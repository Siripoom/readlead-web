import Link from 'next/link'
import { BookOpen, Headphones, Info, Users } from 'lucide-react'
import type { AudioBookItem } from '@/lib/audiobook-landing-data'
import { AudioBookCard } from './AudioBookCarousel'
import { AudioCover } from './AudioCover'
import styles from './AudioLanding.module.css'

function itemHref(item: AudioBookItem) {
  return item.href ?? `/detail?bookId=${encodeURIComponent(item.detailId)}`
}

export function AudioPopularityShowcase({ items }: { items: AudioBookItem[] }) {
  const top = items.slice(0, 3)
  const rest = items.slice(3, 10)
  return (
    <section className={styles.popularitySection}>
      <div className={styles.popularityHeader}>
        <div className={styles.popularityTitle}>
          <h1>อันดับความนิยมสูงสุด <Link href="/ranking">ดูเพิ่มเติม ›</Link></h1>
          <strong>TOP 12 อันดับหนังสือเสียงยอดนิยม</strong>
          <p><Info />จัดอันดับจากยอดฟังรวม, คะแนนรีวิว และความนิยมของผู้ฟัง</p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statCard}><span className={styles.statPink}><Headphones /></span><div><small>ยอดฟังรวมทั้งหมด</small><b>128.7M+</b></div></div>
          <div className={styles.statCard}><span className={styles.statGold}><BookOpen /></span><div><small>เรื่องทั้งหมด</small><b>3,240+</b></div></div>
          <div className={styles.statCard}><span className={styles.statPurple}><Users /></span><div><small>ผู้ฟังที่ใช้งาน</small><b>2.3M+</b></div></div>
        </div>
      </div>

      <div className={styles.topThree}>
        {top.map((item, index) => (
          <Link key={item.id} href={itemHref(item)} className={`${styles.topBanner} group`} aria-label={`อันดับ ${index + 1} ${item.title}`} style={{ background: item.gradient }}>
            <AudioCover index={index} coverUrl={item.coverUrl} title={item.title} sizes="(max-width: 767px) 100vw, 390px" />
            {!item.coverUrl && <span className={styles.topBannerLabel}>พื้นที่ภาพ อันดับ {index + 1} (441×229)</span>}
          </Link>
        ))}
      </div>

      <div className={styles.popularRest}>
        {rest.map((item, index) => <AudioBookCard key={item.id} item={item} index={index + 3} rank={index + 4} />)}
      </div>
    </section>
  )
}
