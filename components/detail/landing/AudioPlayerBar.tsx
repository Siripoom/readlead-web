'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronUp, List, Moon, Pause, Play, Repeat, RotateCcw, RotateCw, SkipBack, SkipForward, X } from 'lucide-react'
import type { DetailEpisode } from '@/lib/detail-catalog'
import styles from './AudioPlayerBar.module.css'

const SPEEDS = [1, 1.25, 1.5, 2, 0.75]
const SLEEP_OPTIONS = [
  { label: 'อีก 15 นาที', minutes: 15 },
  { label: 'อีก 30 นาที', minutes: 30 },
  { label: 'อีก 60 นาที', minutes: 60 },
]

export function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  return `${minutes}:${rest < 10 ? '0' : ''}${rest}`
}

export const audioEpisodeDurationSeconds = (episode: DetailEpisode) => (12 + (episode.episodeNum % 8)) * 60

export interface AudioPlayerHandle {
  toggle: (episode: DetailEpisode) => void
}

interface Props {
  episodes: DetailEpisode[]
  authorName: string
  coverUrl?: string
  coverGradient: string
  onStateChange?: (activeEpisodeId: string | null, playing: boolean) => void
}

export const AudioPlayerBar = forwardRef<AudioPlayerHandle, Props>(function AudioPlayerBar(
  { episodes, authorName, coverUrl, coverGradient, onStateChange },
  ref,
) {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [autoplay, setAutoplay] = useState(true)
  const [sleepAt, setSleepAt] = useState<number | null>(null)
  const [sleepAtEnd, setSleepAtEnd] = useState(false)
  const [sleepMenuOpen, setSleepMenuOpen] = useState(false)
  const [episodesMenuOpen, setEpisodesMenuOpen] = useState(false)
  const [coverFailed, setCoverFailed] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  const current = currentIndex >= 0 ? episodes[currentIndex] : null
  const duration = current ? audioEpisodeDurationSeconds(current) : 0

  useImperativeHandle(ref, () => ({
    toggle(episode) {
      const idx = episodes.findIndex((item) => item.id === episode.id)
      if (idx === -1) return
      if (idx === currentIndex) {
        setPlaying((value) => {
          const next = !value
          if (next && position >= audioEpisodeDurationSeconds(episode)) setPosition(0)
          return next
        })
      } else {
        setCurrentIndex(idx)
        setPosition(0)
        setPlaying(true)
      }
      setOpen(true)
      setMinimized(false)
    },
  }))

  useEffect(() => { onStateChange?.(current?.id ?? null, playing) }, [current, playing, onStateChange])

  useEffect(() => {
    if (!playing || !current) return
    const id = window.setInterval(() => {
      if (sleepAt && Date.now() >= sleepAt) { setSleepAt(null); setPlaying(false); return }
      setPosition((value) => Math.min(duration, value + 0.5 * speed))
    }, 500)
    return () => window.clearInterval(id)
  }, [playing, speed, duration, sleepAt, current])

  useEffect(() => {
    if (!current || position < duration) return
    if (sleepAtEnd) { setSleepAtEnd(false); setPlaying(false); return }
    if (autoplay && currentIndex < episodes.length - 1) { setCurrentIndex((value) => value + 1); setPosition(0) }
    else setPlaying(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, duration])

  useEffect(() => {
    if (!sleepMenuOpen && !episodesMenuOpen) return
    function handlePointerDown(event: PointerEvent) {
      if (barRef.current && !barRef.current.contains(event.target as Node)) { setSleepMenuOpen(false); setEpisodesMenuOpen(false) }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [sleepMenuOpen, episodesMenuOpen])

  function stepEpisode(direction: 1 | -1) {
    let next = currentIndex + direction
    while (next >= 0 && next < episodes.length && episodes[next].status === 'scheduled') next += direction
    if (next < 0 || next >= episodes.length) return
    setCurrentIndex(next)
    setPosition(0)
    setPlaying(true)
  }

  function skip(seconds: number) { setPosition((value) => Math.max(0, Math.min(duration, value + seconds))) }
  function cycleSpeed() { setSpeed((value) => SPEEDS[(SPEEDS.indexOf(value) + 1) % SPEEDS.length]) }
  function pickSleep(minutes: number) { setSleepAt(Date.now() + minutes * 60_000); setSleepAtEnd(false); setSleepMenuOpen(false) }
  function pickSleepAtEnd() { setSleepAtEnd(true); setSleepAt(null); setSleepMenuOpen(false) }
  function clearSleep() { setSleepAt(null); setSleepAtEnd(false); setSleepMenuOpen(false) }
  function close() { setOpen(false); setMinimized(false); setPlaying(false); setCurrentIndex(-1); setPosition(0); setSleepAt(null); setSleepAtEnd(false) }

  if (!open || !current) return null

  if (minimized) {
    return (
      <div className={styles.mini}>
        <button type="button" className={styles.miniPlay} aria-label={playing ? 'หยุด' : 'เล่น'} onClick={() => setPlaying((value) => !value)}>
          {playing ? <Pause size={20}/> : <Play size={20}/>}
        </button>
        <button type="button" className={styles.miniUp} aria-label="ขยายกลับ" onClick={() => setMinimized(false)}>
          <ChevronUp size={15}/>
        </button>
      </div>
    )
  }

  const sleepActive = Boolean(sleepAt || sleepAtEnd)

  return (
    <div ref={barRef} className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.cover} style={{ background: coverGradient }}>
          {coverUrl && !coverFailed && <Image unoptimized fill sizes="38px" src={coverUrl} alt="" className="object-cover" onError={() => setCoverFailed(true)}/>}
        </div>
        <div className={styles.info}>
          <p className={styles.title}>{current.title}</p>
          <p className={styles.subtitle}>{authorName}</p>
        </div>

        <div className={styles.controls}>
          <button type="button" className={`${styles.iconBtn} ${styles.hideOnSmall}`} aria-label="ย้อน 10 วินาที" onClick={() => skip(-10)}><RotateCcw size={17}/></button>
          <button type="button" className={styles.iconBtn} aria-label="บทก่อนหน้า" disabled={currentIndex <= 0} onClick={() => stepEpisode(-1)}><SkipBack size={17}/></button>
          <button type="button" className={styles.playBtn} aria-label={playing ? 'หยุด' : 'เล่น'} onClick={() => setPlaying((value) => !value)}>
            {playing ? <Pause size={26}/> : <Play size={26}/>}
          </button>
          <button type="button" className={styles.iconBtn} aria-label="บทถัดไป" disabled={currentIndex >= episodes.length - 1} onClick={() => stepEpisode(1)}><SkipForward size={17}/></button>
          <button type="button" className={`${styles.iconBtn} ${styles.hideOnSmall}`} aria-label="ไปหน้า 10 วินาที" onClick={() => skip(10)}><RotateCw size={17}/></button>
        </div>

        <div className={styles.prog}>
          <span className={styles.time}>{formatTime(position)}</span>
          <div className={styles.track}><div className={styles.fill} style={{ width: `${duration ? Math.min(100, (position / duration) * 100) : 0}%` }}/></div>
          <span className={styles.time}>{formatTime(duration)}</span>
        </div>

        <button type="button" className={styles.txBtn} onClick={cycleSpeed}>{speed}x</button>
        <button type="button" className={`${styles.iconBtn} ${styles.hideOnSmall} ${autoplay ? styles.active : ''}`} aria-label="เล่นต่อเนื่อง" aria-pressed={autoplay} onClick={() => setAutoplay((value) => !value)}><Repeat size={16}/></button>

        <div className={styles.menuWrap}>
          <button type="button" className={`${styles.iconBtn} ${sleepActive ? styles.active : ''}`} aria-label="ตั้งเวลาปิด" onClick={() => { setEpisodesMenuOpen(false); setSleepMenuOpen((value) => !value) }}><Moon size={16}/></button>
          {sleepMenuOpen && (
            <div className={styles.menu}>
              <p className={styles.menuHead}>ตั้งเวลานอน</p>
              {SLEEP_OPTIONS.map((option) => <button key={option.minutes} type="button" className={styles.menuItem} onClick={() => pickSleep(option.minutes)}>{option.label}</button>)}
              <button type="button" className={styles.menuItem} onClick={pickSleepAtEnd}>เมื่อจบบทนี้</button>
              {sleepActive && <button type="button" className={styles.menuItem} onClick={clearSleep}>ปิดตัวจับเวลา</button>}
            </div>
          )}
        </div>

        <div className={styles.menuWrap}>
          <button type="button" className={styles.iconBtn} aria-label="รายการตอน" onClick={() => { setSleepMenuOpen(false); setEpisodesMenuOpen((value) => !value) }}><List size={16}/></button>
          {episodesMenuOpen && (
            <div className={`${styles.menu} ${styles.epsMenu}`}>
              {episodes.filter((episode) => episode.status !== 'scheduled').map((episode) => (
                <button
                  key={episode.id}
                  type="button"
                  className={`${styles.epsItem} ${episode.id === current.id ? styles.active : ''}`}
                  onClick={() => { setCurrentIndex(episodes.findIndex((item) => item.id === episode.id)); setPosition(0); setPlaying(true); setEpisodesMenuOpen(false) }}
                >
                  {episode.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="button" className={styles.closeBtn} aria-label="ย่อ" onClick={() => setMinimized(true)}><ChevronUp className={styles.flip} size={15}/></button>
        <button type="button" className={styles.closeBtn} aria-label="ปิด" onClick={close}><X size={15}/></button>
      </div>
    </div>
  )
})
