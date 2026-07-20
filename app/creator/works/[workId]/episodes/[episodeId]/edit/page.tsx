'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { Bold, ChevronLeft, Italic, List, LoaderCircle, Save } from 'lucide-react'
import RouteGuard from '@/components/layout/RouteGuard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CreatorEpisodeRecord, CreatorWorkDetail } from '@/lib/creator-studio-types'

export default function EditEpisodePage() {
  const { workId, episodeId } = useParams<{ workId: string; episodeId: string }>()
  const router = useRouter()
  const [episode, setEpisode] = useState<CreatorEpisodeRecord | null>(null)
  const [work, setWork] = useState<CreatorWorkDetail | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/creator/works/${workId}`, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error((await response.json().catch(() => ({})) as { error?: string }).error || 'โหลดตอนไม่สำเร็จ'); return response.json() as Promise<{ work: CreatorWorkDetail }> })
      .then((data) => { const found = data.work.episodes.find((item) => item.id === episodeId); if (!found) throw new Error('ไม่พบตอนที่ต้องการแก้ไข'); setWork(data.work); setEpisode(found) })
      .catch((cause) => { if (cause instanceof Error && cause.name !== 'AbortError') setError(cause.message) })
    return () => controller.abort()
  }, [episodeId, workId])

  function patch<K extends keyof CreatorEpisodeRecord>(key: K, value: CreatorEpisodeRecord[K]) { setEpisode((current) => current ? { ...current, [key]: value } : current) }

  async function save(event: FormEvent) {
    event.preventDefault(); if (!episode) return
    setBusy(true); setError('')
    const response = await fetch(`/api/creator/episodes/${episode.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: episode.title, content: episode.content, priceCoins: episode.priceCoins, status: episode.status, scheduledAt: episode.status === 'scheduled' ? episode.scheduledAt : null, durationSeconds: episode.durationSeconds }) })
    if (!response.ok) { const data = await response.json().catch(() => ({})) as { error?: string }; setError(data.error || 'บันทึกตอนไม่สำเร็จ'); setBusy(false); return }
    router.push(`/creator/works/${workId}`); router.refresh()
  }

  return (
    <RouteGuard allowedRoles={['creator', 'admin']}>
      {!episode ? <main className="flex min-h-[60vh] items-center justify-center px-4 text-sm text-muted-foreground">{error || <><LoaderCircle className="mr-2 size-5 animate-spin" />กำลังโหลดตอน…</>}</main> : <form onSubmit={save} className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b bg-background px-4 py-3"><Link href={`/creator/works/${workId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ChevronLeft className="size-4" />กลับ</Link><Input required maxLength={200} value={episode.title} onChange={(event) => patch('title', event.target.value)} className="min-w-52 flex-1" /><label className="flex items-center gap-2 text-sm">ราคา<Input type="number" min={0} max={10000} value={episode.priceCoins} onChange={(event) => patch('priceCoins', Number(event.target.value))} className="w-24" /></label><select value={episode.status} onChange={(event) => patch('status', event.target.value as CreatorEpisodeRecord['status'])} className="h-9 rounded-md border bg-background px-3 text-sm"><option value="draft">ฉบับร่าง</option>{work?.capabilities.canPublishEpisode && <><option value="published">เผยแพร่</option><option value="scheduled">ตั้งเวลา</option><option value="hidden">ซ่อน</option></>}</select><Button disabled={busy}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}{busy ? 'กำลังบันทึก…' : 'บันทึก'}</Button></header>
        {work && !work.capabilities.canPublishEpisode && <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">บันทึกได้เฉพาะฉบับร่างจนกว่าผู้ดูแลจะอนุมัติเรื่อง</div>}
        {episode.status === 'scheduled' && <div className="border-b bg-amber-50 px-4 py-3"><label className="mx-auto flex max-w-3xl items-center gap-3 text-sm">เวลาเผยแพร่<Input type="datetime-local" required value={episode.scheduledAt?.slice(0, 16) ?? ''} onChange={(event) => patch('scheduledAt', event.target.value ? new Date(event.target.value).toISOString() : null)} className="max-w-64" /></label></div>}
        {episode.type === 'text' && <><div className="flex gap-1 border-b bg-muted/20 px-4 py-2">{[{ icon: Bold, label: 'ตัวหนา' }, { icon: Italic, label: 'ตัวเอียง' }, { icon: List, label: 'รายการ' }].map(({ icon: Icon, label }) => <button type="button" key={label} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title={label}><Icon className="size-4" /></button>)}</div><main className="container mx-auto flex-1 max-w-3xl px-4 py-6"><textarea className="min-h-[60vh] w-full resize-y border-none bg-transparent text-base leading-loose outline-none" value={episode.content ?? ''} onChange={(event) => patch('content', event.target.value)} placeholder="เนื้อหาตอน…" /></main></>}
        {episode.type !== 'text' && <main className="container mx-auto max-w-3xl flex-1 px-4 py-10"><div className="rounded-2xl border bg-muted/20 p-8 text-center"><h1 className="font-semibold">ไฟล์{episode.type === 'image' ? 'ภาพ' : 'เสียง'}ของตอนนี้</h1><p className="mt-2 text-sm text-muted-foreground">แก้ไขชื่อ ราคา สถานะ และเวลาเผยแพร่ได้จากแถบด้านบน การแทนที่ไฟล์จะเพิ่มในขั้นตอนจัดการ media</p></div></main>}
        {error && <div role="alert" className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-lg bg-destructive px-4 py-3 text-sm text-destructive-foreground shadow-lg">{error}</div>}
      </form>}
    </RouteGuard>
  )
}
