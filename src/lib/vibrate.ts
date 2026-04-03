export function vibrate(pattern: number | number[] = 50) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}
