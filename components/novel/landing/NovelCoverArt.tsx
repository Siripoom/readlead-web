export function NovelCoverArt({ index = 0 }: { index?: number }) {
  const variant = index % 4

  if (variant === 0) {
    return (
      <svg viewBox="0 0 100 150" className="h-full w-full" aria-hidden="true">
        <circle cx="70" cy="31" r="19" fill="#fff" opacity=".2" />
        <path d="M0 114 27 72l24 33 25-52 24 62v35H0z" fill="#080812" opacity=".28" />
        <circle cx="48" cy="103" r="7" fill="#070710" opacity=".52" />
        <path d="M37 150q1-34 11-40 10 6 11 40z" fill="#070710" opacity=".52" />
      </svg>
    )
  }

  if (variant === 1) {
    return (
      <svg viewBox="0 0 100 150" className="h-full w-full" aria-hidden="true">
        <path d="M72 20a18 18 0 1 1-9-15 13 13 0 1 0 9 15z" fill="#fff" opacity=".4" />
        <path d="M0 108 29 70l23 32 25-42 23 48v42H0z" fill="#070710" opacity=".3" />
        <rect x="50" y="48" width="3" height="77" rx="1.5" fill="#05050b" opacity=".58" />
        <rect x="44" y="118" width="15" height="4" rx="2" fill="#05050b" opacity=".58" />
      </svg>
    )
  }

  if (variant === 2) {
    return (
      <svg viewBox="0 0 100 150" className="h-full w-full" aria-hidden="true">
        <circle cx="52" cy="45" r="27" fill="none" stroke="#fff" strokeWidth="3" opacity=".24" />
        <circle cx="52" cy="45" r="17" fill="#fff" opacity=".12" />
        <path d="M0 118q30-22 56-5 20 12 44-4v41H0z" fill="#080812" opacity=".36" />
        <path d="m53 70 4 36-5 44h-9l3-44z" fill="#06060d" opacity=".52" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 100 150" className="h-full w-full" aria-hidden="true">
      <g fill="#fff" opacity=".52">
        <circle cx="20" cy="22" r="1.2" />
        <circle cx="72" cy="17" r="1.4" />
        <circle cx="84" cy="48" r="1" />
      </g>
      <path d="M27 150V83q0-18 23-18t23 18v67z" fill="#05050b" opacity=".47" />
      <circle cx="50" cy="61" r="10" fill="#05050b" opacity=".47" />
      <path d="m40 53 4 8 6-10 6 10 4-8v10H40z" fill="#f6d77a" opacity=".82" />
    </svg>
  )
}
