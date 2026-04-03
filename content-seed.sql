-- =============================================
-- EVG Vincent — Contenu des jeux
-- À personnaliser puis exécuter dans Supabase SQL Editor
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
  ('Tu préfères qui entre [PRÉNOM 1] et [PRÉNOM 2] ? Pourquoi ?'),
  ('Raconte ton pire date de ta vie'),
  ('Quel est le message le plus gênant que t''as envoyé par erreur ?'),
  ('Si tu devais noter Vincent en tant que pote sur 10, tu mets combien ?'),
  ('C''est quoi le truc le plus nul que t''as fait pour impressionner quelqu''un ?'),
  ('Qui ici tu appellerais en premier si t''avais un problème à 3h du mat ?');

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
-- 🧠 QUIZ VINCENT
-- Remplace les réponses par les VRAIES infos sur Vincent
-- correct = 0 pour A, 1 pour B, 2 pour C, 3 pour D
-- =============================================
insert into quiz_questions (question, answer_a, answer_b, answer_c, answer_d, correct) values
  -- Personnalise les réponses et le correct ↓
  ('Où Vincent a rencontré sa future femme ?',
   '[Réponse A]', '[Réponse B]', '[Réponse C]', '[Réponse D]', 0),

  ('En quelle année ils se sont mis ensemble ?',
   '[Réponse A]', '[Réponse B]', '[Réponse C]', '[Réponse D]', 0),

  ('Quel est le plat préféré de Vincent ?',
   '[Réponse A]', '[Réponse B]', '[Réponse C]', '[Réponse D]', 0),

  ('Quel est le plus gros défaut de Vincent ?',
   '[Réponse A]', '[Réponse B]', '[Réponse C]', '[Réponse D]', 0),

  ('Quel âge avait Vincent à son premier baiser ?',
   '[Réponse A]', '[Réponse B]', '[Réponse C]', '[Réponse D]', 0),

  ('Quel est le sport préféré de Vincent ?',
   '[Réponse A]', '[Réponse B]', '[Réponse C]', '[Réponse D]', 0),

  ('Quelle est la plus grande peur de Vincent ?',
   '[Réponse A]', '[Réponse B]', '[Réponse C]', '[Réponse D]', 0),

  ('Quel est le film préféré de Vincent ?',
   '[Réponse A]', '[Réponse B]', '[Réponse C]', '[Réponse D]', 0),

  ('Comment s''appelle le/la meilleur(e) ami(e) de Vincent ?',
   '[Réponse A]', '[Réponse B]', '[Réponse C]', '[Réponse D]', 0),

  ('Quel est le surnom que sa femme lui donne ?',
   '[Réponse A]', '[Réponse B]', '[Réponse C]', '[Réponse D]', 0),

  ('Quelle est la destination de rêve de Vincent ?',
   '[Réponse A]', '[Réponse B]', '[Réponse C]', '[Réponse D]', 0),

  ('Quel est le talent caché de Vincent ?',
   '[Réponse A]', '[Réponse B]', '[Réponse C]', '[Réponse D]', 0),

  ('Quelle est la chanson que Vincent met à fond en soirée ?',
   '[Réponse A]', '[Réponse B]', '[Réponse C]', '[Réponse D]', 0),

  ('Combien de fois Vincent a été bourré ce mois-ci ?',
   '0', '1-2', '3-5', 'On a arrêté de compter', 3),

  ('Quelle est la boisson préférée de Vincent ?',
   '[Réponse A]', '[Réponse B]', '[Réponse C]', '[Réponse D]', 0);

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
