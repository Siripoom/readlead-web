'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Eye, List } from 'lucide-react'
import { CONTENT_TYPE_LABELS } from '@/lib/content-types'
import { GENRE_LABELS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { Work } from '@/lib/types'
import { formatCompact } from './format'

const CARD_STEP = 160 + 14 // card width + gap (px)

export function PopularStrip({ works }: { works: Work[] }) {
  const stripRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const updateArrows = useCallback(() => {
    const el = stripRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft < maxScroll - 4)
  }, [])

  useEffect(() => {
    updateArrows()
    window.addEventListener('resize', updateArrows)
    return () => window.removeEventListener('resize', updateArrows)
  }, [updateArrows])

  function scrollBy(dir: -1 | 1) {
    stripRef.current?.scrollBy({ left: dir * CARD_STEP * 3, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {canPrev && (
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="ก่อนหน้า"
          className="absolute -left-4 top-[40%] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-rl-red-deep shadow-[0_4px_14px_rgba(58,31,36,0.15)] transition-transform hover:scale-105"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <div
        ref={stripRef}
        onScroll={updateArrows}
        className="flex gap-3.5 overflow-x-auto px-1 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {works.map((work, i) => {
          const rank = i + 1
          return (
            <Link
              key={work.id}
              href={`/detail/${work.id}`}
              className="group flex w-40 shrink-0 flex-col transition-transform hover:-translate-y-1"
            >
              <div className="relative aspect-3/4 overflow-hidden rounded-[14px] bg-gradient-to-br from-rl-cream-deep to-rl-pink">
                <Image
                  src={work.coverUrl}
                  alt={work.title}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
                <span
                  className={cn(
                    'absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 text-[13px] font-black',
                    rank === 1
                      ? 'border-rl-red bg-rl-gold text-rl-ink'
                      : 'border-rl-gold bg-rl-red text-white',
                  )}
                >
                  {rank}
                </span>
              </div>
              <div className="px-0.5 pt-2.5">
                <div className="truncate text-[13px] font-bold text-black">{work.title}</div>
                <div className="mt-0.5 truncate text-[11px] text-rl-ink-soft">{work.authorName}</div>
                <div className="mt-0.5 text-xs text-rl-ink-soft">
                  {CONTENT_TYPE_LABELS[work.type]} · {GENRE_LABELS[work.genres[0]] ?? work.genres[0]}
                </div>
                <div className="mt-1 flex items-center gap-2.5 text-[11px] font-bold text-rl-red-deep">
                  <span className="inline-flex items-center gap-1">
                    <List className="h-3 w-3" />
                    {work.episodeCount}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {formatCompact(work.viewCount)}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {canNext && (
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="ถัดไป"
          className="absolute -right-4 top-[40%] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-rl-red-deep shadow-[0_4px_14px_rgba(58,31,36,0.15)] transition-transform hover:scale-105"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
