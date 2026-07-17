import Link from 'next/link'
import { Eye, List } from 'lucide-react'
import type { MangaBookItem, MangaLatestUpdate } from '@/lib/manga-landing-data'
import { MangaCoverArt } from './MangaCoverArt'

type Props = {
  items: Array<MangaBookItem | MangaLatestUpdate>
  emptyLabel?: string
}

function isLatestUpdate(item: MangaBookItem | MangaLatestUpdate): item is MangaLatestUpdate {
  return 'updatedLabel' in item
}

export function MangaBookGrid({ items, emptyLabel = 'ไม่พบมังงะในหมวดนี้' }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--home-line)] bg-[var(--home-soft)] px-6 py-10 text-center text-sm text-[var(--home-ink-2)]">
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-x-[38px]">
      {items.map((item, index) => (
        <Link
          key={item.id}
          href={`/detail?bookId=${encodeURIComponent(item.detailId)}`}
          className="group min-w-0 focus-visible:rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7355df]"
        >
          <div
            className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-[0_2px_7px_rgba(0,0,0,0.12)]"
            style={{ background: item.gradient }}
          >
            <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.03]">
              <MangaCoverArt index={index} />
            </div>
            {isLatestUpdate(item) && (
              <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur-sm sm:text-[10px]">
                {item.updatedLabel}
              </span>
            )}
          </div>
          <h3 className="mt-2.5 truncate text-sm font-bold text-[var(--home-ink)]">{item.title}</h3>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-[var(--home-ink-2)]">{item.author}</p>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-[var(--home-ink-2)]">
            {item.genreLabel} · {item.originLabel}
          </p>
          <div className="mt-1.5 flex items-center gap-3 text-[11px] font-bold text-[var(--home-ink-2)]">
            <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{item.views}</span>
            <span className="inline-flex items-center gap-1"><List className="h-3.5 w-3.5" />{item.chapters}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
