export const truths = [
  "Quel est ton plus gros mensonge à ta future femme ?",
  "Quelle est ta pire honte en soirée ?",
  "Qui dans ce groupe serait le pire mari ?",
  "As-tu déjà regretté ta relation ?",
  "Ton plus gros red flag ?",
  "Quel est le secret que tu n'as jamais dit à personne ici ?",
  "Quelle est la chose la plus bizarre que tu as faite bourré ?",
  "Si tu devais embrasser quelqu'un du groupe, ce serait qui ?",
  "Quel est ton plus gros regret amoureux ?",
  "As-tu déjà stalké l'ex de quelqu'un ici ?",
]

export const dares = [
  "Fais un vocal gênant à ta future femme",
  "Danse 30 secondes sans musique",
  "Complimente un inconnu",
  "Imite Vincent bourré",
  "Fais une déclaration d'amour publique",
  "Appelle quelqu'un et chante 'Happy Birthday'",
  "Fais 20 squats maintenant",
  "Parle avec un accent pendant 5 minutes",
  "Fais un selfie avec un inconnu",
  "Envoie un message bizarre au dernier contact dans ton tel",
]

export const challenges = [
  { content: "Obtenir un shot gratuit", points: 15 },
  { content: "Faire rire un inconnu", points: 10 },
  { content: "Se faire offrir un verre", points: 20 },
  { content: "Danser avec un inconnu", points: 15 },
  { content: "Faire une photo avec quelqu'un au hasard", points: 10 },
  { content: "Chanter une chanson en karaoké", points: 15 },
  { content: "Faire un bras de fer avec un inconnu", points: 10 },
  { content: "Obtenir un numéro de téléphone", points: 20 },
  { content: "Faire un compliment à 5 personnes différentes", points: 10 },
  { content: "Faire un TikTok dans le bar", points: 15 },
]

export interface QuizQuestion {
  question: string
  answers: string[]
  correct: number
}

export const quizQuestions: QuizQuestion[] = [
  {
    question: "Où Vincent a rencontré sa future femme ?",
    answers: ["En soirée", "Sur Tinder", "Au travail", "En vacances"],
    correct: 0,
  },
  {
    question: "Quel est son plat préféré ?",
    answers: ["Pizza", "Sushi", "Burger", "Tacos"],
    correct: 2,
  },
  {
    question: "Son plus gros défaut ?",
    answers: ["Toujours en retard", "Trop têtu", "Ronfleur", "Radin"],
    correct: 1,
  },
  {
    question: "Qui est son meilleur pote ici ?",
    answers: ["Alex", "Thomas", "Maxime", "Il les aime tous pareil 😂"],
    correct: 3,
  },
  {
    question: "Quel âge avait Vincent à son premier baiser ?",
    answers: ["12 ans", "14 ans", "16 ans", "Il attend encore"],
    correct: 1,
  },
  {
    question: "Quel est le sport préféré de Vincent ?",
    answers: ["Foot", "Tennis", "Rugby", "Canapé"],
    correct: 0,
  },
  {
    question: "Quelle est sa plus grande peur ?",
    answers: ["Les araignées", "Le mariage 😂", "Les hauteurs", "Sa belle-mère"],
    correct: 0,
  },
  {
    question: "Combien de fois Vincent a été bourré ce mois-ci ?",
    answers: ["0", "1-2", "3-5", "On a arrêté de compter"],
    correct: 3,
  },
]

export const gages = [
  "Tu payes une tournée 🍺",
  "Tu bois cul sec 🥃",
  "Tu fais 10 pompes 💪",
  "Tu appelles quelqu'un au hasard 📞",
  "Tu danses sur la table 💃",
  "Tu fais un discours sur l'amour 💕",
  "Tu chantes la Marseillaise 🇫🇷",
  "Tu fais une imitation de Vincent 🎭",
  "Tu portes quelqu'un sur ton dos 🏋️",
  "Tu racontes ta pire honte 😳",
  "Tu envoies un message random à ton ex 📱",
  "Tu fais le tour du bar en moonwalk 🕺",
]

export const neverHaveIEver = [
  "Je n'ai jamais menti à ma copine",
  "Je n'ai jamais ghost quelqu'un",
  "Je n'ai jamais fait un date gênant",
  "Je n'ai jamais pleuré devant un film",
  "Je n'ai jamais envoyé un message au mauvais destinataire",
  "Je n'ai jamais fait semblant d'être malade pour ne pas sortir",
  "Je n'ai jamais stalké quelqu'un sur Instagram",
  "Je n'ai jamais menti sur mon âge",
  "Je n'ai jamais dormi pendant une soirée",
  "Je n'ai jamais vomi en soirée",
  "Je n'ai jamais fait un strip poker",
  "Je n'ai jamais embrassé quelqu'un du groupe",
  "Je n'ai jamais oublié un anniversaire important",
  "Je n'ai jamais envoyé un nude",
  "Je n'ai jamais été viré d'un bar",
]

export const punishVincent = [
  "Vincent doit boire un shot mystère 🍹",
  "Vincent doit appeler sa future femme et lui dire un truc gênant 📞",
  "Vincent doit danser seul pendant 1 minute 💃",
  "Vincent doit porter un accessoire ridicule toute la soirée 🎩",
  "Vincent doit faire 20 pompes maintenant 💪",
  "Vincent doit chanter devant tout le monde 🎤",
  "Vincent doit raconter comment il a demandé sa copine en mariage 💍",
  "Vincent doit faire un discours sur pourquoi il aime ses potes 🥹",
  "Vincent ne peut plus utiliser ses mains pendant 5 minutes 🙌",
  "Vincent doit envoyer un selfie gênant à sa future femme 📸",
]
