import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '../lib/types'
import { vibrate } from '../lib/vibrate'
import Avatar from './Avatar'

interface LoginProps {
  onLogin: (user: User) => void
}

const ADMIN_PIN = '7472'

type Step = 'pick' | 'pin' | 'camera' | 'challenges'

export default function Login({ onLogin }: LoginProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>('pick')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [capturing, setCapturing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [challenge1, setChallenge1] = useState('')
  const [challenge2, setChallenge2] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)

  useEffect(() => {
    supabase
      .from('users')
      .select('*')
      .order('created_at')
      .then(({ data }) => {
        if (data) setUsers(data as User[])
        setLoading(false)
      })
  }, [])

  const selectPlayer = (user: User) => {
    vibrate()
    setSelectedUser(user)
    if (user.is_admin) {
      // Admin needs PIN first
      setStep('pin')
      setPin('')
      setPinError(false)
      return
    }
    proceedAfterPin(user)
  }

  const proceedAfterPin = (u: User) => {
    if (u.avatar_url) {
      if (u.has_submitted_challenges || u.is_target) {
        onLogin(u)
      } else {
        setStep('challenges')
      }
    } else {
      setStep('camera')
      startCamera()
    }
  }

  const handlePinSubmit = () => {
    if (!selectedUser) return
    if (pin === ADMIN_PIN) {
      vibrate()
      proceedAfterPin(selectedUser)
    } else {
      vibrate([100, 50, 100])
      setPinError(true)
      setPin('')
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 400, height: 400 },
      })
      streamRef.current = stream
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream
      }, 100)
    } catch {
      // Camera not available (desktop, denied, etc.) — stay on camera step
      // User can click "Passer" to skip manually
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const takePhoto = async () => {
    if (!videoRef.current || !selectedUser) return
    setCapturing(true)
    vibrate([50, 30, 50])

    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext('2d')!
    const v = videoRef.current
    const size = Math.min(v.videoWidth, v.videoHeight)
    const sx = (v.videoWidth - size) / 2
    const sy = (v.videoHeight - size) / 2
    ctx.drawImage(v, sx, sy, size, size, 0, 0, 400, 400)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.7)

    const blob = await (await fetch(dataUrl)).blob()
    const fileName = `${selectedUser.username}-${Date.now()}.jpg`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })

    let avatarUrl = dataUrl
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      avatarUrl = urlData.publicUrl
    }

    await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', selectedUser.id)

    stopCamera()
    const updated = { ...selectedUser, avatar_url: avatarUrl }
    setSelectedUser(updated)

    if (updated.has_submitted_challenges || updated.is_target) {
      onLogin(updated)
    } else {
      setStep('challenges')
    }
  }

  const skipPhoto = () => {
    stopCamera()
    if (!selectedUser) return
    if (selectedUser.has_submitted_challenges || selectedUser.is_target) {
      onLogin(selectedUser)
    } else {
      setStep('challenges')
    }
  }

  const submitChallenges = async () => {
    if (!selectedUser) return
    const c1 = challenge1.trim()
    const c2 = challenge2.trim()
    if (!c1 || !c2) return

    setSubmitting(true)
    vibrate()

    await supabase.from('vincent_challenges').insert([
      { proposed_by: selectedUser.id, content: c1 },
      { proposed_by: selectedUser.id, content: c2 },
    ])

    await supabase
      .from('users')
      .update({ has_submitted_challenges: true })
      .eq('id', selectedUser.id)

    onLogin({ ...selectedUser, has_submitted_challenges: true })
  }

  // === STEP: PIN (admin only) ===
  if (step === 'pin' && selectedUser) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6">
        <button onClick={() => setStep('pick')} className="absolute top-4 left-4 text-gray-400 text-2xl">←</button>
        <div className="animate-slide-up w-full max-w-xs text-center">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-gray-400 mb-4">Code admin</p>
          <input
            type="number"
            inputMode="numeric"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setPinError(false) }}
            onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
            maxLength={4}
            placeholder="••••"
            className={`w-full px-4 py-4 rounded-xl bg-dark-light text-white text-center text-2xl tracking-widest placeholder-gray-600 border focus:outline-none ${
              pinError ? 'border-red-500 animate-shake' : 'border-dark-lighter focus:border-accent'
            }`}
            autoFocus
          />
          {pinError && <p className="text-red-400 text-sm mt-2">Mauvais code</p>}
          <button
            onClick={handlePinSubmit}
            className="w-full mt-4 py-3 rounded-xl gradient-bg text-white font-bold active:scale-95 transition-transform"
          >
            OK
          </button>
        </div>
      </div>
    )
  }

  // === STEP: CHALLENGES ===
  if (step === 'challenges' && selectedUser) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6">
        <div className="animate-slide-up w-full max-w-sm">
          <div className="text-6xl mb-4 text-center">🎯</div>
          <h1 className="text-2xl font-bold text-center gradient-text mb-2">
            Défis pour Vincent
          </h1>
          <p className="text-gray-400 text-center mb-6 text-sm">
            Propose 2 défis que Vincent devra faire aujourd'hui !<br />
            Sois créatif 😈<br />
            <span className="text-accent">+10 pts pour toi si Vincent le réussit !</span>
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Défi n°1</label>
              <input
                type="text"
                value={challenge1}
                onChange={(e) => setChallenge1(e.target.value)}
                placeholder="Ex: Faire 50 pompes au bar..."
                maxLength={120}
                className="w-full px-4 py-3 rounded-xl bg-dark-light text-white placeholder-gray-500 border border-dark-lighter focus:border-accent focus:outline-none text-lg"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Défi n°2</label>
              <input
                type="text"
                value={challenge2}
                onChange={(e) => setChallenge2(e.target.value)}
                placeholder="Ex: Chanter devant tout le monde..."
                maxLength={120}
                className="w-full px-4 py-3 rounded-xl bg-dark-light text-white placeholder-gray-500 border border-dark-lighter focus:border-accent focus:outline-none text-lg"
              />
            </div>

            <button
              onClick={submitChallenges}
              disabled={!challenge1.trim() || !challenge2.trim() || submitting}
              className="w-full py-4 rounded-xl gradient-bg text-white font-bold text-lg active:scale-95 transition-transform disabled:opacity-50 mt-2"
            >
              {submitting ? '⏳ ...' : '✅ Valider mes défis'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // === STEP: CAMERA ===
  if (step === 'camera' && selectedUser) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-black">
        <div className="animate-slide-up text-center w-full max-w-sm">
          <p className="text-white text-lg mb-4 font-bold">
            📸 Ta photo, {selectedUser.display_name} !
          </p>

          <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-accent mb-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>

          <button
            onClick={takePhoto}
            disabled={capturing}
            className="w-full py-4 rounded-xl gradient-bg text-white font-bold text-lg active:scale-95 transition-transform mb-3"
          >
            {capturing ? '⏳ ...' : '📸 Prendre la photo'}
          </button>

          <button onClick={skipPhoto} className="text-gray-500 text-sm">
            Passer →
          </button>
        </div>
      </div>
    )
  }

  // === STEP: PICK PLAYER ===
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="animate-slide-up w-full max-w-sm">
        <div className="text-6xl mb-4 text-center">🎉</div>
        <h1 className="text-4xl font-bold text-center mb-2 gradient-text">
          EVG Vincent
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Qui es-tu ?
        </p>

        {loading ? (
          <p className="text-center text-gray-500">Chargement...</p>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => selectPlayer(u)}
                className="w-full card flex items-center gap-4 active:scale-[0.97] transition-transform"
              >
                <Avatar url={u.avatar_url} name={u.display_name} isTarget={u.is_target} size={48} />
                <div className="flex-1 text-left">
                  <p className="font-bold text-lg">{u.display_name}</p>
                  <p className="text-xs text-gray-500">
                    {u.is_target ? 'Le futur marié 👑' : 'Joueur'}
                  </p>
                </div>
                <div className="text-gray-600 text-xl">→</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
