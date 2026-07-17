'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BarChart3, Eye, Heart, Sparkles } from 'lucide-react'
import type {
  MangaRankingGroup,
  MangaRankingId,
  MangaRankingItem,
} from '@/lib/manga-landing-data'
import { cn } from '@/lib/utils'
import { MangaCoverArt } from './MangaCoverArt'

const metricIcons = {
  views: Eye,
  daily: Heart,
  monthly: Heart,
  new: Sparkles,
}

function itemHref(item: MangaRankingItem) {
  return `/detail?bookId=${encodeURIComponent(item.detailId)}`
}

function Metric({ type, value, large = false }: { type: MangaRankingId; value: string; large?: boolean }) {
  const Icon = metricIcons[type]
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-extrabold text-[#ffcf5c]', large ? 'text-2xl' : 'text-lg')}>
      <Icon className={cn(type !== 'views' && 'fill-current', large ? 'h-5 w-5' : 'h-4 w-4')} />
      {value}
    </span>
  )
}

function Champion({ item, type }: { item: MangaRankingItem; type: MangaRankingId }) {
  return (
    <Link
      href={itemHref(item)}
      className="group relative min-h-[260px] overflow-hidden rounded-2xl border border-[var(--home-line)] p-6 text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7355df] md:col-span-2 xl:col-span-1"
      style={{ background: item.gradient }}
    >
      <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
        <MangaCoverArt index={0} />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,10,25,0.94),rgba(15,10,25,0.14)_72%)]" />
      <div className="relative z-10 flex h-full min-h-[210px] flex-col justify-end">
        <span className="mb-2 w-fit rounded-full bg-[#fff3d6] px-3 py-1 text-xs font-bold text-[#a36e00]">อันดับ 1</span>
        <h3 className="text-2xl font-extrabold leading-tight">{item.title}</h3>
        <p className="mt-1 text-xs font-medium text-white/75">{item.author} · {item.genreLabel}</p>
        <div className="mt-3"><Metric type={type} value={item.value} large /></div>
        <p className="mt-3 line-clamp-2 max-w-lg text-xs leading-relaxed text-white/75">{item.tagline}</p>
        <span className="mt-4 w-fit rounded-full bg-[#ffcf5c] px-5 py-2 text-xs font-bold text-[#2a1d00]">อ่านเลย</span>
      </div>
    </Link>
  )
}

function RunnerUp({ item, rank, type }: { item: MangaRankingItem; rank: number; type: MangaRankingId }) {
  return (
    <Link
      href={itemHref(item)}
      className="group relative min-h-[260px] overflow-hidden rounded-2xl border border-[var(--home-line)] p-5 text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7355df]"
      style={{ background: item.gradient }}
    >
      <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
        <MangaCoverArt index={rank} />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,10,25,0.93),rgba(15,10,25,0.12)_74%)]" />
      <div className="relative z-10 flex h-full min-h-[218px] flex-col justify-between">
        <span className="grid h-8 w-8 place-items-center rounded-full border border-white/30 bg-white/20 text-sm font-extrabold backdrop-blur">{rank}</span>
        <div>
          <h3 className="line-clamp-2 text-lg font-bold leading-snug">{item.title}</h3>
          <p className="mt-1 truncate text-xs text-white/70">{item.author}</p>
          <div className="mt-2"><Metric type={type} value={item.value} /></div>
        </div>
      </div>
    </Link>
  )
}

export function MangaRankingShowcase({ groups }: { groups: MangaRankingGroup[] }) {
  const [activeId, setActiveId] = useState<MangaRankingId>(groups[0]?.id ?? 'views')
  const activeGroup = groups.find((group) => group.id === activeId) ?? groups[0]

  if (!activeGroup) return null

  const [champion, second, third, ...rest] = activeGroup.items

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold leading-tight text-[var(--home-ink)] sm:text-[23px]">
          <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-[linear-gradient(135deg,#8b6df0,#ee5a96)] text-white">
            <BarChart3 className="h-4 w-4" />
          </span>
          อันดับรวมยอดนิยม
        </h2>
        <div
          role="tablist"
          aria-label="ประเภทการจัดอันดับมังงะ"
          className="flex w-full gap-1 overflow-x-auto rounded-full border border-[var(--home-line)] bg-[var(--home-soft)] p-1 sm:w-fit"
        >
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={activeGroup.id === group.id}
              aria-controls="manga-ranking-panel"
              onClick={() => setActiveId(group.id)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-xs font-semibold text-[var(--home-ink-2)] transition hover:text-[#cc4452] focus-visible:outline-2 focus-visible:outline-[#7355df]',
                activeGroup.id === group.id && 'bg-white text-[#cc4452] shadow-sm',
              )}
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      <div id="manga-ranking-panel" role="tabpanel" tabIndex={0} className="focus-visible:outline-2 focus-visible:outline-[#7355df]">
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
                  <Link
                    key={item.id}
                    href={itemHref(item)}
                    className="group min-w-0 focus-visible:rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7355df]"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden rounded-[10px] shadow-sm" style={{ background: item.gradient }}>
                      <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
                        <MangaCoverArt index={index + 3} />
                      </div>
                      <span className="absolute left-1.5 top-1.5 rounded-lg bg-black/60 px-2 py-0.5 text-[11px] font-extrabold text-white">{index + 4}</span>
                    </div>
                    <h4 className="mt-2 truncate text-xs font-semibold text-[var(--home-ink)]">{item.title}</h4>
                    <p className="mt-0.5 truncate text-xs font-bold text-[#cc4452]">{item.value}</p>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--home-line)] bg-[var(--home-soft)] px-6 py-12 text-center text-sm text-[var(--home-ink-2)]">
            ไม่พบอันดับมังงะในหมวดนี้
          </div>
        )}
      </div>
    </div>
  )
}
