'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, BarChart3, BookOpen, CheckCircle2, ChevronLeft, Coins, Edit3, Eye, FileText, LoaderCircle, MessageCircle, Plus, Send, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { CreatorWorkDetail } from '@/lib/creator-studio-types'

const statusLabel = {
  draft: 'ฉบับร่าง', pending_review: 'รอตรวจสอบ', approved: 'อนุมัติแล้ว', published: 'เผยแพร่แล้ว', rejected: 'ไม่ผ่านการตรวจ', deletion_pending: 'รออนุมัติการลบ', archived: 'เก็บถาวร',
}

function date(value: string | null) {
  return value ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'
}

async function responseError(response: Response) {
  const data = await response.json().catch(() => ({})) as { error?: string }
  return data.error || 'โหลดข้อมูลผลงานไม่สำเร็จ'
}

export default function CreatorWorkManager({ workId }: { workId: string }) {
  const [work, setWork] = useState<CreatorWorkDetail | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'episodes' | 'reviews' | 'comments'>('episodes')
  const [actionBusy, setActionBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  const loadWork = useCallback((signal?: AbortSignal) => {
    return fetch(`/api/creator/works/${workId}`, { cache: 'no-store', signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(await responseError(response))
        return response.json() as Promise<{ work: CreatorWorkDetail }>
      })
      .then((data) => setWork(data.work))
      .catch((cause) => { if (cause instanceof Error && cause.name !== 'AbortError') setError(cause.message) })
  }, [workId])

  useEffect(() => {
    const controller = new AbortController()
    void loadWork(controller.signal)
    return () => controller.abort()
  }, [loadWork])

  async function submitReview() {
    setActionBusy(true); setActionError('')
    try {
      const response = await fetch(`/api/creator/works/${workId}/submit-review`, { method: 'POST' })
      if (!response.ok) throw new Error(await responseError(response))
      await loadWork()
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'ส่งตรวจสอบไม่สำเร็จ') }
    finally { setActionBusy(false) }
  }

  if (error) return <main className="container mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center gap-3 px-4 text-center"><AlertCircle className="size-9 text-destructive" /><h1 className="text-xl font-semibold">{error}</h1><Link href="/creator"><Button variant="outline">กลับแดชบอร์ด</Button></Link></main>
  if (!work) return <main className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-muted-foreground" aria-busy="true"><LoaderCircle className="size-5 animate-spin" /> กำลังโหลดผลงาน…</main>

  const publishedEpisodes = work.episodes.filter((episode) => episode.status === 'published').length
  const stats: Array<{ label: string; value: number; Icon: LucideIcon }> = [
    { label: 'ยอดอ่าน', value: work.views, Icon: Eye }, { label: 'เหรียญ', value: work.coins, Icon: Coins },
    { label: 'ตอนเผยแพร่', value: publishedEpisodes, Icon: FileText }, { label: 'รีวิว', value: work.reviewCount, Icon: Star },
    { label: 'ความคิดเห็น', value: work.commentCount, Icon: MessageCircle }, { label: 'ชั้นหนังสือ', value: work.shelfCount, Icon: BookOpen },
  ]
  return (
    <main className="container mx-auto max-w-6xl px-4 py-7">
      <Link href="/creator" className="mb-5 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ChevronLeft className="size-4" />แดชบอร์ดนักเขียน</Link>

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="h-24 bg-gradient-to-r from-[#6f43c0] via-[#9b65db] to-[#e7a3b6]" />
        <div className="grid gap-5 px-5 pb-6 sm:grid-cols-[132px_1fr] sm:px-7">
          <div className="-mt-14 flex aspect-[3/4] items-center justify-center rounded-xl border-4 border-card bg-gradient-to-br from-[#ede4fa] to-[#f7dfe7] text-[#7d55c2] shadow-md"><BookOpen className="size-12" /></div>
          <div className="pt-4 sm:pt-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><div className="mb-2 flex flex-wrap gap-2"><Badge>{work.type === 'novel' ? 'นิยาย' : work.type === 'manga' ? 'เว็บตูน' : 'หนังสือเสียง'}</Badge><Badge variant="outline">{statusLabel[work.status]}</Badge><Badge variant="outline">{work.origin === 'translated' ? 'ผลงานแปล' : 'ผลงานต้นฉบับ'}</Badge></div><h1 className="text-2xl font-bold sm:text-3xl">{work.title}</h1><p className="mt-2 text-sm text-muted-foreground">{work.tagline || work.synopsis || 'ยังไม่มีคำโปรย'}</p></div>
              <div className="flex flex-wrap gap-2">{work.status === 'published' && <Link href={`/detail?bookId=${work.id}`}><Button variant="outline"><Eye className="size-4" />ดูหน้าสาธารณะ</Button></Link>}{work.status !== 'pending_review' && !['archived', 'deletion_pending'].includes(work.status) && <Link href={`/creator/works/${work.id}/edit`}><Button><Edit3 className="size-4" />แก้ไขข้อมูล</Button></Link>}</div>
            </div>
            {work.rejectionReason && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">เหตุผลที่ไม่ผ่าน: {work.rejectionReason}</p>}
            {work.status === 'pending_review' && <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">ส่งตรวจเมื่อ {date(work.moderation?.submittedAt ?? null)} ระหว่างนี้เตรียมตอนฉบับร่างได้ แต่ยังเผยแพร่หรือตั้งเวลาไม่ได้</div>}
            {work.status === 'approved' && <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"><CheckCircle2 className="size-5" />เรื่องผ่านการอนุมัติแล้ว เผยแพร่ตอนแรกเพื่อเปิดเรื่องสู่ผู้อ่าน</div>}
            {work.capabilities.canSubmitReview && <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3 text-sm"><span>{work.status === 'rejected' ? 'แก้ไขข้อมูลตามเหตุผลข้างต้นแล้วส่งให้ตรวจใหม่ได้' : 'ส่งข้อมูลเรื่องให้ผู้ดูแลตรวจสอบก่อนเผยแพร่ตอน'}</span><Button size="sm" disabled={actionBusy} onClick={() => void submitReview()}>{actionBusy ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}{actionBusy ? 'กำลังส่ง…' : 'ส่งตรวจสอบ'}</Button></div>}
            {actionError && <p role="alert" className="mt-3 text-sm text-red-700">{actionError}</p>}
          </div>
        </div>
      </section>

      <section className="my-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
        {stats.map(({ label, value, Icon }) => <div key={label} className="rounded-xl border bg-card p-4"><Icon className="mb-3 size-5 text-primary" /><b className="block text-xl">{value.toLocaleString('th-TH')}</b><span className="text-xs text-muted-foreground">{label}</span></div>)}
      </section>

      <section className="rounded-2xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 pt-3">
          <div className="flex" role="tablist" aria-label="จัดการผลงาน">{([['episodes', `ตอน (${work.episodes.length})`], ['reviews', `รีวิว (${work.reviews.length})`], ['comments', `ความคิดเห็น (${work.comments.length})`]] as const).map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`border-b-2 px-4 py-3 text-sm font-medium ${tab === value ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>{label}</button>)}</div>
          {tab === 'episodes' && <div className="mb-3 flex gap-2"><Button variant="outline" size="sm"><BarChart3 className="size-4" />สถิติตอน</Button>{work.capabilities.canCreateDraftEpisode && <Link href={`/creator/works/${work.id}/episodes/new`}><Button size="sm"><Plus className="size-4" />เพิ่ม / Bulk upload</Button></Link>}</div>}
        </div>

        {tab === 'episodes' && <div className="divide-y">{work.episodes.map((episode) => <article key={episode.id} className="grid items-center gap-3 px-4 py-4 sm:grid-cols-[54px_1fr_auto_auto]"><span className="text-center text-sm text-muted-foreground">{episode.episodeNumber}</span><div><h2 className="font-medium">{episode.title}</h2><p className="mt-1 text-xs text-muted-foreground">{date(episode.publishedAt || episode.scheduledAt)} · {episode.type === 'text' ? `${episode.content?.length ?? 0} ตัวอักษร` : episode.type === 'image' ? 'ตอนแบบภาพ' : `${Math.ceil((episode.durationSeconds ?? 0) / 60)} นาที`}</p></div><div className="flex items-center gap-2"><Badge variant="outline">{episode.status === 'published' ? 'เผยแพร่' : episode.status === 'scheduled' ? 'ตั้งเวลา' : episode.status === 'hidden' ? 'ซ่อน' : 'ฉบับร่าง'}</Badge>{episode.priceCoins ? <span className="text-sm text-primary">{episode.priceCoins} เหรียญ</span> : <span className="text-sm text-green-600">ฟรี</span>}</div><Link href={`/creator/works/${work.id}/episodes/${episode.id}/edit`}><Button variant="ghost" size="sm">แก้ไข</Button></Link></article>)}{work.episodes.length === 0 && <div className="flex flex-col items-center gap-3 py-14 text-center text-muted-foreground"><FileText className="size-10" /><b className="text-foreground">ยังไม่มีตอน</b><span className="text-sm">{work.capabilities.canCreateDraftEpisode ? 'เพิ่มตอนแรกหรืออัปโหลดหลายตอนพร้อมกันได้เลย' : 'สถานะผลงานนี้ไม่รองรับการเพิ่มตอน'}</span>{work.capabilities.canCreateDraftEpisode && <Link href={`/creator/works/${work.id}/episodes/new`}><Button>เพิ่มตอนแรก</Button></Link>}</div>}</div>}

        {tab === 'reviews' && <div className="divide-y">{work.reviews.map((review) => <article key={review.id} className="p-5"><div className="flex justify-between gap-3"><b>{review.user.name}</b><span className="text-amber-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span></div><p className="mt-2 text-sm">{review.body}</p><time className="mt-2 block text-xs text-muted-foreground">{date(review.createdAt)}</time></article>)}{work.reviews.length === 0 && <div className="py-14 text-center text-sm text-muted-foreground">ยังไม่มีรีวิวจากนักอ่าน</div>}</div>}

        {tab === 'comments' && <div className="divide-y">{work.comments.map((comment) => <article key={comment.id} className="p-5"><b>{comment.user.name}</b><p className="mt-2 text-sm">{comment.body}</p><time className="mt-2 block text-xs text-muted-foreground">{date(comment.createdAt)}</time>{comment.replies.map((reply) => <div key={reply.id} className="ml-6 mt-3 rounded-lg bg-muted/50 p-3 text-sm"><b>{reply.user.name}</b><p className="mt-1">{reply.body}</p></div>)}</article>)}{work.comments.length === 0 && <div className="py-14 text-center text-sm text-muted-foreground">ยังไม่มีความคิดเห็นจากนักอ่าน</div>}</div>}
      </section>
    </main>
  )
}
