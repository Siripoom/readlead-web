export function AudioCoverArt({ index }: { index: number }) {
  const variant = index % 4

  return (
    <svg viewBox="0 0 100 150" className="h-full w-full" aria-hidden="true">
      <g fill="#fff" opacity=".42">
        <circle cx="18" cy="21" r="1.2" />
        <circle cx="78" cy="17" r="1.4" />
        <circle cx="87" cy="47" r="1" />
      </g>
      {variant === 0 && (
        <>
          <circle cx="68" cy="34" r="21" fill="#fff" opacity=".14" />
          <path d="M0 117 27 78l21 27 25-48 27 60v33H0z" fill="#070812" opacity=".32" />
        </>
      )}
      {variant === 1 && (
        <>
          <circle cx="50" cy="46" r="27" fill="none" stroke="#fff" strokeWidth="2" opacity=".2" />
          <path d="M0 120q28-22 52-7 22 14 48-5v42H0z" fill="#070812" opacity=".35" />
        </>
      )}
      {variant === 2 && (
        <>
          <path d="M75 25a19 19 0 1 1-10-17 13 13 0 1 0 10 17z" fill="#fff" opacity=".35" />
          <path d="m0 113 25-30 18 23 27-44 30 51v37H0z" fill="#070812" opacity=".31" />
        </>
      )}
      {variant === 3 && (
        <>
          <path d="M14 150V91l15-17 15 17v59zm43 0V70l15-16 14 16v80z" fill="#070812" opacity=".3" />
          <circle cx="51" cy="59" r="14" fill="#fff" opacity=".12" />
        </>
      )}
      <g transform="translate(25 86)" opacity=".78">
        <path d="M5 22a20 20 0 0 1 40 0" fill="none" stroke="#f6dc91" strokeWidth="5" strokeLinecap="round" />
        <rect x="1" y="20" width="10" height="20" rx="5" fill="#f6dc91" />
        <rect x="39" y="20" width="10" height="20" rx="5" fill="#f6dc91" />
      </g>
    </svg>
  )
}
