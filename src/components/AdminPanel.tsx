import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '../lib/types'
import { vibrate } from '../lib/vibrate'

interface AdminPanelProps {
  user: User
  onClose: () => void
  onLogout: () => void
  onContent: () => void
}

export default function AdminPanel({ user, onClose, onLogout, onContent }: AdminPanelProps) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null)
  const [log, setLog] = useState<string[]>([])

  if (!user.is_admin) return null

  const addLog = (msg: string) => {
    setLog((prev) => [msg, ...prev].slice(0, 20))
  }

  const confirm = (action: string) => {
    if (confirmAction === action) {
      return true // already confirmed
    }
    setConfirmAction(action)
    return false
  }

  const resetScores = async () => {
    if (!confirm('scores')) return
    vibrate()
    await supabase.from('users').update({ score: 0 }).not('id', 'is', null)
    await supabase
      .from('room')
      .update({ total_points: 0, progress_percentage: 0 })
      .eq('name', 'EVG Vincent')
    addLog('✅ Scores remis à 0')
    setConfirmAction(null)
  }

  const resetChallenges = async () => {
    if (!confirm('challenges')) return
    vibrate()
    await supabase.from('vincent_challenges').delete().not('id', 'is', null)
    await supabase.from('users').update({ has_submitted_challenges: false }).eq('is_target', false)
    // Vincent keeps has_submitted_challenges = true
    await supabase.from('users').update({ has_submitted_challenges: true }).eq('is_target', true)
    addLog('✅ Défis supprimés, joueurs devront re-soumettre')
    setConfirmAction(null)
  }

  const resetPhotos = async () => {
    if (!confirm('photos')) return
    vibrate()
    await supabase.from('users').update({ avatar_url: null }).not('id', 'is', null)
    addLog('✅ Photos supprimées')
    setConfirmAction(null)
  }

  const resetAll = async () => {
    if (!confirm('all')) return
    vibrate()
    // Reset scores + photos
    await supabase.from('users').update({ score: 0, avatar_url: null, has_submitted_challenges: false }).eq('is_target', false)
    await supabase.from('users').update({ score: 0, avatar_url: null, has_submitted_challenges: true }).eq('is_target', true)
    // Delete all challenges
    await supabase.from('vincent_challenges').delete().not('id', 'is', null)
    // Reset room — core fields
    await supabase
      .from('room')
      .update({
        total_points: 0,
        progress_percentage: 0,
        current_game: 'idle',
        current_card: null,
        current_card_type: null,
        current_card_target: null,
        current_challenge_id: null,
      })
      .eq('name', 'EVG Vincent')
    // Reset quiz state
    await supabase.from('quiz_answers').delete().not('id', 'is', null)
    await supabase.from('room').update({ quiz_launched: false, quiz_question_index: 0, quiz_show_results: false, quiz_finished: false }).eq('name', 'EVG Vincent')
    await supabase.from('room').update({ quiz_paused: false, quiz_question_started_at: null }).eq('name', 'EVG Vincent')
    // Bump session version to force logout
    const { data: currentRoom } = await supabase.from('room').select('session_version').single()
    const newVersion = (currentRoom?.session_version || 1) + 1
    await supabase.from('room').update({ session_version: newVersion }).eq('name', 'EVG Vincent')
    addLog('✅ TOUT remis à zéro — déconnexion...')
    setConfirmAction(null)
    setTimeout(() => onLogout(), 500)
  }

  const clearRoomState = async () => {
    vibrate()
    await supabase.from('room').update({
      current_game: 'idle',
      current_card: null,
      current_card_type: null,
      current_card_target: null,
      current_challenge_id: null,
      quiz_launched: false,
      quiz_question_index: 0,
      quiz_show_results: false,
      quiz_finished: false,
    }).eq('name', 'EVG Vincent')
    await supabase.from('room').update({ quiz_paused: false, quiz_question_started_at: null }).eq('name', 'EVG Vincent')
    await supabase.from('quiz_answers').delete().not('id', 'is', null)
    addLog('✅ État du jeu nettoyé + quiz re-disponible')
  }

  const forceLogoutAll = async () => {
    if (!confirm('logout')) return
    vibrate()
    // Just bump session_version → everyone gets logged out, nothing else changes
    const { data: currentRoom } = await supabase.from('room').select('session_version').single()
    const newVersion = (currentRoom?.session_version || 1) + 1
    await supabase.from('room').update({ session_version: newVersion }).eq('name', 'EVG Vincent')
    addLog('✅ Tout le monde déconnecté')
    setConfirmAction(null)
    onLogout()
  }

  const resetQuiz = async () => {
    vibrate()
    await supabase.from('quiz_answers').delete().not('id', 'is', null)
    // Split updates: core fields first, then newer fields (in case columns don't exist yet)
    await supabase.from('room').update({ quiz_launched: false, quiz_question_index: 0, quiz_show_results: false, quiz_finished: false }).eq('name', 'EVG Vincent')
    await supabase.from('room').update({ quiz_paused: false, quiz_question_started_at: null }).eq('name', 'EVG Vincent')
    addLog('✅ Quiz re-disponible')
  }

  const actions: { id: string; label: string; desc: string; action: () => void; color: string; danger?: boolean }[] = [
    {
      id: 'quiz',
      label: '🧠 Reset quiz',
      desc: 'Permet de relancer le quiz pour tous',
      action: resetQuiz,
      color: 'border-blue-500/30',
    },
    {
      id: 'scores',
      label: '🔄 Reset scores',
      desc: 'Remet tous les scores à 0',
      action: resetScores,
      color: 'border-orange-500/30',
    },
    {
      id: 'challenges',
      label: '🗑️ Reset défis',
      desc: 'Supprime tous les défis, les joueurs devront re-soumettre',
      action: resetChallenges,
      color: 'border-orange-500/30',
    },
    {
      id: 'photos',
      label: '📸 Reset photos',
      desc: 'Supprime toutes les photos de profil',
      action: resetPhotos,
      color: 'border-orange-500/30',
    },
    {
      id: 'clear',
      label: '🧹 Nettoyer jeu en cours',
      desc: 'Remet l\'écran Action/Vérité ou Défis en état idle',
      action: clearRoomState,
      color: 'border-blue-500/30',
    },
    {
      id: 'all',
      label: '💣 RESET TOTAL',
      desc: 'Scores, défis, photos → tout supprimé + déconnexion de tous',
      action: resetAll,
      color: 'border-red-500/50',
      danger: true,
    },
    {
      id: 'logout',
      label: '🚪 Forcer reconnexion de tous',
      desc: 'Déconnecte tout le monde (photos et défis gardés)',
      action: forceLogoutAll,
      color: 'border-red-500/50',
      danger: true,
    },
  ]

  return (
    <div className="min-h-dvh px-4 py-6 pb-20">
      <button onClick={onClose} className="text-gray-400 text-2xl mb-4">←</button>

      <div className="animate-slide-up">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎮</div>
          <h1 className="text-2xl font-bold gradient-text">Panel Raph</h1>
          <p className="text-yellow-400 text-sm mt-1">Raph — Game Master</p>
        </div>

        {/* Content editor button */}
        <button
          onClick={onContent}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-left active:scale-[0.97] transition-transform flex items-center gap-4 mb-6"
        >
          <div className="text-3xl">✏️</div>
          <div>
            <div className="font-bold">Contenu des jeux</div>
            <div className="text-sm opacity-80">Vérités, Actions, Quiz, Tu préfères</div>
          </div>
        </button>

        <div className="space-y-3">
          {actions.map((a) => (
            <div key={a.id} className={`card ${a.color} ${a.danger ? 'bg-red-900/10' : ''}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="font-bold">{a.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
                </div>
                <button
                  onClick={a.action}
                  className={`px-4 py-2 rounded-xl font-bold text-sm active:scale-95 transition-transform flex-shrink-0 ${
                    confirmAction === a.id
                      ? 'bg-red-600 text-white animate-pulse'
                      : a.danger
                        ? 'bg-red-600/30 text-red-300'
                        : 'bg-dark-lighter text-white'
                  }`}
                >
                  {confirmAction === a.id ? 'Confirmer ?' : 'Go'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Log */}
        {log.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-2">Log</h2>
            <div className="card space-y-1 max-h-40 overflow-y-auto">
              {log.map((entry, i) => (
                <p key={i} className="text-sm text-gray-400">{entry}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
