import Image from 'next/image'
import Link from 'next/link'
import { CONTENT_TYPE_LABELS } from '@/lib/content-types'
import { GENRE_LABELS } from '@/lib/mock-data'
import type { Work } from '@/lib/types'

const RECENT_MS = 7 * 24 * 60 * 60 * 1000

function badgeFor(work: Work): string | null {
  if (work.status === 'completed') return 'จบแล้ว'
  if (work.isFeatured) return 'ฮิต'
  if (Date.now() - Date.parse(work.updatedAt) < RECENT_MS) return 'ใหม่'
  return null
}

export function RecommendedGrid({ works }: { works: Work[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {works.map((work) => {
        const badge = badgeFor(work)
        return (
          <Link key={work.id} href={`/detail/${work.id}`} className="group block">
            <div className="relative mb-2.5 aspect-3/4 overflow-hidden rounded-xl bg-gradient-to-br from-rl-cream-deep to-rl-pink">
              <Image
                src={work.coverUrl}
                alt={work.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {badge && (
                <span className="absolute right-2 top-2 rounded-md bg-rl-gold px-2 py-0.5 text-[11px] font-extrabold text-rl-ink">
                  {badge}
                </span>
              )}
            </div>
            <div className="truncate text-sm font-bold text-rl-ink">{work.title}</div>
            <div className="text-xs text-rl-ink-soft">
              {GENRE_LABELS[work.genres[0]] ?? work.genres[0]} · {CONTENT_TYPE_LABELS[work.type]}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
