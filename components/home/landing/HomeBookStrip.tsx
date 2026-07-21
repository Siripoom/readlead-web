'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Eye, Headphones, List } from 'lucide-react'
import { useState } from 'react'
import type { HomeBookStripItem } from '@/lib/home-landing-data'
import { cn } from '@/lib/utils'
import styles from './HomeLanding.module.css'
import { useHorizontalScroll } from './useHorizontalScroll'

const CONTENT_TYPE_LABELS = { novel: 'นิยาย', manga: 'เว็บตูน', audiobook: 'หนังสือเสียง' } as const

function CoverScene({ index }: { index: number }) {
  const variant = index % 4
  if (variant === 0) {
    return (
      <svg viewBox="0 0 100 150" className="h-full w-full" aria-hidden="true">
        <circle cx="70" cy="34" r="20" fill="#fff" opacity=".2" />
        <path d="M0 115 28 74l22 30 25-48 25 59v35H0z" fill="#080812" opacity=".28" />
        <circle cx="47" cy="104" r="7" fill="#070710" opacity=".5" />
        <path d="M37 150q1-34 10-39 10 5 11 39z" fill="#070710" opacity=".5" />
      </svg>
    )
  }
  if (variant === 1) {
    return (
      <svg viewBox="0 0 100 150" className="h-full w-full" aria-hidden="true">
        <circle cx="50" cy="45" r="27" fill="none" stroke="#fff" strokeWidth="3" opacity=".22" />
        <circle cx="50" cy="45" r="17" fill="#fff" opacity=".12" />
        <path d="M0 118q30-22 56-5 20 12 44-4v41H0z" fill="#080812" opacity=".35" />
        <path d="m53 70 4 36-5 44h-9l3-44z" fill="#06060d" opacity=".5" />
      </svg>
    )
  }
  if (variant === 2) {
    return (
      <svg viewBox="0 0 100 150" className="h-full w-full" aria-hidden="true">
        <path d="M72 20a18 18 0 1 1-9-15 13 13 0 1 0 9 15z" fill="#fff" opacity=".38" />
        <path d="M0 108 29 70l23 32 25-42 23 48v42H0z" fill="#070710" opacity=".3" />
        <rect x="50" y="49" width="3" height="76" rx="1.5" fill="#05050b" opacity=".55" />
        <rect x="44" y="118" width="15" height="4" rx="2" fill="#05050b" opacity=".55" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 100 150" className="h-full w-full" aria-hidden="true">
      <g fill="#fff" opacity=".5">
        <circle cx="20" cy="22" r="1.2" /><circle cx="72" cy="17" r="1.4" /><circle cx="84" cy="48" r="1" />
      </g>
      <path d="M27 150V83q0-18 23-18t23 18v67z" fill="#05050b" opacity=".46" />
      <circle cx="50" cy="61" r="10" fill="#05050b" opacity=".46" />
      <path d="m40 53 4 8 6-10 6 10 4-8v10H40z" fill="#f6d77a" opacity=".8" />
    </svg>
  )
}

function BookCover({ item, index }: { item: HomeBookStripItem; index: number }) {
  const [coverFailed, setCoverFailed] = useState(false)
  return (
    <>
      <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.03]">
        <CoverScene index={index} />
      </div>
      {item.coverUrl && !coverFailed && (
        <Image
          unoptimized
          fill
          sizes="(max-width: 640px) 160px, 176px"
          src={item.coverUrl}
          alt={`ภาพปก ${item.title}`}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          onError={() => setCoverFailed(true)}
        />
      )}
      {item.availability === 'coming_soon' && (
        <span className="absolute right-2 top-2 z-[2] rounded-full bg-[#cc4452] px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
          เร็ว ๆ นี้
        </span>
      )}
      {item.contentType && item.availability !== 'coming_soon' && (
        <span className="absolute right-2 top-2 z-[2] rounded-full bg-[#2e2a3d]/80 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
          {CONTENT_TYPE_LABELS[item.contentType]}
        </span>
      )}
    </>
  )
}

type Props = {
  items: HomeBookStripItem[]
  variant?: 'popular' | 'recommended'
}

export function HomeBookStrip({ items, variant = 'popular' }: Props) {
  const {
    rowRef,
    canScrollBack,
    canScrollForward,
    updateControls,
    scroll,
    pointerHandlers,
  } = useHorizontalScroll()

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--home-line)] bg-[var(--home-soft)] px-6 py-10 text-center text-sm text-[var(--home-ink-2)]">
        ไม่พบเรื่องในหมวดนี้
      </div>
    )
  }

  const cardWidth = variant === 'popular' ? 'w-40 sm:w-44' : 'w-40'
  const gap = variant === 'popular' ? 'gap-5 lg:gap-[48px]' : 'gap-5 lg:gap-[38px]'

  return (
    <div className="relative">
      {canScrollBack && (
        <button
          type="button"
          aria-label="รายการก่อนหน้า"
          onClick={() => scroll(-1)}
          className="absolute left-0 top-[36%] z-10 grid h-[38px] w-[38px] -translate-x-1/3 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-[#23193c]/45 text-white shadow-md backdrop-blur transition hover:bg-[#23193c]/65 sm:-translate-x-1/2"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <div
        ref={rowRef}
        onScroll={updateControls}
        className={cn(styles.scrollRow, 'flex cursor-grab overflow-x-auto px-1 pb-2 pt-1 active:cursor-grabbing', gap)}
        {...pointerHandlers}
      >
        {items.map((item, index) => {
          const StatIcon = item.mediaType === 'audio' ? Headphones : Eye
          return (
            <Link
              key={item.id}
              href={`/detail?bookId=${encodeURIComponent(item.detailId)}`}
              className={cn('group shrink-0 snap-start', cardWidth)}
            >
              <div
                className="relative aspect-[2/3] overflow-hidden rounded-[13px] shadow-[0_2px_7px_rgba(0,0,0,0.12)]"
                style={{ background: item.gradient }}
              >
                <BookCover item={item} index={index} />
              </div>
              <div className="mt-2.5 min-w-0">
                <h3 className="truncate text-[14px] font-semibold leading-snug text-[var(--home-ink)]">{item.title}</h3>
                <p className="mt-0.5 truncate text-xs text-[var(--home-ink-3)]">{item.author}</p>
                <p className="mt-0.5 truncate text-xs text-[var(--home-ink)]">{item.genreLabel} · {item.originLabel}</p>
                {item.availability === 'coming_soon' ? (
                  <p className="mt-1.5 text-[11px] font-semibold text-[var(--home-red)]">ผ่านการอนุมัติแล้ว · รอตอนแรก</p>
                ) : (
                  <div className="mt-1.5 flex items-center gap-3 text-xs font-bold text-[var(--home-ink-2)]">
                    <span className="inline-flex items-center gap-1"><StatIcon className="h-3.5 w-3.5" />{item.views}</span>
                    <span className="inline-flex items-center gap-1"><List className="h-3.5 w-3.5" />{item.chapters}</span>
                  </div>
                )}
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
          className="absolute right-0 top-[36%] z-10 grid h-[38px] w-[38px] translate-x-1/3 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-[#23193c]/45 text-white shadow-md backdrop-blur transition hover:bg-[#23193c]/65 sm:translate-x-1/2"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
