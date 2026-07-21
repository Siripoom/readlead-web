'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, Coins, LoaderCircle, Lock } from 'lucide-react'
import CommentPanel from '@/components/reader/CommentPanel'
import ReaderChapterEnd from '@/components/reader/ReaderChapterEnd'
import ReaderCommentBadge from '@/components/reader/ReaderCommentBadge'
import ReaderContent from '@/components/reader/ReaderContent'
import ReaderFloatingActions from '@/components/reader/ReaderFloatingActions'
import { browserSupportsSpeech, ReaderSpeechPlayer, ReaderSpeechPurchaseDialog, SPEECH_AUTOPLAY_KEY } from '@/components/reader/ReaderSpeech'
import ReaderToolbar from '@/components/reader/ReaderToolbar'
import { useRole } from '@/contexts/RoleContext'
import { useWallet } from '@/contexts/WalletContext'
import {
  DEFAULT_READER_SETTINGS,
  localReaderRepository,
  type ReaderComment,
  type ReaderSettings,
} from '@/lib/reader-repository'
import { getReaderThemeStyle } from '@/lib/reader-theme'
import { submitReaderContentReport } from '@/lib/reader-content-report'
import { mapPublicCreatorWork, type PublicCreatorWork } from '@/lib/server-creator-catalog'
import type { Episode } from '@/lib/types'

interface SecureEpisode {
  id: string
  workId: string
  episodeNumber: number
  title: string
  type: 'text' | 'image' | 'audio'
  status: string
  priceCoins: number
  content: string | null
  publishedAt: string | null
  durationSeconds: number | null
  assets: Array<{ id: string; kind: string; contentType: string; sortOrder: number }>
}

function readerHref(workId: string, episodeId: string) {
  return `/reader?bookId=${encodeURIComponent(workId)}&episodeId=${encodeURIComponent(episodeId)}`
}

function AutoNextMarker({ label, onVisible }: { label: string; onVisible: () => void }) {
  const markerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!markerRef.current) return
    let fired = false
    let timer: ReturnType<typeof setTimeout> | null = null
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || fired) return
      fired = true
      timer = setTimeout(onVisible, 900)
    }, { threshold: 0.8 })
    observer.observe(markerRef.current)
    return () => {
      observer.disconnect()
      if (timer) clearTimeout(timer)
    }
  }, [onVisible])

  return <div ref={markerRef} className="py-8 text-center text-sm text-[var(--reader-muted)]">จบ {label}</div>
}

