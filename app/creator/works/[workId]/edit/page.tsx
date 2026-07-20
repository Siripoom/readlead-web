'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { ChevronLeft, LoaderCircle, Save } from 'lucide-react'
import RouteGuard from '@/components/layout/RouteGuard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ALL_GENRES, GENRE_LABELS } from '@/lib/mock-data'
import type { CreatorWorkDetail } from '@/lib/creator-studio-types'

export default function EditWorkPage() {
  const { workId } = useParams<{ workId: string }>()
  const router = useRouter()
  const [work, setWork] = useState<CreatorWorkDetail | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/creator/works/${workId}`, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error((await response.json().catch(() => ({})) as { error?: string }).error || 'โหลดข้อมูลไม่สำเร็จ'); return response.json() as Promise<{ work: CreatorWorkDetail }> })
      .then((data) => setWork(data.work))
      .catch((cause) => { if (cause instanceof Error && cause.name !== 'AbortError') setError(cause.message) })
    return () => controller.abort()
  }, [workId])

  function patch<K extends keyof CreatorWorkDetail>(key: K, value: CreatorWorkDetail[K]) { setWork((current) => current ? { ...current, [key]: value } : current) }

  const coreLocked = work?.status === 'approved' || work?.status === 'published'
  const allLocked = work?.status === 'pending_review' || work?.status === 'archived' || work?.status === 'deletion_pending'

  async function save(event: FormEvent) {
    event.preventDefault(); if (!work) return
    setBusy(true); setError('')
    const response = await fetch(`/api/creator/works/${workId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      title: work.title, category: work.category, rating: work.rating, creationMethod: work.creationMethod,
      tagline: work.tagline, synopsis: work.synopsis, tags: work.tags, seriesStatus: work.seriesStatus,
      originalAuthor: work.originalAuthor, translatorName: work.translatorName, originalLanguage: work.originalLanguage, originalTitle: work.originalTitle,
    }) })
    if (!response.ok) { const data = await response.json().catch(() => ({})) as { error?: string }; setError(data.error || 'บันทึกไม่สำเร็จ'); setBusy(false); return }
    router.push(`/creator/works/${workId}`); router.refresh()
  }

  return (
    <RouteGuard allowedRoles={['creator', 'admin']}>
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Link href={`/creator/works/${workId}`} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ChevronLeft className="size-4" />กลับไปหน้าจัดการผลงาน</Link>
        {!work && !error && <div className="flex min-h-80 items-center justify-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-5 animate-spin" />กำลังโหลด…</div>}
        {error && !work && <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>}
        {work && <form onSubmit={save} className="space-y-6"><div><h1 className="text-2xl font-bold">แก้ไขผลงาน</h1><p className="mt-1 text-sm text-muted-foreground">ปรับ metadata และข้อมูลการแสดงผลของ “{work.title}”</p>{coreLocked && <p className="mt-2 text-xs text-amber-700">เรื่องที่อนุมัติแล้วแก้ไขได้เฉพาะคำโปรย เรื่องย่อ แท็ก และสถานะเรื่อง</p>}{allLocked && <p className="mt-2 text-xs text-amber-700">ข้อมูลถูกล็อกระหว่างตรวจสอบหรือดำเนินคำขอ</p>}</div><section className="space-y-5 rounded-2xl border bg-card p-6"><label className="block space-y-2"><span className="text-sm font-medium">ชื่อเรื่อง *</span><Input disabled={coreLocked || allLocked} required maxLength={200} value={work.title} onChange={(event) => patch('title', event.target.value)} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><span className="text-sm font-medium">หมวดหมู่</span><select disabled={coreLocked || allLocked} value={work.category} onChange={(event) => patch('category', event.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-60">{ALL_GENRES.map((genre) => <option value={genre} key={genre}>{GENRE_LABELS[genre]}</option>)}</select></label><label className="space-y-2"><span className="text-sm font-medium">เรตเนื้อหา</span><select disabled={coreLocked || allLocked} value={work.rating} onChange={(event) => patch('rating', event.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-60"><option value="general">ทั่วไป</option><option value="13+">13+</option><option value="18+">18+</option></select></label></div><label className="block space-y-2"><span className="text-sm font-medium">คำโปรย</span><Input disabled={allLocked} maxLength={200} value={work.tagline} onChange={(event) => patch('tagline', event.target.value)} /></label><label className="block space-y-2"><span className="text-sm font-medium">เรื่องย่อ</span><textarea disabled={allLocked} className="min-h-40 w-full rounded-md border bg-background px-3 py-2 text-sm disabled:opacity-60" value={work.synopsis} onChange={(event) => patch('synopsis', event.target.value)} /></label><label className="block space-y-2"><span className="text-sm font-medium">แท็ก (คั่นด้วยจุลภาค)</span><Input disabled={allLocked} value={work.tags.join(', ')} onChange={(event) => patch('tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 10))} /></label><label className="block space-y-2"><span className="text-sm font-medium">สถานะเรื่อง</span><select disabled={allLocked} value={work.seriesStatus} onChange={(event) => patch('seriesStatus', event.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-60"><option value="ongoing">กำลังดำเนินเรื่อง</option><option value="completed">จบแล้ว</option><option value="hiatus">พักการอัปเดต</option></select></label></section>{work.origin === 'translated' && <section className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-6"><h2 className="font-semibold">ข้อมูลผลงานแปล</h2><div className="grid gap-4 sm:grid-cols-2"><Input disabled={coreLocked || allLocked} value={work.originalTitle ?? ''} onChange={(event) => patch('originalTitle', event.target.value)} placeholder="ชื่อต้นฉบับ" /><Input disabled={coreLocked || allLocked} value={work.originalLanguage ?? ''} onChange={(event) => patch('originalLanguage', event.target.value)} placeholder="ภาษาต้นฉบับ" /><Input disabled={coreLocked || allLocked} value={work.originalAuthor ?? ''} onChange={(event) => patch('originalAuthor', event.target.value)} placeholder="ผู้แต่ง" /><Input disabled={coreLocked || allLocked} value={work.translatorName ?? ''} onChange={(event) => patch('translatorName', event.target.value)} placeholder="ผู้แปล" /></div></section>}{error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}<div className="flex justify-end gap-3"><Link href={`/creator/works/${workId}`}><Button type="button" variant="outline">ยกเลิก</Button></Link><Button disabled={busy || allLocked}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{busy ? 'กำลังบันทึก…' : 'บันทึกการเปลี่ยนแปลง'}</Button></div></form>}
      </main>
    </RouteGuard>
  )
}
