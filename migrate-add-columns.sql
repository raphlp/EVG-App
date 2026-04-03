-- Migration: ajouter les colonnes manquantes
-- À exécuter dans Supabase SQL Editor
-- Ne casse rien, ajoute juste ce qui manque

-- Colonnes room
ALTER TABLE room ADD COLUMN IF NOT EXISTS quiz_paused boolean DEFAULT false;
ALTER TABLE room ADD COLUMN IF NOT EXISTS quiz_question_started_at timestamp with time zone;

-- Table quiz_answers (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS quiz_answers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  question_id uuid references quiz_questions(id) on delete cascade,
  answer int not null,
  created_at timestamp with time zone default now(),
  unique(user_id, question_id)
);

-- RLS + Realtime pour quiz_answers
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow all on quiz_answers" ON quiz_answers FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE quiz_answers;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Reset l'état du quiz maintenant
UPDATE room SET
  quiz_launched = false,
  quiz_question_index = 0,
  quiz_show_results = false,
  quiz_finished = false,
  quiz_paused = false,
  quiz_question_started_at = null,
  current_game = 'idle'
WHERE name = 'EVG Vincent';

-- Supprime les réponses quiz
DELETE FROM quiz_answers;
