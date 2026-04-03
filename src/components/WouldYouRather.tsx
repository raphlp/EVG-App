import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Room, WouldYouRather as WyrType } from '../lib/types'
import { vibrate } from '../lib/vibrate'

interface WyrProps {
  user: User
  room: Room | null
  onBack: () => void
}

export default function WouldYouRather({ user, room, onBack }: WyrProps) {
  const [items, setItems] = useState<WyrType[]>([])
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set())
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    supabase.from('would_you_rather').select('*').order('created_at').then(({ data }) => {
      if (data) setItems(data)
    })
  }, [])

  // Master: pick and broadcast
  const pick = async () => {
    if (!user.is_admin || items.length === 0) return
    vibrate([50, 30, 50])
    // Pick from unused items first, reset if all used
    let available = items.filter((i) => !usedIds.has(i.id))
    if (available.length === 0) {
      available = items
      setUsedIds(new Set())
    }
    const item = available[Math.floor(Math.random() * available.length)]
    setUsedIds((prev) => new Set([...prev, item.id]))
    await supabase
      .from('room')
      .update({
        current_game: 'wyr',
        current_card: `${item.option_a} ||| ${item.option_b}`,
        current_card_type: 'wyr',
        current_card_target: null,
      })
      .eq('name', 'EVG Vincent')
    setAnimKey((k) => k + 1)
  }

  const hasCard = room?.current_game === 'wyr' && room.current_card
  const [optA, optB] = (room?.current_card || '|||').split(' ||| ')

  // === SPECTATOR VIEW ===
  if (!user.is_admin) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6">
        {hasCard ? (
          <div key={`spec-${room?.current_card}`} className="animate-slide-up text-center w-full max-w-sm">
            <div className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-6 bg-purple-900/50 text-purple-300">
              TU PRÉFÈRES
            </div>
            <div className="space-y-4">
              <div className="card border-purple-500/30 bg-purple-900/10">
                <p className="text-3xl mb-2">🙋‍♂️</p>
                <p className="text-sm font-bold text-purple-300 mb-1">Main en haut</p>
                <p className="text-xl font-medium">{optA}</p>
              </div>
              <div className="text-gray-500 font-bold text-lg">OU</div>
              <div className="card border-pink-500/30 bg-pink-900/10">
                <p className="text-3xl mb-2">🙇‍♂️</p>
                <p className="text-sm font-bold text-pink-300 mb-1">Main en bas</p>
                <p className="text-xl font-medium">{optB}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in text-center">
            <div className="text-6xl mb-4">🤷</div>
            <h1 className="text-2xl font-bold gradient-text mb-4">Tu préfères</h1>
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
        <div className="text-6xl mb-4">🤷</div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Tu préfères</h1>
        <p className="text-yellow-400 text-sm mb-6">🎮 Mode Master — tout le monde voit</p>

        {hasCard && (
          <div key={animKey} className="animate-slide-up mb-6">
            <div className="space-y-3">
              <div className="card border-purple-500/30 bg-purple-900/10">
                <p className="text-sm font-bold text-purple-300">A.</p>
                <p className="text-lg font-medium mt-1">{optA}</p>
              </div>
              <div className="text-gray-500 font-bold text-sm">OU</div>
              <div className="card border-pink-500/30 bg-pink-900/10">
                <p className="text-sm font-bold text-pink-300">B.</p>
                <p className="text-lg font-medium mt-1">{optB}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={pick}
          disabled={items.length === 0}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl active:scale-95 transition-transform disabled:opacity-50"
        >
          {items.length === 0 ? 'Aucun contenu' : '🎲 Suivant'}
        </button>
      </div>
    </div>
  )
}
