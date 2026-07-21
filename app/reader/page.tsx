'use client'

import { startTransition, use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { notFound, useRouter } from 'next/navigation'
import { Coins, LoaderCircle, Lock } from 'lucide-react'
import ReaderToolbar from '@/components/reader/ReaderToolbar'
import ReaderContent from '@/components/reader/ReaderContent'
import CommentPanel from '@/components/reader/CommentPanel'
import ReaderCommentBadge from '@/components/reader/ReaderCommentBadge'
import ReaderChapterEnd from '@/components/reader/ReaderChapterEnd'
import ReaderFloatingActions from '@/components/reader/ReaderFloatingActions'
import { browserSupportsSpeech, ReaderSpeechPlayer, ReaderSpeechPurchaseDialog, SPEECH_AUTOPLAY_KEY, SPEECH_PRICE_COINS } from '@/components/reader/ReaderSpeech'
import ServerCreatorReader from '@/components/reader/ServerCreatorReader'
import { getDetailEpisodes, getDetailWork, type DetailCatalogItem } from '@/lib/detail-catalog'
import type { Episode, Work } from '@/lib/types'
import { useWallet } from '@/contexts/WalletContext'
import { useRole } from '@/contexts/RoleContext'
import { useProfile } from '@/contexts/ProfileContext'
import { purchaseStorageKey, recordEpisodePurchase } from '@/lib/profile-repository'
import {
  DEFAULT_READER_SETTINGS,
  localReaderRepository,
  type ReaderCommentMap,
  type ReaderReportReason,
  type ReaderSettings,
} from '@/lib/reader-repository'
import { getReaderThemeStyle } from '@/lib/reader-theme'
import { submitReaderContentReport } from '@/lib/reader-content-report'

interface Props {
  searchParams: Promise<{ bookId?: string; episodeId?: string }>
}

function readerHref(workId: string, episodeId: string) {
  return `/reader?bookId=${encodeURIComponent(workId)}&episodeId=${encodeURIComponent(episodeId)}`
}

export default function ReaderPage({ searchParams }: Props) {
  const { bookId, episodeId } = use(searchParams)
  const work = getDetailWork(bookId)
  const episodes = bookId ? getDetailEpisodes(bookId) : []
  const episode = episodes.find((item) => item.id === episodeId)

  if (!work && bookId && episodeId) return <ServerCreatorReader key={`${bookId}:${episodeId}`} workId={bookId} episodeId={episodeId} />
  if (!work || !episode) notFound()
  return <ReaderClient key={`${work.id}:${episode.id}`} work={work} episode={episode} episodes={episodes} />
}

function ReaderClient({ work, episode, episodes }: { work: DetailCatalogItem; episode: Episode; episodes: Episode[] }) {
  const router = useRouter()
  const { balance, spend } = useWallet()
  const { user, isLoggedIn, isLoading } = useRole()
  const { profile } = useProfile()
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_READER_SETTINGS)
  const [readerReady, setReaderReady] = useState(false)
  const [purchased, setPurchased] = useState<Set<string>>(new Set())
  const [commentsEnabled, setCommentsEnabled] = useState(false)
  const [commentStore, setCommentStore] = useState<ReaderCommentMap>({})
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null)
  const [activeSlotLabel, setActiveSlotLabel] = useState('')
  const [commentPanelOpen, setCommentPanelOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [speechSupported, setSpeechSupported] = useState(false)
  const [speechEntitled, setSpeechEntitled] = useState(false)
  const [speechPanelOpen, setSpeechPanelOpen] = useState(false)
  const [speechPurchaseOpen, setSpeechPurchaseOpen] = useState(false)
  const [speechPurchaseBusy, setSpeechPurchaseBusy] = useState(false)
  const [speechPurchaseError, setSpeechPurchaseError] = useState('')
  const [speechAutoPlay, setSpeechAutoPlay] = useState(false)
  const restoredProgress = useRef(false)
  const navigatingRef = useRef(false)

  const scopeId = user?.id ?? 'guest'
  const currentIdx = episodes.findIndex((item) => item.id === episode.id)
  const nextEpisode = episodes[currentIdx + 1]
  const unlocked = episode.price === 0 || purchased.has(episode.id)
  const accessReady = readerReady && !isLoading

  useEffect(() => {
    if (isLoading) return
    let nextPurchased = new Set<string>()
    if (user) {
      try {
        const stored = localStorage.getItem(purchaseStorageKey(user.id)) ?? localStorage.getItem('rl_purchases')
        nextPurchased = stored ? new Set(JSON.parse(stored) as string[]) : new Set()
      } catch {
        nextPurchased = new Set()
      }
    }
    const nextSettings = localReaderRepository.getSettings(scopeId)
    const nextComments = localReaderRepository.getEpisodeComments(work.id, episode.id)
    const nextSpeechEntitled = Boolean(user) && (user?.id === work.authorId || localReaderRepository.hasSpeechEntitlement(scopeId, work.id))
    startTransition(() => {
      setPurchased(nextPurchased)
      setSettings(nextSettings)
      setCommentStore(nextComments)
      setSpeechEntitled(nextSpeechEntitled)
      setReaderReady(true)
    })
  }, [episode.id, isLoading, scopeId, user, work.authorId, work.id])

  useEffect(() => {
    startTransition(() => setSpeechSupported(browserSupportsSpeech()))
  }, [])

  useEffect(() => {
    if (!accessReady || !unlocked || episode.type !== 'text' || !speechEntitled) return
    try {
      const pending = JSON.parse(sessionStorage.getItem(SPEECH_AUTOPLAY_KEY) ?? 'null') as { workId?: string; episodeId?: string } | null
      if (pending?.workId !== work.id || pending.episodeId !== episode.id) return
      sessionStorage.removeItem(SPEECH_AUTOPLAY_KEY)
      startTransition(() => {
        setSpeechPanelOpen(true)
        setSpeechAutoPlay(true)
      })
    } catch {
      sessionStorage.removeItem(SPEECH_AUTOPLAY_KEY)
    }
  }, [accessReady, episode.id, episode.type, speechEntitled, unlocked, work.id])

  useEffect(() => {
    if (!readerReady) return
    localReaderRepository.saveSettings(scopeId, settings)
  }, [readerReady, scopeId, settings])

  useEffect(() => {
    if (!accessReady || !unlocked || restoredProgress.current) return
    restoredProgress.current = true
    const progress = localReaderRepository.getProgress(scopeId, work.id)
    if (!progress || progress.episodeId !== episode.id || progress.scrollRatio < 0.02) return
    const timer = window.setTimeout(() => {
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      window.scrollTo({ top: maxScroll * progress.scrollRatio, behavior: 'auto' })
    }, 120)
    return () => window.clearTimeout(timer)
  }, [accessReady, episode.id, scopeId, unlocked, work.id])

  useEffect(() => {
    if (!accessReady || !unlocked) return
    let timer: ReturnType<typeof setTimeout> | null = null
    function saveProgress() {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      localReaderRepository.saveProgress(scopeId, {
        workId: work.id,
        episodeId: episode.id,
        scrollRatio: window.scrollY / maxScroll,
        updatedAt: new Date().toISOString(),
      })
    }
    function handleScroll() {
      if (timer) return
      timer = setTimeout(() => { timer = null; saveProgress() }, 350)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('pagehide', saveProgress)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('pagehide', saveProgress)
      if (timer) clearTimeout(timer)
      saveProgress()
    }
  }, [accessReady, episode.id, scopeId, unlocked, work.id])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 2800)
    return () => window.clearTimeout(timer)
  }, [notice])

  const commentCounts = useMemo(() => Object.fromEntries(
    Object.entries(commentStore).map(([slotId, comments]) => [
      slotId,
      comments.reduce((total, comment) => total + 1 + comment.replies.length, 0),
    ]),
  ), [commentStore])

  const commitComments = useCallback((update: (current: ReaderCommentMap) => ReaderCommentMap) => {
    setCommentStore((current) => {
      const next = update(current)
      localReaderRepository.saveEpisodeComments(work.id, episode.id, next)
      return next
    })
  }, [episode.id, work.id])

  function openCommentSlot(slotId: string, label: string) {
    setActiveSlotId(slotId)
    setActiveSlotLabel(label)
    setCommentPanelOpen(true)
  }

  function requireLogin() {
    router.push(`/login?next=${encodeURIComponent(readerHref(work.id, episode.id))}`)
  }

  function addComment(text: string) {
    if (!user || !activeSlotId) return requireLogin()
    const slotId = activeSlotId
    commitComments((current) => ({
      ...current,
      [slotId]: [...(current[slotId] ?? []), {
        id: crypto.randomUUID(), userId: user.id, authorName: profile.displayName,
        avatarUrl: profile.avatarUrl, isAuthor: user.id === work.authorId,
        text, createdAt: new Date().toISOString(), likes: [], replies: [],
      }],
    }))
  }

  function addReply(commentId: string, text: string, replyToName?: string) {
    if (!user || !activeSlotId) return requireLogin()
    const slotId = activeSlotId
    commitComments((current) => ({
      ...current,
      [slotId]: (current[slotId] ?? []).map((comment) => comment.id === commentId ? {
        ...comment,
        replies: [...comment.replies, {
          id: crypto.randomUUID(), userId: user.id, authorName: profile.displayName,
          avatarUrl: profile.avatarUrl, isAuthor: user.id === work.authorId,
          text, createdAt: new Date().toISOString(), likes: [], replyToName: replyToName ?? comment.authorName,
        }],
      } : comment),
    }))
  }

  function toggleLike(commentId: string, replyId?: string) {
    if (!user || !activeSlotId) return requireLogin()
    const slotId = activeSlotId
    const toggle = (likes: string[]) => likes.includes(user.id) ? likes.filter((id) => id !== user.id) : [...likes, user.id]
    commitComments((current) => ({
      ...current,
      [slotId]: (current[slotId] ?? []).map((comment) => {
        if (comment.id !== commentId) return comment
        if (!replyId) return { ...comment, likes: toggle(comment.likes) }
        return { ...comment, replies: comment.replies.map((reply) => reply.id === replyId ? { ...reply, likes: toggle(reply.likes) } : reply) }
      }),
    }))
  }

  function saveReport(commentId: string, reason: ReaderReportReason, replyId?: string) {
    if (!user) return requireLogin()
    localReaderRepository.saveReport({
      id: crypto.randomUUID(), reporterId: user.id, workId: work.id, episodeId: episode.id,
      commentId: replyId ?? commentId, reason, status: 'local-pending', createdAt: new Date().toISOString(),
    })
  }

  async function submitContentReport(text: string) {
    if (!user) {
      requireLogin()
      return false
    }
    await submitReaderContentReport({
      workId: work.id,
      workTitle: work.title,
      episodeId: episode.id,
      episodeTitle: episode.title,
      slotLabel: activeSlotLabel || episode.title,
    }, text)
    return true
  }

  function buyEpisode() {
    if (!user) return requireLogin()
    if (balance < episode.price) {
      setNotice(`เหรียญไม่เพียงพอ ต้องการ ${episode.price} เหรียญ`)
      return
    }
    if (!spend(episode.price)) {
      setNotice('ไม่สามารถหักเหรียญได้ กรุณาลองใหม่')
      return
    }
    recordEpisodePurchase(user.id, episode.id, {
      workId: work.id,
      workTitle: work.title,
      episodeTitle: episode.title,
      coinsSpent: episode.price,
    })
    setPurchased((current) => new Set(current).add(episode.id))
    setNotice(`ปลดล็อก ${episode.title} แล้ว`)
  }

  function toggleSpeech() {
    if (!speechSupported) {
      setNotice('เบราว์เซอร์นี้ไม่รองรับการอ่านออกเสียง')
      return
    }
    if (!user) return requireLogin()
    if (!speechEntitled) {
      setSpeechPurchaseError('')
      setSpeechPurchaseOpen(true)
      return
    }
    setSpeechPanelOpen((current) => !current)
  }

  function buySpeech() {
    if (!user) return requireLogin()
    if (balance < SPEECH_PRICE_COINS) {
      setSpeechPurchaseError('เหรียญไม่เพียงพอ กรุณาเติมเหรียญ')
      return
    }
    setSpeechPurchaseBusy(true)
    if (!spend(SPEECH_PRICE_COINS)) {
      setSpeechPurchaseError('ไม่สามารถหักเหรียญได้ กรุณาลองใหม่')
      setSpeechPurchaseBusy(false)
      return
    }
    localReaderRepository.grantSpeechEntitlement(user.id, work.id)
    setSpeechEntitled(true)
    setSpeechPurchaseOpen(false)
    setSpeechPanelOpen(true)
    setSpeechPurchaseBusy(false)
    setNotice('ปลดล็อกอ่านออกเสียงทุกตอนของเรื่องนี้แล้ว')
  }

  const goNext = useCallback(() => {
    if (!nextEpisode || navigatingRef.current) return
    navigatingRef.current = true
    router.push(readerHref(work.id, nextEpisode.id))
  }, [nextEpisode, router, work.id])

  const handleSpeechFinished = useCallback(() => {
    if (!settings.continuous || !nextEpisode) return
    const canReadNext = nextEpisode.price === 0 || purchased.has(nextEpisode.id)
    if (!canReadNext) {
      setNotice('ตอนถัดไปยังไม่ได้ปลดล็อก เสียงอ่านจึงหยุดที่ตอนนี้')
      return
    }
    sessionStorage.setItem(SPEECH_AUTOPLAY_KEY, JSON.stringify({ workId: work.id, episodeId: nextEpisode.id }))
    goNext()
  }, [goNext, nextEpisode, purchased, settings.continuous, work.id])

  const handleBottomVisible = useCallback(() => {
    if (settings.continuous) goNext()
  }, [goNext, settings.continuous])

  const closeCommentPanel = useCallback(() => {
    setCommentPanelOpen(false)
    setActiveSlotId(null)
  }, [])

  function toggleCommentMode() {
    if (episode.type !== 'text') {
      if (commentPanelOpen) closeCommentPanel()
      else openCommentSlot('title', episode.title)
      return
    }

    setCommentsEnabled((current) => {
      const next = !current
      if (!next) {
        setCommentPanelOpen(false)
        setActiveSlotId(null)
      }
      return next
    })
  }

  async function shareReader() {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: `${episode.title} · ${work.title}`, url })
      else {
        await navigator.clipboard.writeText(url)
        setNotice('คัดลอกลิงก์ตอนนี้แล้ว')
      }
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') setNotice('ไม่สามารถแชร์ลิงก์ได้')
    }
  }

  const themeStyle = getReaderThemeStyle(settings.theme, work.coverGradient)

  return (
    <div className="min-h-screen bg-[var(--reader-page)] pb-20 text-[var(--reader-ink)] transition-colors duration-200 md:pb-0" style={themeStyle} data-reader-theme={settings.theme}>
      <nav aria-label="breadcrumb" className="mx-auto flex max-w-[822px] flex-wrap items-center gap-1.5 px-4 pb-2 pt-4 text-xs font-semibold text-[var(--reader-muted)]">
        <Link href="/" className="hover:text-[var(--reader-accent)]">หน้าหลัก</Link><span aria-hidden>›</span>
        <Link href={`/detail?bookId=${encodeURIComponent(work.id)}`} className="max-w-52 truncate hover:text-[var(--reader-accent)]">{work.title}</Link><span aria-hidden>›</span>
        <span className="max-w-52 truncate font-bold text-[var(--reader-ink)]" aria-current="page">{episode.title}</span>
      </nav>

      <article className="mx-auto min-h-[calc(100vh-96px)] max-w-[822px] bg-[var(--reader-paper)] shadow-sm transition-colors duration-200">
        <ReaderToolbar work={work} episode={episode} episodes={episodes} settings={settings} onSettingsChange={setSettings} />

        {!accessReady ? (
          <div className="grid min-h-[60vh] place-items-center" role="status">
            <span className="inline-flex items-center gap-2 text-sm text-[var(--reader-muted)]"><LoaderCircle className="h-5 w-5 animate-spin" /> กำลังเตรียมหน้าอ่าน</span>
          </div>
        ) : (
          <div className="flex min-h-[calc(100vh-140px)] flex-col px-5 pb-16 pt-8 sm:px-10 sm:pb-20">
            <button
              type="button"
              disabled={!commentsEnabled || !unlocked}
              onClick={() => commentsEnabled && unlocked && openCommentSlot('title', episode.title)}
              className={`reader-comment-title mx-auto inline-flex max-w-full items-center px-1 text-center text-xl font-bold ${commentsEnabled && unlocked ? 'reader-comment-target' : 'cursor-default'} ${activeSlotId === 'title' ? 'reader-comment-target-active' : ''}`}
            >
              <span className="truncate">{episode.title}</span>
              {commentsEnabled && (commentCounts.title ?? 0) > 0 && <ReaderCommentBadge count={commentCounts.title} />}
            </button>
            <Link href={`/profile/${encodeURIComponent(work.authorId)}`} className="mx-auto mb-7 mt-1 text-xs font-bold text-[var(--reader-accent)] hover:underline">{work.authorName}</Link>

            {unlocked ? (
              <>
                <div className="flex-1">
                  {episode.type === 'image' ? (
                    <MangaReader title={work.title} episode={episode} onBottomVisible={handleBottomVisible} />
                  ) : episode.type === 'audio' ? (
                    <AudioReader title={work.title} episode={episode} onFinished={handleBottomVisible} />
                  ) : (
                    <ReaderContent
                      content={episode.content}
                      fontSize={settings.fontSize}
                      commentsEnabled={commentsEnabled}
                      commentCounts={commentCounts}
                      activeSlotId={activeSlotId}
                      onParagraphClick={openCommentSlot}
                      onBottomVisible={handleBottomVisible}
                    />
                  )}
                </div>

                <ReaderChapterEnd
                  nextEpisode={nextEpisode}
                  continuous={settings.continuous}
                  onNext={goNext}
                  onContinuousChange={(continuous) => setSettings((current) => ({ ...current, continuous }))}
                />
              </>
            ) : (
              <Paywall work={work} episode={episode} settings={settings} isLoggedIn={isLoggedIn} userId={user?.id ?? null} balance={balance} onLogin={requireLogin} onBuy={buyEpisode} />
            )}
          </div>
        )}
      </article>

      {accessReady && unlocked && <ReaderFloatingActions commentsActive={episode.type === 'text' ? commentsEnabled : commentPanelOpen} onToggleComments={toggleCommentMode} onShare={shareReader} speech={work.type === 'novel' && episode.type === 'text' ? { active: speechPanelOpen, locked: !speechEntitled, disabled: !speechSupported, onClick: toggleSpeech } : undefined} />}

      {episode.type === 'text' && <ReaderSpeechPlayer open={speechPanelOpen && unlocked && speechEntitled} title={episode.title} content={episode.content} rate={settings.speechRate} autoPlay={speechAutoPlay} onAutoPlayConsumed={() => setSpeechAutoPlay(false)} onRateChange={(speechRate) => setSettings((current) => ({ ...current, speechRate }))} onClose={() => setSpeechPanelOpen(false)} onFinished={handleSpeechFinished} onError={setNotice} />}

      <ReaderSpeechPurchaseDialog open={speechPurchaseOpen} workTitle={work.title} balance={balance} userId={user?.id ?? null} busy={speechPurchaseBusy} error={speechPurchaseError} onOpenChange={setSpeechPurchaseOpen} onPurchase={buySpeech} />

      <CommentPanel
        key={activeSlotLabel || 'work-comments'}
        open={commentPanelOpen}
        onClose={closeCommentPanel}
        slotLabel={activeSlotLabel}
        comments={activeSlotId ? (commentStore[activeSlotId] ?? []) : []}
        isLoggedIn={isLoggedIn}
        viewerId={user?.id ?? null}
        onLogin={requireLogin}
        onAddComment={addComment}
        onAddReply={addReply}
        onToggleLike={toggleLike}
        onReport={saveReport}
        onSubmitContentReport={submitContentReport}
      />

      {notice && <div role="status" aria-live="polite" className="fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-foreground px-4 py-3 text-sm text-background shadow-xl md:bottom-6">{notice}</div>}
    </div>
  )
}

