'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { AudioLatestUpdate } from '@/lib/audiobook-landing-data'
import { AudioCover } from './AudioCover'
import styles from './AudioLanding.module.css'

const INITIAL_COUNT = 6
const LOAD_COUNT = 20

function hrefFor(item: AudioLatestUpdate) {
  return item.href ?? `/detail?bookId=${encodeURIComponent(item.detailId)}`
}

export function AudioLatestUpdates({ items }: { items: AudioLatestUpdate[] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT)
  const visible = items.slice(0, visibleCount)
  const expanded = visibleCount > INITIAL_COUNT
  return (
    <div>
      <div className={styles.latestGrid}>
        {visible.map((item, index) => (
          <article key={item.id} className={styles.latestCard}>
            <Link href={hrefFor(item)} className={`${styles.latestCover} group`} style={{ background: item.gradient }}>
              <AudioCover index={index} coverUrl={item.coverUrl} title={item.title} sizes="90px" />
            </Link>
            <div className={styles.latestBody}>
              <h3><Link href={hrefFor(item)}>{item.title}</Link></h3>
              <p className={styles.latestAuthor}>{item.author}</p>
              <p className={styles.latestTags}>{item.genreLabel} · {item.originLabel}</p>
              <p className={styles.latestDescription}>{item.description || `ติดตามเรื่องราวของ ${item.title} ผ่านเสียงบรรยายที่ถ่ายทอดทุกอารมณ์`}</p>
              <p className={styles.latestMeta}>
                <span>อัปเดตล่าสุด</span>{' '}
                <Link href={hrefFor(item)}>{item.updatedLabel} {item.episodeTitle}</Link>
                {item.updatedAt ? ` · ${item.updatedAt}` : ''}
              </p>
            </div>
          </article>
        ))}
      </div>
      {items.length > INITIAL_COUNT && (
        <div className={styles.moreWrap}>
          {!expanded ? (
            <button type="button" onClick={() => setVisibleCount(Math.min(items.length, INITIAL_COUNT + LOAD_COUNT))}>ดูเพิ่มเติม</button>
          ) : (
            <Link href="/discover">ดูทั้งหมด</Link>
          )}
        </div>
      )}
    </div>
  )
}
