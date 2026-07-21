'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, ChevronLeft, ChevronRight, Eye, List } from 'lucide-react'
import { CmsBannerCarousel } from '@/components/home/landing/CmsBannerCarousel'
import type { HomeBookStripItem } from '@/lib/home-landing-data'
import type { CmsBanner } from '@/lib/cms-catalog'
import type { NovelGenreOption } from '@/lib/novel-landing-data'
import type { Genre } from '@/lib/types'
import { cn } from '@/lib/utils'
import styles from '@/components/home/landing/HomeLanding.module.css'
import { useHorizontalScroll } from '@/components/home/landing/useHorizontalScroll'
import { NovelCoverArt } from './NovelCoverArt'

type Props = {
  items: HomeBookStripItem[]
  options: NovelGenreOption[]
  activeGenre: Genre | null
  banners: CmsBanner[]
  slideSeconds: number
}

export function NovelGenreSpotlight({ items, options, activeGenre, banners, slideSeconds }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { rowRef, canScrollBack, canScrollForward, updateControls, scroll, pointerHandlers } =
    useHorizontalScroll()
  const primaryOptions = options.slice(0, 6)
  const extraOptions = options.slice(6)

  return (
    <div>
      {banners.length > 0 && (
        <CmsBannerCarousel
          items={banners}
          aspect="1152 / 228"
          slideSeconds={slideSeconds}
          label="แบนเนอร์เติมเต็มทุกอารมณ์"
        />
      )}
      <div className={`${banners.length > 0 ? 'mt-0 rounded-b-[18px]' : 'rounded-[18px]'} overflow-hidden bg-white shadow-[0_2px_7px_rgba(0,0,0,0.12)]`}>
        <div className="bg-white px-3 py-2 sm:px-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
            {primaryOptions.map((option) => (
              <GenreLink key={option.genre} option={option} activeGenre={activeGenre} />
            ))}
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded((expanded) => !expanded)}
              className="col-span-2 flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-bold text-[#3a3650] transition hover:bg-[#f7f4fc] hover:text-[#cc4452] focus-visible:outline-2 focus-visible:outline-[#cc4452] sm:col-span-2 lg:col-span-1"
            >
              ดูหมวดทั้งหมด
              <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
            </button>
          </div>

          {isExpanded && (
            <div className="grid grid-cols-2 gap-1 border-t border-[#e0e2e9] px-1 py-4 sm:grid-cols-3 lg:grid-cols-6">
              {extraOptions.map((option) => (
                <GenreLink key={option.genre} option={option} activeGenre={activeGenre} compact />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-6">
        {items.length > 0 ? (
          <>
            {canScrollBack && (
              <button
                type="button"
                aria-label="รายการหมวดหมู่ก่อนหน้า"
                onClick={() => scroll(-1)}
                className="absolute left-0 top-1/2 z-10 grid h-10 w-10 -translate-x-1/3 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-[#23193c]/45 text-white shadow-md backdrop-blur transition hover:bg-[#23193c]/65 sm:-translate-x-1/2"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <div
              ref={rowRef}
              onScroll={updateControls}
              className={cn(
                styles.scrollRow,
                'grid cursor-grab grid-flow-col grid-rows-2 auto-cols-[144px] gap-x-5 gap-y-5 overflow-x-auto px-1 pb-2 pt-1 active:cursor-grabbing sm:auto-cols-[160px] sm:gap-x-[38px]',
              )}
              {...pointerHandlers}
            >
              {items.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/detail?bookId=${encodeURIComponent(item.detailId)}`}
                  className="group min-w-0 snap-start"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-[13px] shadow-[0_2px_7px_rgba(0,0,0,0.12)]" style={{ background: item.gradient }}>
                    <GenreCover item={item} index={index} />
                  </div>
                  <h4 className="mt-2.5 truncate text-sm font-semibold text-[var(--home-ink)]">{item.title}</h4>
                  <p className="mt-0.5 truncate text-xs text-[var(--home-ink-3)]">{item.author}</p>
                  <p className="mt-0.5 truncate text-xs text-[var(--home-ink)]">{item.genreLabel} · {item.originLabel}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-xs font-bold text-[var(--home-ink-2)]">
                    <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{item.views}</span>
                    <span className="inline-flex items-center gap-1"><List className="h-3.5 w-3.5" />{item.chapters}</span>
                  </div>
                </Link>
              ))}
            </div>

            {canScrollForward && (
              <button
                type="button"
                aria-label="รายการหมวดหมู่ถัดไป"
                onClick={() => scroll(1)}
                className="absolute right-0 top-1/2 z-10 grid h-10 w-10 translate-x-1/3 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-[#23193c]/45 text-white shadow-md backdrop-blur transition hover:bg-[#23193c]/65 sm:translate-x-1/2"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--home-line)] bg-[var(--home-soft)] px-6 py-10 text-center text-sm text-[var(--home-ink-2)]">
            ไม่พบเรื่องในหมวดนี้
          </div>
        )}
      </div>
    </div>
  )
}

function GenreCover({ item, index }: { item: HomeBookStripItem; index: number }) {
  const [coverFailed, setCoverFailed] = useState(false)
  return (
    <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.03]">
      <NovelCoverArt index={index} />
      {item.coverUrl && !coverFailed && (
        <Image
          unoptimized
          fill
          sizes="(max-width: 640px) 144px, 160px"
          src={item.coverUrl}
          alt={`ภาพปก ${item.title}`}
          className="object-cover"
          onError={() => setCoverFailed(true)}
        />
      )}
    </div>
  )
}

function GenreLink({
  option,
  activeGenre,
  compact = false,
}: {
  option: NovelGenreOption
  activeGenre: Genre | null
  compact?: boolean
}) {
  const isActive = activeGenre === option.genre
  return (
    <Link
      href={`/novel?genre=${option.genre}`}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex min-h-11 items-center justify-center border-r border-[#e0e2e9] px-2 text-center text-sm font-semibold text-[#3f3a55] transition hover:bg-[#f7f4fc] hover:text-[#cc4452] focus-visible:outline-2 focus-visible:outline-[#cc4452]',
        compact && 'rounded-lg border-r-0',
        isActive && 'bg-[#fdeff2] text-[#cc4452]',
      )}
    >
      {option.label}
    </Link>
  )
}
