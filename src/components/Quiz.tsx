import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { QuizQuestion } from '../lib/types'
import { vibrate } from '../lib/vibrate'
import { fireConfetti } from '../lib/confetti'

interface QuizProps {
  onBack: () => void
  onScore: (points: number) => void
}

export default function Quiz({ onBack, onScore }: QuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    supabase.from('quiz_questions').select('*').order('created_at').then(({ data }) => {
      if (data && data.length > 0) setQuestions(data as QuizQuestion[])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">🧠</div>
        <h1 className="text-2xl font-bold gradient-text mb-4">Quiz Vincent</h1>
        <p className="text-gray-400 mb-6">Aucune question configurée</p>
        <button onClick={onBack} className="py-3 px-6 rounded-xl gradient-bg text-white font-bold active:scale-95 transition-transform">Retour</button>
      </div>
    )
  }

  const question = questions[questionIndex]
  const answers = [question.answer_a, question.answer_b, question.answer_c, question.answer_d]

  const handleAnswer = (answerIndex: number) => {
    if (selected !== null) return
    vibrate()
    setSelected(answerIndex)

    if (answerIndex === question.correct) {
      fireConfetti()
      setScore((s) => s + 15)
      onScore(15)
    } else {
      vibrate([100, 50, 100])
    }
  }

  const nextQuestion = () => {
    if (questionIndex >= questions.length - 1) {
      setFinished(true)
      return
    }
    setQuestionIndex((i) => i + 1)
    setSelected(null)
  }

  if (finished) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6">
        <div className="animate-slide-up text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-3xl font-bold gradient-text mb-4">Quiz terminé !</h1>
          <p className="text-xl text-gray-300 mb-2">
            Score : <span className="text-accent font-bold">{score} pts</span>
          </p>
          <p className="text-gray-500 mb-8">
            {score >= 60 ? "Tu connais bien Vincent ! 👏" :
             score >= 30 ? "Pas mal ! 🤔" : "Tu connais pas ton pote 😂"}
          </p>
          <button
            onClick={onBack}
            className="py-4 px-8 rounded-xl gradient-bg text-white font-bold text-lg active:scale-95 transition-transform"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col px-4 py-6">
      <div className="flex-1 flex flex-col justify-center animate-slide-up">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🧠</div>
          <p className="text-gray-400 text-sm">
            Question {questionIndex + 1}/{questions.length}
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${
                i === questionIndex ? 'gradient-bg' :
                i < questionIndex ? 'bg-green-500' : 'bg-dark-lighter'
              }`}
            />
          ))}
        </div>

        <div className="card mb-6">
          <p className="text-xl font-bold text-center leading-relaxed">{question.question}</p>
        </div>

        <div className="space-y-3">
          {answers.map((answer, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={selected !== null}
              className={`w-full py-4 px-6 rounded-xl text-left font-medium text-lg transition-all active:scale-[0.98] ${
                selected === null
                  ? 'bg-dark-light border border-dark-lighter hover:border-accent'
                  : i === question.correct
                    ? 'bg-green-900/50 border border-green-500 text-green-300'
                    : i === selected
                      ? 'bg-red-900/50 border border-red-500 text-red-300 animate-shake'
                      : 'bg-dark-light border border-dark-lighter opacity-50'
              }`}
            >
              <span className="text-gray-500 mr-3">{String.fromCharCode(65 + i)}</span>
              {answer}
            </button>
          ))}
        </div>

        {selected !== null && (
          <button
            onClick={nextQuestion}
            className="mt-6 py-4 rounded-xl gradient-bg text-white font-bold text-lg active:scale-95 transition-transform animate-fade-in"
          >
            {questionIndex < questions.length - 1 ? '⏭️ Question suivante' : '🏁 Voir résultat'}
          </button>
        )}
      </div>
    </div>
  )
}
