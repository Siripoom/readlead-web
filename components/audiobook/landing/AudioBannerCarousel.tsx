'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { CmsBanner, CmsBannerElement } from '@/lib/cms-catalog'
import styles from './AudioLanding.module.css'

type Props = {
  items: CmsBanner[]
  aspect: string
  slideSeconds: number
  label: string
  hero?: boolean
}

type BannerStyle = CSSProperties & { '--audio-banner-aspect': string }

function countdownLabel(totalSeconds: number) {
  const seconds = Math.max(0, totalSeconds)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = seconds % 60
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${days} วัน : ${pad(hours)} : ${pad(minutes)} : ${pad(rest)}`
}

function elementStyle(element: CmsBannerElement): CSSProperties {
  const style: CSSProperties = {
    left: `${element.x}%`,
    top: `${element.y}%`,
    color: element.color,
    fontWeight: element.bold ? 800 : 500,
    textShadow: element.shadow ? '0 1px 7px rgba(0,0,0,.48)' : 'none',
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

function BannerElement({ element, elapsed }: { element: CmsBannerElement; elapsed: number }) {
  const content = element.type === 'countdown'
    ? countdownLabel((element.offsetSeconds ?? 0) - elapsed)
    : element.text
  const className = `${styles.bannerElement} ${styles[`bannerElement_${element.type}`]}`
  if (element.type === 'button' && element.link) {
    return <Link href={element.link} className={className} style={elementStyle(element)}>{content}</Link>
  }
  return <span className={className} style={elementStyle(element)}>{content}</span>
}

export function AudioBannerCarousel({ items, aspect, slideSeconds, label, hero = false }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const dragStart = useRef<number | null>(null)
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
    const sync = () => setHidden(document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  useEffect(() => {
    if (!items.some((item) => item.elements.some((element) => element.type === 'countdown'))) return
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [items])

  useEffect(() => {
    if (items.length <= 1 || paused || hidden || reducedMotion) return
    const timer = window.setInterval(() => setActiveIndex((value) => (value + 1) % items.length), duration)
    return () => window.clearInterval(timer)
  }, [duration, hidden, items.length, paused, reducedMotion])

  if (!items.length) return null
  const go = (index: number) => setActiveIndex((index + items.length) % items.length)
  const finishDrag = (x: number) => {
    if (dragStart.current === null) return
    const delta = x - dragStart.current
    dragStart.current = null
    if (Math.abs(delta) > 40 && items.length > 1) go(active + (delta < 0 ? 1 : -1))
  }

  return (
    <div
      className={`${styles.bannerCarousel} ${hero ? styles.heroCarousel : ''}`}
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false)
      }}
    >
      <div
        className={styles.bannerViewport}
        style={{ '--audio-banner-aspect': aspect } as BannerStyle}
        onPointerDown={(event) => {
          if (event.button !== 0 || items.length <= 1) return
          dragStart.current = event.clientX
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerUp={(event) => finishDrag(event.clientX)}
        onPointerCancel={() => { dragStart.current = null }}
      >
        {items.map((item, index) => (
          <article
            key={item.id}
            className={`${styles.bannerSlide} ${index === active ? styles.bannerSlideActive : ''}`}
            aria-hidden={index !== active}
            style={{ background: item.background || '#eceef1' }}
          >
            {item.imageUrl && (
              <picture className={styles.bannerMedia}>
                <source media="(max-width: 639px)" srcSet={item.mobileImageUrl ?? item.imageUrl} />
                <img
                  src={item.imageUrl}
                  alt=""
                  draggable={false}
                  loading={hero && index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={hero && index === 0 ? 'high' : 'auto'}
                  style={{ objectPosition: `${item.focal.x}% ${item.focal.y}%`, transform: `scale(${item.focal.zoom / 100})` }}
                />
              </picture>
            )}
            {item.imageUrl && <span className={styles.bannerScrim} aria-hidden="true" />}
            {item.linkUrl && !item.elements.some((element) => element.type === 'button' && element.link) && (
              <Link href={item.linkUrl} className={styles.bannerFullLink} aria-label={item.title} tabIndex={index === active ? 0 : -1} />
            )}
            <div className={styles.bannerElements}>
              {item.elements.map((element) => <BannerElement key={element.id} element={element} elapsed={elapsed} />)}
            </div>
          </article>
        ))}
      </div>
      {items.length > 1 && (
        <div className={styles.bannerDots} role="group" aria-label={`เลือก${label}`}>
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`แบนเนอร์ ${index + 1}: ${item.title}`}
              aria-current={index === active ? 'true' : undefined}
              className={index === active ? styles.bannerDotActive : undefined}
              onClick={() => go(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