function Paywall({
  work, episode, settings, isLoggedIn, userId, balance, onLogin, onBuy,
}: {
  work: Work; episode: Episode; settings: ReaderSettings; isLoggedIn: boolean; userId: string | null; balance: number; onLogin: () => void; onBuy: () => void
}) {
  const canAfford = balance >= episode.price
  return (
    <div className="flex flex-1 flex-col">
      {episode.type === 'text' && <ReaderContent content={episode.content} fontSize={settings.fontSize} commentsEnabled={false} preview />}
      <section className="mx-auto mt-6 flex w-full max-w-md flex-1 flex-col items-center justify-center rounded-2xl border border-[var(--reader-border)] bg-[var(--reader-hover)] px-6 py-10 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary"><Lock className="h-7 w-7" /></span>
        <h2 className="mt-4 text-lg font-bold">ปลดล็อกตอนนี้เพื่ออ่านต่อ</h2>
        <p className="mt-1 text-sm text-[var(--reader-muted)]">{work.title} · {episode.title}</p>
        <p className="mt-5 inline-flex items-center gap-2 text-3xl font-black text-[var(--reader-accent)]"><Coins className="h-6 w-6" />{episode.price}<span className="text-sm font-semibold text-[var(--reader-muted)]">เหรียญ</span></p>
        {isLoggedIn ? (
          <>
            <p className={`mt-3 text-xs ${canAfford ? 'text-[var(--reader-muted)]' : 'font-bold text-destructive'}`}>ยอดคงเหลือ {balance.toLocaleString()} เหรียญ</p>
            <button type="button" onClick={onBuy} disabled={!canAfford} className="mt-5 w-full max-w-60 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40">ยืนยันซื้อ {episode.price} เหรียญ</button>
            {!canAfford && userId && <Link href={`/profile/${encodeURIComponent(userId)}?tab=wallet`} className="mt-3 text-xs font-bold text-[var(--reader-accent)] underline">ไปที่กระเป๋าเงิน</Link>}
          </>
        ) : (
          <button type="button" onClick={onLogin} className="mt-5 w-full max-w-60 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground">เข้าสู่ระบบเพื่อปลดล็อก</button>
        )}
      </section>
    </div>
  )
}

