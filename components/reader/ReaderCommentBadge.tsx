interface Props {
  count: number
  className?: string
}

function safeCount(count: number) {
  return Math.max(0, Math.trunc(Number.isFinite(count) ? count : 0))
}

export function readerCommentBadgeMarkup(count: number) {
  const value = safeCount(count)
  return `<span class="reader-comment-badge" aria-label="${value} ความคิดเห็น"><svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><text x="12" y="13" text-anchor="middle">${value}</text></svg></span>`
}

export default function ReaderCommentBadge({ count, className = '' }: Props) {
  const value = safeCount(count)
  return (
    <span className={`reader-comment-badge ${className}`} aria-label={`${value} ความคิดเห็น`}>
      <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <text x="12" y="13" textAnchor="middle">{value}</text>
      </svg>
    </span>
  )
}
