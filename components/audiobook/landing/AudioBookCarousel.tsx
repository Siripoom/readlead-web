'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, Headphones, List } from 'lucide-react'
import type { AudioBookItem } from '@/lib/audiobook-landing-data'
import { useHorizontalScroll } from '@/components/home/landing/useHorizontalScroll'
import { AudioCover } from './AudioCover'
import styles from './AudioLanding.module.css'

function hrefFor(item: AudioBookItem) {
  return item.href ?? `/detail?bookId=${encodeURIComponent(item.detailId)}`
}

export function AudioBookCard({ item, index, rank }: { item: AudioBookItem; index: number; rank?: number }) {
  return (
    <Link href={hrefFor(item)} className={`${styles.bookCard} group`}>
      <div className={styles.bookCover} style={{ background: item.gradient }}>
        <AudioCover index={index} coverUrl={item.coverUrl} title={item.title} sizes="160px" />
        {rank && <span className={styles.bookRank}>#{rank}</span>}
      </div>
      <h3>{item.title}</h3>
      <p className={styles.bookAuthor}>{item.author}</p>
      <p className={styles.bookGenre}>{item.genreLabel} · {item.originLabel}</p>
      <div className={styles.bookMeta}>
        <span><Headphones />{item.views}</span>
        <span><List />{item.chapters}</span>
      </div>
    </Link>
  )
}

export function AudioBookCarousel({ items, label }: { items: AudioBookItem[]; label: string }) {
  const { rowRef, canScrollBack, canScrollForward, updateControls, scroll, pointerHandlers } = useHorizontalScroll()
  return (
    <div className={styles.bookCarousel}>
      {canScrollBack && (
        <button type="button" className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`} aria-label={`${label} ก่อนหน้า`} onClick={() => scroll(-1)}>
          <ChevronLeft />
        </button>
      )}
      <div ref={rowRef} className={styles.bookRow} onScroll={updateControls} {...pointerHandlers}>
        {items.map((item, index) => <AudioBookCard key={item.id} item={item} index={index} />)}
      </div>
      {canScrollForward && (
        <button type="button" className={`${styles.carouselArrow} ${styles.carouselArrowRight}`} aria-label={`${label} ถัดไป`} onClick={() => scroll(1)}>
          <ChevronRight />
        </button>
      )}
    </div>
  )
}
