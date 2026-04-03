-- EVG Vincent - Supabase Schema v4
-- Run this in your Supabase SQL Editor
-- ⚠️ Drops everything and recreates from scratch

drop table if exists quiz_answers cascade;
drop table if exists vincent_challenges cascade;
drop table if exists truths cascade;
drop table if exists dares cascade;
drop table if exists quiz_questions cascade;
drop table if exists would_you_rather cascade;
drop table if exists completions cascade;
drop table if exists challenges cascade;
drop table if exists users cascade;
drop table if exists room cascade;

-- Users table
create table users (
  id uuid default gen_random_uuid() primary key,
  username text not null unique,
  display_name text not null,
  avatar_url text,
  score int default 0,
  is_admin boolean default false,
  is_target boolean default false,
  has_submitted_challenges boolean default false,
  created_at timestamp with time zone default now()
);

-- Room table (single room, includes realtime game state)
create table room (
  id uuid default gen_random_uuid() primary key,
  name text not null default 'EVG Vincent',
  total_points int default 0,
  progress_percentage int default 0,
  current_game text default 'idle',
  current_card text,
  current_card_type text,
  current_card_target text,
  current_challenge_id uuid,
  session_version int default 1,
  quiz_launched boolean default false,
  quiz_question_index int default 0,
  quiz_show_results boolean default false,
  quiz_finished boolean default false,
  quiz_paused boolean default false,
  quiz_question_started_at timestamp with time zone
);

-- Challenges proposed by players for Vincent
create table vincent_challenges (
  id uuid default gen_random_uuid() primary key,
  proposed_by uuid references users(id) on delete cascade,
  content text not null,
  status text default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at timestamp with time zone default now()
);

-- Vérités
create table truths (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  created_at timestamp with time zone default now()
);

-- Actions
create table dares (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  created_at timestamp with time zone default now()
);

-- Quiz questions
create table quiz_questions (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  answer_a text not null,
  answer_b text not null,
  answer_c text not null,
  answer_d text not null,
  correct int not null default 0, -- 0=A, 1=B, 2=C, 3=D
  created_at timestamp with time zone default now()
);

-- Tu préfères
create table would_you_rather (
  id uuid default gen_random_uuid() primary key,
  option_a text not null,
  option_b text not null,
  created_at timestamp with time zone default now()
);

-- Insert the single room
insert into room (name, total_points, progress_percentage, current_game, session_version, quiz_launched)
values ('EVG Vincent', 0, 0, 'idle', 1, false);

-- Pre-fill players
insert into users (username, display_name, score, is_admin, is_target, has_submitted_challenges) values
  ('bruno', 'Bruno', 0, false, false, false),
  ('laurent', 'Laurent', 0, false, false, false),
  ('denis', 'Denis', 0, false, false, false),
  ('xavier', 'Xavier', 0, false, false, false),
  ('flo', 'Flo', 0, false, false, false),
  ('raph', 'Raph', 0, true, false, false),  -- admin, PIN 7472 côté client
  ('vincent', 'Vincent', 0, false, true, true);  -- Vincent skips challenge submission

-- Default truths
insert into truths (content) values
  ('Quel est ton plus gros mensonge à ta future femme ?'),
  ('Quelle est ta pire honte en soirée ?'),
  ('Qui dans ce groupe serait le pire mari ?'),
  ('As-tu déjà regretté ta relation ?'),
  ('Ton plus gros red flag ?');

-- Default dares
insert into dares (content) values
  ('Fais un vocal gênant à ta future femme'),
  ('Danse 30 secondes sans musique'),
  ('Complimente un inconnu'),
  ('Imite Vincent bourré'),
  ('Fais une déclaration d''amour publique');

-- Default quiz
insert into quiz_questions (question, answer_a, answer_b, answer_c, answer_d, correct) values
  ('Où Vincent a rencontré sa future femme ?', 'En soirée', 'Sur Tinder', 'Au travail', 'En vacances', 0),
  ('Quel est son plat préféré ?', 'Pizza', 'Sushi', 'Burger', 'Tacos', 2),
  ('Son plus gros défaut ?', 'Toujours en retard', 'Trop têtu', 'Ronfleur', 'Radin', 1),
  ('Qui est son meilleur pote ici ?', 'Alex', 'Thomas', 'Maxime', 'Il les aime tous pareil', 3);

-- Default tu préfères
insert into would_you_rather (option_a, option_b) values
  ('Ne plus jamais boire d''alcool', 'Ne plus jamais manger de pizza'),
  ('Épouser quelqu''un que tu n''aimes pas', 'Ne jamais te marier'),
  ('Revivre ta pire honte', 'Que tout le monde la voit en vidéo'),
  ('Être le plus moche mais le plus drôle', 'Être le plus beau mais ennuyeux');

-- Quiz answers (track who answered what in live quiz)
create table quiz_answers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  question_id uuid references quiz_questions(id) on delete cascade,
  answer int not null,
  created_at timestamp with time zone default now(),
  unique(user_id, question_id)
);

-- Enable Realtime
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table room;
alter publication supabase_realtime add table vincent_challenges;
alter publication supabase_realtime add table quiz_answers;

-- RLS Policies (permissive for party app)
alter table users enable row level security;
alter table room enable row level security;
alter table vincent_challenges enable row level security;
alter table truths enable row level security;
alter table dares enable row level security;
alter table quiz_questions enable row level security;
alter table would_you_rather enable row level security;

create policy "Allow all on users" on users for all using (true) with check (true);
create policy "Allow all on room" on room for all using (true) with check (true);
create policy "Allow all on vincent_challenges" on vincent_challenges for all using (true) with check (true);
create policy "Allow all on truths" on truths for all using (true) with check (true);
create policy "Allow all on dares" on dares for all using (true) with check (true);
create policy "Allow all on quiz_questions" on quiz_questions for all using (true) with check (true);
create policy "Allow all on would_you_rather" on would_you_rather for all using (true) with check (true);

alter table quiz_answers enable row level security;
create policy "Allow all on quiz_answers" on quiz_answers for all using (true) with check (true);
