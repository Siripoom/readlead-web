'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, BookOpen, ChevronLeft, ChevronRight, Headphones, ImageIcon, LoaderCircle, Search, Trash2 } from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { CreatorDashboardData, CreatorDashboardWork, CreatorMetric, CreatorWorkType } from '@/lib/creator-studio-types'
import styles from './CreatorDashboard.module.css'

type TypeFilter = CreatorWorkType | 'all'
type SortMode = 'published' | 'recent' | 'oldest' | 'dailyVotes' | 'monthlyVotes' | 'views'

const typeOptions: Array<{ value: TypeFilter; label: string }> = [
  { value: 'all', label: 'ทั้งหมด' }, { value: 'novel', label: 'นิยาย' }, { value: 'manga', label: 'เว็บตูน' }, { value: 'audiobook', label: 'หนังสือเสียง' },
]
const metrics: Array<{ key: Exclude<CreatorMetric, 'revenue' | 'comments'>; label: string }> = [
  { key: 'coins', label: 'เหรียญ' }, { key: 'views', label: 'ยอดวิว' }, { key: 'shelf', label: 'เพิ่มเข้าชั้นหนังสือ' },
  { key: 'dailyVotes', label: 'โหวตแนะนำ' }, { key: 'monthlyVotes', label: 'โหวตรายเดือน' }, { key: 'reviews', label: 'รีวิว' },
]
const statusLabels: Record<CreatorDashboardWork['status'], string> = {
  draft: 'ฉบับร่าง', pending_review: 'รอตรวจสอบ', approved: 'อนุมัติแล้ว', published: 'เผยแพร่', rejected: 'ไม่ผ่าน', deletion_pending: 'รอลบ', archived: 'เก็บถาวร',
}
const sortLabels: Record<SortMode, string> = {
  published: 'เรียงตามวันที่เผยแพร่', recent: 'อัปเดตล่าสุด', oldest: 'อัปเดตเก่าสุด', dailyVotes: 'โหวตแนะนำ', monthlyVotes: 'โหวตรายเดือน', views: 'ยอดวิว',
}

function money(satang: number) { return `฿${(satang / 100).toLocaleString('th-TH', { maximumFractionDigits: 2 })}` }
function compact(value: number) { return new Intl.NumberFormat('th-TH', { notation: value >= 1000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value) }
function thaiDate(value: string | null) { return value ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date(value)) : '—' }

async function apiError(response: Response, fallback: string) {
  const data = await response.json().catch(() => ({})) as { error?: string }
  return data.error || fallback
}

function TrendChart({ points, metric }: { points: CreatorDashboardData['chart']; metric: CreatorMetric }) {
  const chart = useMemo(() => {
    if (!points.length) return null
    const max = Math.max(1, ...points.map((point) => point.value))
    return points.map((point, index) => ({
      ...point,
      x: points.length === 1 ? 50 : (index / (points.length - 1)) * 100,
      y: 91 - (point.value / max) * 78,
    }))
  }, [points])
  if (!chart) return <div className={styles.chartEmpty}>ยังไม่มีข้อมูลในช่วงเวลานี้</div>
  const path = chart.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')
  return (
    <div className={styles.chartWrap}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`กราฟแนวโน้ม ${metric}`}>
        <defs><linearGradient id="creatorChartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8d5ad8" stopOpacity=".28" /><stop offset="1" stopColor="#8d5ad8" stopOpacity="0" /></linearGradient></defs>
        {[20, 40, 60, 80].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} className={styles.chartGrid} />)}
        <path d={`${path} L 100 100 L 0 100 Z`} fill="url(#creatorChartFill)" />
        <path d={path} className={styles.chartLine} />
        {chart.map((point) => <circle key={point.date} cx={point.x} cy={point.y} r="1.2" className={styles.chartPoint}><title>{thaiDate(point.date)}: {point.value.toLocaleString('th-TH')}</title></circle>)}
      </svg>
      <div className={styles.chartLabels}><span>{thaiDate(chart[0].date)}</span><span>{thaiDate(chart.at(-1)!.date)}</span></div>
    </div>
  )
}

