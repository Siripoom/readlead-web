'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { NovelEditorialPick } from '@/lib/novel-landing-data'
import { cn } from '@/lib/utils'
import { NovelCoverArt } from './NovelCoverArt'

const AUTO_SLIDE_MS = 2600

export function NovelEditorialBanner({ items }: { items: NovelEditorialPick[] }) {
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
    const sync = () => setIsDocumentHidden(document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  useEffect(() => {
    if (
      items.length <= 1 ||
      isHovered ||
      isDocumentHidden ||
      isDragging ||
      prefersReducedMotion
    ) return
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % items.length)
    }, AUTO_SLIDE_MS)
    return () => window.clearInterval(timer)
  }, [isDocumentHidden, isDragging, isHovered, items.length, prefersReducedMotion])

  const go = (index: number) => {
    if (items.length === 0) return
    setActiveIndex((index + items.length) % items.length)
  }

  const finishDrag = (pointerX: number) => {
    if (dragStartX.current === null) return
    const delta = pointerX - dragStartX.current
    dragStartX.current = null
    setIsDragging(false)
    if (Math.abs(delta) > 40) {
      suppressClickUntil.current = Date.now() + 300
      go(activeIndex + (delta < 0 ? 1 : -1))
    }
  }

  const offsets = items.length >= 3 ? [-1, 0, 1] : items.length === 2 ? [0, 1] : [0]
  const activeItem = items[activeIndex]

  return (
    <div
      className="overflow-hidden rounded-[18px] bg-[linear-gradient(120deg,#8b6df0,#7355df_58%,#cc4452)] text-white shadow-[0_2px_7px_rgba(0,0,0,0.12)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="grid min-h-[280px] gap-6 px-6 py-8 sm:px-9 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.9fr)] lg:items-center lg:px-10">
        <div className="relative z-10 max-w-[520px]">
          <p className="text-xs font-semibold text-white/85 sm:text-sm">คัดสรรโดยทีมงาน</p>
          <h3 className="mt-2 text-2xl font-extrabold leading-tight sm:text-[30px]">
            นิยายน่าอ่านประจำสัปดาห์
          </h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85">
            รวมเรื่องเด่นที่ทีมงานคัดมาให้คุณโดยเฉพาะ อ่านสนุก ครบทุกอารมณ์
          </p>
          <Link
            href="/discover"
            className="mt-6 inline-flex items-center gap-1.5 rounded-[10px] bg-white px-5 py-2.5 text-sm font-bold text-[#7355df] transition hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            ดูทั้งหมด <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div
          className="touch-pan-y"
          aria-label="นิยายคัดสรร"
          onClickCapture={(event) => {
            if (Date.now() < suppressClickUntil.current) {
              event.preventDefault()
              event.stopPropagation()
            }
          }}
          onPointerDown={(event) => {
            if (event.button !== 0 || items.length <= 1) return
            dragStartX.current = event.clientX
            setIsDragging(true)
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerUp={(event) => finishDrag(event.clientX)}
          onPointerCancel={() => {
            dragStartX.current = null
            setIsDragging(false)
          }}
        >
          {items.length > 0 ? (
            <>
              <div className="flex h-[190px] items-center justify-center gap-2 overflow-hidden sm:gap-3">
                {offsets.map((offset) => {
                  const index = (activeIndex + offset + items.length) % items.length
                  const item = items[index]
                  const isCenter = offset === 0
                  return (
                    <Link
                      key={`${item.id}-${offset}`}
                      href={`/detail?bookId=${encodeURIComponent(item.detailId)}`}
                      tabIndex={isCenter ? 0 : -1}
                      aria-hidden={!isCenter}
                      className={cn(
                        'group relative aspect-[2/3] shrink-0 overflow-hidden rounded-xl shadow-lg transition-[width,height,opacity,transform] duration-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                        isCenter
                          ? 'h-[184px] opacity-100'
                          : 'h-[154px] opacity-50 hover:opacity-75',
                      )}
                      style={{ background: item.gradient }}
                    >
                      <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
                        <NovelCoverArt index={index} />
                      </div>
                    </Link>
                  )
                })}
              </div>
              <div className="mt-2 text-center" aria-live="polite">
                <p className="truncate text-base font-bold">{activeItem?.title}</p>
                <p className="mt-0.5 text-xs text-white/70">{activeItem?.author}</p>
              </div>
            </>
          ) : (
            <div className="grid min-h-[210px] place-items-center rounded-xl border border-white/20 bg-white/10 px-5 text-center text-sm text-white/75">
              ไม่พบเรื่องแนะนำในหมวดนี้
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
