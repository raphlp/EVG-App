-- =============================================
-- EVG Vincent — Contenu des jeux
-- À exécuter dans Supabase SQL Editor APRÈS le schema
-- =============================================

-- Vide les anciennes données
delete from truths;
delete from dares;
delete from quiz_questions;
delete from would_you_rather;

-- =============================================
-- 🤔 VÉRITÉS (20)
-- =============================================
insert into truths (content) values
  ('Quel est ton plus gros mensonge à ta copine/femme ?'),
  ('Quelle est ta pire honte en soirée ?'),
  ('Qui dans ce groupe serait le pire mari ?'),
  ('As-tu déjà regretté une relation ?'),
  ('Ton plus gros red flag ?'),
  ('C''est quoi le truc le plus bizarre que t''as fait bourré ?'),
  ('Si tu devais embrasser quelqu''un du groupe, ce serait qui ?'),
  ('Quel est ton plus gros regret amoureux ?'),
  ('As-tu déjà stalké l''ex de quelqu''un ici ?'),
  ('Quel est le secret que tu n''as jamais dit à personne ici ?'),
  ('C''est quoi la chose la plus gênante dans ton historique de recherche ?'),
  ('Tu as déjà menti à quelqu''un du groupe ? Sur quoi ?'),
  ('Quel est ton crush inavoué ?'),
  ('C''est quoi le truc le plus cher que t''as cassé bourré ?'),
  ('Raconte ton pire date de ta vie'),
  ('Quel est le message le plus gênant que t''as envoyé par erreur ?'),
  ('Si tu devais noter Vincent en tant que pote sur 10, tu mets combien ?'),
  ('C''est quoi le truc le plus nul que t''as fait pour impressionner quelqu''un ?'),
  ('Qui ici tu appellerais en premier si t''avais un problème à 3h du mat ?'),
  ('Quel est ton souvenir le plus gênant avec Vincent ?');

-- =============================================
-- 🎬 ACTIONS (20)
-- =============================================
insert into dares (content) values
  ('Fais un vocal gênant à ta copine/femme maintenant'),
  ('Danse 30 secondes sans musique devant tout le monde'),
  ('Complimente un inconnu dans la rue/le bar'),
  ('Imite Vincent bourré'),
  ('Fais une déclaration d''amour publique à Vincent'),
  ('Appelle quelqu''un au hasard dans tes contacts et chante joyeux anniversaire'),
  ('Fais 20 squats maintenant'),
  ('Parle avec un accent pendant les 5 prochaines minutes'),
  ('Fais un selfie avec un inconnu'),
  ('Envoie un message bizarre au dernier contact dans ton tel'),
  ('Fais le tour du groupe en faisant un compliment à chacun'),
  ('Imite quelqu''un du groupe, les autres doivent deviner qui'),
  ('Raconte une blague — si personne rigole, tu bois'),
  ('Poste une story Instagram gênante (tu peux supprimer après)'),
  ('Fais un bras de fer avec la personne à ta gauche'),
  ('Appelle ta mère et dis-lui que tu l''aimes'),
  ('Mime un film, les autres devinent'),
  ('Fais ton plus beau moonwalk'),
  ('Envoie "tu me manques" à ton ex'),
  ('Chante le refrain de la dernière chanson que t''as écoutée');

