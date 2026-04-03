import { useState, useEffect } from 'react'
import { vibrate } from '../lib/vibrate'
import { supabase } from '../lib/supabase'
import type { User, Room } from '../lib/types'

interface TruthDareProps {
  user: User
  room: Room | null
  users: User[]
  onBack: () => void
}

export default function TruthDare({ user, room, users, onBack }: TruthDareProps) {
  const [truths, setTruths] = useState<string[]>([])
  const [dares, setDares] = useState<string[]>([])
  const [usedTruths, setUsedTruths] = useState<Set<string>>(new Set())
  const [usedDares, setUsedDares] = useState<Set<string>>(new Set())
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    supabase.from('truths').select('content').then(({ data }) => {
      if (data) setTruths(data.map((d) => d.content))
    })
    supabase.from('dares').select('content').then(({ data }) => {
      if (data) setDares(data.map((d) => d.content))
    })
  }, [])

  const pick = async (type: 'truth' | 'dare') => {
    if (!user.is_admin) return
    vibrate([50, 30, 50])

    const list = type === 'truth' ? truths : dares
    const used = type === 'truth' ? usedTruths : usedDares
    const setUsed = type === 'truth' ? setUsedTruths : setUsedDares
    if (list.length === 0) return
    // Pick from unused items first, reset if all used
    let available = list.filter((t) => !used.has(t))
    if (available.length === 0) {
      available = list
      setUsed(new Set())
    }
    const text = available[Math.floor(Math.random() * available.length)]
    setUsed((prev) => new Set([...prev, text]))

    const otherPlayers = users.filter((p) => !p.is_admin)
    if (otherPlayers.length === 0) return
    const target = otherPlayers[Math.floor(Math.random() * otherPlayers.length)]

    await supabase
      .from('room')
      .update({
        current_game: 'truth-dare',
        current_card: text,
        current_card_type: type,
        current_card_target: target.display_name,
      })
      .eq('name', 'EVG Vincent')

    setAnimKey((k) => k + 1)
  }

  const hasCard = room?.current_card && room.current_game === 'truth-dare'
  const cardType = room?.current_card_type
  const cardText = room?.current_card
  const cardTarget = room?.current_card_target

  // === SPECTATOR VIEW ===
  if (!user.is_admin) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6">
        {hasCard ? (
          <div key={`spec-${cardText}`} className="animate-slide-up text-center w-full max-w-sm">
            <div className="text-5xl mb-4">
              {cardType === 'truth' ? '🤔' : '🎬'}
            </div>
            <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-3 ${
              cardType === 'truth' ? 'bg-purple-900/50 text-purple-300' : 'bg-pink-900/50 text-pink-300'
            }`}>
              {cardType === 'truth' ? 'VÉRITÉ' : 'ACTION'}
            </div>

            <p className="text-accent text-lg font-bold mb-4">
              👉 {cardTarget}
            </p>

            <div className="card">
              <p className="text-xl font-medium leading-relaxed">{cardText}</p>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in text-center">
            <div className="text-6xl mb-4">🔥</div>
            <h1 className="text-2xl font-bold gradient-text mb-4">Action / Vérité</h1>
            <p className="text-gray-400">En attente de Raph...</p>
            <div className="mt-4 w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    )
  }

  // === MASTER VIEW ===
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <button onClick={onBack} className="absolute top-4 left-4 text-gray-400 text-2xl">←</button>

      <div className="animate-slide-up text-center w-full max-w-sm">
        <div className="text-6xl mb-4">🔥</div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Action / Vérité</h1>
        <p className="text-yellow-400 text-sm mb-6">🎮 Mode Master — tout le monde voit</p>

        {hasCard && (
          <div key={animKey} className="animate-slide-up mb-6">
            <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-3 ${
              cardType === 'truth' ? 'bg-purple-900/50 text-purple-300' : 'bg-pink-900/50 text-pink-300'
            }`}>
              {cardType === 'truth' ? 'VÉRITÉ' : 'ACTION'}
            </div>

            <p className="text-accent text-lg font-bold mb-4">
              👉 {cardTarget}
            </p>

            <div className="card">
              <p className="text-xl font-medium leading-relaxed">{cardText}</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => pick('truth')}
            disabled={truths.length === 0}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold text-xl active:scale-95 transition-transform disabled:opacity-50"
          >
            🤔 Vérité {truths.length === 0 && '(vide)'}
          </button>
          <button
            onClick={() => pick('dare')}
            disabled={dares.length === 0}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold text-xl active:scale-95 transition-transform disabled:opacity-50"
          >
            🎬 Action {dares.length === 0 && '(vide)'}
          </button>
        </div>
      </div>
    </div>
  )
}
