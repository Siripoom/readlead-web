import Link from 'next/link'
import type { HomeActivityCard } from '@/lib/home-landing-data'
import { cn } from '@/lib/utils'

const toneClasses: Record<HomeActivityCard['tone'], string> = {
  violet: 'bg-[linear-gradient(135deg,#efeafe,#e4d8fb)] [&_.promo-button]:bg-[#7355df]',
  pink: 'bg-[linear-gradient(135deg,#fdeaf2,#fbd9e7)] [&_.promo-button]:bg-[#ee5a96] [&_h2]:text-[#ee5a96]',
  lavender: 'bg-[linear-gradient(135deg,#f0eafe,#e7defb)] [&_.promo-button]:bg-[#7355df]',
}

function PromoArtwork({ type }: { type: HomeActivityCard['artwork'] }) {
  if (type === 'trophy') {
    return (
      <svg viewBox="0 0 96 96" aria-hidden="true">
        <path d="M30 20h36v10a18 18 0 0 1-36 0z" fill="#f6b73c" />
        <path d="M30 24h-8a8 8 0 0 0 8 10M66 24h8a8 8 0 0 1-8 10" fill="none" stroke="#e09b1e" strokeWidth="4" />
        <rect x="42" y="48" width="12" height="14" fill="#e09b1e" />
        <rect x="32" y="62" width="32" height="9" rx="3" fill="#d98c14" />
        <path d="M44 30l4 8 4-8z" fill="#fff" opacity=".6" />
      </svg>
    )
  }

  if (type === 'reward') {
    return (
      <svg viewBox="0 0 96 96" aria-hidden="true">
        <circle cx="40" cy="56" r="20" fill="#f6b73c" />
        <circle cx="40" cy="56" r="14" fill="#ffd56b" />
        <text x="40" y="61" fontSize="14" textAnchor="middle" fill="#d98c14" fontWeight="700">฿</text>
        <rect x="54" y="46" width="28" height="24" rx="4" fill="#ee5a96" />
        <rect x="54" y="52" width="28" height="5" fill="#fff" opacity=".5" />
        <path d="M68 46v24M62 46c-4-6 6-8 6 0M74 46c4-6-6-8-6 0" stroke="#fff" strokeWidth="3" fill="none" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 96 96" aria-hidden="true">
      <rect x="22" y="40" width="52" height="36" rx="5" fill="#b89bf0" />
      <path d="M22 44l26 18 26-18" fill="none" stroke="#fff" strokeWidth="3" />
      <circle cx="66" cy="36" r="12" fill="#ee5a96" />
      <path d="M66 30c-3-4 5-6 5 0 0-6 8-4 5 0l-5 6z" fill="#fff" />
    </svg>
  )
}

export function ActivityPromos({ cards }: { cards: HomeActivityCard[] }) {
  return (
    <section aria-label="กิจกรรมสำหรับนักอ่าน" className="grid gap-4 md:grid-cols-3 md:gap-5">
      {cards.map((card) => (
        <article
          key={card.id}
          className={cn(
            'relative min-h-[150px] overflow-hidden rounded-[18px] px-6 py-5 shadow-[0_2px_7px_rgba(0,0,0,0.10)] sm:min-h-[170px] sm:px-[26px] sm:py-[23px]',
            toneClasses[card.tone],
          )}
        >
          <div className="relative z-[1] flex h-full max-w-[72%] flex-col items-start justify-center">
            <p className="text-xs text-[var(--home-ink-2)] sm:text-[13px]">{card.badge}</p>
            <h2 className="mt-1 text-lg font-bold leading-tight sm:text-[21px]">{card.title}</h2>
            <p className="mt-1 text-xs text-[var(--home-ink-2)] sm:text-[13px]">{card.description}</p>
            <Link
              href={card.href}
              className="promo-button mt-4 inline-flex rounded-[9px] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc4452]"
            >
              {card.ctaLabel}
            </Link>
          </div>
          <span className="absolute right-3 top-1/2 w-[76px] -translate-y-1/2 sm:right-4 sm:w-[86px]">
            <PromoArtwork type={card.artwork} />
          </span>
        </article>
      ))}
    </section>
  )
}
