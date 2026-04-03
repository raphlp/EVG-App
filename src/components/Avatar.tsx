interface AvatarProps {
  url: string | null
  name: string
  isTarget?: boolean
  size?: number
  borderColor?: string
}

const COLORS = [
  'from-purple-600 to-pink-600',
  'from-blue-600 to-purple-600',
  'from-pink-600 to-orange-500',
  'from-green-600 to-teal-500',
  'from-yellow-500 to-orange-500',
  'from-red-600 to-pink-600',
  'from-indigo-600 to-blue-500',
]

function getColorForName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase()
}

export default function Avatar({ url, name, isTarget, size = 48, borderColor = 'border-dark-lighter' }: AvatarProps) {
  const sizeStyle = { width: size, height: size }

  if (url) {
    return (
      <div
        className={`rounded-full overflow-hidden border-2 ${borderColor} flex-shrink-0`}
        style={sizeStyle}
      >
        <img src={url} alt="" className="w-full h-full object-cover" />
      </div>
    )
  }

  if (isTarget) {
    return (
      <div
        className={`rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0 border-2 ${borderColor}`}
        style={sizeStyle}
      >
        <span style={{ fontSize: size * 0.45 }}>👑</span>
      </div>
    )
  }

  const color = getColorForName(name)
  return (
    <div
      className={`rounded-full bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 border-2 ${borderColor}`}
      style={sizeStyle}
    >
      <span className="font-bold text-white" style={{ fontSize: size * 0.35 }}>
        {getInitials(name)}
      </span>
    </div>
  )
}
