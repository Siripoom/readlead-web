export default function OrnamentalDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center py-2 ${className}`} aria-hidden>
      <div className="ornament-divider flex-1" />
      <span className="mx-3 text-[var(--gold)] text-xs select-none">✦</span>
      <div className="ornament-divider flex-1" />
    </div>
  )
}
