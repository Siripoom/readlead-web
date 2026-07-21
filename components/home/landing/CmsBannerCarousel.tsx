'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { CmsBanner, CmsBannerElement } from '@/lib/cms-catalog'
import { cn } from '@/lib/utils'
import styles from './HomeLanding.module.css'

type Props = {
  items: CmsBanner[]
  aspect: string
  slideSeconds: number
  label: string
  fullWidth?: boolean
}

type BannerStyle = CSSProperties & { '--cms-banner-aspect': string }

function countdownLabel(totalSeconds: number) {
  const seconds = Math.max(0, totalSeconds)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = seconds % 60
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${days} วัน ${pad(hours)}:${pad(minutes)}:${pad(rest)}`
}

function elementStyle(element: CmsBannerElement): CSSProperties {
  const style: CSSProperties = {
    left: `${element.x}%`,
    top: `${element.y}%`,
    color: element.color,
    fontWeight: element.bold ? 800 : 500,
    textShadow: element.shadow ? '0 1px 6px rgba(0,0,0,.48)' : 'none',
    transform: `scale(${element.scale})`,
    transformOrigin: 'top left',
  }
  if (element.type === 'badge') style.background = element.backgroundColor
  if (element.type === 'button') {
    style.width = `${element.width ?? 18}%`
    style.height = `${element.height ?? 12}%`
    style.background = element.backgroundColor
    style.transform = 'none'
  }
  return style
}

function BannerElement({ element, elapsedSeconds }: { element: CmsBannerElement; elapsedSeconds: number }) {
  const className = cn(styles.cmsBannerElement, styles[`cmsBannerElement_${element.type}`])
  const content = element.type === 'countdown'
    ? countdownLabel((element.offsetSeconds ?? 0) - elapsedSeconds)
    : element.text
  if (element.type === 'button' && element.link) {
    return <Link href={element.link} className={className} style={elementStyle(element)}>{content}</Link>
  }
  return <span className={className} style={elementStyle(element)}>{content}</span>
}

export function CmsBannerCarousel({ items, aspect, slideSeconds, label, fullWidth = false }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const dragStartX = useRef<number | null>(null)
  const active = items.length ? activeIndex % items.length : 0
  const duration = Math.min(60, Math.max(1, slideSeconds)) * 1000

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!items.some((item) => item.elements.some((element) => element.type === 'countdown'))) return
    const timer = window.setInterval(() => setElapsedSeconds((current) => current + 1), 1000)
    return () => window.clearInterval(timer)
  }, [items])

  useEffect(() => {
    if (items.length <= 1 || paused || reducedMotion) return
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % items.length), duration)
    return () => window.clearInterval(timer)
  }, [duration, items.length, paused, reducedMotion])

  if (!items.length) return null

  const go = (index: number) => setActiveIndex((index + items.length) % items.length)
  const finishDrag = (x: number) => {
    if (dragStartX.current === null) return
    const delta = x - dragStartX.current
    dragStartX.current = null
    if (Math.abs(delta) > 40 && items.length > 1) go(active + (delta < 0 ? 1 : -1))
  }

  return (
    <div
      aria-label={label}
      className={cn(styles.cmsBannerCarousel, fullWidth && styles.cmsBannerCarouselHero)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={cn(styles.cmsBannerViewport, fullWidth && styles.cmsBannerViewportHero)}
        style={{ '--cms-banner-aspect': aspect } as BannerStyle}
        onPointerDown={(event) => {
          if (event.button !== 0 || items.length <= 1) return
          dragStartX.current = event.clientX
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerUp={(event) => finishDrag(event.clientX)}
        onPointerCancel={() => { dragStartX.current = null }}
      >
        {items.map((item, index) => (
          <article
            key={item.id}
            aria-hidden={index !== active}
            className={cn(styles.cmsBannerSlide, index === active && styles.cmsBannerSlideActive)}
            style={{ background: item.background || '#27312f' }}
          >
            {item.imageUrl && (
              <picture className={styles.cmsBannerMedia}>
                <source media="(max-width: 639px)" srcSet={item.mobileImageUrl ?? item.imageUrl} />
                <img
                  src={item.imageUrl}
                  alt=""
                  loading={fullWidth && index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={fullWidth && index === 0 ? 'high' : 'auto'}
                  draggable={false}
                  style={{
                    objectPosition: `${item.focal.x}% ${item.focal.y}%`,
                    transform: `scale(${item.focal.zoom / 100})`,
                  }}
                />
              </picture>
            )}
            {item.imageUrl && <span className={styles.cmsBannerScrim} aria-hidden="true" />}
            {item.linkUrl && !item.elements.some((element) => element.type === 'button' && element.link) && (
              <Link href={item.linkUrl} className={styles.cmsBannerFullLink} tabIndex={index === active ? 0 : -1} aria-label={item.title} />
            )}
            <div className={styles.cmsBannerElements}>
              {item.elements.map((element) => <BannerElement key={element.id} element={element} elapsedSeconds={elapsedSeconds} />)}
            </div>
          </article>
        ))}
      </div>
      {items.length > 1 && (
        <div className={styles.cmsBannerDots} role="group" aria-label={`เลือก${label}`}>
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`ไปยังแบนเนอร์ ${index + 1}: ${item.title}`}
              aria-current={index === active ? 'true' : undefined}
              onClick={() => go(index)}
              className={index === active ? styles.cmsBannerDotActive : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