export default function ServerCreatorReader({ workId, episodeId }: { workId: string; episodeId: string }) {
  const router = useRouter()
  const { isLoggedIn, isLoading, user } = useRole()
  const { balance, refresh: refreshWallet } = useWallet()
  const [rawWork, setRawWork] = useState<PublicCreatorWork | null>(null)
  const [secureEpisode, setSecureEpisode] = useState<SecureEpisode | null>(null)
  const [accessStatus, setAccessStatus] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_READER_SETTINGS)
  const [settingsScope, setSettingsScope] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [commentsEnabled, setCommentsEnabled] = useState(false)
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null)
  const [activeSlotLabel, setActiveSlotLabel] = useState('')
  const [commentPanelOpen, setCommentPanelOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [speechSupported, setSpeechSupported] = useState(false)
  const [speechAccess, setSpeechAccess] = useState<{ eligible: boolean; entitled: boolean; priceCoins: number } | null>(null)
  const [speechPanelOpen, setSpeechPanelOpen] = useState(false)
  const [speechPurchaseOpen, setSpeechPurchaseOpen] = useState(false)
  const [speechPurchaseBusy, setSpeechPurchaseBusy] = useState(false)
  const [speechPurchaseError, setSpeechPurchaseError] = useState('')
  const [speechAutoPlay, setSpeechAutoPlay] = useState(false)
  const navigatingRef = useRef(false)
  const scopeId = user?.id ?? 'guest'

  const loadWork = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch(`/api/catalog/works/${encodeURIComponent(workId)}`, {
      cache: 'no-store',
      signal,
    })
    if (!response.ok) throw new Error('ไม่พบผลงาน')
    const data = await response.json() as { work: PublicCreatorWork }
    setRawWork(data.work)
  }, [workId])

  useEffect(() => {
    const controller = new AbortController()
    startTransition(() => {
      void loadWork(controller.signal).catch((cause: unknown) => {
        if (cause instanceof Error && cause.name !== 'AbortError') setError(cause.message)
      })
    })
    return () => controller.abort()
  }, [loadWork])

  useEffect(() => {
    startTransition(() => setSpeechSupported(browserSupportsSpeech()))
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    startTransition(() => {
      setSpeechAccess(null)
      setSpeechPanelOpen(false)
    })
    fetch(`/api/works/${encodeURIComponent(workId)}/speech-access`, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => ({})) as { eligible?: boolean; entitled?: boolean; priceCoins?: number; error?: string }
        if (!response.ok) throw new Error(data.error || 'ตรวจสอบสิทธิ์อ่านออกเสียงไม่สำเร็จ')
        startTransition(() => setSpeechAccess({ eligible: Boolean(data.eligible), entitled: Boolean(data.entitled), priceCoins: data.priceCoins ?? 300 }))
      })
      .catch((cause: unknown) => {
        if (!(cause instanceof DOMException && cause.name === 'AbortError')) setNotice(cause instanceof Error ? cause.message : 'ตรวจสอบสิทธิ์อ่านออกเสียงไม่สำเร็จ')
      })
    return () => controller.abort()
  }, [isLoggedIn, workId])

  const loadEpisode = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch(`/api/episodes/${encodeURIComponent(episodeId)}/purchase`, {
      cache: 'no-store',
      signal,
    })
    setAccessStatus(response.status)
    if (!response.ok) {
      const data = await response.json().catch(() => ({})) as { error?: string }
      setSecureEpisode(null)
      setNotice(data.error || 'เปิดตอนไม่สำเร็จ')
      sessionStorage.removeItem(SPEECH_AUTOPLAY_KEY)
      return
    }
    const data = await response.json() as { episode: SecureEpisode }
    setSecureEpisode(data.episode)
    setNotice('')
  }, [episodeId])

  useEffect(() => {
    const controller = new AbortController()
    navigatingRef.current = false
    startTransition(() => {
      setAccessStatus(null)
      setSecureEpisode(null)
      setCommentsEnabled(false)
      setActiveSlotId(null)
      setActiveSlotLabel('')
      setCommentPanelOpen(false)
    })
    startTransition(() => {
      void loadEpisode(controller.signal).catch((cause: unknown) => {
        if (cause instanceof Error && cause.name !== 'AbortError') {
          setAccessStatus(0)
          setNotice('เชื่อมต่อระบบอ่านไม่สำเร็จ')
        }
      })
    })
    return () => controller.abort()
  }, [isLoggedIn, loadEpisode])

  useEffect(() => {
    if (isLoading) return
    const storedSettings = localReaderRepository.getSettings(scopeId)
    startTransition(() => {
      setSettings(storedSettings)
      setSettingsScope(scopeId)
    })
  }, [isLoading, scopeId])

  useEffect(() => {
    if (settingsScope !== scopeId) return
    localReaderRepository.saveSettings(scopeId, settings)
  }, [scopeId, settings, settingsScope])

  useEffect(() => {
    if (!notice || !secureEpisode) return
    const timer = window.setTimeout(() => setNotice(''), 2800)
    return () => window.clearTimeout(timer)
  }, [notice, secureEpisode])

  const mapped = useMemo(() => rawWork ? mapPublicCreatorWork(rawWork) : null, [rawWork])
  const episode = useMemo<Episode | null>(() => secureEpisode ? {
    id: secureEpisode.id,
    workId: secureEpisode.workId,
    title: secureEpisode.title,
    episodeNum: secureEpisode.episodeNumber,
    price: secureEpisode.priceCoins,
    status: 'published',
    type: secureEpisode.type,
    content: secureEpisode.content ?? '',
    wordCount: secureEpisode.content?.length ?? 0,
    publishedAt: secureEpisode.publishedAt,
  } : null, [secureEpisode])
  const toolbarEpisodes = mapped?.episodes ?? []
  const currentIndex = toolbarEpisodes.findIndex((item) => item.id === episodeId)
  const nextEpisode = currentIndex >= 0 ? toolbarEpisodes[currentIndex + 1] : undefined

  useEffect(() => {
    if (!secureEpisode || secureEpisode.type !== 'text' || !speechAccess?.entitled) return
    try {
      const pending = JSON.parse(sessionStorage.getItem(SPEECH_AUTOPLAY_KEY) ?? 'null') as { workId?: string; episodeId?: string } | null
      if (pending?.workId !== workId || pending.episodeId !== episodeId) return
      sessionStorage.removeItem(SPEECH_AUTOPLAY_KEY)
      startTransition(() => {
        setSpeechPanelOpen(true)
        setSpeechAutoPlay(true)
      })
    } catch {
      sessionStorage.removeItem(SPEECH_AUTOPLAY_KEY)
    }
  }, [episodeId, secureEpisode, speechAccess?.entitled, workId])

  const serverComments = useMemo<ReaderComment[]>(() => {
    if (!rawWork || !mapped) return []
    return rawWork.comments.map((comment) => ({
      id: comment.id,
      userId: comment.user.id,
      authorName: comment.user.name,
      isAuthor: comment.user.id === mapped.work.authorId,
      text: comment.body,
      createdAt: comment.createdAt,
      likes: [],
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        userId: reply.user.id,
        authorName: reply.user.name,
        isAuthor: reply.user.id === mapped.work.authorId,
        text: reply.body,
        createdAt: reply.createdAt,
        likes: [],
      })),
    }))
  }, [mapped, rawWork])
  const commentCount = Math.max(
    rawWork?.commentCount ?? 0,
    serverComments.reduce((count, comment) => count + 1 + comment.replies.length, 0),
  )

  const goNext = useCallback(() => {
    if (!nextEpisode || navigatingRef.current) return
    navigatingRef.current = true
    router.push(readerHref(workId, nextEpisode.id))
  }, [nextEpisode, router, workId])

  const handleBottomVisible = useCallback(() => {
    if (settings.continuous) goNext()
  }, [goNext, settings.continuous])

  const handleSpeechFinished = useCallback(() => {
    if (!settings.continuous || !nextEpisode) return
    void fetch(`/api/episodes/${encodeURIComponent(nextEpisode.id)}/purchase`, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          setNotice('ตอนถัดไปยังไม่ได้ปลดล็อก เสียงอ่านจึงหยุดที่ตอนนี้')
          return
        }
        sessionStorage.setItem(SPEECH_AUTOPLAY_KEY, JSON.stringify({ workId, episodeId: nextEpisode.id }))
        goNext()
      })
      .catch(() => setNotice('ตรวจสอบสิทธิ์ตอนถัดไปไม่สำเร็จ เสียงอ่านจึงหยุดที่ตอนนี้'))
  }, [goNext, nextEpisode, settings.continuous, workId])

  const requireLogin = useCallback(() => {
    router.push(`/login?next=${encodeURIComponent(readerHref(workId, episodeId))}`)
  }, [episodeId, router, workId])

  const closeCommentPanel = useCallback(() => {
    setCommentPanelOpen(false)
    setActiveSlotId(null)
  }, [])

  function openCommentSlot(slotId: string, label: string) {
    setActiveSlotId(slotId)
    setActiveSlotLabel(label)
    setCommentPanelOpen(true)
  }

  function toggleCommentMode() {
    if (episode?.type !== 'text') {
      if (commentPanelOpen) closeCommentPanel()
      else {
        setActiveSlotLabel(`ความคิดเห็นของเรื่อง ${mapped?.work.title ?? ''}`)
        setCommentPanelOpen(true)
      }
      return
    }

    setCommentsEnabled((current) => {
      const next = !current
      if (!next) closeCommentPanel()
      return next
    })
  }

  async function shareReader() {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: `${episode?.title ?? ''} · ${mapped?.work.title ?? ''}`, url })
      else {
        await navigator.clipboard.writeText(url)
        setNotice('คัดลอกลิงก์ตอนนี้แล้ว')
      }
    } catch (cause) {
      if ((cause as DOMException).name !== 'AbortError') setNotice('ไม่สามารถแชร์ลิงก์ได้')
    }
  }

  async function purchase() {
    if (!isLoggedIn) return requireLogin()
    setBusy(true)
    try {
      const response = await fetch(`/api/episodes/${encodeURIComponent(episodeId)}/purchase`, { method: 'POST' })
      const data = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) setNotice(data.error || 'ซื้อเนื้อหาไม่สำเร็จ')
      else await loadEpisode()
    } catch {
      setNotice('เชื่อมต่อระบบซื้อไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setBusy(false)
    }
  }

  function toggleSpeech() {
    if (!speechSupported) {
      setNotice('เบราว์เซอร์นี้ไม่รองรับการอ่านออกเสียง')
      return
    }
    if (!isLoggedIn) return requireLogin()
    if (!speechAccess?.entitled) {
      setSpeechPurchaseError('')
      setSpeechPurchaseOpen(true)
      return
    }
    setSpeechPanelOpen((current) => !current)
  }

  async function purchaseSpeech() {
    if (!isLoggedIn) return requireLogin()
    setSpeechPurchaseBusy(true)
    setSpeechPurchaseError('')
    try {
      const response = await fetch(`/api/works/${encodeURIComponent(workId)}/speech-access`, { method: 'POST' })
      const data = await response.json().catch(() => ({})) as { coinBalance?: number; error?: string }
      if (!response.ok) {
        setSpeechPurchaseError(data.error || 'ซื้อฟีเจอร์อ่านออกเสียงไม่สำเร็จ')
        return
      }
      setSpeechAccess((current) => ({ eligible: true, entitled: true, priceCoins: current?.priceCoins ?? 300 }))
      setSpeechPurchaseOpen(false)
      setSpeechPanelOpen(true)
      setNotice('ปลดล็อกอ่านออกเสียงทุกตอนของเรื่องนี้แล้ว')
      await refreshWallet()
    } catch {
      setSpeechPurchaseError('เชื่อมต่อระบบซื้อไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setSpeechPurchaseBusy(false)
    }
  }

  async function sendComment(text: string) {
    if (!user) {
      requireLogin()
      return false
    }
    try {
      const response = await fetch('/api/interactions/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workId, body: text }),
      })
      const data = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) {
        setNotice(data.error || 'ส่งความคิดเห็นไม่สำเร็จ')
        return false
      }
      await loadWork()
      setNotice('ส่งความคิดเห็นแล้ว')
      return true
    } catch {
      setNotice('เชื่อมต่อระบบความคิดเห็นไม่สำเร็จ กรุณาลองใหม่')
      return false
    }
  }

  async function submitContentReport(text: string) {
    if (!user || !mapped || !episode) {
      requireLogin()
      return false
    }
    await submitReaderContentReport({
      workId,
      workTitle: mapped.work.title,
      episodeId,
      episodeTitle: episode.title,
      slotLabel: activeSlotLabel || `ความคิดเห็นของเรื่อง ${mapped.work.title}`,
    }, text)
    return true
  }

  if (error) return (
    <main className="flex min-h-[65vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <BookOpen className="size-10 text-muted-foreground" />
      <h1 className="text-xl font-bold">{error}</h1>
      <Link href={`/detail?bookId=${encodeURIComponent(workId)}`} className="text-primary underline">กลับหน้ารายละเอียด</Link>
    </main>
  )

  if (!mapped || accessStatus === null || settingsScope !== scopeId) return (
    <main className="flex min-h-[65vh] items-center justify-center gap-2 text-sm text-muted-foreground" role="status">
      <LoaderCircle className="size-5 animate-spin" />กำลังเตรียมหน้าอ่าน…
    </main>
  )

  const themeStyle = getReaderThemeStyle(settings.theme, mapped.work.coverGradient)

  return (
    <div className="min-h-screen bg-[var(--reader-page)] pb-20 text-[var(--reader-ink)] transition-colors duration-200 md:pb-0" style={themeStyle} data-reader-theme={settings.theme}>
      <nav aria-label="breadcrumb" className="mx-auto flex max-w-[822px] flex-wrap items-center gap-1.5 px-4 pb-2 pt-4 text-xs font-semibold text-[var(--reader-muted)]">
        <Link href="/" className="hover:text-[var(--reader-accent)]">หน้าหลัก</Link><span aria-hidden>›</span>
        <Link href={`/detail?bookId=${encodeURIComponent(workId)}`} className="max-w-52 truncate hover:text-[var(--reader-accent)]">{mapped.work.title}</Link>
        {episode && <><span aria-hidden>›</span><span className="max-w-52 truncate font-bold text-[var(--reader-ink)]" aria-current="page">{episode.title}</span></>}
      </nav>

      <article className="mx-auto min-h-[calc(100vh-96px)] max-w-[822px] bg-[var(--reader-paper)] shadow-sm transition-colors duration-200">
        {episode && <ReaderToolbar work={mapped.work} episode={episode} episodes={toolbarEpisodes} settings={settings} onSettingsChange={setSettings} />}

        {secureEpisode && episode ? (
          <div className="flex min-h-[calc(100vh-140px)] flex-col px-5 pb-16 pt-8 sm:px-10 sm:pb-20">
            <button
              type="button"
              disabled={episode.type !== 'text' || !commentsEnabled}
              onClick={() => openCommentSlot('title', episode.title)}
              className={`reader-comment-title mx-auto inline-flex max-w-full items-center px-1 text-center text-xl font-bold ${episode.type === 'text' && commentsEnabled ? 'reader-comment-target' : 'cursor-default'} ${activeSlotId === 'title' ? 'reader-comment-target-active' : ''}`}
            >
              <span className="truncate">{episode.title}</span>
              {episode.type === 'text' && commentsEnabled && commentCount > 0 && <ReaderCommentBadge count={commentCount} />}
            </button>
            <Link href={`/profile/${mapped.work.authorId}`} className="mx-auto mb-7 mt-1 block text-center text-xs font-bold text-[var(--reader-accent)] hover:underline">{mapped.work.authorName}</Link>

            <div className="flex-1">
              {episode.type === 'text' ? (
                <ReaderContent
                  content={episode.content}
                  fontSize={settings.fontSize}
                  commentsEnabled={commentsEnabled}
                  sharedCommentCount={commentCount}
                  activeSlotId={activeSlotId}
                  onParagraphClick={openCommentSlot}
                  onBottomVisible={handleBottomVisible}
                />
              ) : episode.type === 'image' ? (
                <div className="mx-auto max-w-2xl overflow-hidden bg-[#171522] shadow-2xl sm:rounded-xl">
                  {secureEpisode.assets.map((asset, assetIndex) => asset.contentType.startsWith('image/') && (
                    <Image unoptimized width={1200} height={1600} key={asset.id} src={`/api/episode-assets/${asset.id}`} alt={`หน้า ${assetIndex + 1}`} className="block h-auto w-full" />
                  ))}
                  <AutoNextMarker label={episode.title} onVisible={handleBottomVisible} />
                </div>
              ) : (
                <section className="mx-auto max-w-xl rounded-2xl border border-[var(--reader-border)] bg-[var(--reader-hover)] p-6">
                  <audio
                    controls
                    preload="metadata"
                    className="w-full"
                    onEnded={handleBottomVisible}
                    src={secureEpisode.assets.find((asset) => asset.contentType.startsWith('audio/')) ? `/api/episode-assets/${secureEpisode.assets.find((asset) => asset.contentType.startsWith('audio/'))!.id}` : undefined}
                  />
                </section>
              )}
            </div>

            <ReaderChapterEnd
              nextEpisode={nextEpisode}
              continuous={settings.continuous}
              onNext={goNext}
              onContinuousChange={(continuous) => setSettings((current) => ({ ...current, continuous }))}
            />
          </div>
        ) : (
          <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary"><Lock className="size-7" /></span>
            <h1 className="mt-4 text-xl font-bold">ปลดล็อกตอนนี้เพื่ออ่านต่อ</h1>
            <p className="mt-2 text-sm text-muted-foreground">{notice}</p>
            <p className="mt-5 inline-flex items-center gap-2 text-3xl font-bold text-primary"><Coins className="size-6" />{rawWork?.episodes.find((item) => item.id === episodeId)?.priceCoins ?? 0} เหรียญ</p>
            <button type="button" disabled={busy} onClick={() => void purchase()} className="mt-5 w-full rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-50">{busy ? 'กำลังดำเนินการ…' : isLoggedIn ? 'ยืนยันซื้อด้วยยอดบนเซิร์ฟเวอร์' : 'เข้าสู่ระบบเพื่อปลดล็อก'}</button>
          </section>
        )}
      </article>

      {secureEpisode && <ReaderFloatingActions commentsActive={episode?.type === 'text' ? commentsEnabled : commentPanelOpen} onToggleComments={toggleCommentMode} onShare={shareReader} speech={rawWork?.type === 'novel' && episode?.type === 'text' && speechAccess?.eligible ? { active: speechPanelOpen, locked: !speechAccess.entitled, disabled: !speechSupported, onClick: toggleSpeech } : undefined} />}

      {episode?.type === 'text' && <ReaderSpeechPlayer open={speechPanelOpen && Boolean(speechAccess?.entitled)} title={episode.title} content={episode.content} rate={settings.speechRate} autoPlay={speechAutoPlay} onAutoPlayConsumed={() => setSpeechAutoPlay(false)} onRateChange={(speechRate) => setSettings((current) => ({ ...current, speechRate }))} onClose={() => setSpeechPanelOpen(false)} onFinished={handleSpeechFinished} onError={setNotice} />}

      <ReaderSpeechPurchaseDialog open={speechPurchaseOpen} workTitle={mapped.work.title} balance={balance} userId={user?.id ?? null} busy={speechPurchaseBusy} error={speechPurchaseError} onOpenChange={setSpeechPurchaseOpen} onPurchase={() => void purchaseSpeech()} />

      <CommentPanel
        key={activeSlotLabel || 'work-comments'}
        open={commentPanelOpen}
        onClose={closeCommentPanel}
        slotLabel={activeSlotLabel || `ความคิดเห็นของเรื่อง ${mapped.work.title}`}
        comments={serverComments}
        totalCount={commentCount}
        isLoggedIn={isLoggedIn}
        viewerId={user?.id ?? null}
        onLogin={requireLogin}
        onAddComment={sendComment}
        onSubmitContentReport={submitContentReport}
        maxCommentLength={3000}
      />

      {notice && secureEpisode && <div role="status" aria-live="polite" className="fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-foreground px-4 py-3 text-sm text-background shadow-xl md:bottom-6">{notice}</div>}
    </div>
  )
}
