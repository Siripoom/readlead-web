export function MangaCoverArt({ index }: { index: number }) {
  const variant = index % 4

  if (variant === 0) {
    return (
      <svg viewBox="0 0 100 150" className="h-full w-full" aria-hidden="true">
        <circle cx="70" cy="29" r="22" fill="#fff" opacity=".17" />
        <path d="m0 118 31-39 18 25 25-47 26 61v32H0z" fill="#05060d" opacity=".33" />
        <path d="M42 150q1-40 9-47 9 7 10 47z" fill="#05060d" opacity=".62" />
        <path d="m48 70 4-25 4 25-4 39z" fill="#f4d37a" opacity=".8" />
      </svg>
    )
  }

  if (variant === 1) {
    return (
      <svg viewBox="0 0 100 150" className="h-full w-full" aria-hidden="true">
        <g fill="none" stroke="#fff" opacity=".24">
          <circle cx="50" cy="48" r="29" strokeWidth="2" />
          <circle cx="50" cy="48" r="20" />
          <path d="M8 48h84M50 6v84" />
        </g>
        <path d="M0 121q25-23 48-9 25 15 52-5v43H0z" fill="#06060d" opacity=".38" />
        <path d="m46 76 9 0 5 74H37z" fill="#06060d" opacity=".58" />
      </svg>
    )
  }

  if (variant === 2) {
    return (
      <svg viewBox="0 0 100 150" className="h-full w-full" aria-hidden="true">
        <path d="M76 27a20 20 0 1 1-11-18 14 14 0 1 0 11 18z" fill="#fff" opacity=".38" />
        <path d="m0 114 23-27 19 18 26-42 32 51v36H0z" fill="#05060d" opacity=".32" />
        <path d="M32 150q2-43 19-43t20 43z" fill="#05060d" opacity=".56" />
        <path d="m41 98 10-13 10 13-10 11z" fill="#f0d27d" opacity=".72" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 100 150" className="h-full w-full" aria-hidden="true">
      <g fill="#fff" opacity=".45">
        <circle cx="17" cy="22" r="1.2" />
        <circle cx="79" cy="16" r="1.5" />
        <circle cx="88" cy="49" r="1" />
        <circle cx="28" cy="62" r=".9" />
      </g>
      <path d="M16 150V92l14-16 14 16v58zm40 0V72l15-17 15 17v78z" fill="#05060d" opacity=".35" />
      <circle cx="51" cy="66" r="12" fill="#05060d" opacity=".58" />
      <path d="M35 150q1-55 16-67 16 12 17 67z" fill="#05060d" opacity=".58" />
    </svg>
  )
}
