'use client'

import { startTransition, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  BookMarked,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  Eye,
  Headphones,
  Heart,
  History,
  Library,
  Menu,
  MessageSquareText,
  Sparkles,
  Ticket,
  UserRound,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useRole } from '@/contexts/RoleContext'
import { cn } from '@/lib/utils'
import { shelfStorageKey } from '@/lib/profile-repository'
import {
  RANKING_GENRES,
  RANKING_SORT_LABELS,
  RANKING_STATS,
  RANKING_TYPE_LABELS,
  RANKING_VIEW_LABELS,
  type RankingContentType,
  type RankingCreatorItem,
  type RankingGenreKey,
  type RankingRouteState,
  type RankingSort,
  type RankingView,
  type RankingWorkItem,
} from '@/lib/ranking-page-data'
import styles from './RankingLanding.module.css'

const PAGE_SIZE = 20
const DAILY_MAX = 15
const MONTHLY_MAX = 30
const VOTE_STORAGE_KEY = 'rl_ranking_votes_v1'

type VoteKind = 'daily' | 'monthly'
type VoteBonus = { daily: number; monthly: number }
type VoteLedger = {
  dailyKey: string
  monthlyKey: string
  dailyUsed: number
  monthlyUsed: number
  bonuses: Record<string, VoteBonus>
}

interface Props {
  state: RankingRouteState
  works: RankingWorkItem[]
  creators: RankingCreatorItem[]
}

const todayKey = () => new Date().toLocaleDateString('en-CA')
const monthKey = () => todayKey().slice(0, 7)
const initialLedger = (): VoteLedger => ({
  dailyKey: todayKey(),
  monthlyKey: monthKey(),
  dailyUsed: 0,
  monthlyUsed: 0,
  bonuses: {},
})

