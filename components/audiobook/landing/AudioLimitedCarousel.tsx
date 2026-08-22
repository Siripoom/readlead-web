'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock3, Headphones, List } from 'lucide-react'
import type { HomeLimitedOffer } from '@/lib/home-landing-data'
import { useHorizontalScroll } from '@/components/home/landing/useHorizontalScroll'
import { AudioCover } from './AudioCover'
import styles from './AudioLanding.module.css'

function formatCountdown(total: number) {
  const value = Math.max(0, total)
  const days = Math.floor(value / 86400)
  const hours = Math.floor((value % 86400) / 3600)
  const minutes = Math.floor((value % 3600) / 60)
  const seconds = value % 60
  const pad = (number: number) => String(number).padStart(2, '0')
  return `${days} วัน : ${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`
}

export function AudioLimitedCarousel({ items }: { items: HomeLimitedOffer[] }) {
  const [elapsed, setElapsed] = useState(0)
  const { rowRef, canScrollBack, canScrollForward, updateControls, scroll, pointerHandlers } = useHorizontalScroll()
  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className={styles.bookCarousel}>
      {canScrollBack && <button type="button" className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`} aria-label="ข้อเสนอก่อนหน้า" onClick={() => scroll(-1)}><ChevronLeft /></button>}
      <div ref={rowRef} className={styles.bookRow} onScroll={updateControls} {...pointerHandlers}>
        {items.map((item, index) => (
          <Link key={item.id} href={item.href ?? `/detail?bookId=${encodeURIComponent(item.detailId)}`} className={`${styles.bookCard} group`}>
            <div className={`${styles.bookCover} ${styles.offerCover}`} style={{ background: item.gradient }}>
              <AudioCover index={index} coverUrl={item.coverUrl} title={item.title} sizes="160px" />
              {item.discount && <span className={styles.discount}>{item.discount}</span>}
              <span className={styles.countdown}><Clock3 />{formatCountdown(item.initialSeconds - elapsed)}</span>
            </div>
            <h3>{item.title}</h3>
            <p className={styles.bookAuthor}>{item.author}</p>
            <div className={styles.bookMeta}>
              {item.views && <span><Headphones />{item.views}</span>}
              {item.chapters && <span><List />{item.chapters}</span>}
            </div>
          </Link>
        ))}
      </div>
      {canScrollForward && <button type="button" className={`${styles.carouselArrow} ${styles.carouselArrowRight}`} aria-label="ข้อเสนอถัดไป" onClick={() => scroll(1)}><ChevronRight /></button>}
    </div>
  )
}
