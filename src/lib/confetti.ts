import confetti from 'canvas-confetti'

export function fireConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#a855f7', '#ec4899', '#f97316', '#facc15'],
  })
}

export function fireSideConfetti() {
  const end = Date.now() + 500
  const colors = ['#a855f7', '#ec4899', '#f97316']

  ;(function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    })
    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()
}
