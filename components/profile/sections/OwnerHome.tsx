'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CalendarDays, Coins, TicketCheck } from 'lucide-react'
import { BookCard } from '@/components/shared/BookCard'
import TopUpModal from '@/components/modals/TopUpModal'
import { useWallet } from '@/contexts/WalletContext'
import type { ContentType } from '@/lib/types'
import type { OwnerDashboardData } from '@/lib/profile-types'
import styles from '../profile.module.css'

type ShelfFilter = 'all' | ContentType
const FILTERS: Array<{ id: ShelfFilter; label: string }> = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'novel', label: 'นิยาย' },
  { id: 'manga', label: 'เว็บตูน' },
  { id: 'audiobook', label: 'หนังสือเสียง' },
]

export function OwnerHome({ data }: { data: OwnerDashboardData }) {
  const { balance } = useWallet()
  const [filter, setFilter] = useState<ShelfFilter>('all')
  const [topUpOpen, setTopUpOpen] = useState(false)
  const profile = data.profile
  const expPercent = Math.min(100, (profile.currentLevelExp / profile.nextLevelExp) * 100)
  const shelf = filter === 'all' ? data.shelf : data.shelf.filter((work) => work.type === filter)

  return (
    <div className={styles.stack}>
      <section className={styles.ownerHero}>
        <Image src={profile.avatarUrl} alt={profile.displayName} width={154} height={154} className={styles.avatarLarge} />
        <div className={styles.ownerInfo}>
          <h1 className={styles.ownerName}>{profile.displayName}</h1>
          <div className={styles.handle}>@{profile.handle}</div>
          <div className={styles.levelRow}>
            <div><b>เลเวล {profile.level}</b><span className={styles.rankPill}>{profile.rankLabel}</span></div>
            <span>{profile.currentLevelExp.toLocaleString('th-TH')} / {profile.nextLevelExp.toLocaleString('th-TH')} EXP</span>
          </div>
          <div className={styles.progress} aria-label={`ความคืบหน้า EXP ${Math.round(expPercent)} เปอร์เซ็นต์`}>
            <i style={{ width: `${expPercent}%` }} />
          </div>
          <div className={styles.followStats}>
            <div><b>{profile.followerCount.toLocaleString('th-TH')}</b><span>ผู้ติดตาม</span></div>
            <div><b>{profile.followingCount.toLocaleString('th-TH')}</b><span>กำลังติดตาม</span></div>
          </div>
        </div>
      </section>

      <section className={styles.statsGrid} aria-label="สรุปบัญชี">
        <button type="button" onClick={() => setTopUpOpen(true)} className={`${styles.card} ${styles.statCard}`} style={{ textAlign: 'left', cursor: 'pointer' }}>
          <span className={styles.statIcon}><Coins /></span>
          <span className={styles.statText}>
            <span className={styles.statLabel}>ยอดเหรียญในบัญชี</span>
            <span className={`${styles.statValue} block`}>{balance.toLocaleString('th-TH')}</span>
            <span className={styles.statSub}>เติมเหรียญ ›</span>
          </span>
        </button>
        <div className={`${styles.card} ${styles.statCard}`}>
          <span className={styles.statIcon}><TicketCheck /></span>
          <div className={styles.statText}>
            <div className={styles.statLabel}>โหวตแนะนำวันนี้</div>
            <div className={styles.statValue}>{data.dailyVote.used} <small>/ {data.dailyVote.total}</small></div>
            <div className={styles.statSub}>{data.dailyVote.resetLabel}</div>
          </div>
        </div>
        <div className={`${styles.card} ${styles.statCard}`}>
          <span className={styles.statIcon}><CalendarDays /></span>
          <div className={styles.statText}>
            <div className={styles.statLabel}>โหวตรายเดือน</div>
            <div className={styles.statValue}>{data.monthlyVote.used} <small>/ {data.monthlyVote.total}</small></div>
            <div className={styles.statSub}>{data.monthlyVote.resetLabel}</div>
          </div>
        </div>
      </section>

      <section className={`${styles.card} ${styles.sectionCard}`}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>ชั้นหนังสือของฉัน</h2>
            <p className={styles.sectionDesc}>เรื่องที่บันทึกไว้สำหรับอ่านต่อ</p>
          </div>
          <div className={styles.filterRow}>
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`${styles.filterButton} ${filter === item.id ? styles.filterButtonActive : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        {shelf.length ? (
          <div className={styles.bookGrid}>{shelf.map((work) => <BookCard key={work.id} work={work} />)}</div>
        ) : (
          <div className={styles.empty}>ยังไม่มีเรื่องในหมวดนี้</div>
        )}
      </section>
      <TopUpModal open={topUpOpen} onOpenChange={setTopUpOpen} />
    </div>
  )
}
