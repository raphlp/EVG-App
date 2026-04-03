import { vibrate } from '../lib/vibrate'

interface WelcomeProps {
  onStart: () => void
}

export default function Welcome({ onStart }: WelcomeProps) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 overflow-hidden relative">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-dark to-dark pointer-events-none" />

      {/* Floating party emojis */}
      <span className="animate-float absolute text-3xl" style={{ top: '6%', left: '8%', animationDelay: '0s' }}>🍻</span>
      <span className="animate-float-reverse absolute text-2xl" style={{ top: '10%', right: '7%', animationDelay: '0.5s' }}>🎉</span>
      <span className="animate-float-slow absolute text-2xl" style={{ top: '30%', left: '4%', animationDelay: '1.2s' }}>💀</span>
      <span className="animate-float absolute text-2xl" style={{ top: '35%', right: '5%', animationDelay: '1.8s' }}>🔥</span>
      <span className="animate-float-reverse absolute text-xl" style={{ top: '60%', left: '6%', animationDelay: '0.8s' }}>🥂</span>
      <span className="animate-float-slow absolute text-xl" style={{ top: '65%', right: '8%', animationDelay: '2.2s' }}>😈</span>
      <span className="animate-float absolute text-lg" style={{ top: '80%', left: '12%', animationDelay: '1.5s' }}>🎊</span>
      <span className="animate-float-reverse absolute text-lg" style={{ top: '85%', right: '12%', animationDelay: '0.3s' }}>💍</span>

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm text-center">

        {/* Photo de Vincent */}
        <div className="relative mx-auto w-48 h-48 mb-7 animate-photo-entrance">
          {/* Glow */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-pink-500/30 via-purple-500/20 to-orange-500/30 blur-2xl animate-hero-glow" />
          {/* Ring degrade */}
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 p-[3px]">
            <div className="w-full h-full rounded-full bg-dark" />
          </div>
          {/* Photo */}
          <img
            src="/vincent-hero.png"
            alt="Vincent"
            className="absolute inset-0 w-48 h-48 rounded-full object-cover"
            style={{ clipPath: 'circle(50%)' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              const fallback = e.currentTarget.nextElementSibling as HTMLElement | null
              if (fallback) fallback.classList.remove('hidden')
            }}
          />
          {/* Fallback */}
          <div className="hidden absolute inset-0 rounded-full bg-gradient-to-br from-pink-600 to-purple-700 flex items-center justify-center">
            <span className="text-7xl">🤵</span>
          </div>
          {/* Crown */}
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-5xl animate-float-slow drop-shadow-lg">👑</span>
          {/* Sparkles */}
          <span className="absolute -bottom-1 -right-2 text-2xl animate-sparkle" style={{ animationDelay: '0s' }}>✨</span>
          <span className="absolute top-2 -left-2 text-xl animate-sparkle" style={{ animationDelay: '1s' }}>✨</span>
          <span className="absolute top-1/2 -right-4 text-lg animate-sparkle" style={{ animationDelay: '0.5s' }}>✨</span>
        </div>

        {/* Title */}
        <div className="animate-title-entrance">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-400/70 mb-2">Enterrement de vie de garcon</p>
          <h1 className="text-4xl font-black leading-tight">
            <span className="gradient-text">Bienvenue a l'EVG</span>
          </h1>
          <h2 className="text-5xl font-black text-white mt-1 drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            de Vincent !
          </h2>
        </div>

        {/* Subtitle */}
        <p className="animate-subtitle-entrance text-gray-400 mt-4 text-lg italic">
          Sa derniere soiree de liberte... 😈
        </p>

        {/* Decorative line */}
        <div className="flex items-center gap-3 mt-8 mb-8 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          <span className="text-pink-400/60 text-sm">🎉 🍾 🎉</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
        </div>

        {/* CTA Button */}
        <button
          onClick={() => { vibrate(); onStart() }}
          className="w-full py-5 rounded-2xl gradient-bg text-white font-black text-xl active:scale-95 transition-transform animate-pulse-glow animate-fade-in shadow-2xl shadow-purple-500/20"
          style={{ animationDelay: '1s', animationFillMode: 'both' }}
        >
          C'est parti ! 🚀
        </button>

        <p className="text-gray-600 text-xs mt-4 animate-fade-in" style={{ animationDelay: '1.2s', animationFillMode: 'both' }}>
          Prepare-toi Vincent...
        </p>
      </div>
    </div>
  )
}
