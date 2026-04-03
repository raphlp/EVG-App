export interface User {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  score: number
  is_admin: boolean
  is_target: boolean
  has_submitted_challenges: boolean
  created_at: string
}

export interface VincentChallenge {
  id: string
  proposed_by: string
  content: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

export interface Room {
  id: string
  name: string
  total_points: number
  progress_percentage: number
  current_game: 'idle' | 'truth-dare' | 'challenge' | 'quiz' | 'wyr' | null
  current_card: string | null
  current_card_type: 'truth' | 'dare' | 'challenge' | null
  current_card_target: string | null
  current_challenge_id: string | null
  session_version: number
  quiz_launched: boolean
  quiz_question_index: number
  quiz_show_results: boolean
  quiz_finished: boolean
  quiz_paused: boolean
  quiz_question_started_at: string | null
}

export interface QuizQuestion {
  id: string
  question: string
  answer_a: string
  answer_b: string
  answer_c: string
  answer_d: string
  correct: number
}

export interface WouldYouRather {
  id: string
  option_a: string
  option_b: string
}

export interface QuizAnswer {
  id: string
  user_id: string
  question_id: string
  answer: number
  created_at: string
}

export type Page = 'home' | 'truth-dare' | 'challenges' | 'quiz' | 'wyr' | 'scoreboard'
