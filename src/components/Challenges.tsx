import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Room, VincentChallenge } from '../lib/types'
import { vibrate } from '../lib/vibrate'
import { fireConfetti } from '../lib/confetti'

interface ChallengesProps {
  user: User
  room: Room | null
  onBack: () => void
  onScore: (userId: string, points: number) => void
}

export default function Challenges({ user, room, onBack, onScore }: ChallengesProps) {
  const [challenges, setChallenges] = useState<(VincentChallenge & { proposer_name?: string })[]>([])
  const [loading, setLoading] = useState(true)

  const fetchChallenges = async () => {
    const { data } = await supabase
      .from('vincent_challenges')
      .select('*, users!vincent_challenges_proposed_by_fkey(display_name)')
      .order('created_at')

    if (data) {
      setChallenges(data.map((c) => ({
        ...c,
        proposer_name: (c.users as { display_name: string } | null)?.display_name ?? '?',
      })))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchChallenges()

    const channel = supabase
      .channel('challenges-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vincent_challenges' }, () => {
        fetchChallenges()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'room' }, () => {
        // room state updated externally
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Master: pick a random pending challenge and broadcast
  const drawChallenge = async () => {
    if (!user.is_admin) return
    const pending = challenges.filter((c) => c.status === 'pending')
    if (pending.length === 0) return

    vibrate([50, 30, 50])
    const picked = pending[Math.floor(Math.random() * pending.length)]

    await supabase
      .from('room')
      .update({
        current_game: 'challenge',
        current_card: picked.content,
        current_card_type: 'challenge',
        current_card_target: 'Vincent',
        current_challenge_id: picked.id,
      })
      .eq('name', 'EVG Vincent')
  }

  const validateChallenge = async () => {
    if (!user.is_admin || !room?.current_challenge_id) return
    vibrate(100)
    fireConfetti()

    const challenge = challenges.find((c) => c.id === room.current_challenge_id)

    await supabase
      .from('vincent_challenges')
      .update({ status: 'completed' })
      .eq('id', room.current_challenge_id)

    // Points to the proposer
    if (challenge) {
      onScore(challenge.proposed_by, 10)
    }

    // Clear room
    await supabase
      .from('room')
      .update({
        current_game: 'idle',
        current_card: null,
        current_card_type: null,
        current_card_target: null,
        current_challenge_id: null,
      })
      .eq('name', 'EVG Vincent')

    fetchChallenges()
  }

  const failChallenge = async () => {
    if (!user.is_admin || !room?.current_challenge_id) return
    vibrate()

    await supabase
      .from('vincent_challenges')
      .update({ status: 'failed' })
      .eq('id', room.current_challenge_id)

    await supabase
      .from('room')
      .update({
        current_game: 'idle',
        current_card: null,
        current_card_type: null,
        current_card_target: null,
        current_challenge_id: null,
      })
      .eq('name', 'EVG Vincent')

    fetchChallenges()
  }

  const hasActiveChallenge = room?.current_game === 'challenge' && room.current_card
  const pending = challenges.filter((c) => c.status === 'pending')
  const completed = challenges.filter((c) => c.status === 'completed')
  const failed = challenges.filter((c) => c.status === 'failed')

  // === SPECTATOR VIEW (non-admin) ===
  if (!user.is_admin) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6">
        <button onClick={onBack} className="absolute top-4 left-4 text-gray-400 text-2xl">←</button>

        {hasActiveChallenge ? (
          <div key={room.current_card} className="animate-slide-up text-center w-full max-w-sm">
            <div className="text-5xl mb-4">🎯</div>
            <div className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-3 bg-orange-900/50 text-orange-300">
              DÉFI POUR VINCENT
            </div>
            <div className="card mt-4">
              <p className="text-xl font-bold leading-relaxed">{room.current_card}</p>
            </div>
            <p className="text-gray-500 text-sm mt-4">En attente de validation de Raph...</p>
          </div>
        ) : (
          <div className="animate-fade-in text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h1 className="text-2xl font-bold gradient-text mb-4">Défis Vincent</h1>
            <p className="text-gray-400 mb-2">{pending.length} défis en attente</p>
            <p className="text-green-400 mb-2">{completed.length} réussis ✅</p>
            {failed.length > 0 && <p className="text-red-400">{failed.length} ratés ❌</p>}
            <p className="text-gray-500 text-sm mt-6">En attente de Raph...</p>
            <div className="mt-4 w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    )
  }

  // === MASTER VIEW ===
  return (
    <div className="min-h-dvh px-4 py-6 pb-20">
      <button onClick={onBack} className="text-gray-400 text-2xl mb-4">←</button>

      <div className="animate-slide-up">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎯</div>
          <h1 className="text-2xl font-bold gradient-text">Défis Vincent</h1>
          <p className="text-yellow-400 text-sm mt-1">🎮 Mode Master</p>
        </div>

        {/* Active challenge */}
        {hasActiveChallenge && (
          <div className="card mb-6 border-orange-500/30 bg-orange-900/10 animate-slide-up">
            <p className="text-sm text-orange-400 font-bold mb-2">DÉFI EN COURS</p>
            <p className="text-xl font-bold mb-4">{room.current_card}</p>
            <div className="flex gap-3">
              <button
                onClick={validateChallenge}
                className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold active:scale-95 transition-transform"
              >
                ✅ Réussi !
              </button>
              <button
                onClick={failChallenge}
                className="flex-1 py-3 rounded-xl bg-red-600/70 text-white font-bold active:scale-95 transition-transform"
              >
                ❌ Raté
              </button>
            </div>
          </div>
        )}

        {/* Draw button */}
        {!hasActiveChallenge && pending.length > 0 && (
          <button
            onClick={drawChallenge}
            className="w-full py-5 rounded-2xl gradient-bg-orange text-white font-bold text-xl active:scale-95 transition-transform animate-pulse-glow mb-6"
          >
            🎲 Tirer un défi ({pending.length} restants)
          </button>
        )}

        {!hasActiveChallenge && pending.length === 0 && !loading && (
          <div className="card mb-6 text-center border-green-500/30">
            <p className="text-green-400 font-bold">Tous les défis ont été joués ! 🎉</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card text-center py-3">
            <p className="text-2xl font-bold text-gray-300">{pending.length}</p>
            <p className="text-xs text-gray-500">En attente</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-2xl font-bold text-green-400">{completed.length}</p>
            <p className="text-xs text-gray-500">Réussis</p>
          </div>
          <div className="card text-center py-3">
            <p className="text-2xl font-bold text-red-400">{failed.length}</p>
            <p className="text-xs text-gray-500">Ratés</p>
          </div>
        </div>

        {/* Challenge list */}
        {loading ? (
          <p className="text-center text-gray-500">Chargement...</p>
        ) : (
          <div className="space-y-2">
            {challenges.map((c) => (
              <div
                key={c.id}
                className={`card text-sm ${
                  c.status === 'completed' ? 'border-green-500/30 bg-green-900/10' :
                  c.status === 'failed' ? 'border-red-500/30 bg-red-900/10' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{c.status === 'completed' ? '✅' : c.status === 'failed' ? '❌' : '⏳'}</span>
                  <span className={c.status !== 'pending' ? 'line-through text-gray-500' : ''}>
                    {c.content}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">par {c.proposer_name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
