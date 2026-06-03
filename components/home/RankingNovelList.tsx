'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Eye, BookOpen, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMetaNumber } from '@/components/home/RankingList'
import { GENRE_LABELS } from '@/lib/mock-data'
import type { Work } from '@/lib/types'

type FilterType = 'reads' | 'views' | 'popularity'

const FILTERS: { key: FilterType; label: string; icon: typeof Eye }[] = [
  { key: 'reads', label: 'ยอดอ่าน', icon: BookOpen },
  { key: 'views', label: 'ยอดดู', icon: Eye },
  { key: 'popularity', label: 'นิยมสูงสุด', icon: TrendingUp },
]

function sortWorks(works: Work[], filter: FilterType): Work[] {
  return [...works].sort((a, b) => {
    if (filter === 'reads') return b.readCount - a.readCount
    if (filter === 'views') return b.viewCount - a.viewCount
    return b.rankingScore - a.rankingScore
  })
}

function statValue(work: Work, filter: FilterType): string {
  if (filter === 'reads') return formatMetaNumber(work.readCount)
  if (filter === 'views') return formatMetaNumber(work.viewCount)
  return `${work.rankingScore}`
}

interface BadgeProps {
  rank: number
}

function RankBadge({ rank }: BadgeProps) {
  if (rank <= 3) {
    return (
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black text-white shadow-sm',
          rank === 1 ? 'bg-amber-400' :
          rank === 2 ? 'bg-slate-400' :
          'bg-orange-500',
        )}
      >
        {rank}
      </div>
    )
  }
  return (
    <span className="w-8 shrink-0 text-right text-xl font-black tabular-nums text-muted-foreground">
      {rank}
    </span>
  )
}

interface RowProps {
  work: Work
  rank: number
  filter: FilterType
}

function RankingRow({ work, rank, filter }: RowProps) {
  return (
    <Link
      href={`/detail?bookId=${work.id}`}
      className="group flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-muted/30"
    >
      <RankBadge rank={rank} />

      <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl shadow-sm">
        <Image
          src={work.coverUrl}
          alt={work.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          sizes="80px"
        />
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="line-clamp-2 text-sm font-bold leading-5 text-foreground">{work.title}</p>

        <p className="truncate text-[11px] text-muted-foreground">
          {GENRE_LABELS[work.genres[0]] ?? work.genres[0]} · {work.authorName}
        </p>

        <p className="text-xs font-semibold text-primary tabular-nums">
          {statValue(work, filter)}
        </p>
      </div>
    </Link>
  )
}

interface Props {
  title: string
  works: Work[]
}

export function RankingNovelList({ title, works }: Props) {
  const [filter, setFilter] = useState<FilterType>('reads')
  const [page, setPage] = useState(0)

  if (works.length === 0) return null

  const sorted = sortWorks(works, filter)
  const visibleItems = sorted.slice(page * 6, page * 6 + 6)
  const leftCol = visibleItems.slice(0, 3)
  const rightCol = visibleItems.slice(3, 6)
  const canPrev = page > 0
  const canNext = (page + 1) * 6 < sorted.length

  function handleFilter(f: FilterType) {
    setFilter(f)
    setPage(0)
  }

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          <div className="flex gap-1.5">
            {FILTERS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleFilter(key)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  filter === key
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                )}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>

          {/* Pagination arrows */}
          <div className="flex gap-1.5">
            {canPrev && (
              <button
                type="button"
                onClick={() => setPage(p => p - 1)}
                aria-label="หน้าก่อนหน้า"
                className="rounded-full bg-black/80 p-2 text-white transition-colors hover:bg-black"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {canNext && (
              <button
                type="button"
                onClick={() => setPage(p => p + 1)}
                aria-label="หน้าถัดไป"
                className="rounded-full bg-black/80 p-2 text-white transition-colors hover:bg-black"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
        <div className="divide-y divide-border/60">
          {leftCol.map((work, i) => (
            <RankingRow key={work.id} work={work} rank={page * 6 + i + 1} filter={filter} />
          ))}
        </div>
        <div className="divide-y divide-border/60">
          {rightCol.map((work, i) => (
            <RankingRow key={work.id} work={work} rank={page * 6 + i + 4} filter={filter} />
          ))}
        </div>
      </div>
    </section>
  )
}
