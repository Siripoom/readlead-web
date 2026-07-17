'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { BarChart3, ChevronRight, Flame, Headphones, Play, Sparkles } from 'lucide-react'
import type {
  AudioRankingGroup,
  AudioRankingId,
  AudioRankingItem,
} from '@/lib/audiobook-landing-data'
import { cn } from '@/lib/utils'
import { AudioCoverArt } from './AudioCoverArt'

const AUTO_ROTATE_MS = 3000

const metricIcons = {
  vote_d: Flame,
  vote_m: Flame,
  listens: Headphones,
  new: Sparkles,
}

function itemHref(item: AudioRankingItem) {
  return `/detail?bookId=${encodeURIComponent(item.detailId)}`
}

function Metric({ type, value, large = false }: { type: AudioRankingId; value: string; large?: boolean }) {
  const Icon = metricIcons[type]
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-extrabold text-[#ff6844]', large ? 'text-2xl' : 'text-lg')}>
      <Icon className={cn(type !== 'listens' && 'fill-current', large ? 'h-6 w-6' : 'h-4 w-4')} />
      {value}
    </span>
  )
}

function Champion({ item, type }: { item: AudioRankingItem; type: AudioRankingId }) {
  return (
    <Link
      href={itemHref(item)}
      className="group relative min-h-[260px] overflow-hidden rounded-2xl border border-[var(--home-line)] p-6 text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7355df] md:col-span-2 xl:col-span-1"
      style={{ background: item.gradient }}
    >
      <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
        <AudioCoverArt index={0} />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,9,24,0.95),rgba(13,9,24,0.16)_74%)]" />
      <div className="relative z-10 flex h-full min-h-[210px] flex-col justify-end">
        <span className="mb-2 w-fit rounded-full bg-[#fff3d6] px-3 py-1 text-xs font-bold text-[#a36e00]">อันดับ 1</span>
        <h3 className="text-2xl font-extrabold leading-tight">{item.title}</h3>
        <p className="mt-1 text-xs font-medium text-white/75">{item.author} · {item.genreLabel} · {item.originLabel}</p>
        <div className="mt-3"><Metric type={type} value={item.value} large /></div>
        <p className="mt-3 line-clamp-2 max-w-lg text-xs leading-relaxed text-white/75">{item.tagline}</p>
        <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#cc4452] px-5 py-2 text-xs font-bold text-white">
          <Play className="h-3.5 w-3.5 fill-current" /> เริ่มฟัง
        </span>
      </div>
    </Link>
  )
}

function RunnerUp({ item, rank, type }: { item: AudioRankingItem; rank: number; type: AudioRankingId }) {
  return (
    <Link
      href={itemHref(item)}
      className="group relative min-h-[260px] overflow-hidden rounded-2xl border border-[var(--home-line)] p-5 text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7355df]"
      style={{ background: item.gradient }}
    >
      <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
        <AudioCoverArt index={rank} />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(13,9,24,0.94),rgba(13,9,24,0.14)_74%)]" />
      <div className="relative z-10 flex h-full min-h-[218px] flex-col justify-between">
        <span className="grid h-8 w-8 place-items-center rounded-full border border-white/30 bg-white/20 text-sm font-extrabold backdrop-blur">{rank}</span>
        <div>
          <h3 className="line-clamp-2 text-lg font-bold leading-snug">{item.title}</h3>
          <p className="mt-1 truncate text-xs text-white/70">{item.author} · {item.originLabel}</p>
          <div className="mt-2"><Metric type={type} value={item.value} /></div>
        </div>
      </div>
    </Link>
  )
}

