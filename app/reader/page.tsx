'use client'

import { startTransition, useState, use, useCallback, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { useRouter } from 'next/navigation'
import ReaderToolbar from '@/components/reader/ReaderToolbar'
import ReaderContent from '@/components/reader/ReaderContent'
import CommentPanel, { type Comment, type CommentType } from '@/components/reader/CommentPanel'
import { getDetailEpisodes, getDetailWork } from '@/lib/detail-catalog'
import type { Work, Episode } from '@/lib/types'
import { useWallet } from '@/contexts/WalletContext'
import { purchaseStorageKey, recordEpisodePurchase } from '@/lib/profile-repository'
import { useRole } from '@/contexts/RoleContext'

interface Props {
  searchParams: Promise<{ bookId?: string; episodeId?: string }>
}

export default function ReaderPage({ searchParams }: Props) {
  const { bookId, episodeId } = use(searchParams)
  const work = getDetailWork(bookId)
  const episodes: Episode[] = bookId ? getDetailEpisodes(bookId) : []
  const episode = episodes.find(e => e.id === episodeId)

  if (!work || !episode) notFound()

  return <ReaderClient key={episode.id} work={work} episode={episode} episodes={episodes} />
}

function ReaderClient({
  work,
  episode,
  episodes,
}: {
  work: Work
  episode: Episode
  episodes: Episode[]
}) {
  const router = useRouter()
  const { balance, spend } = useWallet()
  const { user } = useRole()
  const [fontSize, setFontSize] = useState(18)
  const [showComments, setShowComments] = useState(false)
  const [autoAdvance, setAutoAdvance] = useState(false)
  const [purchased, setPurchased] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('rl_purchases')
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set()
    } catch { return new Set() }
  })
  const [purchaseError, setPurchaseError] = useState('')

  useEffect(() => {
    if (!user) return
    try {
      const stored = localStorage.getItem(purchaseStorageKey(user.id)) ?? localStorage.getItem('rl_purchases')
      startTransition(() => setPurchased(stored ? new Set(JSON.parse(stored) as string[]) : new Set()))
    } catch {
      startTransition(() => setPurchased(new Set()))
    }
  }, [user])

  // comment state
  const [commentStore, setCommentStore] = useState<Record<number, Comment[]>>({})
  const [activeParagraphIdx, setActiveParagraphIdx] = useState<number | null>(null)
  const [activeParagraphText, setActiveParagraphText] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)

  const currentIdx = episodes.findIndex(e => e.id === episode.id)
  const prevEp = episodes[currentIdx - 1]
  const nextEp = episodes[currentIdx + 1]

  const handleBottomVisible = useCallback(() => {
    if (!autoAdvance || !nextEp) return
    if (nextEp.price === 0 || purchased.has(nextEp.id)) {
      router.push(`/reader?bookId=${work.id}&episodeId=${nextEp.id}`)
    } else if (balance >= nextEp.price) {
      const ok = spend(nextEp.price)
      if (ok) {
        const next = new Set([...purchased, nextEp.id])
        setPurchased(next)
        if (user) recordEpisodePurchase(user.id, nextEp.id)
        router.push(`/reader?bookId=${work.id}&episodeId=${nextEp.id}`)
      } else {
        setPurchaseError('เกิดข้อผิดพลาดในการหักเหรียญ')
      }
    } else {
      setPurchaseError(`เหรียญไม่เพียงพอ — ต้องการ ${nextEp.price} เหรียญ (มี ${balance} เหรียญ)`)
    }
  }, [autoAdvance, nextEp, router, work.id, purchased, balance, spend, user])

  function handleParagraphClick(idx: number, text: string) {
    setActiveParagraphIdx(idx)
    setActiveParagraphText(text)
    setPanelOpen(true)
  }

  const currentUser = 'คุณ'

  function handleAddComment(text: string, type: CommentType = 'normal') {
    if (activeParagraphIdx === null) return
    const idx = activeParagraphIdx
    setCommentStore(prev => ({
      ...prev,
      [idx]: [...(prev[idx] ?? []), { id: crypto.randomUUID(), author: currentUser, text, type, likes: 0, replies: [] }],
    }))
  }

  function handleAddReply(commentId: string, text: string) {
    if (activeParagraphIdx === null) return
    const idx = activeParagraphIdx
    setCommentStore(prev => ({
      ...prev,
      [idx]: (prev[idx] ?? []).map(c =>
        c.id === commentId
          ? { ...c, replies: [...c.replies, { id: crypto.randomUUID(), author: currentUser, text }] }
          : c
      ),
    }))
  }

  function handleToggleComments() {
    const next = !showComments
    setShowComments(next)
    if (!next) {
      setPanelOpen(false)
      setActiveParagraphIdx(null)
    }
  }

  const commentCounts: Record<number, number> = Object.fromEntries(
    Object.entries(commentStore).map(([k, v]) => [Number(k), v.length + v.reduce((s, c) => s + c.replies.length, 0)])
  )

  return (
    <div className="min-h-screen bg-background">
      <ReaderToolbar
        workId={work.id}
        workTitle={work.title}
        episodeTitle={episode.title}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        showComments={showComments}
        onToggleComments={handleToggleComments}
        autoAdvance={autoAdvance}
        onToggleAutoAdvance={() => setAutoAdvance(v => !v)}
      />

      <main className="container mx-auto px-4 py-10">
        <article className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-8 text-primary">{episode.title}</h2>

          {showComments && (
            <p className="text-xs text-muted-foreground text-center mb-6">
              กดที่บรรทัดใดก็ได้เพื่อแสดงความคิดเห็น
            </p>
          )}

          {episode.type === 'image' ? (
            <MangaReader title={work.title} episode={episode} onBottomVisible={handleBottomVisible} />
          ) : episode.type === 'audio' ? (
            <AudioReader title={work.title} episode={episode} onFinished={handleBottomVisible} />
          ) : (
            <ReaderContent
              content={episode.content}
              fontSize={fontSize}
              showComments={showComments}
              commentCounts={commentCounts}
              activeParagraphIdx={activeParagraphIdx}
              onParagraphClick={handleParagraphClick}
              onBottomVisible={handleBottomVisible}
            />
          )}

          <div className="flex justify-between mt-12 pt-6 border-t">
            {prevEp ? (
              <a href={`/reader?bookId=${work.id}&episodeId=${prevEp.id}`} className="text-sm text-primary hover:underline">
                ← {prevEp.title}
              </a>
            ) : <span />}
            {nextEp ? (
              <a href={`/reader?bookId=${work.id}&episodeId=${nextEp.id}`} className="text-sm text-primary hover:underline">
                {nextEp.title} →
              </a>
            ) : <span />}
          </div>
        </article>
      </main>

      {/* Comment slide panel */}
      <CommentPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        paragraphText={activeParagraphText}
        comments={activeParagraphIdx !== null ? (commentStore[activeParagraphIdx] ?? []) : []}
        onAddComment={handleAddComment}
        onAddReply={handleAddReply}
      />

      {/* Coin error bar */}
      {purchaseError && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-destructive text-destructive-foreground px-4 py-3 flex items-center justify-between text-sm shadow-lg">
          <span>{purchaseError}</span>
          <button
            type="button"
            onClick={() => setPurchaseError('')}
            className="ml-4 px-3 py-1 rounded-md bg-destructive-foreground/20 hover:bg-destructive-foreground/30 transition-colors text-xs font-medium"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

function MangaReader({ title, episode, onBottomVisible }: { title: string; episode: Episode; onBottomVisible: () => void }) {
  useEffect(() => {
    const marker = document.querySelector('[data-manga-end]')
    if (!marker) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) onBottomVisible() }, { threshold: 0.8 })
    observer.observe(marker)
    return () => observer.disconnect()
  }, [onBottomVisible])

  return <div className="mx-auto max-w-2xl overflow-hidden rounded-xl bg-[#171522] shadow-2xl">
    {Array.from({ length: 9 }, (_, index) => (
      <section
        key={index}
        className="relative flex min-h-[52vh] items-end overflow-hidden border-b border-white/10 p-7 text-white"
        style={{ background: `linear-gradient(${135 + index * 11}deg,hsl(${225 + index * 19} 38% ${18 + index % 3 * 7}%),hsl(${335 - index * 9} 48% ${28 + index % 2 * 8}%))` }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_24%,rgba(255,255,255,.34),transparent_24%),linear-gradient(to_top,rgba(0,0,0,.68),transparent_65%)]" />
        <div className="relative max-w-md rounded-2xl bg-black/35 p-4 backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-[.2em] opacity-70">{title} · PANEL {index + 1}</p>
          <p className="mt-2 text-lg font-bold leading-relaxed">{index === 0 ? episode.title : index % 2 ? 'เงาที่ปรากฏตรงหน้ากำลังเปลี่ยนเรื่องราวทั้งหมด…' : 'การเดินทางครั้งใหม่เพิ่งเริ่มต้นเท่านั้น'}</p>
        </div>
      </section>
    ))}
    <div data-manga-end className="p-8 text-center text-sm text-white/60">จบ {episode.title}</div>
  </div>
}

