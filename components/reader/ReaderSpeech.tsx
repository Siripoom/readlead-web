'use client'

import Link from 'next/link'
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Coins, Pause, Play, RotateCcw, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { isRichEpisodeContent, sanitizeEpisodeHtml } from '@/lib/creator-rich-text'

export const SPEECH_PRICE_COINS = 300
export const SPEECH_AUTOPLAY_KEY = 'rl_reader_speech_autoplay_v1'
export const SPEECH_RATES = [0.75, 1, 1.25, 1.5] as const

export function browserSupportsSpeech() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

function splitLongText(text: string, maxLength = 220) {
  const chunks: string[] = []
  let remaining = text.replace(/\s+/g, ' ').trim()
  while (remaining.length > maxLength) {
    const windowText = remaining.slice(0, maxLength + 1)
    const candidates = [windowText.lastIndexOf(' '), windowText.lastIndexOf('。'), windowText.lastIndexOf('!'), windowText.lastIndexOf('?'), windowText.lastIndexOf('ฯ')]
    const splitAt = Math.max(...candidates)
    const end = splitAt >= Math.floor(maxLength * 0.55) ? splitAt + 1 : maxLength
    chunks.push(remaining.slice(0, end).trim())
    remaining = remaining.slice(end).trim()
  }
  if (remaining) chunks.push(remaining)
  return chunks
}

function speechChunks(title: string, content: string) {
  let blocks: string[]
  if (isRichEpisodeContent(content)) {
    const documentNode = new DOMParser().parseFromString(sanitizeEpisodeHtml(content), 'text/html')
    blocks = [...documentNode.body.querySelectorAll<HTMLElement>('h2,p,blockquote,li')]
      .filter((element) => element.tagName !== 'BLOCKQUOTE' && element.tagName !== 'LI' || !element.querySelector(':scope > p, :scope > h2'))
      .map((element) => element.textContent?.replace(/\s+/g, ' ').trim() ?? '')
      .filter(Boolean)
  } else {
    blocks = content.split(/\n+/).map((line) => line.trim()).filter(Boolean)
  }
  return [title, ...blocks].flatMap((block) => splitLongText(block)).filter(Boolean)
}

type PlayerState = 'idle' | 'playing' | 'paused'

