'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { CalendarDays, Coins, TicketCheck } from 'lucide-react'
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
  const [serverShelf, setServerShelf] = useState<Array<{ createdAt: string; work: { id: string; type: ContentType; title: string; category: string; tagline: string; creator: { name: string; writerApplication: { penName: string } | null } } }>>([])
  const [social, setSocial] = useState<{ followers: number; following: number } | null>(null)
  const profile = data.profile
  const expPercent = Math.min(100, (profile.currentLevelExp / profile.nextLevelExp) * 100)
  const shelf = filter === 'all' ? serverShelf : serverShelf.filter((item) => item.work.type === filter)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/member/activity', { cache: 'no-store', signal: controller.signal }).then((response) => response.ok ? response.json() : { shelves: [] }).then((result: { shelves?: typeof serverShelf; followers?: number; following?: number }) => { setServerShelf(result.shelves ?? []); setSocial({ followers: result.followers ?? 0, following: result.following ?? 0 }) }).catch(() => undefined)
    return () => controller.abort()
  }, [])

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
            <div><b>{(social?.followers ?? profile.followerCount).toLocaleString('th-TH')}</b><span>ผู้ติดตาม</span></div>
            <div><b>{(social?.following ?? profile.followingCount).toLocaleString('th-TH')}</b><span>กำลังติดตาม</span></div>
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
          <div className={styles.bookGrid}>{shelf.map(({ work }) => <Link key={work.id} href={`/detail?bookId=${encodeURIComponent(work.id)}`} className={`${styles.card} block overflow-hidden p-4`}><div className="mb-3 aspect-[3/2] rounded-lg bg-gradient-to-br from-[#7451b7] to-[#e3a3b5]" /><b className="line-clamp-1">{work.title}</b><span className="mt-1 block text-xs text-muted-foreground">{work.creator.writerApplication?.penName || work.creator.name} · {work.category}</span><p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{work.tagline}</p></Link>)}</div>
        ) : (
          <div className={styles.empty}>ยังไม่มีเรื่องในหมวดนี้</div>
        )}
      </section>
      <TopUpModal open={topUpOpen} onOpenChange={setTopUpOpen} />
    </div>
  )
}
