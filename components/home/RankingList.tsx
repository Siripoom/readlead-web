'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Eye, Star } from 'lucide-react'
import type { Work } from '@/lib/types'
import { GENRE_LABELS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const RANK_COLORS = [
  'border-[#F3B43F] bg-[#FFF6DC] text-[#D48A00]',
  'border-[#B8C2CC] bg-[#EEF2F6] text-[#64748B]',
  'border-[#DBA381] bg-[#FFF0E7] text-[#C46D3F]',
]

const META_NUMBER_FORMATTER = new Intl.NumberFormat('th-TH', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export type RankingStatVariant = 'reads' | 'views' | 'popularity' | 'vip'

interface Props {
  title: string
  works: Work[]
  chineseTitle?: string
  statLabel: string
  statVariant: RankingStatVariant
  actionHref?: string
  actionLabel?: string
  maxItems?: number
}

function formatMetaNumber(value: number) {
  return META_NUMBER_FORMATTER.format(value)
}

function formatPrimaryStat(work: Work, statVariant: RankingStatVariant) {
  switch (statVariant) {
    case 'reads':
      return formatMetaNumber(work.readCount)
    case 'views':
      return formatMetaNumber(work.viewCount)
    case 'popularity':
      return `${work.rankingScore}`
    case 'vip':
      return `฿${formatMetaNumber(work.vipTopUpTotal)}`
  }
}

export function RankingList({
  title,
  works,
  chineseTitle,
  statLabel,
  statVariant,
  actionHref = '/discover',
  actionLabel = 'ดูเพิ่มเติม',
  maxItems = 6,
}: Props) {
  const visibleWorks = works.slice(0, maxItems)

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-3">
          <h2 className="text-2xl font-bold leading-tight text-foreground">{title}</h2>
          {chineseTitle && <span className="text-sm font-serif text-muted-foreground">{chineseTitle}</span>}
        </div>

        <Link
          href={actionHref}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {actionLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-x-10 rounded-3xl border border-border/80 bg-card px-2 md:grid-cols-2 md:px-5">
        {visibleWorks.length > 0 ? visibleWorks.map((work, index) => (
          <Link
            key={work.id}
            href={`/detail?bookId=${work.id}`}
            className="grid grid-cols-[2.75rem_4.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/70 py-4 transition-colors hover:bg-muted/20 last:border-b-0 md:px-2"
          >
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border text-base font-black',
                RANK_COLORS[index] ?? 'border-border bg-background text-muted-foreground',
              )}
            >
              {index + 1}
            </span>

            <div className="relative h-24 w-16 overflow-hidden rounded-xl">
              <Image src={work.coverUrl} alt={work.title} fill className="object-cover" sizes="64px" />
            </div>

            <div className="min-w-0 space-y-2">
              <div className="space-y-1">
                <p className="line-clamp-2 text-[15px] font-bold leading-5 text-foreground">{work.title}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {work.authorName} · {GENRE_LABELS[work.genres[0]]}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {formatMetaNumber(work.viewCount)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {formatMetaNumber(work.voteCount)}
                </span>
              </div>
            </div>

            <div className="text-right">
              {work.isFeatured && (
                <span className="inline-flex rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">
                  推荐
                </span>
              )}
              <p className="mt-2 text-[10px] text-muted-foreground">{statLabel}</p>
              <p className="text-sm font-bold text-foreground">{formatPrimaryStat(work, statVariant)}</p>
            </div>
          </Link>
        )) : (
          <div className="flex min-h-48 items-center justify-center px-4 text-sm text-muted-foreground">
            ยังไม่มีอันดับสำหรับหมวดนี้
          </div>
        )}
      </div>
    </section>
  )
}
