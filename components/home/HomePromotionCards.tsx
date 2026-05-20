'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HomePromotionBanner } from '@/lib/types'

interface Props {
  items: HomePromotionBanner[]
}

const AUTO_SLIDE_MS = 6000

export function HomePromotionCards({ items }: Props) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const hasMountedRef = useRef(false)
  const [idx, setIdx] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches)

    syncPreference()
    mediaQuery.addEventListener('change', syncPreference)

    return () => mediaQuery.removeEventListener('change', syncPreference)
  }, [])

  const activeIndex = items.length === 0 ? 0 : Math.min(idx, items.length - 1)

  useEffect(() => {
    const target = itemRefs.current[activeIndex]

    if (!target) return

    target.scrollIntoView({
      behavior: hasMountedRef.current && !prefersReducedMotion ? 'smooth' : 'auto',
      block: 'nearest',
      inline: 'start',
    })

    hasMountedRef.current = true
  }, [activeIndex, prefersReducedMotion])

  useEffect(() => {
    const viewport = viewportRef.current

    if (!viewport || items.length <= 1) return

    let frame = 0

    const syncActiveIndex = () => {
      const scrollLeft = viewport.scrollLeft
      let nextIndex = 0
      let minDistance = Number.POSITIVE_INFINITY

      itemRefs.current.forEach((item, itemIndex) => {
        if (!item) return

        const distance = Math.abs(item.offsetLeft - scrollLeft)

        if (distance < minDistance) {
          minDistance = distance
          nextIndex = itemIndex
        }
      })

      setIdx(current => (current === nextIndex ? current : nextIndex))
    }

    const handleScroll = () => {
      cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(syncActiveIndex)
    }

    viewport.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      viewport.removeEventListener('scroll', handleScroll)
    }
  }, [items.length])

  useEffect(() => {
    if (items.length <= 1 || prefersReducedMotion) return

    const timer = window.setInterval(() => {
      setIdx(current => (current + 1) % items.length)
    }, AUTO_SLIDE_MS)

    return () => window.clearInterval(timer)
  }, [items.length, prefersReducedMotion])

  if (items.length === 0) return null

  const showControls = items.length > 1
  const cardWidthClassName = items.length === 1
    ? 'basis-full'
    : 'basis-[85%] md:basis-[calc((100%-1rem)/2)]'

  const goToPrev = () => setIdx((activeIndex - 1 + items.length) % items.length)
  const goToNext = () => setIdx((activeIndex + 1) % items.length)

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] bg-transparent">
      <div
        ref={viewportRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-5 md:py-5"
      >
        {items.map((item, index) => (
          <Link
            key={item.id}
            ref={node => {
              itemRefs.current[index] = node
            }}
            href={item.href}
            aria-label={item.title}
            className={cn(
              'group relative block min-w-0 flex-none snap-start overflow-hidden rounded-[1.35rem] border border-border/60 bg-muted/20',
              cardWidthClassName,
            )}
          >
            <div className="relative aspect-[16/9] min-h-32 overflow-hidden">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                priority={index === 0}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes={items.length === 1 ? '100vw' : '(max-width: 768px) 85vw, 50vw'}
              />
            </div>
          </Link>
        ))}
      </div>

      {showControls && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous promotion"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/25 bg-black/35 p-2 text-white backdrop-blur transition-colors hover:bg-black/55"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next promotion"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/25 bg-black/35 p-2 text-white backdrop-blur transition-colors hover:bg-black/55"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </section>
  )
}