const fmt = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 1 : 2)}M`
  if (value >= 1_000) return value.toLocaleString('en-US')
  return String(value)
}

const coverStyle = (item: Pick<RankingWorkItem, 'coverFrom' | 'coverTo'>): CSSProperties => ({
  background: `linear-gradient(155deg, ${item.coverFrom}, ${item.coverTo})`,
})

function buildHref(state: RankingRouteState, options: { genre?: RankingGenreKey | null; page?: number } = {}) {
  const params = new URLSearchParams()
  if (state.type && state.sort) {
    params.set('type', state.type)
    params.set('sort', state.sort)
  } else if (state.view !== 'overview') {
    params.set('view', state.view)
  }
  const genre = options.genre === undefined ? state.genre : options.genre
  if (genre) params.set('genre', genre)
  if (options.page && options.page > 1) params.set('page', String(options.page))
  const query = params.toString()
  return query ? `/ranking?${query}` : '/ranking'
}

function currentLabel(state: RankingRouteState) {
  if (state.type && state.sort) return `${RANKING_TYPE_LABELS[state.type]} · ${RANKING_SORT_LABELS[state.sort].label}`
  if (state.view !== 'overview') return RANKING_VIEW_LABELS[state.view].label
  return 'ภาพรวม'
}

const TYPE_ICONS: Record<RankingContentType, ReactNode> = {
  novel: <BookOpen />,
  manga: <Library />,
  audiobook: <Headphones />,
}

const SORTS: RankingSort[] = ['recommended', 'monthly', 'views', 'new']
const OTHER_VIEWS: Array<{ view: Exclude<RankingView, 'overview'>; icon: ReactNode }> = [
  { view: 'completed', icon: <History /> },
  { view: 'creators', icon: <UserRound /> },
  { view: 'shelf', icon: <BookMarked /> },
  { view: 'reviews', icon: <MessageSquareText /> },
  { view: 'favorites', icon: <Heart /> },
]

function SideMenu({ state, onNavigate }: { state: RankingRouteState; onNavigate?: () => void }) {
  const [openGroups, setOpenGroups] = useState<Record<RankingContentType, boolean>>({
    novel: state.type === 'novel',
    manga: state.type === 'manga',
    audiobook: state.type === 'audiobook',
  })

  return (
    <>
      <nav className={styles.sideNav} aria-label="หมวดกระดานอันดับ">
        <Link
          href="/ranking"
          onClick={onNavigate}
          aria-current={state.view === 'overview' && !state.type ? 'page' : undefined}
          className={cn(styles.sideLink, state.view === 'overview' && !state.type && styles.sideLinkActive)}
        >
          <BarChart3 className={styles.sideIcon} /> ภาพรวม
        </Link>

        {(['novel', 'manga', 'audiobook'] as RankingContentType[]).map((type) => {
          const isOpen = openGroups[type]
          return (
            <div key={type}>
              <button
                type="button"
                className={styles.groupButton}
                aria-expanded={isOpen}
                onClick={() => setOpenGroups((current) => ({ ...current, [type]: !current[type] }))}
              >
                <span className={styles.sideIcon}>{TYPE_ICONS[type]}</span>
                <span className={styles.groupLabel}>{RANKING_TYPE_LABELS[type]}</span>
                <ChevronDown className={cn(styles.chevron, isOpen && styles.chevronOpen)} />
              </button>
              {isOpen && (
                <div className={styles.subNav}>
                  {SORTS.map((sort) => {
                    const active = state.type === type && state.sort === sort
                    const label = sort === 'new'
                      ? `อันดับ${type === 'novel' ? 'หนังสือ' : type === 'manga' ? 'เว็บตูน' : 'หนังสือเสียง'}ใหม่`
                      : RANKING_SORT_LABELS[sort].label
                    return (
                      <Link
                        key={sort}
                        href={`/ranking?type=${type}&sort=${sort}`}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                        className={cn(styles.subLink, active && styles.subLinkActive)}
                      >
                        {label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        <div className={styles.separator} />
        <div className={styles.sideSectionTitle}><Sparkles className={styles.sideIcon} /> อันดับอื่นๆ</div>
        {OTHER_VIEWS.map(({ view, icon }) => {
          const active = state.view === view
          return (
            <Link
              key={view}
              href={`/ranking?view=${view}`}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(styles.sideLink, active && styles.sideLinkActive)}
            >
              <span className={styles.sideIcon}>{icon}</span>
              {RANKING_VIEW_LABELS[view].label}
            </Link>
          )
        })}
      </nav>

      <div className={styles.promo}>
        <h3>โหวตผลงานที่คุณชื่นชอบ</h3>
        <p>ทุกการโหวตของคุณ มีผลต่ออันดับผลงานที่คุณรัก</p>
        <Link href="/ranking?type=novel&sort=recommended" onClick={onNavigate} className={styles.promoLink}>ไปโหวตเลย</Link>
        <svg className={styles.gems} viewBox="0 0 100 90" aria-hidden="true">
          <defs><linearGradient id="rank-gem" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c69cff"/><stop offset="1" stopColor="#f48fc4"/></linearGradient></defs>
          <polygon points="50,18 68,43 50,80 32,43" fill="url(#rank-gem)"/><polygon points="50,18 68,43 50,51 32,43" fill="#fff" opacity=".38"/>
          <polygon points="76,43 87,57 76,79 64,57" fill="#f4a0cc"/><polygon points="25,49 38,62 30,84 17,64" fill="#b98bee" opacity=".9"/>
        </svg>
      </div>
    </>
  )
}

type Countdown = { days: string; hours: string; minutes: string; seconds: string }
const pad = (value: number) => String(value).padStart(2, '0')

function countdownTo(kind: VoteKind): Countdown {
  const now = new Date()
  const target = kind === 'daily'
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    : new Date(now.getFullYear(), now.getMonth() + 1, 1)
  let seconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000))
  const days = Math.floor(seconds / 86400)
  seconds -= days * 86400
  const hours = Math.floor(seconds / 3600)
  seconds -= hours * 3600
  const minutes = Math.floor(seconds / 60)
  seconds -= minutes * 60
  return { days: pad(days), hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) }
}

function useCountdown(kind: VoteKind) {
  const [value, setValue] = useState(() => countdownTo(kind))
  useEffect(() => {
    const timer = window.setInterval(() => setValue(countdownTo(kind)), 1000)
    return () => window.clearInterval(timer)
  }, [kind])
  return value
}

function VoteSummaryCard({ kind, used }: { kind: VoteKind; used: number }) {
  const countdown = useCountdown(kind)
  const daily = kind === 'daily'
  const values = [countdown.days, countdown.hours, countdown.minutes, countdown.seconds]
  return (
    <div className={cn(styles.voteCard, daily ? styles.voteDaily : styles.voteMonthly)}>
      <div className={styles.voteHead}>
        <span className={styles.ticketIcon}>{daily ? <Ticket /> : <Crown />}</span>
        <div><b>{daily ? 'โหวตแนะนำ' : 'โหวตรายเดือน'}</b><p>{daily ? 'รีเซ็ตทุกวัน' : 'รีเซ็ตทุกเดือน'}</p></div>
      </div>
      <div className={styles.voteCount}>
        <strong>{used}<small> / {daily ? DAILY_MAX : MONTHLY_MAX}</small></strong><span>โหวตแล้ว</span>
      </div>
      <div>
        <span className={styles.countdownLabel}>เหลือเวลาอีก</span>
        <div className={styles.countdown} aria-label={`เหลือเวลา ${values.join(':')}`}>
          {values.map((value, index) => (
            <span className={styles.countCell} key={index} aria-hidden="true"><b>{value}</b><span>{['วัน', 'ชม.', 'นาที', 'วินาที'][index]}</span></span>
          ))}
        </div>
      </div>
    </div>
  )
}

function RankingHero({ state, ledger }: { state: RankingRouteState; ledger: VoteLedger }) {
  const listMode = state.type !== null || state.view !== 'overview'
  const year = new Date().getFullYear()
  return (
    <section className={styles.heroBand}>
      <div className={styles.hero}>
        <svg className={styles.heroScene} viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g fill="#fff" opacity=".66"><ellipse cx="120" cy="65" rx="74" ry="22"/><ellipse cx="645" cy="48" rx="88" ry="25"/><ellipse cx="430" cy="37" rx="48" ry="14"/></g>
          <g fill="#c5cdef" opacity=".9"><rect x="470" y="135" width="25" height="108"/><polygon points="470,135 482,105 495,135"/><rect x="504" y="110" width="32" height="133"/><polygon points="504,110 520,72 536,110"/><rect x="544" y="145" width="25" height="98"/><polygon points="544,145 556,116 569,145"/></g>
          <path d="M0 240 Q400 215 800 243 L800 300H0Z" fill="#ecd9e9" opacity=".78"/><path d="M0 265 Q400 238 800 264V300H0Z" fill="#d8c2dc" opacity=".7"/>
          <g fill="#263552"><ellipse cx="665" cy="124" rx="16" ry="18"/><path d="M632 158Q665 140 698 158L716 262Q665 244 614 262Z"/><path d="M697 155L719 245L703 250L678 167Z"/></g>
          <g fill="#f3a4c2" opacity=".9"><rect x="330" y="108" width="6" height="9" rx="3" transform="rotate(22 333 112)"/><rect x="397" y="180" width="6" height="9" rx="3" transform="rotate(-18 400 184)"/><rect x="282" y="201" width="5" height="8" rx="2" transform="rotate(28 284 205)"/></g>
        </svg>
        <div className={styles.heroText}>
          {listMode && <div className={styles.heroEyebrow}>ศึกชิงบัลลังก์</div>}
          <h1 className={styles.heroTitle}>{listMode ? 'นักเขียนแห่งปี' : 'กระดานอันดับปี'} <span>{year}</span></h1>
          <p className={styles.heroDescription}>ร่วมโหวตผลงานที่คุณชื่นชอบ{listMode && <><br/>ให้ขึ้นแท่นอันดับ 1</>}</p>
        </div>
        {listMode && <div className={styles.heroDots} aria-hidden="true"><i className={styles.heroDot}/><i className={styles.heroDot}/><i className={styles.heroDot}/><i className={styles.heroDot}/></div>}
      </div>
      <div className={styles.voteCards}>
        <VoteSummaryCard kind="daily" used={ledger.dailyUsed}/>
        <VoteSummaryCard kind="monthly" used={ledger.monthlyUsed}/>
      </div>
    </section>
  )
}

function GenreFilters({ state }: { state: RankingRouteState }) {
  return (
    <div className={styles.filters} aria-label="กรองหมวดหมู่">
      <Link href={buildHref(state, { genre: null })} className={cn(styles.filterLink, !state.genre && styles.filterActive)}>ทุกหมวด</Link>
      {RANKING_GENRES.map((genre) => (
        <span key={genre.key} className="contents">
          <span className={styles.filterDot} aria-hidden="true">·</span>
          <Link href={buildHref(state, { genre: genre.key })} className={cn(styles.filterLink, state.genre === genre.key && styles.filterActive)}>{genre.label}</Link>
        </span>
      ))}
    </div>
  )
}

function StatsStrip() {
  const icons = [<UserRound key="users"/>, <BookOpen key="works"/>, <Eye key="views"/>, <Sparkles key="new"/>]
  return (
    <section className={cn(styles.card, styles.stats)} aria-label="สถิติแพลตฟอร์ม">
      {RANKING_STATS.map((stat, index) => (
        <div className={styles.stat} key={stat.id}>
          <span className={styles.statIcon} style={{ background: stat.accent }}>{icons[index]}</span>
          <div>
            <div className={styles.statValue}>{stat.value} <span>{stat.unit}</span></div>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={styles.statParts}>{stat.parts.map((part) => <span key={part}>{part}</span>)}</div>
          </div>
        </div>
      ))}
    </section>
  )
}

function RankMark({ rank }: { rank: number }) {
  if (rank > 3) return <>{rank}</>
  const color = rank === 1 ? '#f4b528' : rank === 2 ? '#b6bcc8' : '#cf8a52'
  return <span className={styles.crownStack} style={{ '--crown': color } as CSSProperties}><Crown/><span>{rank}</span></span>
}

function WorkLink({ item, className, children }: { item: RankingWorkItem; className?: string; children: ReactNode }) {
  return <Link className={className} href={`/detail?bookId=${encodeURIComponent(item.detailId)}`}>{children}</Link>
}

function OverviewTable({ state, works, ledger }: Props & { ledger: VoteLedger }) {
  const rows = useMemo(() => works
    .filter((item) => !state.genre || item.genre === state.genre)
    .sort((left, right) => {
      const leftBonus = ledger.bonuses[left.id]?.daily ?? 0
      const rightBonus = ledger.bonuses[right.id]?.daily ?? 0
      return right.recommendedVotes + rightBonus - left.recommendedVotes - leftBonus
    })
    .slice(0, 100), [ledger.bonuses, state.genre, works])

  return (
    <section className={cn(styles.card, styles.overviewCard)}>
      <div className={styles.sectionHead}><h2>อันดับทั้งหมด</h2><small>(Top 100)</small></div>
      <GenreFilters state={state}/>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th className={styles.center}>อันดับ</th><th>เรื่อง</th><th>ผู้เขียน</th><th className={styles.number}>โหวตรายวัน</th><th className={styles.number}>โหวตรายเดือน</th><th className={styles.number}>ยอดวิว</th><th className={styles.center}>เปลี่ยนแปลง</th><th className={styles.center}>เปิดตัว</th></tr></thead>
          <tbody>
            {rows.map((item, index) => {
              const bonus = ledger.bonuses[item.detailId] ?? { daily: 0, monthly: 0 }
              return (
                <tr key={item.id}>
                  <td className={styles.rankCell}><RankMark rank={index + 1}/></td>
                  <td><div className={styles.storyCell}><span className={styles.miniCover} style={coverStyle(item)}>{item.title.charAt(0)}</span><WorkLink item={item} className={styles.storyTitle}>{item.title}</WorkLink></div></td>
                  <td>{item.author}</td>
                  <td className={styles.number}>{fmt(item.recommendedVotes + bonus.daily)}</td>
                  <td className={styles.number}>{fmt(item.monthlyVotes + bonus.monthly)}</td>
                  <td className={styles.number}>{fmt(item.views)}</td>
                  <td className={styles.center}>{item.change > 0 ? <span className={styles.up}>▲ {item.change}</span> : item.change < 0 ? <span className={styles.down}>▼ {Math.abs(item.change)}</span> : <span className={styles.flat}>–</span>}</td>
                  <td className={styles.center}>{item.launchedAt}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function metricFor(item: RankingWorkItem, state: RankingRouteState, bonus: VoteBonus) {
  if (state.view === 'shelf') return { value: item.shelfCount, label: 'เพิ่มเข้าชั้น' }
  if (state.view === 'favorites') return { value: item.favoriteCount, label: 'หัวใจ' }
  if (state.view === 'reviews') return { value: item.reviewCount, label: `รีวิว · ${item.rating.toFixed(1)} ★` }
  if (state.sort === 'monthly') return { value: item.monthlyVotes + bonus.monthly, label: 'คะแนนรายเดือน' }
  if (state.sort === 'views') return { value: item.views, label: 'ยอดวิว' }
  if (state.sort === 'new') return { value: new Date(item.updatedAt).getTime(), label: 'เปิดตัวใหม่' }
  return { value: item.recommendedVotes + bonus.daily, label: 'คะแนนโหวต' }
}

function sortWorks(works: RankingWorkItem[], state: RankingRouteState, ledger: VoteLedger) {
  return [...works].sort((left, right) => {
    if (state.sort === 'new') return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    const leftMetric = metricFor(left, state, ledger.bonuses[left.id] ?? { daily: 0, monthly: 0 }).value
    const rightMetric = metricFor(right, state, ledger.bonuses[right.id] ?? { daily: 0, monthly: 0 }).value
    return rightMetric - leftMetric
  })
}

function Pagination({ state, total }: { state: RankingRouteState; total: number }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const candidates = Array.from(new Set([1, state.page - 1, state.page, state.page + 1, pages])).filter((page) => page >= 1 && page <= pages).sort((a, b) => a - b)
  if (pages <= 1) return null
  return (
    <nav className={styles.pagination} aria-label="หน้ารายการอันดับ">
      <Link aria-disabled={state.page === 1} href={buildHref(state, { page: state.page - 1 })} className={cn(styles.pageLink, state.page === 1 && styles.pageDisabled)}><ChevronLeft size={15}/><span className="sr-only">ก่อนหน้า</span></Link>
      {candidates.map((page, index) => (
        <span key={page} className="contents">
          {index > 0 && page - candidates[index - 1] > 1 && <span className={styles.pageLink} aria-hidden="true">…</span>}
          <Link aria-current={page === state.page ? 'page' : undefined} href={buildHref(state, { page })} className={cn(styles.pageLink, page === state.page && styles.pageActive)}>{page}</Link>
        </span>
      ))}
      <Link aria-disabled={state.page === pages} href={buildHref(state, { page: state.page + 1 })} className={cn(styles.pageLink, state.page === pages && styles.pageDisabled)}><ChevronRight size={15}/><span className="sr-only">ถัดไป</span></Link>
    </nav>
  )
}

function CreatorList({ state, creators }: { state: RankingRouteState; creators: RankingCreatorItem[] }) {
  const start = (state.page - 1) * PAGE_SIZE
  const pageItems = creators.slice(start, start + PAGE_SIZE)
  return (
    <>
      <div className={styles.list}>
        {pageItems.map((creator, index) => (
          <div className={styles.creatorRow} key={creator.id}>
            <div className={styles.creatorRank}>#{start + index + 1}</div>
            <div className={styles.creatorIdentity}>
              <span className={styles.avatar} style={{ background: `linear-gradient(145deg,${creator.avatarFrom},${creator.avatarTo})` }}>{creator.name.charAt(0)}</span>
              <div><h3 className={styles.creatorName}>{creator.name}</h3><p className={styles.creatorMeta}>{creator.genreLabel} · {creator.works} ผลงาน</p></div>
            </div>
            <div className={styles.creatorStats}>
              <div><b>{fmt(creator.followers)}</b><span>ผู้ติดตาม</span></div>
              <div><b>{fmt(creator.totalVotes)}</b><span>คะแนนโหวต</span></div>
              <div><b>{fmt(creator.totalViews)}</b><span>ยอดวิว</span></div>
            </div>
          </div>
        ))}
      </div>
      <Pagination state={state} total={creators.length}/>
    </>
  )
}

function ListView({ state, works, creators, ledger, onVote, savedIds, onToggleShelf }: Props & {
  ledger: VoteLedger
  onVote: (item: RankingWorkItem) => void
  savedIds: Set<string>
  onToggleShelf: (id: string) => void
}) {
  const baseTitle = state.type && state.sort ? RANKING_SORT_LABELS[state.sort] : state.view !== 'overview' ? RANKING_VIEW_LABELS[state.view] : null
  const title = state.type && state.sort === 'new'
    ? {
        ...baseTitle,
        label: `อันดับ${state.type === 'novel' ? 'หนังสือ' : state.type === 'manga' ? 'เว็บตูน' : 'หนังสือเสียง'}ใหม่`,
      }
    : baseTitle
  const sorted = useMemo(() => sortWorks(works, state, ledger), [ledger, state, works])
  const start = (state.page - 1) * PAGE_SIZE
  const pageItems = sorted.slice(start, start + PAGE_SIZE)

  return (
    <section className={cn(styles.card, styles.listCard)}>
      <div className={styles.sectionHead}><h2>{title?.label}</h2><small>{title?.subtitle}</small></div>
      <GenreFilters state={state}/>
      {state.view === 'creators' ? <CreatorList state={state} creators={creators}/> : (
        <>
          <div className={styles.list}>
            {pageItems.length === 0 && <div className={styles.empty}>ยังไม่มีรายการในหมวดนี้</div>}
            {pageItems.map((item, index) => {
              const rank = start + index + 1
              const bonus = ledger.bonuses[item.detailId] ?? { daily: 0, monthly: 0 }
              const metric = metricFor(item, state, bonus)
              return (
                <article className={styles.workRow} key={item.id}>
                  <div className={styles.coverWrap}>
                    <span className={styles.cover} style={coverStyle(item)}>{item.title.charAt(0)}</span>
                    <span className={cn(styles.rankFlag, rank === 1 && styles.rankOne, rank === 2 && styles.rankTwo, rank === 3 && styles.rankThree)}>{rank}</span>
                  </div>
                  <div className={styles.workMain}>
                    <h3 className={styles.workTitle}><span>#{rank}</span>{item.title}</h3>
                    <div className={styles.meta}>
                      <b>{item.author}</b><i className={styles.metaDivider}/><span>{item.genreLabel}</span><i className={styles.metaDivider}/><span className={styles.origin}>{item.origin}</span><i className={styles.metaDivider}/><span className={styles.status}>{item.status === 'completed' ? 'จบแล้ว' : 'กำลังเขียน'}</span>
                    </div>
                    <p className={styles.description}>{item.synopsis}</p>
                    <p className={styles.updated}><b>อัปเดตล่าสุด</b> {item.latestEpisode} · {new Date(item.updatedAt).toLocaleDateString('th-TH', { dateStyle: 'medium', timeZone: 'Asia/Bangkok' })}</p>
                  </div>
                  <div className={styles.workActions}>
                    <div className={styles.metric}><b>{state.sort === 'new' ? item.launchedAt : fmt(metric.value)}</b>{metric.label}</div>
                    <div className={styles.actionButtons}>
                      <WorkLink item={item} className={styles.primaryButton}>รายละเอียด</WorkLink>
                      <button type="button" className={styles.voteButton} onClick={() => onVote(item)}>โหวต</button>
                      <button type="button" className={styles.outlineButton} onClick={() => onToggleShelf(item.detailId)}>{savedIds.has(item.detailId) ? 'อยู่ในชั้นแล้ว' : 'เพิ่มในชั้น'}</button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          <Pagination state={state} total={sorted.length}/>
        </>
      )}
    </section>
  )
}

function VoteDialog({ item, open, onOpenChange, ledger, onConfirm, message }: {
  item: RankingWorkItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  ledger: VoteLedger
  onConfirm: (kind: VoteKind) => void
  message: string
}) {
  if (!item) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialog}>
        <DialogHeader><DialogTitle className={styles.dialogTitle}>โหวตให้ “{item.title}”</DialogTitle><DialogDescription>เลือกตั๋วที่ต้องการใช้ 1 ใบ คะแนนจะอัปเดตบนกระดานทันที</DialogDescription></DialogHeader>
        <div className={styles.dialogCover}>
          <span className={styles.dialogMiniCover} style={coverStyle(item)}>{item.title.charAt(0)}</span>
          <div><b>{item.title}</b><p className={styles.creatorMeta}>{item.author} · {item.genreLabel}</p></div>
        </div>
        <div className={styles.dialogOptions}>
          <button type="button" className={styles.dialogOption} style={{ '--accent': '#cc4452', '--bg': '#fff5f8' } as CSSProperties} disabled={ledger.dailyUsed >= DAILY_MAX} onClick={() => onConfirm('daily')}><Ticket color="#cc4452"/><b>โหวตแนะนำ</b><span>เหลือ {Math.max(0, DAILY_MAX - ledger.dailyUsed)} ใบวันนี้</span></button>
          <button type="button" className={styles.dialogOption} style={{ '--accent': '#f6921e', '--bg': '#fff9f1' } as CSSProperties} disabled={ledger.monthlyUsed >= MONTHLY_MAX} onClick={() => onConfirm('monthly')}><Crown color="#f6921e"/><b>โหวตรายเดือน</b><span>เหลือ {Math.max(0, MONTHLY_MAX - ledger.monthlyUsed)} ใบเดือนนี้</span></button>
        </div>
        <p className={styles.dialogMessage} role="status">{message}</p>
      </DialogContent>
    </Dialog>
  )
}

export function RankingExperience({ state, works, creators }: Props) {
  const router = useRouter()
  const { isLoggedIn, user } = useRole()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [ledger, setLedger] = useState<VoteLedger>(initialLedger)
  const [ledgerReady, setLedgerReady] = useState(false)
  const [selectedWork, setSelectedWork] = useState<RankingWorkItem | null>(null)
  const [voteDialogOpen, setVoteDialogOpen] = useState(false)
  const [voteMessage, setVoteMessage] = useState('')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [serverWorks, setServerWorks] = useState<RankingWorkItem[] | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/catalog/works?pageSize=50', { cache: 'no-store', signal: controller.signal }).then((response) => response.ok ? response.json() : Promise.reject(new Error('catalog'))).then((data: { items?: Array<{ id: string; type: RankingContentType; title: string; category: string; tagline: string; seriesStatus: string; updatedAt: string; publishedAt: string | null; views: number; shelfCount: number; dailyVotes: number; monthlyVotes: number; reviewCount: number; creator: { name: string; writerApplication: { penName: string } | null }; _count: { episodes: number } }> }) => {
      setServerWorks((data.items ?? []).map((item, index) => ({ id: item.id, detailId: item.id, type: item.type, title: item.title, author: item.creator.writerApplication?.penName || item.creator.name, genre: (RANKING_GENRES.some((genre) => genre.key === item.category) ? item.category : 'other') as RankingGenreKey, genreLabel: RANKING_GENRES.find((genre) => genre.key === item.category)?.label || item.category, synopsis: item.tagline, status: item.seriesStatus === 'completed' ? 'completed' : 'ongoing', origin: 'ไทย', latestEpisode: `${item._count.episodes} ตอน`, updatedAt: item.updatedAt, launchedAt: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('th-TH', { dateStyle: 'medium' }) : '—', recommendedVotes: item.dailyVotes, monthlyVotes: item.monthlyVotes, views: item.views, change: 0, shelfCount: item.shelfCount, favoriteCount: item.shelfCount, reviewCount: item.reviewCount, rating: 0, coverFrom: ['#7255a7', '#9a5f73', '#477c78'][index % 3], coverTo: ['#241b3a', '#39212b', '#193934'][index % 3] })))
    }).catch(() => undefined)
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (serverWorks === null) return
    const timer = window.setTimeout(() => setLedger(initialLedger()), 0)
    return () => window.clearTimeout(timer)
  }, [serverWorks])

  useEffect(() => {
    let next = initialLedger()
    try {
      const stored = JSON.parse(localStorage.getItem(VOTE_STORAGE_KEY) ?? 'null') as VoteLedger | null
      if (stored) {
        const resetDaily = stored.dailyKey !== todayKey()
        const resetMonthly = stored.monthlyKey !== monthKey()
        const bonuses = Object.fromEntries(Object.entries(stored.bonuses ?? {}).map(([id, bonus]) => [id, {
          daily: resetDaily ? 0 : bonus.daily,
          monthly: resetMonthly ? 0 : bonus.monthly,
        }]))
        next = {
          dailyKey: todayKey(),
          monthlyKey: monthKey(),
          dailyUsed: resetDaily ? 0 : stored.dailyUsed,
          monthlyUsed: resetMonthly ? 0 : stored.monthlyUsed,
          bonuses,
        }
      }
    } catch {}
    startTransition(() => {
      setLedger(next)
      setLedgerReady(true)
    })

    if (user) void fetch('/api/member/activity', { cache: 'no-store' }).then((response) => response.ok ? response.json() : { shelves: [] }).then((data: { shelves?: Array<{ work: { id: string } }> }) => setSavedIds(new Set((data.shelves ?? []).map((item) => item.work.id))))
  }, [user])

  useEffect(() => {
    if (!ledgerReady || serverWorks !== null) return
    localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(ledger))
  }, [ledger, ledgerReady, serverWorks])

  const openVote = (item: RankingWorkItem) => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    setSelectedWork(item)
    setVoteMessage('')
    setVoteDialogOpen(true)
  }

  const confirmVote = async (kind: VoteKind) => {
    if (!selectedWork) return
    const max = kind === 'daily' ? DAILY_MAX : MONTHLY_MAX
    const used = kind === 'daily' ? ledger.dailyUsed : ledger.monthlyUsed
    if (used >= max) {
      setVoteMessage('ตั๋วประเภทนี้ถูกใช้ครบแล้ว')
      return
    }
    if (serverWorks?.some((work) => work.detailId === selectedWork.detailId)) {
      const response = await fetch('/api/interactions/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workId: selectedWork.detailId, kind }) })
      const data = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) { setVoteMessage(data.error || 'โหวตไม่สำเร็จ'); return }
    }
    setLedger((current) => {
      const currentBonus = current.bonuses[selectedWork.detailId] ?? { daily: 0, monthly: 0 }
      return {
        ...current,
        dailyUsed: current.dailyUsed + (kind === 'daily' ? 1 : 0),
        monthlyUsed: current.monthlyUsed + (kind === 'monthly' ? 1 : 0),
        bonuses: {
          ...current.bonuses,
          [selectedWork.detailId]: { ...currentBonus, [kind]: currentBonus[kind] + 1 },
        },
      }
    })
    setVoteMessage('บันทึกคะแนนโหวตเรียบร้อยแล้ว')
  }

  const toggleShelf = (id: string) => {
    if (!isLoggedIn) { router.push('/login'); return }
    if (serverWorks?.some((work) => work.detailId === id)) {
      void fetch('/api/interactions/shelf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workId: id }) }).then(async (response) => {
        const data = await response.json().catch(() => ({})) as { active?: boolean }
        if (response.ok) setSavedIds((current) => { const next = new Set(current); if (data.active) next.add(id); else next.delete(id); return next })
      })
      return
    }
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      if (user) localStorage.setItem(shelfStorageKey(user.id), JSON.stringify([...next]))
      return next
    })
  }

  const displayWorks = serverWorks ?? works

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <h2 className={styles.sideTitle}>อันดับความนิยม</h2>
          <SideMenu state={state}/>
        </aside>

        <main className={styles.content}>
          <div className={styles.mobileNav}>
            <button type="button" className={styles.mobileNavButton} onClick={() => setMobileOpen(true)} aria-expanded={mobileOpen}><span className="flex items-center"><Menu size={18}/><span className="ml-2">{currentLabel(state)}</span></span><ChevronRight size={18}/></button>
          </div>

          <RankingHero state={state} ledger={ledger}/>
          {state.view === 'overview' && !state.type ? (
            <><StatsStrip/><OverviewTable state={state} works={displayWorks} creators={creators} ledger={ledger}/></>
          ) : (
            <ListView state={state} works={displayWorks} creators={creators} ledger={ledger} onVote={openVote} savedIds={savedIds} onToggleShelf={toggleShelf}/>
          )}
        </main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[min(88vw,360px)] gap-0 bg-white p-0">
          <SheetHeader className="border-b px-5 py-5"><SheetTitle className="text-lg font-bold">อันดับความนิยม</SheetTitle><SheetDescription>เลือกหมวดและประเภทอันดับ</SheetDescription></SheetHeader>
          <div className={styles.sheetBody}><SideMenu state={state} onNavigate={() => setMobileOpen(false)}/></div>
        </SheetContent>
      </Sheet>

      <VoteDialog item={selectedWork} open={voteDialogOpen} onOpenChange={setVoteDialogOpen} ledger={ledger} onConfirm={confirmVote} message={voteMessage}/>
    </div>
  )
}
