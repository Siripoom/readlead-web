'use client'

import Link from 'next/link'
import { BookOpen, ChevronRight, Eye, Info, List, Trophy, Users } from 'lucide-react'
import type { HomeBookStripItem } from '@/lib/home-landing-data'
import { NovelCoverArt } from './NovelCoverArt'
import styles from './NovelLanding.module.css'

function itemHref(item: HomeBookStripItem) {
  return item.href ?? `/detail?bookId=${encodeURIComponent(item.detailId)}`
}

function CoverImage({ item, className }: { item: HomeBookStripItem; className: string }) {
  if (!item.coverUrl) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element -- cover URLs can be local API routes or CMS URLs.
    <img
      src={item.coverUrl}
      alt=""
      className={className}
      onError={(event) => { event.currentTarget.style.display = 'none' }}
    />
  )
}

function PopularHero({ item, rank, compact = false }: { item: HomeBookStripItem; rank: number; compact?: boolean }) {
  return (
    <Link
      href={itemHref(item)}
      className={compact ? styles.popularMini : styles.popularChampion}
      style={{ background: item.gradient }}
    >
      <span className={styles.popularBackdrop} aria-hidden="true">
        <NovelCoverArt index={rank - 1} />
      </span>
      <CoverImage item={item} className={styles.popularBackdropImage} />
      <span className={styles.popularShade} aria-hidden="true" />
      <span className={styles.popularHeroContent}>
        <span className={styles.hallOfFame}><Trophy /> HALL OF FAME</span>
        <span className={styles.popularTitleRow}>
          <strong className={styles.popularRank}>{rank}</strong>
          <span>
            <b className={styles.popularTitle}>{item.title}</b>
            <small className={styles.popularGenre}>{item.genreLabel} · {item.originLabel}</small>
          </span>
        </span>
        <em className={styles.popularQuote}>{item.tagline || 'เรื่องราวเข้มข้นที่ผู้อ่านกำลังพูดถึงมากที่สุด'}</em>
        <span className={styles.popularStats}>
          <span><Eye /> <b>{item.views}</b> ครั้ง</span>
          <span><List /> {item.chapters} ตอน</span>
        </span>
        {!compact && <span className={styles.readButton}>อ่านเลย <ChevronRight /></span>}
      </span>
      <span className={styles.popularHeroCover} style={{ background: item.gradient }} aria-hidden="true">
        <NovelCoverArt index={rank - 1} />
        <CoverImage item={item} className={styles.popularHeroCoverImage} />
      </span>
    </Link>
  )
}

function PopularCard({ item, rank }: { item: HomeBookStripItem; rank: number }) {
  return (
    <Link href={itemHref(item)} className={styles.popularCard}>
      <span className={styles.cardCover} style={{ background: item.gradient }}>
        <NovelCoverArt index={rank - 1} />
        <CoverImage item={item} className={styles.cardCoverImage} />
      </span>
      <span className={styles.cardTitleRow}>
        <strong>{rank}</strong>
        <span>
          <b>{item.title}</b>
          <small>{item.author}</small>
          <small>{item.genreLabel} · {item.originLabel}</small>
        </span>
      </span>
      <span className={styles.cardStats}><Eye /> {item.views} <List /> {item.chapters}</span>
    </Link>
  )
}

export function NovelPopularityShowcase({ items }: { items: HomeBookStripItem[] }) {
  const [champion, second, third, ...rest] = items
  if (!champion) return null

  return (
    <section className={styles.popularitySection}>
      <div className={styles.popularityHeader}>
        <div>
          <h1>อันดับความนิยมสูงสุด <Link href="/ranking">ดูเพิ่มเติม <ChevronRight /></Link></h1>
          <h2>TOP 10 อันดับนิยายยอดนิยม</h2>
          <p><Info /> จัดอันดับจากยอดอ่านรวม, คะแนนรีวิว และความนิยมของผู้อ่าน</p>
        </div>
        <div className={styles.summaryStats}>
          <div><span className={styles.statPink}><BookOpen /></span><small>ยอดอ่านทั้งหมด</small><b>128.7M+</b></div>
          <div><span className={styles.statGold}><List /></span><small>เรื่องทั้งหมด</small><b>3,240+</b></div>
          <div><span className={styles.statPurple}><Users /></span><small>ผู้ใช้งาน</small><b>2.3M+</b></div>
        </div>
      </div>

      <div className={styles.popularTop}>
        <PopularHero item={champion} rank={1} />
        {(second || third) && (
          <div className={styles.popularSecondRow}>
            {second && <PopularHero item={second} rank={2} compact />}
            {third && <PopularHero item={third} rank={3} compact />}
          </div>
        )}
      </div>

      <div className={styles.popularGrid}>
        {rest.slice(0, 7).map((item, index) => <PopularCard key={item.id} item={item} rank={index + 4} />)}
      </div>
    </section>
  )
}
