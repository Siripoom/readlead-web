/**
 * Shared SVG gradient defs for the gold/silver/bronze rank medals.
 * Ported verbatim from index_78.html. Render <MedalDefs /> ONCE per page;
 * every <Medal> references these gradient ids.
 */
export function MedalDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        <linearGradient id="medalGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE9A8" />
          <stop offset="50%" stopColor="#F2C879" />
          <stop offset="100%" stopColor="#D49A3D" />
        </linearGradient>
        <linearGradient id="medalGoldRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF5D0" />
          <stop offset="100%" stopColor="#C8872E" />
        </linearGradient>
        <linearGradient id="medalSilver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#E3E6E9" />
          <stop offset="100%" stopColor="#AFB6BD" />
        </linearGradient>
        <linearGradient id="medalSilverRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#9AA1A8" />
        </linearGradient>
        <linearGradient id="medalBronze" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0BE8C" />
          <stop offset="50%" stopColor="#D6915A" />
          <stop offset="100%" stopColor="#A85F30" />
        </linearGradient>
        <linearGradient id="medalBronzeRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FAD9B8" />
          <stop offset="100%" stopColor="#8C4E22" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const MEDALS = {
  1: { ring: 'url(#medalGoldRing)', face: 'url(#medalGold)', accent: '#C8872E', text: '#8a5a00' },
  2: { ring: 'url(#medalSilverRing)', face: 'url(#medalSilver)', accent: '#9AA1A8', text: '#6b7177' },
  3: { ring: 'url(#medalBronzeRing)', face: 'url(#medalBronze)', accent: '#8C4E22', text: '#6b3a1a' },
} as const

// Gold/silver use a leaf-wreath flourish; bronze uses a star flourish (per mockup).
const WREATH = (
  <g fillOpacity={0.85}>
    <path d="M6 14 q3 -1 4 2 q-3 1 -4 -2z" />
    <path d="M4.5 18 q3.2 -0.5 3.8 2.6 q-3.2 0.6 -3.8 -2.6z" />
    <path d="M4.5 22.5 q3.2 0.5 2.8 3.6 q-3.2 -0.4 -2.8 -3.6z" />
    <path d="M6.5 27 q3 1 1.8 4 q-3 -1 -1.8 -4z" />
    <path d="M34 14 q-3 -1 -4 2 q3 1 4 -2z" />
    <path d="M35.5 18 q-3.2 -0.5 -3.8 2.6 q3.2 0.6 3.8 -2.6z" />
    <path d="M35.5 22.5 q-3.2 0.5 -2.8 3.6 q3.2 -0.4 2.8 -3.6z" />
    <path d="M33.5 27 q-3 1 -1.8 4 q3 -1 1.8 -4z" />
  </g>
)

const STARS = (
  <g fillOpacity={0.8}>
    <path d="M20 2.5 l1.6 3.4 3.7 0.5 -2.7 2.6 0.6 3.7 -3.2 -1.8 -3.2 1.8 0.6 -3.7 -2.7 -2.6 3.7 -0.5z" />
    <path d="M6 9 l1.3 2.7 3 0.4 -2.2 2.1 0.5 3 -2.6 -1.5 -2.6 1.5 0.5 -3 -2.2 -2.1 3 -0.4z" />
    <path d="M34 9 l1.3 2.7 3 0.4 -2.2 2.1 0.5 3 -2.6 -1.5 -2.6 1.5 0.5 -3 -2.2 -2.1 3 -0.4z" />
    <path d="M5 25 l1.3 2.7 3 0.4 -2.2 2.1 0.5 3 -2.6 -1.5 -2.6 1.5 0.5 -3 -2.2 -2.1 3 -0.4z" />
    <path d="M35 25 l1.3 2.7 3 0.4 -2.2 2.1 0.5 3 -2.6 -1.5 -2.6 1.5 0.5 -3 -2.2 -2.1 3 -0.4z" />
  </g>
)

/** Circular medal badge for ranks 1–3 (references <MedalDefs /> gradients). */
export function Medal({ rank, className }: { rank: 1 | 2 | 3; className?: string }) {
  const m = MEDALS[rank]
  return (
    <svg viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="19" fill={m.ring} />
      <circle cx="20" cy="20" r="15.5" fill={m.face} />
      <g fill={m.accent}>{rank === 3 ? STARS : WREATH}</g>
      <text
        x="20"
        y="26"
        fontFamily="Noto Sans Thai, sans-serif"
        fontSize="15"
        fontWeight="900"
        fill={m.text}
        textAnchor="middle"
      >
        {rank}
      </text>
    </svg>
  )
}
