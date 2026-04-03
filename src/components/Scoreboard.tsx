import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Room } from '../lib/types'
import Avatar from './Avatar'

interface ScoreboardProps {
  users: User[]
  currentUser: User
  room?: Room | null
  onBack: () => void
  isHome?: boolean
}

const medals = ['🥇', '🥈', '🥉']

export default function Scoreboard({ users, currentUser, room, onBack, isHome }: ScoreboardProps) {
  const [vincentStats, setVincentStats] = useState({ completed: 0, total: 0, failed: 0 })

  const vincent = users.find((u) => u.is_target)
  const players = [...users.filter((u) => !u.is_target)].sort((a, b) => b.score - a.score)

  useEffect(() => {
    const fetch = () => {
      supabase.from('vincent_challenges').select('status').then(({ data }) => {
        if (data) {
          setVincentStats({
            total: data.length,
            completed: data.filter((c) => c.status === 'completed').length,
            failed: data.filter((c) => c.status === 'failed').length,
          })
        }
      })
    }

    fetch()

    const channel = supabase
      .channel('scoreboard-challenges')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vincent_challenges' }, fetch)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const vincentPercent = vincentStats.total > 0
    ? Math.round((vincentStats.completed / vincentStats.total) * 100)
    : 0

  return (
    <div className="min-h-dvh px-4 py-6 pb-20">
      {isHome ? (
        <div className="text-center mb-2">
          <div className="flex justify-center mb-2">
            <Avatar url={currentUser.avatar_url} name={currentUser.display_name} isTarget={currentUser.is_target} size={48} borderColor="border-accent" />
          </div>
          <p className="text-gray-400 text-sm">
            Salut <span className="text-accent font-semibold">{currentUser.display_name}</span> !
            {currentUser.is_target && <span className="ml-1 text-yellow-400">👑</span>}
          </p>
        </div>
      ) : (
        <button onClick={onBack} className="text-gray-400 text-2xl mb-4">←</button>
      )}

      <div className="animate-slide-up">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏆</div>
          <h1 className="text-2xl font-bold gradient-text">
            {isHome ? 'EVG Vincent' : 'Scoreboard'}
          </h1>
          {isHome && <p className="text-gray-500 text-xs mt-1">En attente du master...</p>}
        </div>

        {/* Progress bar */}
        {isHome && room && (
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Progression EVG</span>
              <span className="text-sm font-bold text-accent">{room.progress_percentage}%</span>
            </div>
            <div className="w-full h-3 bg-dark rounded-full overflow-hidden">
              <div
                className="h-full gradient-bg rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${room.progress_percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Vincent section */}
        {vincent && (
          <div className="card mb-6 border-yellow-500/30 bg-yellow-900/10">
            <div className="flex items-center gap-3 mb-3">
              <Avatar url={vincent.avatar_url} name={vincent.display_name} isTarget size={48} borderColor="border-yellow-500" />
              <div>
                <p className="font-bold text-lg">Vincent <span className="text-yellow-400">👑</span></p>
                <p className="text-sm text-gray-400">Le futur marié</p>
              </div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Défis réussis</span>
              <span className="text-sm font-bold text-yellow-400">
                {vincentStats.completed}/{vincentStats.total}
              </span>
            </div>
            <div className="w-full h-3 bg-dark rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-1000"
                style={{ width: `${vincentPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>✅ {vincentStats.completed} réussis</span>
              <span>❌ {vincentStats.failed} ratés</span>
            </div>
          </div>
        )}

        {/* Players ranking */}
        <h2 className="text-sm text-gray-500 uppercase tracking-wider mb-3">Classement joueurs</h2>

        {/* Top 3 podium */}
        {players.length >= 3 && (
          <div className="flex items-end justify-center gap-3 mb-6">
            {[1, 0, 2].map((rank) => {
              const p = players[rank]
              if (!p) return null
              const isFirst = rank === 0
              return (
                <div key={p.id} className={`flex flex-col items-center ${isFirst ? '-mt-4' : ''}`}>
                  {isFirst && <div className="text-xl mb-1">👑</div>}
                  <Avatar
                    url={p.avatar_url}
                    name={p.display_name}
                    size={isFirst ? 64 : 52}
                    borderColor={isFirst ? 'border-yellow-400' : rank === 1 ? 'border-gray-400' : 'border-orange-700'}
                  />
                  <p className="text-xs font-bold truncate w-16 text-center mt-1">{p.display_name}</p>
                  <p className="text-xs text-accent">{p.score} pts</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Full list */}
        <div className="space-y-2">
          {players.map((u, i) => (
            <div
              key={u.id}
              className={`card flex items-center gap-3 ${
                u.id === currentUser.id ? 'border-accent/50 bg-purple-900/20' : ''
              }`}
            >
              <div className="text-lg w-8 text-center flex-shrink-0">
                {i < 3 ? medals[i] : <span className="text-gray-500 text-sm">{i + 1}</span>}
              </div>
              <Avatar url={u.avatar_url} name={u.display_name} size={40} />
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">
                  {u.display_name}
                  {u.id === currentUser.id && (
                    <span className="text-accent text-xs ml-1">(toi)</span>
                  )}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold gradient-text">{u.score} pts</p>
              </div>
            </div>
          ))}
        </div>

        {isHome && (
          <button
            onClick={onBack}
            className="mt-8 w-full text-center text-gray-600 text-sm py-2"
          >
            Changer de joueur
          </button>
        )}
      </div>
    </div>
  )
}
