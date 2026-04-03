import { supabase } from '../lib/supabase'
import type { Page, User, Room } from '../lib/types'
import { vibrate } from '../lib/vibrate'
import Avatar from './Avatar'

interface HomeProps {
  user: User
  room: Room | null
  onNavigate: (page: Page) => void
  onLogout: () => void
  onAdmin: () => void
}

export default function Home({ user, room, onNavigate, onLogout, onAdmin }: HomeProps) {
  const launchGame = async (page: Page) => {
    vibrate()
    const gameMap: Record<string, string> = {
      'truth-dare': 'truth-dare',
      'challenges': 'challenge',
      'quiz': 'quiz',
      'wyr': 'wyr',
    }
    const gameState = gameMap[page]
    if (gameState) {
      const updateData: Record<string, unknown> = { current_game: gameState }
      if (page === 'quiz') {
        // If quiz already in progress, just resume. Otherwise start fresh.
        const quizInProgress = room?.quiz_launched && !room?.quiz_finished
        if (!quizInProgress) {
          updateData.quiz_launched = true
          updateData.quiz_question_index = 0
          updateData.quiz_show_results = false
          updateData.quiz_finished = false
          updateData.quiz_question_started_at = new Date().toISOString()
          // Clean old answers
          await supabase.from('quiz_answers').delete().not('id', 'is', null)
        }
      }
      await supabase
        .from('room')
        .update(updateData)
        .eq('name', 'EVG Vincent')
    }
    onNavigate(page)
  }

  const resetQuiz = async () => {
    vibrate()
    await supabase.from('quiz_answers').delete().not('id', 'is', null)
    await supabase.from('room').update({
      quiz_launched: false,
      quiz_question_index: 0,
      quiz_show_results: false,
      quiz_finished: false,
      quiz_paused: false,
      quiz_question_started_at: null,
    }).eq('name', 'EVG Vincent')
  }

  const menuItems: { page: Page; emoji: string; label: string; desc: string; color: string }[] = [
    {
      page: 'truth-dare', emoji: '🔥', label: 'Action / Vérité',
      desc: 'Lance pour tout le monde',
      color: 'from-purple-600 to-pink-600',
    },
    {
      page: 'challenges', emoji: '🎯', label: 'Défis Vincent',
      desc: 'Tire et valide les défis',
      color: 'from-pink-600 to-orange-500',
    },
    {
      page: 'quiz', emoji: '🧠', label: 'Quiz Vincent',
      desc: room?.quiz_launched && !room?.quiz_finished ? 'Reprendre le quiz' : 'Lance le quiz pour tous',
      color: 'from-blue-600 to-purple-600',
    },
    {
      page: 'wyr', emoji: '🤷', label: 'Tu préfères',
      desc: 'Lance pour tout le monde',
      color: 'from-indigo-600 to-purple-600',
    },
    {
      page: 'scoreboard', emoji: '🏆', label: 'Scoreboard',
      desc: 'Classement en live',
      color: 'from-yellow-500 to-orange-500',
    },
  ]

  return (
    <div className="min-h-dvh px-4 py-6 pb-20">
      {/* Admin button — no PIN, already verified at login */}
      {user.is_admin && (
        <button
          onClick={onAdmin}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-dark-light border border-dark-lighter flex items-center justify-center text-lg active:scale-90 transition-transform"
        >
          ⚙️
        </button>
      )}

      {/* Header */}
      <div className="animate-slide-up text-center mb-6">
        <div className="flex justify-center mb-3">
          <Avatar url={user.avatar_url} name={user.display_name} isTarget={user.is_target} size={64} borderColor="border-accent" />
        </div>
        <h1 className="text-2xl font-bold gradient-text">EVG Vincent</h1>
        <p className="text-gray-400 text-sm mt-1">
          Salut <span className="text-accent font-semibold">{user.display_name}</span> !
          {user.is_target && <span className="ml-1 text-yellow-400">👑</span>}
        </p>
      </div>

      {/* Progress bar */}
      {room && (
        <div className="card mb-6 animate-fade-in">
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

      {/* Menu */}
      <div className="space-y-3">
        {menuItems.map((item, i) => {
          const quizFinished = item.page === 'quiz' && room?.quiz_finished

          if (quizFinished) {
            // Quiz finished → button becomes reset
            return (
              <button
                key={item.page}
                onClick={resetQuiz}
                className="w-full p-5 rounded-2xl bg-dark-light border border-dark-lighter text-left active:scale-[0.97] transition-transform animate-slide-up flex items-center gap-4"
                style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}
              >
                <div className="text-4xl opacity-50">🧠</div>
                <div className="flex-1">
                  <div className="font-bold text-lg text-gray-400">Quiz Vincent</div>
                  <div className="text-sm text-gray-500">Terminé ✅</div>
                </div>
                <div className="text-2xl">🔄</div>
              </button>
            )
          }

          return (
            <button
              key={item.page}
              onClick={() => launchGame(item.page)}
              className={`w-full p-5 rounded-2xl bg-gradient-to-r ${item.color} text-white text-left active:scale-[0.97] transition-transform animate-slide-up flex items-center gap-4`}
              style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}
            >
              <div className="text-4xl">{item.emoji}</div>
              <div>
                <div className="font-bold text-lg">{item.label}</div>
                <div className="text-sm opacity-80">{item.desc}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Score */}
      {!user.is_target && (
        <div className="card mt-6 text-center animate-fade-in">
          <p className="text-gray-400 text-sm">Ton score</p>
          <p className="text-3xl font-bold gradient-text">{user.score} pts</p>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={onLogout}
        className="mt-6 w-full text-center text-gray-600 text-sm py-2"
      >
        Changer de joueur
      </button>
    </div>
  )
}
