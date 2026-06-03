'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HomePromotionBanner, HomePromotionSlide } from '@/lib/types'

interface BannerCardProps {
  banner: HomePromotionBanner
  gradientDir?: 'left' | 'right'
  priority?: boolean
  className?: string
}

function BannerCard({ banner, gradientDir = 'left', priority, className }: BannerCardProps) {
  return (
    <Link
      href={banner.href}
      className={cn(
        'group relative block overflow-hidden rounded-2xl shadow-lg',
        className,
      )}
    >
      <div className="relative aspect-16/7 min-h-48">
        <Image
          src={banner.imageUrl}
          alt={banner.title}
          fill
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div
          className={cn(
            'absolute inset-0',
            gradientDir === 'right'
              ? 'bg-linear-to-l from-black/80 via-black/55 to-transparent'
              : 'bg-linear-to-r from-black/80 via-black/55 to-transparent',
          )}
        />
        <div
          className={cn(
            'absolute inset-0 flex flex-col justify-end gap-2 p-5 text-white md:p-7',
            gradientDir === 'right' && 'items-end text-right',
          )}
        >
          {banner.eyebrow && (
            <span className="inline-flex self-start rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/85 backdrop-blur">
              {banner.eyebrow}
            </span>
          )}
          <h2 className="text-xl font-black leading-tight md:text-2xl">{banner.title}</h2>
          <p className="line-clamp-2 text-sm text-white/80 md:text-base">{banner.description}</p>
          <span className="mt-1 inline-flex self-start items-center gap-1.5 rounded-full bg-white/15 border border-white/30 px-5 py-2 text-sm font-bold backdrop-blur transition-colors group-hover:bg-white/25">
            {banner.ctaLabel ?? 'ดูรายละเอียด'}
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

interface DesktopSlideProps {
  slide: HomePromotionSlide
  priority?: boolean
}

function DesktopSlide({ slide, priority }: DesktopSlideProps) {
  return (
    <div className="flex gap-3 md:gap-4">
      <BannerCard
        banner={slide.banners[0]}
        gradientDir="left"
        priority={priority}
        className="flex-1"
      />
      <BannerCard
        banner={slide.banners[1]}
        gradientDir="right"
        priority={priority}
        className="flex-1"
      />
    </div>
  )
}

interface Props {
  slides: HomePromotionSlide[]
}

const AUTO_SLIDE_MS = 6000

export function HomePromotionCards({ slides }: Props) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
  const [idx, setIdx] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const touchStartX = useRef<number>(0)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setPrefersReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const update = () => {
      const next = window.innerWidth >= 768
      setIsDesktop(prev => {
        if (prev !== null && prev !== next) setIdx(0)
        return next
      })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const units: (HomePromotionSlide | HomePromotionBanner)[] = isDesktop
    ? slides
    : slides.flatMap(s => s.banners)

  const count = units.length

  useEffect(() => {
    if (count <= 1 || prefersReducedMotion) return
    const timer = window.setInterval(() => {
      setIdx(prev => (prev + 1) % count)
    }, AUTO_SLIDE_MS)
    return () => window.clearInterval(timer)
  }, [count, prefersReducedMotion])

  if (slides.length === 0 || isDesktop === null) return null

  const goToPrev = () => setIdx(prev => (prev - 1 + count) % count)
  const goToNext = () => setIdx(prev => (prev + 1) % count)

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 50) {
      if (delta < 0) goToNext()
      else goToPrev()
    }
  }

  return (
    <section className="relative overflow-hidden rounded-[1.75rem]">
      <div
        className={cn(
          'flex',
          !prefersReducedMotion && 'transition-transform duration-500 ease-out',
        )}
        style={{ transform: `translateX(-${idx * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {units.map((unit, i) => (
          <div key={'id' in unit ? unit.id : (unit as HomePromotionBanner).id} className="w-full shrink-0">
            {isDesktop ? (
              <DesktopSlide slide={unit as HomePromotionSlide} priority={i === 0} />
            ) : (
              <BannerCard banner={unit as HomePromotionBanner} priority={i === 0} />
            )}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous promotion"
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/25 bg-black/35 p-2 text-white backdrop-blur transition-colors hover:bg-black/55"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next promotion"
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/25 bg-black/35 p-2 text-white backdrop-blur transition-colors hover:bg-black/55"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-3 py-1.5 backdrop-blur">
            {units.map((unit, i) => (
              <button
                key={`dot-${'id' in unit ? unit.id : i}`}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Go to promotion ${i + 1}`}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === idx ? 'w-6 bg-white' : 'w-2 bg-white/40',
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
