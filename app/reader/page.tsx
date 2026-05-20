'use client'

import { useState, use, useCallback } from 'react'
import { notFound } from 'next/navigation'
import { useRouter } from 'next/navigation'
import ReaderToolbar from '@/components/reader/ReaderToolbar'
import ReaderContent from '@/components/reader/ReaderContent'
import CommentPanel, { type Comment, type CommentType } from '@/components/reader/CommentPanel'
import { MOCK_WORKS, MOCK_EPISODES } from '@/lib/mock-data'
import type { Work, Episode } from '@/lib/types'
import { useWallet } from '@/contexts/WalletContext'

interface Props {
  searchParams: Promise<{ bookId?: string; episodeId?: string }>
}

export default function ReaderPage({ searchParams }: Props) {
  const { bookId, episodeId } = use(searchParams)
  const work = MOCK_WORKS.find(w => w.id === bookId)
  const episodes: Episode[] = bookId ? (MOCK_EPISODES[bookId] ?? []) : []
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
        localStorage.setItem('rl_purchases', JSON.stringify([...next]))
        router.push(`/reader?bookId=${work.id}&episodeId=${nextEp.id}`)
      } else {
        setPurchaseError('เกิดข้อผิดพลาดในการหักเหรียญ')
      }
    } else {
      setPurchaseError(`เหรียญไม่เพียงพอ — ต้องการ ${nextEp.price} เหรียญ (มี ${balance} เหรียญ)`)
    }
  }, [autoAdvance, nextEp, router, work.id, purchased, balance, spend])

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

          <ReaderContent
            content={episode.content}
            fontSize={fontSize}
            showComments={showComments}
            commentCounts={commentCounts}
            activeParagraphIdx={activeParagraphIdx}
            onParagraphClick={handleParagraphClick}
            onBottomVisible={handleBottomVisible}
          />

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
