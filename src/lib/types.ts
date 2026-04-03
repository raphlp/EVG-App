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

export type Page = 'home' | 'truth-dare' | 'challenges' | 'quiz' | 'wyr' | 'scoreboard'

export const PLAYERS = [
  { username: 'bruno', display_name: 'Bruno', is_admin: false, is_target: false },
  { username: 'laurent', display_name: 'Laurent', is_admin: false, is_target: false },
  { username: 'denis', display_name: 'Denis', is_admin: false, is_target: false },
  { username: 'xavier', display_name: 'Xavier', is_admin: false, is_target: false },
  { username: 'flo', display_name: 'Flo', is_admin: false, is_target: false },
  { username: 'raph', display_name: 'Raph', is_admin: true, is_target: false },
  { username: 'vincent', display_name: 'Vincent', is_admin: false, is_target: true },
] as const
