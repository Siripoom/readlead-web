'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { HomeHeroSlide } from '@/lib/home-landing-data'
import { cn } from '@/lib/utils'
import styles from './HomeLanding.module.css'

type Props = {
  slides: HomeHeroSlide[]
  slideSeconds?: number
  indicatorTone?: 'brand' | 'neutral'
}

type HeroStyle = CSSProperties & {
  '--hero-x'?: string
  '--hero-y'?: string
  '--hero-title-size'?: string
  '--hero-color'?: string
}

function styleForSlide(slide: HomeHeroSlide): HeroStyle {
  const visual = slide.visual
  return {
    background: slide.background ?? '#303438',
    ...(visual ? {
      '--hero-x': `${visual.x}%`,
      '--hero-y': `${visual.y}%`,
      '--hero-title-size': `${42 * visual.size / 100}px`,
      '--hero-color': visual.color,
    } : {}),
  }
}

function hasLightText(color = '#ffffff') {
  const value = color.slice(1)
  if (!/^[0-9a-f]{6}$/i.test(value)) return true
  const red = Number.parseInt(value.slice(0, 2), 16)
  const green = Number.parseInt(value.slice(2, 4), 16)
  const blue = Number.parseInt(value.slice(4, 6), 16)
  return (red * 299 + green * 587 + blue * 114) / 1000 >= 150
}

export function HomeHero({ slides, slideSeconds = 6, indicatorTone = 'brand' }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isDocumentHidden, setIsDocumentHidden] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const dragStartX = useRef<number | null>(null)
  const suppressClickUntil = useRef(0)
  const activeSlideIndex = slides.length ? activeIndex % slides.length : 0
  const autoSlideMs = Math.min(60, Math.max(1, slideSeconds)) * 1000

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
    }, autoSlideMs)
    return () => window.clearInterval(timer)
  }, [autoSlideMs, isDocumentHidden, isDragging, isHovered, prefersReducedMotion, slides.length])

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
      go(activeSlideIndex + (delta < 0 ? 1 : -1))
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
        {slides.map((slide, index) => {
          const active = activeSlideIndex === index
          const imageSlide = Boolean(slide.desktopImageUrl)
          return (
            <div
              key={slide.id}
              aria-hidden={!active}
              className={cn(
                styles.heroSlide,
                active && styles.heroSlideActive,
              )}
              style={styleForSlide(slide)}
            >
              {slide.desktopImageUrl && <picture className={styles.heroMedia}>
                <source media="(max-width: 639px)" srcSet={slide.mobileImageUrl ?? slide.desktopImageUrl} />
                {/* CMS image hosts are configured at runtime, so a native responsive image is required here. */}
                <img src={slide.desktopImageUrl} alt="" loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} draggable={false} />
              </picture>}
              {imageSlide && <span className={cn(styles.heroShade, hasLightText(slide.visual?.color) ? styles.heroShadeDark : styles.heroShadeLight)} aria-hidden="true" />}
              <div className={cn('h-full px-5 py-10 sm:px-6 md:py-12', styles.heroContent, slide.visual ? 'w-full' : 'mx-auto flex max-w-[1200px] items-center')}>
                <div className={cn('max-w-[590px]', slide.visual && styles.heroPositioner)}>
                  <div className={cn(styles.heroCopy, slide.visual && styles.heroCmsCopy)}>
                    {slide.badge && <span className="inline-flex rounded-full bg-white/85 px-4 py-1.5 text-xs font-extrabold text-[#3a3f47] shadow-sm sm:text-sm">
                      {slide.badge}
                    </span>}
                    <h1 className={cn('max-w-[560px] text-[30px] font-extrabold leading-[1.14] text-[#2b2f36] sm:text-[38px] lg:text-[42px]', slide.badge && 'mt-4', slide.visual && styles.heroCmsTitle)}>
                      {slide.title}
                    </h1>
                    {slide.description && <p className={cn('mt-3 text-sm text-[#5b6068] sm:text-base', slide.visual && styles.heroCmsDescription)}>
                      {slide.description}
                    </p>}
                    <Link
                      href={slide.href}
                      tabIndex={active ? 0 : -1}
                      className="mt-6 inline-flex items-center gap-2 rounded-[11px] bg-[#3a3f47] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2b2f36] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc4452]"
                    >
                      {slide.ctaLabel}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
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
              aria-current={index === activeSlideIndex ? 'true' : undefined}
              onClick={() => go(index)}
              className={cn(
                'h-2 rounded-full transition-[width,background-color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc4452]',
                index === activeSlideIndex && indicatorTone === 'brand' && 'w-[22px] bg-[#cc4452]',
                index === activeSlideIndex && indicatorTone === 'neutral' && 'w-[22px] bg-[#3a3f47]',
                index !== activeSlideIndex && indicatorTone === 'brand' && 'w-2 bg-[#cc4452]/30 hover:bg-[#cc4452]/55',
                index !== activeSlideIndex && indicatorTone === 'neutral' && 'w-2 bg-[#3a3f47]/30 hover:bg-[#3a3f47]/55',
              )}
            />
          ))}
        </div>
      )}
    </section>
  )
}
