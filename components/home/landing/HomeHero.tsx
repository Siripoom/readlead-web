'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { HomeHeroSlide } from '@/lib/home-landing-data'
import { cn } from '@/lib/utils'
import styles from './HomeLanding.module.css'

const AUTO_SLIDE_MS = 6000

type Props = {
  slides: HomeHeroSlide[]
  indicatorTone?: 'brand' | 'neutral'
}

export function HomeHero({ slides, indicatorTone = 'brand' }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isDocumentHidden, setIsDocumentHidden] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const dragStartX = useRef<number | null>(null)
  const suppressClickUntil = useRef(0)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setPrefersReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const handleVisibility = () => setIsDocumentHidden(document.hidden)
    handleVisibility()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  useEffect(() => {
    if (
      slides.length <= 1 ||
      isHovered ||
      isDocumentHidden ||
      isDragging ||
      prefersReducedMotion
    ) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, AUTO_SLIDE_MS)
    return () => window.clearInterval(timer)
  }, [isDocumentHidden, isDragging, isHovered, prefersReducedMotion, slides.length])

  if (slides.length === 0) return null

  const go = (index: number) => {
    setActiveIndex((index + slides.length) % slides.length)
  }

  const finishDrag = (pointerX: number) => {
    if (dragStartX.current === null) return

    const delta = pointerX - dragStartX.current
    dragStartX.current = null
    setIsDragging(false)

    if (slides.length > 1 && Math.abs(delta) > 40) {
      suppressClickUntil.current = Date.now() + 300
      go(activeIndex + (delta < 0 ? 1 : -1))
    }
  }

  return (
    <section
      aria-label="เรื่องแนะนำ"
      className="bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          'relative min-h-[350px] w-full touch-pan-y overflow-hidden sm:min-h-[320px] lg:aspect-[1280/318] lg:min-h-[260px] xl:min-h-0',
          isDragging && 'cursor-grabbing select-none',
        )}
        onClickCapture={(event) => {
          if (Date.now() < suppressClickUntil.current) {
            event.preventDefault()
            event.stopPropagation()
          }
        }}
        onPointerDown={(event) => {
          if (event.button !== 0 || slides.length <= 1) return
          dragStartX.current = event.clientX
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (dragStartX.current === null) return
          if (Math.abs(event.clientX - dragStartX.current) > 8) setIsDragging(true)
        }}
        onPointerUp={(event) => finishDrag(event.clientX)}
        onPointerCancel={() => {
          dragStartX.current = null
          setIsDragging(false)
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            aria-hidden={activeIndex !== index}
            className={cn(
              styles.heroSlide,
              activeIndex === index && styles.heroSlideActive,
            )}
            style={{ background: slide.background }}
          >
            <div className="mx-auto flex h-full max-w-[1200px] items-center px-5 py-10 sm:px-6 md:py-12">
              <div className={cn('max-w-[590px]', styles.heroCopy)}>
                <span className="inline-flex rounded-full bg-white/85 px-4 py-1.5 text-xs font-extrabold text-[#3a3f47] shadow-sm sm:text-sm">
                  {slide.badge}
                </span>
                <h1 className="mt-4 max-w-[560px] text-[30px] font-extrabold leading-[1.14] text-[#2b2f36] sm:text-[38px] lg:text-[42px]">
                  {slide.title}
                </h1>
                <p className="mt-3 text-sm text-[#5b6068] sm:text-base">
                  {slide.description}
                </p>
                <Link
                  href={slide.href}
                  tabIndex={activeIndex === index ? 0 : -1}
                  className="mt-6 inline-flex items-center gap-2 rounded-[11px] bg-[#3a3f47] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2b2f36] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc4452]"
                >
                  {slide.ctaLabel}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div
          role="group"
          className="mt-[14px] flex justify-center gap-[7px]"
          aria-label="เลือกสไลด์"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`ไปยังสไลด์ ${index + 1}: ${slide.title}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => go(index)}
              className={cn(
                'h-2 rounded-full transition-[width,background-color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc4452]',
                index === activeIndex && indicatorTone === 'brand' && 'w-[22px] bg-[#cc4452]',
                index === activeIndex && indicatorTone === 'neutral' && 'w-[22px] bg-[#3a3f47]',
                index !== activeIndex && indicatorTone === 'brand' && 'w-2 bg-[#cc4452]/30 hover:bg-[#cc4452]/55',
                index !== activeIndex && indicatorTone === 'neutral' && 'w-2 bg-[#3a3f47]/30 hover:bg-[#3a3f47]/55',
              )}
            />
          ))}
        </div>
      )}
    </section>
  )
}
