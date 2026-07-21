'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Filter, Star } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { GENRE_LABELS } from '@/lib/mock-data'
import type { OwnerDashboardData } from '@/lib/profile-types'
import type { ContentType } from '@/lib/types'
import styles from '../profile.module.css'

type ShelfFilter = 'all' | ContentType
type ResetPeriod = 'daily' | 'monthly'
type Countdown = { days: string; hours: string; minutes: string; seconds: string }
type ShelfWork = {
  id: string
  type: ContentType
  title: string
  category: string
  creatorName: string
  tagline: string
}

const FILTERS: Array<{ id: ShelfFilter; label: string }> = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'novel', label: 'นิยาย' },
  { id: 'manga', label: 'มังงะ' },
  { id: 'audiobook', label: 'หนังสือเสียง' },
]

const TYPE_LABELS: Record<ContentType, string> = {
  novel: 'นิยาย',
  manga: 'มังงะ',
  audiobook: 'หนังสือเสียง',
}

const COVER_GRADIENTS = [
  'radial-gradient(circle at 70% 26%,rgba(255,255,255,.55),transparent 22%),linear-gradient(160deg,#3b5bdb,#1e3a8a 60%,#0f1e4d)',
  'linear-gradient(170deg,#5eead4,#0ea5e9 58%,#1e3a8a)',
  'radial-gradient(circle at 50% 32%,rgba(200,255,210,.4),transparent 38%),linear-gradient(180deg,#34d399,#16a34a 65%,#14532d)',
  'radial-gradient(circle at 50% 30%,rgba(150,255,210,.45),transparent 40%),linear-gradient(180deg,#0f3d3e,#134e4a 70%,#042f2e)',
  'linear-gradient(170deg,#a78bfa,#6d28d9 58%,#3b0764)',
  'linear-gradient(170deg,#94a3b8,#475569 58%,#1e293b)',
  'linear-gradient(170deg,#a7f3d0,#34d399 55%,#0f766e)',
  'linear-gradient(170deg,#c4b5fd,#8b5cf6 60%,#5b21b6)',
]

const EMPTY_COUNTDOWN: Countdown = { days: '–', hours: '–', minutes: '–', seconds: '–' }

function getCountdown(period: ResetPeriod): Countdown {
  const now = new Date()
  const target = period === 'daily'
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    : new Date(now.getFullYear(), now.getMonth() + 1, 1)
  let remaining = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000))
  const days = Math.floor(remaining / 86400)
  remaining -= days * 86400
  const hours = Math.floor(remaining / 3600)
  remaining -= hours * 3600
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining - minutes * 60
  const pad = (value: number) => String(value).padStart(2, '0')

  return { days: pad(days), hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) }
}

function useCountdown(period: ResetPeriod) {
  const [countdown, setCountdown] = useState<Countdown>(EMPTY_COUNTDOWN)

  useEffect(() => {
    const tick = () => setCountdown(getCountdown(period))
    tick()
    const interval = window.setInterval(tick, 1000)
    return () => window.clearInterval(interval)
  }, [period])

  return countdown
}

function coverGradient(id: string) {
  let hash = 0
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return COVER_GRADIENTS[hash % COVER_GRADIENTS.length]
}

function VoteCountdown({ countdown, accent }: { countdown: Countdown; accent: string }) {
  const cells = [
    { value: countdown.days, label: 'วัน' },
    { value: countdown.hours, label: 'ชม.' },
    { value: countdown.minutes, label: 'นาที' },
    { value: countdown.seconds, label: 'วินาที' },
  ]

  return (
    <div className={styles.countdown} style={{ '--vote-accent': accent } as React.CSSProperties} aria-label={`เหลือ ${countdown.days} วัน ${countdown.hours} ชั่วโมง ${countdown.minutes} นาที ${countdown.seconds} วินาที`}>
      {cells.map((cell) => (
        <span className={styles.countdownCell} key={cell.label}>
          <b>{cell.value}</b>
          <small>{cell.label}</small>
        </span>
      ))}
    </div>
  )
}

