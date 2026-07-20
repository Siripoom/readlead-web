'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { ArrowRight, BookOpen, Coins, LoaderCircle, Lock, MessageSquare, Send } from 'lucide-react'
import ReaderContent from '@/components/reader/ReaderContent'
import ReaderToolbar from '@/components/reader/ReaderToolbar'
import { useRole } from '@/contexts/RoleContext'
import { DEFAULT_READER_SETTINGS, type ReaderSettings } from '@/lib/reader-repository'
import { mapPublicCreatorWork, type PublicCreatorWork } from '@/lib/server-creator-catalog'
import type { Episode } from '@/lib/types'

interface SecureEpisode { id: string; workId: string; episodeNumber: number; title: string; type: 'text' | 'image' | 'audio'; status: string; priceCoins: number; content: string | null; publishedAt: string | null; durationSeconds: number | null; assets: Array<{ id: string; kind: string; contentType: string; sortOrder: number }> }

export default function ServerCreatorReader({ workId, episodeId }: { workId: string; episodeId: string }) {
  const router = useRouter()
  const { isLoggedIn, user } = useRole()
  const [rawWork, setRawWork] = useState<PublicCreatorWork | null>(null)
  const [secureEpisode, setSecureEpisode] = useState<SecureEpisode | null>(null)
  const [accessStatus, setAccessStatus] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_READER_SETTINGS)
  const [busy, setBusy] = useState(false)
  const [comment, setComment] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/catalog/works/${encodeURIComponent(workId)}`, { cache: 'no-store', signal: controller.signal }).then(async (response) => { if (!response.ok) throw new Error('ไม่พบผลงาน'); return response.json() as Promise<{ work: PublicCreatorWork }> }).then((data) => setRawWork(data.work)).catch((cause) => { if (cause instanceof Error && cause.name !== 'AbortError') setError(cause.message) })
    return () => controller.abort()
  }, [workId])

  async function loadEpisode() {
    const response = await fetch(`/api/episodes/${encodeURIComponent(episodeId)}/purchase`, { cache: 'no-store' })
    setAccessStatus(response.status)
    if (!response.ok) { const data = await response.json().catch(() => ({})) as { error?: string }; setNotice(data.error || 'เปิดตอนไม่สำเร็จ'); return }
    const data = await response.json() as { episode: SecureEpisode }
    setSecureEpisode(data.episode); setNotice('')
  }

  useEffect(() => { const timer = window.setTimeout(() => { void loadEpisode() }, 0); return () => window.clearTimeout(timer) }, [episodeId, isLoggedIn]) // eslint-disable-line react-hooks/exhaustive-deps

  const mapped = useMemo(() => rawWork ? mapPublicCreatorWork(rawWork) : null, [rawWork])
  const episode = useMemo<Episode | null>(() => secureEpisode ? { id: secureEpisode.id, workId: secureEpisode.workId, title: secureEpisode.title, episodeNum: secureEpisode.episodeNumber, price: secureEpisode.priceCoins, status: 'published', type: secureEpisode.type, content: secureEpisode.content ?? '', wordCount: secureEpisode.content?.length ?? 0, publishedAt: secureEpisode.publishedAt } : null, [secureEpisode])
  const toolbarEpisodes = mapped?.episodes ?? []
  const index = toolbarEpisodes.findIndex((item) => item.id === episodeId)
  const next = index >= 0 ? toolbarEpisodes[index + 1] : undefined

  async function purchase() {
    if (!isLoggedIn) { router.push(`/login?next=${encodeURIComponent(`/reader?bookId=${workId}&episodeId=${episodeId}`)}`); return }
    setBusy(true)
    const response = await fetch(`/api/episodes/${encodeURIComponent(episodeId)}/purchase`, { method: 'POST' })
    const data = await response.json().catch(() => ({})) as { error?: string }
    if (!response.ok) setNotice(data.error || 'ซื้อเนื้อหาไม่สำเร็จ')
    else await loadEpisode()
    setBusy(false)
  }

  async function sendComment() {
    if (!comment.trim()) return
    if (!user) { router.push('/login'); return }
    const response = await fetch('/api/interactions/comment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workId, body: comment.trim() }) })
    const data = await response.json().catch(() => ({})) as { error?: string }
    if (!response.ok) setNotice(data.error || 'ส่งความคิดเห็นไม่สำเร็จ')
    else { setComment(''); setNotice('ส่งความคิดเห็นแล้ว') }
  }

  if (error) return <main className="flex min-h-[65vh] flex-col items-center justify-center gap-4 px-4 text-center"><BookOpen className="size-10 text-muted-foreground" /><h1 className="text-xl font-bold">{error}</h1><Link href={`/detail?bookId=${encodeURIComponent(workId)}`} className="text-primary underline">กลับหน้ารายละเอียด</Link></main>
  if (!mapped || accessStatus === null) return <main className="flex min-h-[65vh] items-center justify-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-5 animate-spin" />กำลังเตรียมหน้าอ่าน…</main>

  const theme = { '--reader-page': '#f4f5f8', '--reader-paper': '#fff', '--reader-ink': '#29242b', '--reader-muted': '#85818a', '--reader-border': '#e7e8ee', '--reader-hover': '#faf5f6', '--reader-highlight': '#fdeff1', '--reader-accent': '#cc4452', '--reader-cover': mapped.work.coverGradient } as CSSProperties
  return <div className="min-h-screen bg-[var(--reader-page)] pb-16 text-[var(--reader-ink)]" style={theme}>
    <nav className="mx-auto flex max-w-[822px] gap-2 px-4 py-4 text-xs text-[var(--reader-muted)]"><Link href="/">หน้าหลัก</Link><span>›</span><Link href={`/detail?bookId=${encodeURIComponent(workId)}`}>{mapped.work.title}</Link>{episode && <><span>›</span><b>{episode.title}</b></>}</nav>
    <article className="mx-auto min-h-[calc(100vh-80px)] max-w-[822px] bg-[var(--reader-paper)] shadow-sm">
      {episode && <ReaderToolbar work={mapped.work} episode={episode} episodes={toolbarEpisodes} settings={settings} onSettingsChange={setSettings} />}
      {secureEpisode && episode ? <div className="px-5 py-10 sm:px-10"><h1 className="text-center text-xl font-bold">{episode.title}</h1><Link href={`/profile/${mapped.work.authorId}`} className="mx-auto mt-2 block text-center text-xs font-semibold text-[var(--reader-accent)]">{mapped.work.authorName}</Link>
        <div className="mt-9">{episode.type === 'text' ? <ReaderContent content={episode.content} fontSize={settings.fontSize} commentsEnabled={false} /> : episode.type === 'image' ? <div className="mx-auto max-w-2xl">{secureEpisode.assets.map((asset, assetIndex) => asset.contentType.startsWith('image/') && <Image unoptimized width={1200} height={1600} key={asset.id} src={`/api/episode-assets/${asset.id}`} alt={`หน้า ${assetIndex + 1}`} className="block h-auto w-full" />)}</div> : <div className="mx-auto max-w-xl rounded-2xl border bg-muted/20 p-6"><audio controls preload="metadata" className="w-full" src={secureEpisode.assets.find((asset) => asset.contentType.startsWith('audio/')) ? `/api/episode-assets/${secureEpisode.assets.find((asset) => asset.contentType.startsWith('audio/'))!.id}` : undefined} /></div>}</div>
        <div className="mt-12 border-t pt-6"><label className="text-sm font-semibold" htmlFor="server-reader-comment"><MessageSquare className="mr-2 inline size-4" />ความคิดเห็นเกี่ยวกับตอนนี้</label><div className="mt-2 flex gap-2"><input id="server-reader-comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={3000} placeholder="เขียนความคิดเห็น…" className="h-10 flex-1 rounded-lg border px-3 text-sm" /><button type="button" onClick={() => void sendComment()} className="rounded-lg bg-primary px-4 text-primary-foreground"><Send className="size-4" /></button></div></div>
        {next ? <div className="mt-8 text-center"><Link href={`/reader?bookId=${encodeURIComponent(workId)}&episodeId=${encodeURIComponent(next.id)}`} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">อ่านตอนถัดไป <ArrowRight className="size-4" /></Link></div> : <p className="mt-10 text-center text-sm text-muted-foreground">อ่านถึงตอนล่าสุดแล้ว</p>}
      </div> : <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center"><span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary"><Lock className="size-7" /></span><h1 className="mt-4 text-xl font-bold">ปลดล็อกตอนนี้เพื่ออ่านต่อ</h1><p className="mt-2 text-sm text-muted-foreground">{notice}</p><p className="mt-5 inline-flex items-center gap-2 text-3xl font-bold text-primary"><Coins className="size-6" />{rawWork?.episodes.find((item) => item.id === episodeId)?.priceCoins ?? 0} เหรียญ</p><button type="button" disabled={busy} onClick={() => void purchase()} className="mt-5 w-full rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50">{busy ? 'กำลังดำเนินการ…' : isLoggedIn ? 'ยืนยันซื้อด้วยยอดบนเซิร์ฟเวอร์' : 'เข้าสู่ระบบเพื่อปลดล็อก'}</button></section>}
    </article>
    {notice && secureEpisode && <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-lg bg-foreground px-4 py-3 text-sm text-background">{notice}</div>}
  </div>
}