export default function CreatorDashboard() {
  const { profile } = useProfile()
  const now = new Date()
  const [data, setData] = useState<CreatorDashboardData | null>(null)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [type, setType] = useState<TypeFilter>('all')
  const [metric, setMetric] = useState<CreatorMetric>('coins')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [sort, setSort] = useState<SortMode>('published')
  const [queryDraft, setQueryDraft] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [newWorkOpen, setNewWorkOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawBusy, setWithdrawBusy] = useState(false)
  const [deleteWork, setDeleteWork] = useState<CreatorDashboardWork | null>(null)
  const [deleteReason, setDeleteReason] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  const load = useCallback(async () => {
    setBusy(true); setError('')
    const params = new URLSearchParams({ type, metric, year: String(year), month: String(month), sort, query, page: String(page), pageSize: '10' })
    try {
      const response = await fetch(`/api/creator/dashboard?${params}`, { cache: 'no-store' })
      if (!response.ok) throw new Error(await apiError(response, 'โหลดแดชบอร์ดไม่สำเร็จ'))
      setData(await response.json() as CreatorDashboardData)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'โหลดแดชบอร์ดไม่สำเร็จ') }
    finally { setBusy(false) }
  }, [metric, month, page, query, sort, type, year])

  useEffect(() => {
    const timer = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  function search(event: FormEvent) { event.preventDefault(); setPage(1); setQuery(queryDraft.trim()) }

  async function withdraw() {
    setWithdrawBusy(true); setActionMessage('')
    try {
      const response = await fetch('/api/creator/withdrawals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: Number(withdrawAmount) }) })
      if (!response.ok) throw new Error(await apiError(response, 'ส่งคำขอไม่สำเร็จ'))
      setWithdrawOpen(false); setWithdrawAmount(''); setActionMessage('ส่งคำขอถอนเงินเรียบร้อยแล้ว'); await load()
    } catch (cause) { setActionMessage(cause instanceof Error ? cause.message : 'ส่งคำขอไม่สำเร็จ') }
    finally { setWithdrawBusy(false) }
  }

  async function requestDelete() {
    if (!deleteWork) return
    try {
      const response = await fetch(`/api/creator/works/${deleteWork.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: deleteReason }) })
      if (!response.ok) throw new Error(await apiError(response, 'ส่งคำขอลบไม่สำเร็จ'))
      setDeleteWork(null); setDeleteReason(''); setActionMessage('ส่งคำขอลบให้ผู้ดูแลตรวจสอบแล้ว'); await load()
    } catch (cause) { setActionMessage(cause instanceof Error ? cause.message : 'ส่งคำขอลบไม่สำเร็จ') }
  }

  const pages = Math.max(1, Math.ceil((data?.worksPage.total ?? 0) / (data?.worksPage.pageSize ?? 10)))

  if (busy && !data) return <div className={styles.state}><LoaderCircle className={styles.spin} /> กำลังโหลดแดชบอร์ดนักเขียน…</div>
  if (error && !data) return <div className={styles.state}><AlertCircle /><b>{error}</b><Button variant="outline" onClick={() => void load()}>ลองใหม่</Button></div>

  return (
    <div className={styles.dashboard}>
      {actionMessage && <div className={styles.notice} role="status">{actionMessage}<button type="button" onClick={() => setActionMessage('')} aria-label="ปิด">×</button></div>}
      <div className={styles.topGrid}>
        <section className={styles.profileCard}>
          <Image src={profile.avatarUrl} alt="" width={124} height={124} className={styles.avatar} />
          <h1>{data?.profile.displayName}</h1><p>@{profile.handle}</p>
          <div className={styles.miniStats}><div><b>{data?.profile.works ?? 0}</b><span>ผลงาน</span></div><div><b>{(data?.profile.followers ?? 0).toLocaleString('th-TH')}</b><span>ผู้ติดตาม</span></div><div><b>{data?.profile.episodes ?? 0}</b><span>ตอน</span></div></div>
        </section>

        <div className={styles.rightTop}>
          <section className={styles.incomeGrid}>
            <div><span>วันนี้</span><b>{money(data?.income.todaySatang ?? 0)}</b><small>ส่วนแบ่ง 7% ของเหรียญวันนี้</small></div>
            <div><span>เดือนนี้</span><b>{money(data?.income.monthSatang ?? 0)}</b><small>รายได้สะสมของเดือน</small></div>
            <div><span>ปีนี้</span><b>{money(data?.income.yearSatang ?? 0)}</b><small>รายได้สะสมของปี</small></div>
          </section>
          <section className={styles.panel}>
            <h2>ภาพรวมผลงาน</h2>
            <div className={styles.tabs}>{typeOptions.map((option) => <button type="button" key={option.value} className={type === option.value ? styles.activeTab : ''} onClick={() => { setType(option.value); setPage(1) }}>{option.label}</button>)}</div>
            <div className={styles.overview}>{metrics.map((item) => <button type="button" key={item.key} className={metric === item.key ? styles.activeMetric : ''} onClick={() => setMetric(item.key)}><span>{item.label}</span><b>{compact(data?.overview[item.key] ?? 0)}</b></button>)}</div>
          </section>
        </div>

        <section className={styles.balanceCard}>
          <span>ยอดถอนได้ตอนนี้</span><b>{money(data?.balance.availableSatang ?? 0)}</b>
          <dl><div><dt>รายได้เดือนนี้</dt><dd>{money(data?.income.monthSatang ?? 0)}</dd></div><div><dt>รอตรวจสอบ</dt><dd>{money(data?.balance.pendingSatang ?? 0)}</dd></div><div><dt>จ่ายอัตโนมัติ</dt><dd>{thaiDate(data?.balance.nextPayoutAt ?? null)}</dd></div></dl>
          <div className={styles.balanceActions}><Button onClick={() => setWithdrawOpen(true)}>ถอนเงิน</Button><Button variant="outline" onClick={() => setNewWorkOpen(true)}>+ ลงผลงานใหม่</Button></div>
        </section>
        <section className={`${styles.panel} ${styles.chartPanel}`}>
          <div className={styles.panelHead}><h2>แนวโน้ม{metrics.find((item) => item.key === metric)?.label ?? 'รายได้'}</h2><div><select value={month} onChange={(event) => setMonth(Number(event.target.value))}><option value={0}>ทั้งปี</option>{Array.from({ length: 12 }, (_, index) => <option value={index + 1} key={index}>{new Intl.DateTimeFormat('th-TH', { month: 'short' }).format(new Date(2026, index, 1))}</option>)}</select><select value={year} onChange={(event) => setYear(Number(event.target.value))}>{[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((value) => <option key={value}>{value}</option>)}</select></div></div>
          <TrendChart points={data?.chart ?? []} metric={metric} />
        </section>
      </div>

      <section className={`${styles.panel} ${styles.worksPanel}`}>
        <div className={styles.worksHead}><h2>ผลงานของฉัน <span>{data?.worksPage.total ?? 0} เรื่อง</span></h2><div className={styles.tools}><form onSubmit={search}><Search /><input value={queryDraft} onChange={(event) => setQueryDraft(event.target.value)} placeholder="ค้นหาผลงาน…" /><button className="sr-only">ค้นหา</button></form><select value={sort} onChange={(event) => { setSort(event.target.value as SortMode); setPage(1) }}>{Object.entries(sortLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div></div>
        <div className={styles.workTabs}>{typeOptions.map((option) => <button type="button" key={option.value} className={type === option.value ? styles.activeWorkTab : ''} onClick={() => { setType(option.value); setPage(1) }}>{option.label}</button>)}</div>
        {busy && <div className={styles.inlineLoading}><LoaderCircle className={styles.spin} /> กำลังอัปเดตรายการ…</div>}
        {!busy && !data?.worksPage.items.length && <div className={styles.empty}><BookOpen /><b>ยังไม่มีผลงาน</b><span>เริ่มสร้างนิยาย เว็บตูน หรือหนังสือเสียงเรื่องแรกของคุณ</span><Button onClick={() => setNewWorkOpen(true)}>ลงผลงานใหม่</Button></div>}
        <div className={styles.workList}>{data?.worksPage.items.map((work) => <article key={work.id} className={styles.workRow}>
          <div className={`${styles.coverPlaceholder} ${styles[work.type]}`}>{work.type === 'novel' ? <BookOpen /> : work.type === 'manga' ? <ImageIcon /> : <Headphones />}</div>
          <div className={styles.workMain}><h3>{work.title}</h3><p>อัปเดตล่าสุด {thaiDate(work.updatedAt)}</p><small>{work._count.episodes} ตอน · {work.origin === 'translated' ? 'ผลงานแปล' : 'ผลงานไทย'}</small>{work.rejectionReason && <em>{work.rejectionReason}</em>}</div>
          <div className={styles.rowStats}><div><b>{compact(work.views)}</b><span>ยอดวิว</span></div><div><b>{work.dailyVotes}</b><span>ตั๋วแนะนำ</span></div><div><b>{work.monthlyVotes}</b><span>ตั๋วรายเดือน</span></div><div><b>{work.reviewCount}</b><span>รีวิว</span></div><div><b>{work.commentCount}</b><span>ความคิดเห็น</span></div><div><b>{work.shelfCount}</b><span>ชั้นหนังสือ</span></div><div><b>{money(work.coins * 7)}</b><span>รายได้</span></div></div>
          <span className={`${styles.status} ${styles[`status_${work.status}`]}`}>{statusLabels[work.status]}</span>
          <Link href={`/creator/works/${work.id}`} className={styles.manage}>จัดการ</Link>
          {!['archived', 'deletion_pending'].includes(work.status) && <button type="button" className={styles.delete} onClick={() => setDeleteWork(work)} aria-label={`ขอลบ ${work.title}`}><Trash2 /></button>}
        </article>)}</div>
        {(data?.worksPage.total ?? 0) > 0 && <div className={styles.pager}><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft /> ก่อนหน้า</Button><span>{page} / {pages}</span><Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>ถัดไป <ChevronRight /></Button></div>}
      </section>

      <Dialog open={newWorkOpen} onOpenChange={setNewWorkOpen}><DialogContent><DialogHeader><DialogTitle>ลงผลงานใหม่</DialogTitle></DialogHeader><div className={styles.newWorkGrid}>{[{ type: 'novel', label: 'นิยายรายตอน', desc: 'เรื่องยาวแบ่งเป็นตอน', icon: BookOpen }, { type: 'manga', label: 'เว็บตูน', desc: 'การ์ตูนแบบเลื่อนอ่าน', icon: ImageIcon }, { type: 'audiobook', label: 'หนังสือเสียง', desc: 'เสียงอ่านแบ่งเป็นตอน', icon: Headphones }].map((item) => <Link key={item.type} href={`/creator/works/new/${item.type}`}><item.icon /><b>{item.label}</b><span>{item.desc}</span></Link>)}</div></DialogContent></Dialog>

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}><DialogContent><DialogHeader><DialogTitle>ถอนเงินล่วงหน้า</DialogTitle></DialogHeader><div className={styles.withdrawBody}><div><span>ยอดที่ถอนได้ตอนนี้</span><b>{money(data?.balance.availableSatang ?? 0)}</b></div><label htmlFor="withdraw-amount">จำนวนเงินที่ต้องการถอน (บาท)</label><Input id="withdraw-amount" type="number" min={100} max={20000} value={withdrawAmount} onChange={(event) => setWithdrawAmount(event.target.value)} placeholder="100–20,000" /><p>หักภาษี ณ ที่จ่าย 3% ระบบจองยอดทันทีและส่งให้ฝ่ายการเงินตรวจสอบ</p></div><DialogFooter><Button variant="outline" onClick={() => setWithdrawOpen(false)}>ยกเลิก</Button><Button disabled={withdrawBusy || Number(withdrawAmount) < 100 || Number(withdrawAmount) > 20000} onClick={() => void withdraw()}>{withdrawBusy ? 'กำลังส่ง…' : 'ส่งคำขอถอนเงิน'}</Button></DialogFooter></DialogContent></Dialog>

      <Dialog open={!!deleteWork} onOpenChange={(open) => { if (!open) setDeleteWork(null) }}><DialogContent><DialogHeader><DialogTitle>ขอลบผลงาน “{deleteWork?.title}”</DialogTitle></DialogHeader><label className={styles.deleteLabel} htmlFor="delete-reason">เหตุผลที่ขอลบ</label><textarea id="delete-reason" value={deleteReason} onChange={(event) => setDeleteReason(event.target.value)} maxLength={500} rows={4} /><DialogFooter><Button variant="outline" onClick={() => setDeleteWork(null)}>ยกเลิก</Button><Button variant="destructive" disabled={!deleteReason.trim()} onClick={() => void requestDelete()}>ส่งคำขอลบ</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}
