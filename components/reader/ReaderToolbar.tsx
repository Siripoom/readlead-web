'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { BookOpen, ChevronLeft, ChevronRight, List, Lock } from 'lucide-react'
import type { Episode, Work } from '@/lib/types'
import type { ReaderSettings, ReaderTheme } from '@/lib/reader-repository'

interface Props {
  work: Work
  episode: Episode
  episodes: Episode[]
  settings: ReaderSettings
  onSettingsChange: (settings: ReaderSettings) => void
}

const THEMES: Array<{ value: ReaderTheme; label: string }> = [
  { value: 'light', label: 'กลางวัน' },
  { value: 'sepia', label: 'ซีเปีย' },
  { value: 'dark', label: 'กลางคืน' },
]

function readerHref(workId: string, episodeId: string) {
  return `/reader?bookId=${encodeURIComponent(workId)}&episodeId=${encodeURIComponent(episodeId)}`
}

export default function ReaderToolbar({ work, episode, episodes, settings, onSettingsChange }: Props) {
  const [openPanel, setOpenPanel] = useState<'toc' | 'settings' | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const currentIdx = episodes.findIndex((item) => item.id === episode.id)
  const previous = episodes[currentIdx - 1]
  const next = episodes[currentIdx + 1]

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!toolbarRef.current?.contains(event.target as Node)) setOpenPanel(null)
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenPanel(null)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return (
    <div
      ref={toolbarRef}
      className="sticky top-[55px] z-40 flex min-h-11 items-center justify-between border-b border-[var(--reader-border)] bg-[var(--reader-paper)] px-2 text-[var(--reader-muted)]"
    >
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[var(--reader-hover)] hover:text-[var(--reader-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label="เปิดสารบัญ"
        aria-expanded={openPanel === 'toc'}
        onClick={() => setOpenPanel((current) => current === 'toc' ? null : 'toc')}
      >
        <List className="h-5 w-5" />
      </button>

      <p className="pointer-events-none absolute inset-x-14 truncate text-center text-xs font-bold text-[var(--reader-ink)] sm:text-sm">
        {episode.title}
      </p>

      <div className="relative z-10 flex items-center gap-0.5">
        <button
          type="button"
          className="grid h-9 min-w-9 place-items-center rounded-lg px-2 text-xs font-extrabold hover:bg-[var(--reader-hover)] hover:text-[var(--reader-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="ตั้งค่าหน้าอ่าน"
          aria-expanded={openPanel === 'settings'}
          onClick={() => setOpenPanel((current) => current === 'settings' ? null : 'settings')}
        >
          Aa
        </button>
        {previous ? (
          <Link
            href={readerHref(work.id, previous.id)}
            aria-label={`ตอนก่อนหน้า ${previous.title}`}
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[var(--reader-hover)] hover:text-[var(--reader-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        ) : (
          <span className="grid h-9 w-9 place-items-center opacity-25" aria-hidden><ChevronLeft className="h-5 w-5" /></span>
        )}
        {next ? (
          <Link
            href={readerHref(work.id, next.id)}
            aria-label={`ตอนถัดไป ${next.title}`}
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[var(--reader-hover)] hover:text-[var(--reader-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        ) : (
          <span className="grid h-9 w-9 place-items-center opacity-25" aria-hidden><ChevronRight className="h-5 w-5" /></span>
        )}
      </div>

      {openPanel === 'toc' && (
        <section className="absolute left-0 top-full max-h-[72vh] w-[min(430px,calc(100vw-1rem))] overflow-y-auto rounded-b-2xl border border-t-0 border-border bg-background text-foreground shadow-xl" aria-label="สารบัญตอน">
          <div className="flex gap-3 border-b p-4">
            <div
              className="h-[72px] w-[54px] shrink-0 rounded-lg bg-cover bg-center shadow"
              style={{ background: work.coverUrl ? `url(${work.coverUrl}) center/cover` : 'var(--reader-cover)' }}
              aria-hidden
            />
            <div className="min-w-0 self-center">
              <p className="line-clamp-2 text-sm font-extrabold">{work.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{work.authorName}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><BookOpen className="h-3 w-3" /> {episodes.length} ตอน</p>
            </div>
          </div>
          <div className="py-1">
            {episodes.map((item) => (
              <Link
                key={item.id}
                href={readerHref(work.id, item.id)}
                onClick={() => setOpenPanel(null)}
                aria-current={item.id === episode.id ? 'page' : undefined}
                className={`flex items-center gap-3 border-l-[3px] px-4 py-3 text-sm transition-colors ${
                  item.id === episode.id
                    ? 'border-primary bg-primary/10 font-bold text-primary'
                    : 'border-transparent hover:bg-muted/60'
                }`}
              >
                <span className="w-7 shrink-0 text-xs text-muted-foreground">{item.episodeNum}</span>
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
                {item.price > 0 && <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-label={`${item.price} เหรียญ`} />}
              </Link>
            ))}
          </div>
        </section>
      )}

      {openPanel === 'settings' && (
        <section className="absolute right-2 top-[calc(100%+8px)] w-60 rounded-2xl border border-border bg-background p-4 text-foreground shadow-xl" aria-label="ตั้งค่าหน้าอ่าน">
          <p className="mb-2 text-[11px] font-extrabold text-muted-foreground">ธีม</p>
          <div className="mb-4 flex gap-1.5">
            {THEMES.map((item) => (
              <button
                type="button"
                key={item.value}
                onClick={() => onSettingsChange({ ...settings, theme: item.value })}
                className={`flex-1 rounded-lg border px-1 py-2 text-[11px] font-bold ${settings.theme === item.value ? 'border-primary text-primary' : 'border-border hover:bg-muted'}`}
                aria-pressed={settings.theme === item.value}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="mb-2 text-[11px] font-extrabold text-muted-foreground">ขนาดตัวอักษร</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-8 w-8 rounded-lg border font-extrabold disabled:opacity-30"
              onClick={() => onSettingsChange({ ...settings, fontSize: Math.max(14, settings.fontSize - 1) })}
              disabled={settings.fontSize <= 14}
              aria-label="ลดขนาดตัวอักษร"
            >A−</button>
            <span className="flex-1 text-center text-sm font-bold" aria-live="polite">{settings.fontSize}</span>
            <button
              type="button"
              className="h-8 w-8 rounded-lg border font-extrabold disabled:opacity-30"
              onClick={() => onSettingsChange({ ...settings, fontSize: Math.min(24, settings.fontSize + 1) })}
              disabled={settings.fontSize >= 24}
              aria-label="เพิ่มขนาดตัวอักษร"
            >A+</button>
          </div>
        </section>
      )}
    </div>
  )
}
