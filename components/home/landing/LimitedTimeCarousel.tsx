'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Clock3 } from 'lucide-react'
import type { HomeLimitedOffer } from '@/lib/home-landing-data'
import styles from './HomeLanding.module.css'
import { useHorizontalScroll } from './useHorizontalScroll'

function formatCountdown(totalSeconds: number) {
  const seconds = Math.max(0, totalSeconds)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = seconds % 60
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${days} วัน : ${pad(hours)} : ${pad(minutes)} : ${pad(rest)}`
}

export function LimitedTimeCarousel({ items }: { items: HomeLimitedOffer[] }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const {
    rowRef,
    canScrollBack,
    canScrollForward,
    updateControls,
    scroll,
    pointerHandlers,
  } = useHorizontalScroll()

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="relative">
      {canScrollBack && (
        <button
          type="button"
          aria-label="ข้อเสนอก่อนหน้า"
          onClick={() => scroll(-1)}
          className="absolute left-0 top-[38%] z-10 grid h-[38px] w-[38px] -translate-x-1/3 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-[#23193c]/45 text-white shadow-md backdrop-blur transition hover:bg-[#23193c]/65 sm:-translate-x-1/2"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <div
        ref={rowRef}
        onScroll={updateControls}
        className={`${styles.scrollRow} flex cursor-grab gap-5 overflow-x-auto px-1 pb-2 pt-1 active:cursor-grabbing sm:gap-[38px]`}
        {...pointerHandlers}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/detail?bookId=${encodeURIComponent(item.detailId)}`}
            className="group w-[144px] shrink-0 snap-start sm:w-40"
          >
            <div
              className="relative aspect-[2/3] overflow-hidden rounded-[13px] shadow-[0_2px_7px_rgba(0,0,0,0.12)]"
              style={{ background: item.gradient }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.45),transparent_28%),linear-gradient(to_top,rgba(30,20,50,0.18),transparent_50%)] transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-[linear-gradient(90deg,#ff5f8d,#ff2f6a)] px-1.5 py-1.5 text-[11px] font-semibold tabular-nums text-white sm:text-[12px]">
                <Clock3 className="h-3.5 w-3.5 shrink-0 fill-current" />
                <span>{formatCountdown(item.initialSeconds - elapsedSeconds)}</span>
              </div>
            </div>
            <h3 className="mt-2 truncate text-sm font-semibold leading-snug text-[var(--home-ink)]">
              {item.title}
            </h3>
            <p className="truncate text-xs text-[var(--home-ink-2)]">{item.author}</p>
          </Link>
        ))}
      </div>

      {canScrollForward && (
        <button
          type="button"
          aria-label="ข้อเสนอถัดไป"
          onClick={() => scroll(1)}
          className="absolute right-0 top-[38%] z-10 grid h-[38px] w-[38px] translate-x-1/3 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-[#23193c]/45 text-white shadow-md backdrop-blur transition hover:bg-[#23193c]/65 sm:translate-x-1/2"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