export function ReaderSpeechPlayer({
  open,
  title,
  content,
  rate,
  autoPlay = false,
  onRateChange,
  onClose,
  onFinished,
  onAutoPlayConsumed,
  onError,
}: {
  open: boolean
  title: string
  content: string
  rate: number
  autoPlay?: boolean
  onRateChange: (rate: number) => void
  onClose: () => void
  onFinished: () => void
  onAutoPlayConsumed?: () => void
  onError?: (message: string) => void
}) {
  const chunks = useMemo(() => speechChunks(title, content), [content, title])
  const [state, setState] = useState<PlayerState>('idle')
  const [currentIndex, setCurrentIndex] = useState(0)
  const indexRef = useRef(0)
  const generationRef = useRef(0)
  const stateRef = useRef<PlayerState>('idle')
  const mountedRef = useRef(true)
  const speakAtRef = useRef<(index: number, selectedRate: number, generation: number) => void>(() => undefined)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const speakAt = useCallback((index: number, selectedRate: number, generation: number) => {
    if (!browserSupportsSpeech() || generation !== generationRef.current) return
    if (index >= chunks.length) {
      indexRef.current = 0
      setCurrentIndex(0)
      setState('idle')
      onFinished()
      return
    }
    indexRef.current = index
    setCurrentIndex(index)
    const utterance = new SpeechSynthesisUtterance(chunks[index])
    const voices = window.speechSynthesis.getVoices()
    utterance.voice = voices.find((voice) => voice.lang.toLowerCase() === 'th-th')
      ?? voices.find((voice) => voice.lang.toLowerCase().startsWith('th'))
      ?? null
    utterance.lang = 'th-TH'
    utterance.rate = selectedRate
    utterance.onend = () => {
      if (mountedRef.current && generation === generationRef.current) speakAtRef.current(index + 1, selectedRate, generation)
    }
    utterance.onerror = (event) => {
      if (generation !== generationRef.current || event.error === 'canceled' || event.error === 'interrupted') return
      setState('idle')
      onError?.('ไม่สามารถเล่นเสียงอ่านได้ กรุณาลองใหม่')
    }
    window.speechSynthesis.speak(utterance)
  }, [chunks, onError, onFinished])

  useEffect(() => {
    speakAtRef.current = speakAt
  }, [speakAt])

  const stop = useCallback(() => {
    generationRef.current += 1
    if (browserSupportsSpeech()) window.speechSynthesis.cancel()
    indexRef.current = 0
    setCurrentIndex(0)
    setState('idle')
  }, [])

  const play = useCallback(() => {
    if (!browserSupportsSpeech()) {
      onError?.('เบราว์เซอร์นี้ไม่รองรับการอ่านออกเสียง')
      return
    }
    if (stateRef.current === 'paused' && window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setState('playing')
      return
    }
    generationRef.current += 1
    window.speechSynthesis.cancel()
    setState('playing')
    speakAt(indexRef.current, rate, generationRef.current)
  }, [onError, rate, speakAt])

  function pause() {
    if (!browserSupportsSpeech()) return
    window.speechSynthesis.pause()
    setState('paused')
  }

  function changeRate(nextRate: number) {
    onRateChange(nextRate)
    if (!browserSupportsSpeech() || stateRef.current === 'idle') return
    const shouldPlay = stateRef.current === 'playing'
    generationRef.current += 1
    window.speechSynthesis.cancel()
    if (shouldPlay) {
      setState('playing')
      speakAt(indexRef.current, nextRate, generationRef.current)
    } else {
      setState('paused')
    }
  }

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      generationRef.current += 1
      if (browserSupportsSpeech()) window.speechSynthesis.cancel()
    }
  }, [])

  useEffect(() => {
    if (!open) startTransition(stop)
  }, [open, stop])

  useEffect(() => {
    if (!open || !autoPlay) return
    play()
    onAutoPlayConsumed?.()
  }, [autoPlay, onAutoPlayConsumed, open, play])

  if (!open) return null

  return (
    <section aria-label="เครื่องเล่นอ่านออกเสียง" className="fixed right-16 top-1/2 z-40 w-[min(19rem,calc(100vw-5rem))] -translate-y-1/2 rounded-2xl border border-[var(--reader-border)] bg-[var(--reader-paper)] p-4 text-[var(--reader-ink)] shadow-2xl xl:left-[calc(50%+95px)] xl:right-auto">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="flex items-center gap-2 text-sm font-bold"><Volume2 className="size-4 text-[var(--reader-accent)]" />อ่านออกเสียง</p><p className="mt-1 truncate text-xs text-[var(--reader-muted)]">{title}</p></div>
        <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-xs text-[var(--reader-muted)] hover:bg-[var(--reader-hover)]" aria-label="ปิดเครื่องเล่นอ่านออกเสียง">ปิด</button>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button type="button" onClick={state === 'playing' ? pause : play} className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground" aria-label={state === 'playing' ? 'พักเสียงอ่าน' : 'เล่นเสียงอ่าน'}>
          {state === 'playing' ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
        </button>
        <button type="button" onClick={stop} className="grid size-9 place-items-center rounded-full border border-[var(--reader-border)] text-[var(--reader-muted)] hover:text-[var(--reader-accent)]" aria-label="หยุดและเริ่มใหม่"><RotateCcw className="size-4" /></button>
        <span className="ml-1 text-xs text-[var(--reader-muted)]">{chunks.length ? `ช่วง ${Math.min(currentIndex + 1, chunks.length)} / ${chunks.length}` : 'ไม่มีข้อความ'}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5" aria-label="ความเร็วเสียงอ่าน">
        {SPEECH_RATES.map((item) => <button key={item} type="button" onClick={() => changeRate(item)} aria-pressed={rate === item} className={`rounded-full px-2.5 py-1 text-xs font-bold ${rate === item ? 'bg-primary text-primary-foreground' : 'bg-[var(--reader-hover)] text-[var(--reader-muted)]'}`}>{item}×</button>)}
      </div>
    </section>
  )
}

export function ReaderSpeechPurchaseDialog({
  open,
  workTitle,
  balance,
  userId,
  busy,
  error,
  onOpenChange,
  onPurchase,
}: {
  open: boolean
  workTitle: string
  balance: number
  userId: string | null
  busy: boolean
  error?: string
  onOpenChange: (open: boolean) => void
  onPurchase: () => void
}) {
  const canAfford = balance >= SPEECH_PRICE_COINS
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle className="flex items-center gap-2 text-primary"><Volume2 className="size-5" />ปลดล็อกอ่านออกเสียง</DialogTitle><DialogDescription>ซื้อครั้งเดียว ใช้อ่านออกเสียงได้ทุกตอนปัจจุบันและตอนใหม่ของเรื่องนี้</DialogDescription></DialogHeader><div className="space-y-3 py-2"><p className="font-semibold">{workTitle}</p><div className="space-y-2 rounded-xl border bg-accent/30 p-4 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">ราคา</span><strong className="inline-flex items-center gap-1 text-primary"><Coins className="size-4" />{SPEECH_PRICE_COINS} เหรียญ</strong></div><div className="flex justify-between"><span className="text-muted-foreground">ยอดเหรียญของคุณ</span><strong className={canAfford ? '' : 'text-destructive'}>{balance.toLocaleString('th-TH')} เหรียญ</strong></div></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}{!canAfford && userId && <Link href={`/profile/${encodeURIComponent(userId)}?tab=wallet`} className="inline-block text-sm font-bold text-primary underline">ไปที่กระเป๋าเหรียญ</Link>}</div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>ยกเลิก</Button><Button onClick={onPurchase} disabled={!canAfford || busy}>{busy ? 'กำลังซื้อ…' : `ซื้อ ${SPEECH_PRICE_COINS} เหรียญ`}</Button></DialogFooter></DialogContent></Dialog>
}
