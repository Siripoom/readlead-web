'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { CmsBannerElement } from '@/lib/cms-catalog'
import type { NovelCmsCoverflow } from '@/lib/novel-cms-catalog'
import { cn } from '@/lib/utils'
import styles from '@/components/home/landing/HomeLanding.module.css'

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

function MaybeLink({ href, children, className }: { href?: string; children: ReactNode; className: string }) {
  return href ? <Link href={href} className={className}>{children}</Link> : <div className={className}>{children}</div>
}

export function NovelCmsCoverflow({ data, slideSeconds }: { data: NovelCmsCoverflow; slideSeconds: number }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const dragStartX = useRef<number | null>(null)
  const active = activeIndex % data.covers.length
  const duration = Math.min(60, Math.max(1, slideSeconds)) * 1000

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (data.main.elements.some((element) => element.type === 'countdown')) {
      const timer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000)
      return () => window.clearInterval(timer)
    }
  }, [data.main.elements])

  useEffect(() => {
    if (data.covers.length <= 1 || paused || reducedMotion) return
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % data.covers.length), duration)
    return () => window.clearInterval(timer)
  }, [data.covers.length, duration, paused, reducedMotion])

  const go = (index: number) => setActiveIndex((index + data.covers.length) % data.covers.length)
  const finishDrag = (x: number) => {
    if (dragStartX.current === null) return
    const delta = x - dragStartX.current
    dragStartX.current = null
    if (Math.abs(delta) > 40 && data.covers.length > 1) go(active + (delta < 0 ? 1 : -1))
  }
  const offsets = data.covers.length >= 3 ? [-1, 0, 1] : data.covers.length === 2 ? [0, 1] : [0]
  const activeCover = data.covers[active]

  return (
    <div
      className="relative min-h-[480px] overflow-hidden rounded-[18px] shadow-[0_2px_7px_rgba(0,0,0,0.12)] sm:min-h-[360px] lg:min-h-0 lg:aspect-[1152/280]"
      style={{ background: data.main.background || '#7355df' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="แนะนำโดยเว็บ"
    >
      {data.main.imageUrl && (
        <picture className="absolute inset-0">
          <source media="(max-width: 639px)" srcSet={data.main.mobileImageUrl ?? data.main.imageUrl} />
          <img
            src={data.main.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
            style={{
              objectPosition: `${data.main.focal.x}% ${data.main.focal.y}%`,
              transform: `scale(${data.main.focal.zoom / 100})`,
            }}
          />
        </picture>
      )}
      {data.main.imageUrl && <span className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/5 to-transparent" aria-hidden="true" />}
      <div className={styles.cmsBannerElements}>
        {data.main.elements.map((element) => (
          <BannerElement key={element.id} element={element} elapsedSeconds={elapsedSeconds} />
        ))}
      </div>

      <div
        className="absolute inset-x-5 bottom-5 z-10 touch-pan-y sm:inset-y-5 sm:left-auto sm:right-6 sm:flex sm:w-[48%] sm:flex-col sm:justify-center"
        onPointerDown={(event) => {
          if (event.button !== 0 || data.covers.length <= 1) return
          dragStartX.current = event.clientX
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerUp={(event) => finishDrag(event.clientX)}
        onPointerCancel={() => { dragStartX.current = null }}
      >
        <div className="flex h-[205px] items-center justify-center gap-2 sm:h-[220px]">
          {offsets.map((offset) => {
            const index = (active + offset + data.covers.length) % data.covers.length
            const cover = data.covers[index]
            const centered = offset === 0
            return (
              <MaybeLink
                key={`${cover.id}-${offset}`}
                href={centered ? cover.linkUrl : undefined}
                className={cn(
                  'relative block aspect-[2/3] shrink-0 overflow-hidden rounded-xl shadow-xl transition-[height,opacity,transform] duration-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                  centered ? 'h-[198px] opacity-100 sm:h-[214px]' : 'h-[160px] opacity-55 sm:h-[176px]',
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- CMS cover URLs are runtime-configured. */}
                <img src={cover.imageUrl} alt={centered ? cover.title : ''} className="h-full w-full object-cover" draggable={false} />
              </MaybeLink>
            )
          })}
        </div>
        <div className="mt-1 text-center text-white" aria-live="polite">
          <p className="truncate text-sm font-extrabold sm:text-base">{activeCover.title}</p>
          {activeCover.subtitle && <p className="mt-0.5 truncate text-xs text-white/75">{activeCover.subtitle}</p>}
        </div>
        {data.covers.length > 1 && (
          <div className="mt-2 flex justify-center gap-2" role="group" aria-label="เลือกปกแนะนำ">
            {data.covers.map((cover, index) => (
              <button
                key={cover.id}
                type="button"
                aria-label={`ไปยังปก ${index + 1}: ${cover.title}`}
                aria-current={index === active ? 'true' : undefined}
                onClick={() => go(index)}
                className={cn('h-1.5 rounded-full bg-white/45 transition-all', index === active ? 'w-6 bg-white' : 'w-1.5')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