export function OwnerHome({ data }: { data: OwnerDashboardData }) {
  const { balance } = useWallet()
  const [filter, setFilter] = useState<ShelfFilter>('all')
  const [category, setCategory] = useState('all')
  const [serverShelf, setServerShelf] = useState<ShelfWork[] | null>(null)
  const [social, setSocial] = useState<{ followers: number; following: number } | null>(null)
  const dailyCountdown = useCountdown('daily')
  const monthlyCountdown = useCountdown('monthly')
  const profile = data.profile
  const expPercent = profile.nextLevelExp > 0
    ? Math.min(100, (profile.currentLevelExp / profile.nextLevelExp) * 100)
    : 0

  const fallbackShelf = useMemo<ShelfWork[]>(() => data.shelf.map((work) => ({
    id: work.id,
    type: work.type,
    title: work.title,
    category: GENRE_LABELS[work.genres[0]] ?? work.genres[0] ?? 'อื่น ๆ',
    creatorName: work.authorName,
    tagline: work.synopsis,
  })), [data.shelf])
  const allShelf = serverShelf ?? fallbackShelf
  const typeShelf = filter === 'all' ? allShelf : allShelf.filter((work) => work.type === filter)
  const categories = useMemo(() => Array.from(new Set(typeShelf.map((work) => work.category).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'th')), [typeShelf])
  const activeCategory = category === 'all' || categories.includes(category) ? category : 'all'
  const shelf = activeCategory === 'all' ? typeShelf : typeShelf.filter((work) => work.category === activeCategory)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/member/activity', { cache: 'no-store', signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Unable to load member activity')))
      .then((result: {
        shelves?: Array<{
          work: {
            id: string
            type: ContentType
            title: string
            category: string
            tagline: string
            creator: { name: string; writerApplication: { penName: string } | null }
          }
        }>
        followers?: number
        following?: number
      }) => {
        setServerShelf((result.shelves ?? []).map(({ work }) => ({
          id: work.id,
          type: work.type,
          title: work.title,
          category: GENRE_LABELS[work.category] ?? work.category,
          creatorName: work.creator.writerApplication?.penName || work.creator.name,
          tagline: work.tagline,
        })))
        setSocial({ followers: result.followers ?? 0, following: result.following ?? 0 })
      })
      .catch(() => {
        if (!controller.signal.aborted) setServerShelf(fallbackShelf)
      })
    return () => controller.abort()
  }, [fallbackShelf])

  const changeFilter = (nextFilter: ShelfFilter) => {
    setFilter(nextFilter)
    setCategory('all')
  }

  return (
    <div className={styles.ownerHome}>
      <section className={styles.ownerHero}>
        <div className={styles.avatarWrap}>
          <Image src={profile.avatarUrl} alt={profile.displayName} width={178} height={178} className={styles.avatarLarge} priority />
        </div>
        <div className={styles.ownerInfo}>
          <h1 className={styles.ownerName}>{profile.displayName}</h1>
          <div className={styles.ownerHandle}>@{profile.handle}</div>
          <div className={styles.levelRow}>
            <div className={styles.levelIdentity}>
              <b>เลเวล {profile.level}</b>
              <span className={styles.rankPill}><Star aria-hidden="true" />{profile.rankLabel}</span>
            </div>
            <span>{profile.currentLevelExp.toLocaleString('th-TH')} / {profile.nextLevelExp.toLocaleString('th-TH')} EXP</span>
          </div>
          <div className={styles.progress} aria-label={`ความคืบหน้า EXP ${Math.round(expPercent)} เปอร์เซ็นต์`}>
            <i style={{ width: `${expPercent}%` }} />
          </div>
          <div className={styles.followStats}>
            <div><span>ผู้ติดตาม</span><b>{(social?.followers ?? profile.followerCount).toLocaleString('th-TH')} <small>คน</small></b></div>
            <div><span>กำลังติดตาม</span><b>{(social?.following ?? profile.followingCount).toLocaleString('th-TH')} <small>คน</small></b></div>
          </div>
        </div>
      </section>

      <section className={styles.statsGrid} aria-label="สรุปบัญชี">
        <Link href={`/profile/${encodeURIComponent(profile.id)}?tab=wallet`} className={`${styles.card} ${styles.coinCard}`}>
          <Image src="/profile/readify-coin.png" alt="" width={52} height={52} className={styles.coinImage} />
          <span className={styles.coinBody}>
            <b>ยอดเหรียญในบัญชี</b>
            <span className={styles.coinValueRow}>
              <strong>{balance.toLocaleString('th-TH')}</strong>
              <span>เติมเหรียญ ›</span>
            </span>
          </span>
        </Link>

        <div className={`${styles.voteCard} ${styles.dailyVoteCard}`}>
          <Image src="/profile/readify-daily-ticket.png" alt="" width={52} height={42} className={styles.ticketImage} />
          <div className={styles.voteBody}>
            <div className={styles.voteTitleRow}>
              <b>โหวตแนะนำ</b>
              <span>{data.dailyVote.resetLabel}</span>
              <small>เหลือเวลาอีก</small>
            </div>
            <div className={styles.voteValueRow}>
              <span className={styles.voteCount}><strong>{data.dailyVote.used}<small> / {data.dailyVote.total}</small></strong><span>โหวตแล้ว</span></span>
              <VoteCountdown countdown={dailyCountdown} accent="#cc4452" />
            </div>
          </div>
        </div>

        <div className={`${styles.voteCard} ${styles.monthlyVoteCard}`}>
          <Image src="/profile/readify-monthly-ticket.png" alt="" width={52} height={42} className={styles.ticketImage} />
          <div className={styles.voteBody}>
            <div className={styles.voteTitleRow}>
              <b>โหวตรายเดือน</b>
              <span>{data.monthlyVote.resetLabel}</span>
              <small>เหลือเวลาอีก</small>
            </div>
            <div className={styles.voteValueRow}>
              <span className={styles.voteCount}><strong>{data.monthlyVote.used}<small> / {data.monthlyVote.total}</small></strong><span>โหวตแล้ว</span></span>
              <VoteCountdown countdown={monthlyCountdown} accent="#f6921e" />
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.card} ${styles.bookshelf}`}>
        <div className={styles.bookshelfTabs}>
          <div className={styles.mediaTabs} role="tablist" aria-label="กรองตามประเภทสื่อ">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                onClick={() => changeFilter(item.id)}
                className={`${styles.mediaTab} ${filter === item.id ? styles.mediaTabActive : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className={styles.categoryFilter}>
            <Filter aria-hidden="true" />
            <select value={activeCategory} onChange={(event) => setCategory(event.target.value)} aria-label="กรองตามหมวดหมู่">
              <option value="all">ทุกหมวดหมู่</option>
              {categories.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
            <ChevronDown aria-hidden="true" />
          </label>
        </div>

        {serverShelf === null && fallbackShelf.length === 0 ? (
          <div className={styles.shelfLoading} aria-busy="true">กำลังโหลดชั้นหนังสือ...</div>
        ) : shelf.length ? (
          <div className={styles.ownerBookGrid}>
            {shelf.map((work) => (
              <Link key={work.id} href={`/detail?bookId=${encodeURIComponent(work.id)}`} className={styles.bookCard}>
                <span className={styles.bookCover} style={{ background: coverGradient(work.id) }} />
                <b title={work.title}>{work.title}</b>
                <span className={styles.bookMeta}>
                  <span>{work.category}</span>
                  <span>{TYPE_LABELS[work.type]}</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>ยังไม่มีเรื่องในหมวดนี้</div>
        )}
      </section>
    </div>
  )
}
