'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Work } from '@/lib/types'

const SCROLL_AMOUNT = 392

interface CardProps {
  work: Work
  rank: number
}

function RankingCard({ work, rank }: CardProps) {
  return (
    <Link
      href={`/detail/${work.id}`}
      className="group flex w-[152px] shrink-0 flex-col gap-1.5 transition-all duration-200 hover:-translate-y-1 md:w-[176px]"
    >
      <div className="relative aspect-3/4 overflow-hidden rounded-xl shadow-sm group-hover:shadow-md">
        <Image
          src={work.coverUrl}
          alt={work.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 152px, 176px"
        />

        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/70 to-transparent pointer-events-none" />

        <span
          className={cn(
            'absolute bottom-2 left-2 text-5xl font-black leading-none drop-shadow-md tabular-nums',
            rank === 1 ? 'text-amber-400' :
            rank === 2 ? 'text-slate-300' :
            rank === 3 ? 'text-orange-400' :
            'text-white/80',
          )}
        >
          {rank}
        </span>
      </div>

      <p className="truncate text-sm font-bold leading-5 text-foreground">{work.title}</p>
      <p className="truncate text-[11px] text-muted-foreground">{work.authorName}</p>
      <p className="truncate text-[11px] text-muted-foreground">{work.genres[0]}</p>
    </Link>
  )
}

interface Props {
  title: string
  works: Work[]
}

export function AllTimeRankingCarousel({ title, works }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const update = () => {
      setCanScrollLeft(el.scrollLeft > 0)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    return () => el.removeEventListener('scroll', update)
  }, [])

  if (works.length === 0) return null

  const handleScrollLeft = () =>
    scrollRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' })
  const handleScrollRight = () =>
    scrollRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' })

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <div className="flex gap-2">
          {canScrollLeft && (
            <button
              type="button"
              onClick={handleScrollLeft}
              aria-label="Scroll left"
              className="rounded-full bg-black/80 p-2 text-white transition-colors hover:bg-black"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              onClick={handleScrollRight}
              aria-label="Scroll right"
              className="rounded-full bg-black/80 p-2 text-white transition-colors hover:bg-black"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 md:gap-5 [&::-webkit-scrollbar]:hidden"
      >
        {works.map((work, i) => (
          <RankingCard key={work.id} work={work} rank={i + 1} />
        ))}
      </div>
    </section>
  )
}
