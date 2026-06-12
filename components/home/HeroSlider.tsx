'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HomePromotionSlide } from '@/lib/types'

// Center card = 70% of container, each side peek = 15%
const CARD_PCT = 70
const AUTO_SLIDE_MS = 6000
const TRANSITION_MS = 500

interface Props {
  slides: HomePromotionSlide[]
}

export function HeroSlider({ slides }: Props) {
  const banners = useMemo(
    () => slides.map(s => s.banners[0]).filter(Boolean),
    [slides],
  )
  const extended = useMemo(
    () => [...banners, ...banners, ...banners],
    [banners],
  )

  const n = banners.length
  const [idx, setIdx] = useState(n)
  const [animated, setAnimated] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setPrefersReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (n === 0) return
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)

    if (idx >= n * 2) {
      resetTimerRef.current = setTimeout(() => {
        setAnimated(false)
        setIdx(prev => prev - n)
        setTimeout(() => setAnimated(true), 50)
      }, TRANSITION_MS)
    } else if (idx < n) {
      resetTimerRef.current = setTimeout(() => {
        setAnimated(false)
        setIdx(prev => prev + n)
        setTimeout(() => setAnimated(true), 50)
      }, TRANSITION_MS)
    }

    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    }
  }, [idx, n])

  useEffect(() => {
    if (n <= 1 || prefersReducedMotion) return
    const timer = setInterval(() => setIdx(prev => prev + 1), AUTO_SLIDE_MS)
    return () => clearInterval(timer)
  }, [n, prefersReducedMotion])

  if (n === 0) return null

  const activeDot = ((idx - n) % n + n) % n
  // translateX% is relative to the track's own width (= section width, no explicit width set)
  // This centers item[idx] in the section: left edge at (100-CARD_PCT)/2 %
  const translateXPct = (100 - CARD_PCT) / 2 - idx * CARD_PCT

  return (
    <section className="relative overflow-hidden">
      <div
        className={cn(
          'flex items-center',
          animated && !prefersReducedMotion && 'transition-transform duration-500 ease-out',
        )}
        style={{ transform: `translateX(${translateXPct}%)` }}
      >
        {extended.map((banner, i) => {
          const isActive = i === idx
          return (
            <div
              key={`${banner.id}-${i}`}
              className={cn(
                'shrink-0 px-2',
                animated && !prefersReducedMotion && 'transition-all duration-500',
                isActive ? 'opacity-100' : 'opacity-50',
              )}
              style={{ width: `${CARD_PCT}%` }}
            >
              <Link href={banner.href} className="group block">
                <div className="relative aspect-3/1 overflow-hidden rounded-3xl bg-muted/30">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    priority={i >= n && i < n * 2}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 80vw, 70vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />

                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 space-y-3 p-6 text-white md:p-10">
                      {banner.eyebrow && (
                        <span className="inline-block rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                          {banner.eyebrow}
                        </span>
                      )}
                      <h2 className="line-clamp-2 text-2xl font-black leading-tight md:text-4xl">
                        {banner.title}
                      </h2>
                      <p className="line-clamp-2 text-sm text-white/80 md:text-base">{banner.description}</p>
                      <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-bold text-white md:text-base">
                        {banner.ctaLabel ?? 'อ่านเลย'}
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => setIdx(prev => prev - 1)}
        aria-label="Previous slide"
        className="absolute left-[17%] top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/25 bg-black/40 p-2.5 text-white backdrop-blur transition-colors hover:bg-black/60"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => setIdx(prev => prev + 1)}
        aria-label="Next slide"
        className="absolute right-[17%] top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/25 bg-black/40 p-2.5 text-white backdrop-blur transition-colors hover:bg-black/60"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-3 py-1.5 backdrop-blur">
        {banners.map((banner, i) => (
          <button
            key={banner.id}
            type="button"
            onClick={() => { setAnimated(true); setIdx(n + i) }}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              'h-2 rounded-full transition-all',
              i === activeDot ? 'w-6 bg-red-600' : 'w-2 bg-white/40',
            )}
          />
        ))}
      </div>
    </section>
  )
}
