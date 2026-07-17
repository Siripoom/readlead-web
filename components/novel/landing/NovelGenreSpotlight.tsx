'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, ChevronDown, ChevronLeft, ChevronRight, Eye, List, Sparkles } from 'lucide-react'
import type { HomeBookStripItem } from '@/lib/home-landing-data'
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
}

export function NovelGenreSpotlight({ items, options, activeGenre }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { rowRef, canScrollBack, canScrollForward, updateControls, scroll, pointerHandlers } =
    useHorizontalScroll()
  const primaryOptions = options.slice(0, 6)
  const extraOptions = options.slice(6)

  return (
    <div>
      <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_2px_7px_rgba(0,0,0,0.12)]">
        <div className="relative min-h-[228px] overflow-hidden bg-[radial-gradient(130%_150%_at_88%_8%,#f6ecff_0%,rgba(246,236,255,0)_46%),linear-gradient(110deg,#ece1ff_0%,#f1e8ff_30%,#f9ebf4_64%,#ffeef5_100%)] px-6 py-8 sm:px-10">
          <div className="relative z-10 max-w-[660px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#cc4452]/20 bg-white/75 px-4 py-1.5 text-xs font-semibold text-[#cc4452] sm:text-sm">
              <Sparkles className="h-3.5 w-3.5" /> นิยายดี ๆ ที่รอให้คุณค้นพบ
            </span>
            <h3 className="mt-5 text-[30px] font-extrabold leading-tight text-[#2a2540] sm:text-[40px]">
              เติมเต็มทุกอารมณ์
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#6b6580] sm:text-base">
              คัดสรรนิยายคุณภาพ หลากหลายแนว ครบทุกอารมณ์ ให้คุณสนุกได้ไม่รู้จบ
            </p>
          </div>
          <div className="absolute bottom-[-35px] right-[-20px] hidden h-[230px] w-[330px] opacity-80 sm:block" aria-hidden="true">
            <BookOpen className="h-full w-full stroke-[1] text-[#bca7ec]" />
          </div>
        </div>

        <div className="border-t border-[#e0e2e9] bg-white px-3 py-2 sm:px-5">
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
                    <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.03]">
                      <NovelCoverArt index={index} />
                    </div>
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