function AudioReader({ title, episode, onFinished }: { title: string; episode: Episode; onFinished: () => void }) {
  const duration = 12 * 60 + (episode.episodeNum % 8) * 60
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => setProgress((value) => {
      if (value >= duration) { window.clearInterval(timer); setPlaying(false); onFinished(); return duration }
      return value + 1
    }), 1000)
    return () => window.clearInterval(timer)
  }, [duration, onFinished, playing])

  const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
  return <div className="space-y-7">
    <section className="rounded-3xl bg-[linear-gradient(135deg,#2e2945,#783f58)] p-7 text-white shadow-xl sm:p-10">
      <p className="text-xs uppercase tracking-[.18em] text-white/60">Now listening</p><h3 className="mt-2 text-2xl font-black">{title}</h3><p className="mt-1 text-white/70">{episode.title}</p>
      <button onClick={() => setPlaying((value) => !value)} className="mx-auto mt-9 grid h-20 w-20 place-items-center rounded-full bg-white text-2xl font-black text-[#cc4452] shadow-lg" aria-label={playing ? 'หยุดชั่วคราว' : 'เล่น'}>{playing ? 'Ⅱ' : '▶'}</button>
      <input className="mt-9 w-full accent-[#ff9aac]" type="range" min={0} max={duration} value={progress} onChange={(event) => setProgress(Number(event.target.value))}/><div className="flex justify-between text-xs text-white/60"><span>{clock(progress)}</span><span>{clock(duration)}</span></div>
    </section>
    <section className="rounded-2xl border bg-white p-6"><h3 className="font-bold text-primary">Transcript</h3>{episode.content.split('\n').filter(Boolean).map((paragraph, index)=><p key={index} className="mt-4 leading-8 text-muted-foreground">{paragraph}</p>)}</section>
  </div>
}
