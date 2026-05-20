'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { HomePromotionSlide } from '@/lib/types'

interface Props {
  slides: HomePromotionSlide[]
}

export function HeroSlider({ slides }: Props) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return

    const timer = setInterval(() => {
      setIdx(current => (current + 1) % slides.length)
    }, 6000)

    return () => clearInterval(timer)
  }, [slides.length])

  if (slides.length === 0) return null

  const prev = () => setIdx(current => (current - 1 + slides.length) % slides.length)
  const next = () => setIdx(current => (current + 1) % slides.length)

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] bg-transparent">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${idx * 100}%)`, width: `${slides.length * 100}%` }}
      >
        {slides.map(slide => (
          <div key={slide.id} className="w-full flex-shrink-0 p-4 md:p-5" style={{ width: `${100 / slides.length}%` }}>
            <div className="grid gap-4">
              {slide.banners.map((banner, bannerIndex) => (
                <Link
                  key={banner.id}
                  href={banner.href}
                  className="group relative block overflow-hidden rounded-[1.35rem] border border-border/60 bg-muted/30"
                >
                  <div className="relative aspect-[16/6] min-h-36">
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title}
                      fill
                      priority={idx === 0 && bannerIndex === 0}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 1200px"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,9,6,0.88)_0%,rgba(20,9,6,0.58)_45%,rgba(20,9,6,0.18)_100%)]" />
                    <div className="absolute inset-0 flex items-center justify-between gap-4 p-5 md:p-7">
                      <div className="max-w-xl text-white">
                        {banner.eyebrow && (
                          <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/85 backdrop-blur">
                            {banner.eyebrow}
                          </span>
                        )}
                        <h2 className="mt-3 text-xl font-bold leading-tight md:text-3xl">{banner.title}</h2>
                        <p className="mt-2 line-clamp-2 text-sm text-white/80 md:text-base">{banner.description}</p>
                      </div>

                      <span className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'hidden md:inline-flex rounded-full px-4')}>
                        {banner.ctaLabel ?? 'ดูรายละเอียด'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous promotion"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/25 bg-black/35 p-2 text-white backdrop-blur transition-colors hover:bg-black/55"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            aria-label="Next promotion"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/25 bg-black/35 p-2 text-white backdrop-blur transition-colors hover:bg-black/55"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-3 py-1.5 backdrop-blur">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                onClick={() => setIdx(slideIndex)}
                aria-label={`Go to promotion slide ${slideIndex + 1}`}
                className={cn(
                  'h-2 rounded-full transition-all',
                  slideIndex === idx ? 'w-6 bg-white' : 'w-2 bg-white/45',
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
