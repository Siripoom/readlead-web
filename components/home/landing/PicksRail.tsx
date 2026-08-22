'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HomeBookStripItem } from '@/lib/home-landing-data'
import { cn } from '@/lib/utils'
import styles from './HomeLanding.module.css'
import { MobileRailDots } from './MobileRailDots'
import { useHorizontalScroll } from './useHorizontalScroll'

const CONTENT_TYPE_BADGE = {
  novel: { label: 'นิยาย', background: '#cc4452' },
  manga: { label: 'เว็บตูน', background: '#1c3f94' },
  audiobook: { label: 'หนังสือเสียง', background: '#f5821f' },
} as const

export function PicksRail({ items }: { items: HomeBookStripItem[] }) {
  const {
    rowRef,
    canScrollBack,
    canScrollForward,
    activePage,
    pageCount,
    updateControls,
    scroll,
    scrollToPage,
    pointerHandlers,
  } = useHorizontalScroll({ autoplayMs: 4200 })

  if (items.length === 0) return null

  return (
    <div className="relative">
      {canScrollBack && (
        <button
          type="button"
          aria-label="รายการก่อนหน้า"
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 z-10 hidden h-[34px] w-[34px] -translate-x-1/3 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-[#23193c]/45 text-white shadow-md backdrop-blur sm:grid"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      <div
        ref={rowRef}
        onScroll={updateControls}
        className={cn(styles.scrollRow, 'flex cursor-grab gap-[14px] overflow-x-auto pb-1 pt-1 active:cursor-grabbing')}
        {...pointerHandlers}
      >
        {items.map((item) => {
          const badge = item.contentType ? CONTENT_TYPE_BADGE[item.contentType] : null
          return (
            <Link
              key={item.id}
              href={item.href ?? `/detail?bookId=${encodeURIComponent(item.detailId)}`}
              className="relative h-[134px] w-[170px] shrink-0 snap-start overflow-hidden rounded-[13px] shadow-[0_2px_7px_rgba(0,0,0,0.14)]"
              style={{ background: item.gradient }}
            >
              {item.coverUrl && (
                <Image
                  unoptimized
                  fill
                  sizes="170px"
                  src={item.coverUrl}
                  alt=""
                  className="object-cover"
                />
              )}
              <span className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden="true" />
              {badge && (
                <span
                  className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                  style={{ background: badge.background }}
                >
                  {badge.label}
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 p-2.5">
                <h3 className="truncate text-[13px] font-bold leading-snug text-white">{item.title}</h3>
                <p className="mt-0.5 truncate text-[10px] text-white/80">{item.genreLabel} · {item.originLabel}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {canScrollForward && (
        <button
          type="button"
          aria-label="รายการถัดไป"
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 z-10 hidden h-[34px] w-[34px] translate-x-1/3 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-[#23193c]/45 text-white shadow-md backdrop-blur sm:grid"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      <MobileRailDots
        activePage={activePage}
        pageCount={pageCount}
        onSelect={(page) => scrollToPage(page, true)}
        label="เลือกหน้ารายการคัดสรร"
      />
    </div>
  )
}