-- =============================================
-- 🧠 QUIZ VINCENT (18 questions)
-- correct = 0 pour A, 1 pour B, 2 pour C, 3 pour D
-- =============================================
insert into quiz_questions (question, answer_a, answer_b, answer_c, answer_d, correct) values
  ('Où Vincent a rencontré Prisca ?',
   'En soirée', 'Sur une appli', 'Au travail', 'Par des amis communs', 2),

  ('En quelle année Vincent et Prisca se sont mis ensemble ?',
   '2021', '2022', '2023', '2024', 2),

  ('Quel est le plat préféré de Vincent ?',
   'La raclette', 'Le pot-au-feu', 'Le burger', 'Les lasagnes', 1),

  ('Quel est le plus gros défaut de Vincent ?',
   'Radin', 'Susceptible', 'Toujours en retard', 'Trop têtu', 1),

  ('Quel âge avait Vincent à son premier bisou ?',
   '12 ans', '14 ans', '16 ans', '18 ans', 1),

  ('Quel est le sport préféré de Vincent ?',
   'Le foot', 'Le tennis', 'Le ski', 'La natation', 2),

  ('Quelle est la plus grande peur de Vincent ?',
   'Les araignées', 'Se casser un os', 'Parler en public', 'Les hauteurs', 1),

  ('Quel est le film préféré de Vincent ?',
   'Le Seigneur des Anneaux', 'Star Wars', 'Intouchables', 'The Dark Knight', 1),

  ('Quel est le surnom que Prisca donne à Vincent ?',
   'Mon cœur', 'Chéri', 'Bébé', 'Vinou', 1),

  ('Quelle est la destination de rêve de Vincent ?',
   'Le Japon', 'Le Vietnam', 'La Thaïlande', 'L''Australie', 1),

  ('Quel est le talent caché de Vincent ?',
   'Il chante bien', 'Il est bricoleur', 'Il danse bien', 'Il cuisine bien', 1),

  ('Quel est l''artiste que Vincent met à fond en soirée ?',
   'Oasis', 'Nirvana', 'AC/DC', 'Red Hot Chili Peppers', 1),

  ('Quelle est la boisson préférée de Vincent ?',
   'Orangina', 'Coca', 'Ice Tea', 'Perrier', 1),

  ('Quel est le métier de Vincent ?',
   'Comptable', 'Banquier', 'Commercial', 'Ingénieur', 1),

  ('Quel est l''endroit le plus insolite où Vincent s''est endormi bourré ?',
   'Sur un banc public', 'Dans un rond-point', 'Dans une baignoire', 'Sur le capot d''une voiture', 1),

  ('Quelle est la plus grosse connerie que Vincent a faite ?',
   'Sauter dans une piscine habillé', 'Partir en road trip sans permis', 'Appeler son boss bourré', 'Se raser la tête pour un pari', 0),

  ('Quel est le surnom que ses potes donnent à Vincent ?',
   'Vince', 'Vins', 'Vinz', 'Le Vin', 1),

  ('Quelle est la plus grande qualité de Vincent ?',
   'Drôle', 'Gentil', 'Généreux', 'Loyal', 1);

-- =============================================
-- 🤷 TU PRÉFÈRES (20)
-- =============================================
insert into would_you_rather (option_a, option_b) values
  ('Ne plus jamais boire d''alcool', 'Ne plus jamais manger de pizza'),
  ('Épouser quelqu''un que tu n''aimes pas', 'Ne jamais te marier'),
  ('Revivre ta pire honte', 'Que tout le monde la voit en vidéo'),
  ('Être le plus moche mais le plus drôle', 'Être le plus beau mais ennuyeux'),
  ('Perdre ton tel pendant 1 an', 'Perdre ton meilleur pote pendant 1 an'),
  ('Dire tout ce que tu penses pendant 24h', 'Ne rien dire pendant 1 semaine'),
  ('Vivre sans musique', 'Vivre sans films/séries'),
  ('Avoir un pet bruyant à chaque premier date', 'Roter à chaque bisou'),
  ('Être bloqué dans un ascenseur avec ton ex', 'Avec ton boss'),
  ('Ne plus jamais mentir', 'Ne plus jamais dire la vérité'),
  ('Lire les pensées de tout le monde', 'Que personne ne puisse lire les tiennes'),
  ('Gagner au loto mais devoir tout dépenser en 24h', 'Gagner 2000€/mois à vie'),
  ('Chanter tout ce que tu dis', 'Danser à chaque fois que tu marches'),
  ('Être célèbre mais détesté', 'Inconnu mais aimé de tous'),
  ('Ne plus jamais utiliser Instagram', 'Ne plus jamais utiliser YouTube'),
  ('Avoir les cheveux de Trump', 'La voix de Chipmunk pour toujours'),
  ('Manger que des pâtes pour toujours', 'Que du riz pour toujours'),
  ('Être invisible', 'Pouvoir voler'),
  ('Revivre tes 15 ans', 'Avancer direct à 60 ans'),
  ('Savoir comment tu meurs', 'Savoir quand tu meurs');