export function AudioRankingShowcase({ groups }: { groups: AudioRankingGroup[] }) {
  const [activeId, setActiveId] = useState<AudioRankingId>(groups[0]?.id ?? 'vote_d')
  const [isHovered, setIsHovered] = useState(false)
  const [isFocusWithin, setIsFocusWithin] = useState(false)
  const [isDocumentHidden, setIsDocumentHidden] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [restartKey, setRestartKey] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const activeGroup = groups.find((group) => group.id === activeId) ?? groups[0]

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setPrefersReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const sync = () => setIsDocumentHidden(document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  useEffect(() => {
    if (groups.length <= 1 || isHovered || isFocusWithin || isDocumentHidden || prefersReducedMotion) return
    const timer = window.setInterval(() => {
      setActiveId((current) => {
        const index = groups.findIndex((group) => group.id === current)
        return groups[(index + 1 + groups.length) % groups.length]?.id ?? current
      })
    }, AUTO_ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [groups, isDocumentHidden, isFocusWithin, isHovered, prefersReducedMotion, restartKey])

  if (!activeGroup) return null

  const selectTab = (id: AudioRankingId) => {
    setActiveId(id)
    setRestartKey((key) => key + 1)
  }
  const [champion, second, third, ...rest] = activeGroup.items

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsFocusWithin(false)
      }}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold leading-tight text-[var(--home-ink)] sm:text-[23px]">
            <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-[linear-gradient(135deg,#8b6df0,#cc4452)] text-white">
              <BarChart3 className="h-4 w-4" />
            </span>
            อันดับรวมยอดนิยม
          </h2>
          <Link href="/ranking" className="hidden items-center gap-0.5 text-xs font-semibold text-[var(--home-ink-2)] transition hover:text-[#cc4452] lg:inline-flex">
            ดูเพิ่มเติม <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div
          role="tablist"
          aria-label="ประเภทการจัดอันดับหนังสือเสียง"
          className="flex w-full gap-1 overflow-x-auto rounded-lg bg-[var(--home-soft)] p-0.5 sm:w-fit"
        >
          {groups.map((group, index) => (
            <button
              key={group.id}
              ref={(element) => { tabRefs.current[index] = element }}
              type="button"
              role="tab"
              aria-selected={activeGroup.id === group.id}
              aria-controls="audio-ranking-panel"
              tabIndex={activeGroup.id === group.id ? 0 : -1}
              onClick={() => selectTab(group.id)}
              onKeyDown={(event) => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
                event.preventDefault()
                let nextIndex = index
                if (event.key === 'ArrowLeft') nextIndex = (index - 1 + groups.length) % groups.length
                if (event.key === 'ArrowRight') nextIndex = (index + 1) % groups.length
                if (event.key === 'Home') nextIndex = 0
                if (event.key === 'End') nextIndex = groups.length - 1
                const nextGroup = groups[nextIndex]
                if (nextGroup) {
                  selectTab(nextGroup.id)
                  tabRefs.current[nextIndex]?.focus()
                }
              }}
              className={cn(
                'shrink-0 rounded-md px-4 py-2 text-[11px] font-semibold text-[var(--home-ink-2)] transition hover:text-[#cc4452] focus-visible:outline-2 focus-visible:outline-[#7355df]',
                activeGroup.id === group.id && 'bg-white font-bold text-[#cc4452] shadow-sm',
              )}
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      <div id="audio-ranking-panel" role="tabpanel" tabIndex={0} className="focus-visible:outline-2 focus-visible:outline-[#7355df]">
        {champion ? (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr]">
              <Champion item={champion} type={activeGroup.id} />
              {second && <RunnerUp item={second} rank={2} type={activeGroup.id} />}
              {third && <RunnerUp item={third} rank={3} type={activeGroup.id} />}
            </div>
            {rest.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-7">
                {rest.map((item, index) => (
                  <Link key={item.id} href={itemHref(item)} className="group min-w-0 focus-visible:rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7355df]">
                    <div className="relative aspect-[2/3] overflow-hidden rounded-[10px] shadow-sm" style={{ background: item.gradient }}>
                      <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"><AudioCoverArt index={index + 3} /></div>
                      <span className="absolute left-1.5 top-1.5 rounded-lg bg-black/60 px-2 py-0.5 text-[11px] font-extrabold text-white">{index + 4}</span>
                    </div>
                    <h4 className="mt-2 truncate text-xs font-semibold text-[var(--home-ink)]">{item.title}</h4>
                    <p className="mt-0.5 truncate text-[10px] text-[var(--home-ink-3)]">{item.author} · {item.originLabel}</p>
                    <p className="mt-1 truncate text-xs font-bold text-[#cc4452]">{item.value}</p>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--home-line)] bg-[var(--home-soft)] px-6 py-12 text-center text-sm text-[var(--home-ink-2)]">
            ไม่พบอันดับหนังสือเสียงในหมวดนี้
          </div>
        )}
      </div>
    </div>
  )
}
