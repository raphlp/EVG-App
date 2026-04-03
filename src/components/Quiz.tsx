import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { QuizQuestion, User, Room } from '../lib/types'
import { vibrate } from '../lib/vibrate'

interface QuizAnswer {
  id: string
  user_id: string
  question_id: string
  answer: number
  created_at: string
  display_name?: string
}

interface QuizProps {
  user: User
  room: Room | null
  users: User[]
  onBack: () => void
  onScore: (points: number) => void
}

const COLORS = [
  'from-red-500 to-pink-600',
  'from-blue-500 to-indigo-600',
  'from-yellow-500 to-orange-500',
  'from-green-500 to-teal-500',
]
const SHAPES = ['◆', '●', '▲', '■']

function calcPoints(answeredAt: string, questionStartedAt: string | null): number {
  if (!questionStartedAt) return 750
  const elapsed = (new Date(answeredAt).getTime() - new Date(questionStartedAt).getTime()) / 1000
  const clamped = Math.max(0, Math.min(10, elapsed))
  return Math.round(1000 - (clamped / 10) * 500)
}

export default function Quiz({ user, room, users, onBack, onScore }: QuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [allAnswers, setAllAnswers] = useState<QuizAnswer[]>([])
  const [myAnswer, setMyAnswer] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [scoredQuestions, setScoredQuestions] = useState<Set<string>>(() => {
    try {
      const stored = sessionStorage.getItem('evg-quiz-scored')
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch { return new Set() }
  })
  // Track cumulative quiz points per player locally (awarded points, not recalculated)
  const [awardedPoints, setAwardedPoints] = useState<Record<string, number>>(() => {
    try {
      const stored = sessionStorage.getItem('evg-quiz-points')
      return stored ? JSON.parse(stored) : {}
    } catch { return {} }
  })

  const qIndex = room?.quiz_question_index ?? 0
  const showResults = room?.quiz_show_results ?? false
  const quizFinished = room?.quiz_finished ?? false
  const questionStartedAt = room?.quiz_question_started_at ?? null
  const currentQuestion = questions[qIndex]
  // All users play except Vincent (target) — he spectates
  const allPlayers = users.filter((u) => !u.is_target)
  const isSpectator = user.is_target

  useEffect(() => {
    supabase.from('quiz_questions').select('*').order('created_at').then(({ data }) => {
      if (data) setQuestions(data as QuizQuestion[])
      setLoading(false)
    })
  }, [])

  // Detect fresh quiz start: index=0 + no answers yet → clear stale sessionStorage
  useEffect(() => {
    if (qIndex === 0 && allAnswers.length === 0 && scoredQuestions.size > 0) {
      setScoredQuestions(new Set())
      setAwardedPoints({})
      try {
        sessionStorage.removeItem('evg-quiz-scored')
        sessionStorage.removeItem('evg-quiz-points')
      } catch {}
    }
  }, [qIndex, allAnswers.length, scoredQuestions.size])

  const fetchAllAnswers = useCallback(async () => {
    const { data } = await supabase
      .from('quiz_answers')
      .select('*, users!quiz_answers_user_id_fkey(display_name)')
    if (data) {
      setAllAnswers(data.map((a) => ({
        ...a,
        display_name: (a.users as { display_name: string } | null)?.display_name ?? '?',
      })))
    }
  }, [])

  useEffect(() => { fetchAllAnswers() }, [fetchAllAnswers, qIndex])

  // Sync myAnswer from DB, but don't overwrite if we just answered locally
  const lastSubmitRef = useRef(0)
  useEffect(() => {
    if (currentQuestion && user) {
      const existing = allAnswers.find((a) => a.user_id === user.id && a.question_id === currentQuestion.id)
      if (existing) {
        setMyAnswer(existing.answer)
      } else if (Date.now() - lastSubmitRef.current > 3000) {
        // Only reset to null if we didn't just submit (avoids race condition)
        setMyAnswer(null)
      }
    } else {
      setMyAnswer(null)
    }
  }, [currentQuestion, allAnswers, user])

  useEffect(() => {
    const channel = supabase
      .channel('quiz-answers-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_answers' }, () => {
        fetchAllAnswers()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchAllAnswers])

  // Score current user + track all players' points when results shown
  useEffect(() => {
    if (!showResults || !currentQuestion) return
    if (scoredQuestions.has(currentQuestion.id)) return

    // Award points to current user in DB
    if (myAnswer !== null && myAnswer === currentQuestion.correct) {
      const myAnswerData = allAnswers.find((a) => a.user_id === user.id && a.question_id === currentQuestion.id)
      const pts = myAnswerData ? calcPoints(myAnswerData.created_at, questionStartedAt) : 750
      onScore(pts)
    }

    // Compute points for ALL players for this question and accumulate
    const pointsForQuestion: Record<string, number> = {}
    for (const a of allAnswers) {
      if (a.question_id !== currentQuestion.id) continue
      const q = currentQuestion
      if (a.answer === q.correct) {
        pointsForQuestion[a.user_id] = calcPoints(a.created_at, questionStartedAt)
      }
    }
    setAwardedPoints((prev) => {
      const next = { ...prev }
      for (const [uid, pts] of Object.entries(pointsForQuestion)) {
        next[uid] = (next[uid] || 0) + pts
      }
      try { sessionStorage.setItem('evg-quiz-points', JSON.stringify(next)) } catch {}
      return next
    })

    const newScored = new Set([...scoredQuestions, currentQuestion.id])
    setScoredQuestions(newScored)
    try { sessionStorage.setItem('evg-quiz-scored', JSON.stringify([...newScored])) } catch {}
  }, [showResults, currentQuestion, myAnswer, allAnswers, questionStartedAt, scoredQuestions, onScore, user.id])

  // Cumulative scores from locally tracked awarded points
  const playerScores = useMemo(() => {
    return allPlayers.map((p) => ({
      ...p,
      quizScore: awardedPoints[p.id] || 0,
    })).sort((a, b) => b.quizScore - a.quizScore)
  }, [allPlayers, awardedPoints])

  const currentAnswers = allAnswers.filter((a) => currentQuestion && a.question_id === currentQuestion.id)
  const answeredCount = currentAnswers.filter((a) => allPlayers.some((p) => p.id === a.user_id)).length
  const allAnsweredQ = answeredCount >= allPlayers.length

  const submitAnswer = async (answerIndex: number) => {
    if (isSpectator || myAnswer !== null || showResults || !currentQuestion) return
    vibrate()
    lastSubmitRef.current = Date.now()
    setMyAnswer(answerIndex)
    await supabase.from('quiz_answers').upsert({
      user_id: user.id,
      question_id: currentQuestion.id,
      answer: answerIndex,
    }, { onConflict: 'user_id,question_id' })
  }

  // === MASTER CONTROLS ===
  const showResultsNow = async () => {
    await supabase.from('room').update({ quiz_show_results: true }).eq('name', 'EVG Vincent')
  }

  const nextQuestion = async () => {
    if (qIndex >= questions.length - 1) {
      await supabase.from('room').update({ quiz_finished: true, quiz_show_results: false }).eq('name', 'EVG Vincent')
    } else {
      await supabase.from('room').update({
        quiz_question_index: qIndex + 1,
        quiz_show_results: false,
        quiz_question_started_at: new Date().toISOString(),
      }).eq('name', 'EVG Vincent')
    }
  }

  const restartQuiz = async () => {
    vibrate()
    await supabase.from('quiz_answers').delete().not('id', 'is', null)
    await supabase.from('room').update({
      quiz_question_index: 0,
      quiz_show_results: false,
      quiz_finished: false,
      quiz_question_started_at: new Date().toISOString(),
    }).eq('name', 'EVG Vincent')
    setScoredQuestions(new Set())
    setAwardedPoints({})
    try { sessionStorage.removeItem('evg-quiz-scored'); sessionStorage.removeItem('evg-quiz-points') } catch {}
  }

  const quitQuiz = async () => {
    // Just set game to idle — quiz state is preserved in DB, can resume later
    await supabase.from('room').update({ current_game: 'idle' }).eq('name', 'EVG Vincent')
    onBack()
  }

  const endQuiz = async () => {
    // Fully reset quiz state so it shows as fresh "Lance le quiz" on Home
    await supabase.from('room').update({
      current_game: 'idle',
      quiz_launched: false,
      quiz_question_index: 0,
      quiz_show_results: false,
      quiz_finished: false,
      quiz_paused: false,
      quiz_question_started_at: null,
    }).eq('name', 'EVG Vincent')
    try { sessionStorage.removeItem('evg-quiz-scored'); sessionStorage.removeItem('evg-quiz-points') } catch {}
    onBack()
  }

  // === LOADING ===
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">🧠</div>
        <p className="text-gray-400 mb-6">Aucune question configurée</p>
        {user.is_admin && <button onClick={quitQuiz} className="py-3 px-6 rounded-xl gradient-bg text-white font-bold">Retour</button>}
      </div>
    )
  }

  // === QUIZ FINISHED — FINAL LEADERBOARD ===
  if (quizFinished) {
    return (
      <div className="min-h-dvh px-4 py-6 pb-20">
        <div className="animate-slide-up text-center mb-8">
          <div className="text-6xl mb-3">🏆</div>
          <h1 className="text-3xl font-bold gradient-text mb-1">Quiz terminé !</h1>
          <p className="text-gray-500 text-sm">{questions.length} questions</p>
        </div>

        <Leaderboard playerScores={playerScores} currentUserId={user.id} />

        {user.is_admin && (
          <div className="flex gap-3 mt-6">
            <button onClick={restartQuiz} className="flex-1 py-3 rounded-xl bg-dark-light border border-dark-lighter text-white font-bold active:scale-95 transition-transform">
              🔄 Rejouer
            </button>
            <button onClick={endQuiz} className="flex-1 py-3 rounded-xl gradient-bg text-white font-bold active:scale-95 transition-transform">
              ✅ Terminer
            </button>
          </div>
        )}

        {!user.is_admin && (
          <p className="text-gray-500 text-center text-sm mt-8">En attente de Raph...</p>
        )}
      </div>
    )
  }

  if (!currentQuestion) return null

  const questionAnswers = [currentQuestion.answer_a, currentQuestion.answer_b, currentQuestion.answer_c, currentQuestion.answer_d]

  // === RESULTS SCREEN ===
  if (showResults) {
    const correctAnswer = currentQuestion.correct
    const correctPlayers = currentAnswers.filter((a) => a.answer === correctAnswer)
    const wrongPlayers = currentAnswers.filter((a) => a.answer !== correctAnswer)

    return (
      <div className="min-h-dvh px-4 py-6 pb-20">
        <div className="animate-slide-up">
          <div className="text-center mb-4">
            <p className="text-gray-500 text-xs mb-2">Question {qIndex + 1}/{questions.length}</p>
            <p className="text-lg font-bold">{currentQuestion.question}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {questionAnswers.map((ans, i) => {
              const isCorrect = i === correctAnswer
              const count = currentAnswers.filter((a) => a.answer === i).length
              return (
                <div
                  key={i}
                  className={`p-3 rounded-2xl text-center transition-all animate-slide-up ${
                    isCorrect
                      ? 'bg-green-600 text-white scale-105'
                      : 'bg-dark-light text-gray-500 opacity-40'
                  }`}
                  style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}
                >
                  <p className="text-xl">{SHAPES[i]}</p>
                  <p className="font-bold text-xs mt-1">{ans}</p>
                  <p className={`text-xs mt-1 ${isCorrect ? 'text-green-200' : 'text-gray-600'}`}>
                    {count} rép.
                  </p>
                </div>
              )
            })}
          </div>

          <div className="flex gap-3 mb-4">
            <div className="flex-1 card py-3 border-green-500/30 bg-green-900/10">
              <p className="text-green-400 font-bold text-xs mb-2">✅ ({correctPlayers.length})</p>
              <div className="flex flex-wrap gap-1">
                {correctPlayers.map((a) => (
                  <span key={a.id} className="px-2 py-0.5 rounded-full bg-green-800/50 text-green-300 text-xs">
                    {a.display_name}
                  </span>
                ))}
                {correctPlayers.length === 0 && <span className="text-gray-500 text-xs">Personne</span>}
              </div>
            </div>
            <div className="flex-1 card py-3 border-red-500/30 bg-red-900/10">
              <p className="text-red-400 font-bold text-xs mb-2">❌ ({wrongPlayers.length})</p>
              <div className="flex flex-wrap gap-1">
                {wrongPlayers.map((a) => (
                  <span key={a.id} className="px-2 py-0.5 rounded-full bg-red-800/50 text-red-300 text-xs">
                    {a.display_name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Classement</h3>
          <Leaderboard playerScores={playerScores} currentUserId={user.id} compact />

          {user.is_admin && (
            <button
              onClick={nextQuestion}
              className="w-full mt-4 py-4 rounded-xl gradient-bg text-white font-bold text-lg active:scale-95 transition-transform"
            >
              {qIndex < questions.length - 1 ? '⏭️ Question suivante' : '🏁 Classement final'}
            </button>
          )}
        </div>
      </div>
    )
  }

  // === QUESTION SCREEN ===
  const hasAnswered = myAnswer !== null

  return (
    <div className="min-h-dvh flex flex-col px-4 py-6">
      {/* Admin top bar */}
      {user.is_admin && (
        <div className="flex gap-2 mb-3">
          <button onClick={quitQuiz} className="px-3 py-1.5 rounded-lg bg-dark-light border border-dark-lighter text-gray-400 text-xs active:scale-95">
            ✕ Quitter
          </button>
          <button onClick={restartQuiz} className="px-3 py-1.5 rounded-lg bg-dark-light border border-dark-lighter text-gray-400 text-xs active:scale-95">
            🔄 Restart
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-dark-lighter rounded-full mb-3 overflow-hidden">
        <div
          className="h-full gradient-bg rounded-full transition-all duration-500"
          style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="text-center mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wider">
          Question {qIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="card mb-4 animate-slide-up">
        <p className="text-xl font-bold text-center leading-relaxed">{currentQuestion.question}</p>
      </div>

      {/* Answer grid */}
      {isSpectator ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-3">👑</div>
          <p className="text-gray-400 text-sm">Tu regardes les autres galérer...</p>
          <div className="flex justify-center gap-1.5 mt-4">
            {allPlayers.map((u) => {
              const hasAnsw = currentAnswers.some((a) => a.user_id === u.id)
              return (
                <div key={u.id} className="flex flex-col items-center gap-1">
                  <div className={`w-3 h-3 rounded-full transition-all ${hasAnsw ? 'bg-green-500' : 'bg-dark-lighter'}`} />
                  <span className="text-[10px] text-gray-600">{u.display_name.slice(0, 3)}</span>
                </div>
              )
            })}
          </div>
          <p className="text-gray-600 text-xs mt-2">{answeredCount}/{allPlayers.length} ont répondu</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 flex-1">
          {questionAnswers.map((ans, i) => (
            <button
              key={i}
              onClick={() => submitAnswer(i)}
              disabled={hasAnswered}
              className={`p-4 rounded-2xl text-white font-bold text-sm transition-all active:scale-95 bg-gradient-to-br ${COLORS[i]} ${
                hasAnswered
                  ? myAnswer === i
                    ? 'ring-4 ring-white/50 scale-105'
                    : 'opacity-30'
                  : ''
              }`}
            >
              <p className="text-2xl mb-2">{SHAPES[i]}</p>
              <p>{ans}</p>
            </button>
          ))}
        </div>
      )}

      {/* Waiting indicator */}
      {!isSpectator && hasAnswered && !showResults && (
        <div className="mt-4 text-center animate-fade-in">
          <p className="text-accent font-bold text-sm mb-2">Réponse envoyée ✅</p>
          <div className="flex justify-center gap-1.5 mt-2">
            {allPlayers.map((u) => {
              const hasAnsw = currentAnswers.some((a) => a.user_id === u.id)
              return (
                <div key={u.id} className="flex flex-col items-center gap-1">
                  <div className={`w-3 h-3 rounded-full transition-all ${hasAnsw ? 'bg-green-500' : 'bg-dark-lighter'}`} />
                  <span className="text-[10px] text-gray-600">{u.display_name.slice(0, 3)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Master: show results button */}
      {user.is_admin && hasAnswered && !showResults && (
        <button
          onClick={showResultsNow}
          className={`mt-3 w-full py-4 rounded-xl text-white font-bold text-lg active:scale-95 transition-transform ${
            allAnsweredQ ? 'gradient-bg animate-pulse-glow' : 'bg-dark-light border border-dark-lighter'
          }`}
        >
          {allAnsweredQ ? '🎉 Tout le monde a répondu !' : `📊 Résultats (${answeredCount}/${allPlayers.length})`}
        </button>
      )}
    </div>
  )
}

function Leaderboard({ playerScores, currentUserId, compact }: {
  playerScores: { id: string; display_name: string; quizScore: number }[]
  currentUserId: string
  compact?: boolean
}) {
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="space-y-2">
      {playerScores.map((p, i) => (
        <div
          key={p.id}
          className={`card flex items-center gap-3 ${compact ? 'py-2' : 'py-3'} ${
            p.id === currentUserId ? 'border-accent/50 bg-purple-900/20' : ''
          } ${i === 0 && !compact ? 'border-yellow-500/30 bg-yellow-900/10' : ''} animate-slide-up`}
          style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}
        >
          <div className={`${compact ? 'text-lg' : 'text-2xl'} w-8 text-center`}>
            {i < 3 ? medals[i] : <span className="text-gray-500 text-sm">{i + 1}</span>}
          </div>
          <div className="flex-1">
            <p className={`font-bold ${compact ? 'text-sm' : ''}`}>
              {p.display_name}
              {p.id === currentUserId && <span className="text-accent text-xs ml-1">(toi)</span>}
            </p>
          </div>
          <p className={`font-bold gradient-text ${compact ? 'text-sm' : ''}`}>{p.quizScore} pts</p>
        </div>
      ))}
    </div>
  )
}
