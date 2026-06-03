'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Percent } from 'lucide-react'
import type { DiscountNovelItem } from '@/lib/types'

const SCROLL_AMOUNT = 392

interface CardProps {
  item: DiscountNovelItem
}

function DiscountCard({ item }: CardProps) {
  return (
    <Link
      href={item.href}
      className="group flex w-[152px] shrink-0 flex-col gap-1.5 transition-all duration-200 hover:-translate-y-1 md:w-[176px]"
    >
      <div className="relative aspect-3/4 overflow-hidden rounded-xl shadow-sm group-hover:shadow-md">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 152px, 176px"
        />

        <div className="absolute left-2 top-2 rounded-md bg-rose-500 px-2 py-0.5 text-xs font-bold text-white shadow">
          {item.discountLabel}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-rose-600/90 px-2 py-1 text-white backdrop-blur-sm">
          <Percent className="h-3 w-3 shrink-0" />
          <span className="truncate text-[10px] font-bold tabular-nums">{item.countdown}</span>
        </div>
      </div>

      <p className="truncate text-sm font-bold leading-5 text-foreground">{item.title}</p>
      <p className="truncate text-[11px] text-muted-foreground">{item.publisher} · {item.author}</p>
      <p className="truncate text-[11px] text-muted-foreground">{item.genre} · แปล: {item.translator}</p>
    </Link>
  )
}

interface Props {
  title: string
  items: DiscountNovelItem[]
}

export function DiscountNovelCarousel({ title, items }: Props) {
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

  if (items.length === 0) return null

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
        {items.map(item => (
          <DiscountCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