function MangaReader({ title, episode, onBottomVisible }: { title: string; episode: Episode; onBottomVisible: () => void }) {
  const markerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!markerRef.current) return
    let fired = false
    let timer: ReturnType<typeof setTimeout> | null = null
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || fired) return
      fired = true
      timer = setTimeout(onBottomVisible, 900)
    }, { threshold: 0.8 })
    observer.observe(markerRef.current)
    return () => {
      observer.disconnect()
      if (timer) clearTimeout(timer)
    }
  }, [onBottomVisible])
  return <div className="mx-auto max-w-2xl overflow-hidden rounded-xl bg-[#171522] shadow-2xl">
    {Array.from({ length: 9 }, (_, index) => (
      <section key={index} className="relative flex min-h-[52vh] items-end overflow-hidden border-b border-white/10 p-7 text-white" style={{ background: `linear-gradient(${135 + index * 11}deg,hsl(${225 + index * 19} 38% ${18 + index % 3 * 7}%),hsl(${335 - index * 9} 48% ${28 + index % 2 * 8}%))` }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_24%,rgba(255,255,255,.34),transparent_24%),linear-gradient(to_top,rgba(0,0,0,.68),transparent_65%)]" />
        <div className="relative max-w-md rounded-2xl bg-black/35 p-4 backdrop-blur-sm"><p className="text-xs font-bold uppercase tracking-[.2em] opacity-70">{title} · PANEL {index + 1}</p><p className="mt-2 text-lg font-bold leading-relaxed">{index === 0 ? episode.title : index % 2 ? 'เงาที่ปรากฏตรงหน้ากำลังเปลี่ยนเรื่องราวทั้งหมด…' : 'การเดินทางครั้งใหม่เพิ่งเริ่มต้นเท่านั้น'}</p></div>
      </section>
    ))}
    <div ref={markerRef} className="p-8 text-center text-sm text-white/60">จบ {episode.title}</div>
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
    <section className="rounded-3xl bg-[linear-gradient(135deg,#2e2945,#783f58)] p-7 text-white shadow-xl sm:p-10"><p className="text-xs uppercase tracking-[.18em] text-white/60">Now listening</p><h3 className="mt-2 text-2xl font-black">{title}</h3><p className="mt-1 text-white/70">{episode.title}</p><button type="button" onClick={() => setPlaying((value) => !value)} className="mx-auto mt-9 grid h-20 w-20 place-items-center rounded-full bg-white text-2xl font-black text-[#cc4452] shadow-lg" aria-label={playing ? 'หยุดชั่วคราว' : 'เล่น'}>{playing ? 'Ⅱ' : '▶'}</button><input aria-label="ตำแหน่งเสียง" className="mt-9 w-full accent-[#ff9aac]" type="range" min={0} max={duration} value={progress} onChange={(event) => setProgress(Number(event.target.value))}/><div className="flex justify-between text-xs text-white/60"><span>{clock(progress)}</span><span>{clock(duration)}</span></div></section>
    <section className="rounded-2xl border border-[var(--reader-border)] bg-[var(--reader-paper)] p-6"><h3 className="font-bold text-[var(--reader-accent)]">Transcript</h3>{episode.content.split('\n').filter(Boolean).map((paragraph, index) => <p key={index} className="mt-4 leading-8 text-[var(--reader-muted)]">{paragraph}</p>)}</section>
  </div>
}
