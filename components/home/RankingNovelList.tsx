'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Eye, BookOpen, TrendingUp, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatMetaNumber } from '@/components/home/RankingList'
import { GENRE_LABELS } from '@/lib/mock-data'
import type { Work } from '@/lib/types'

type FilterType = 'reads' | 'views' | 'popularity'

const COLUMNS: { key: FilterType; label: string; icon: typeof Eye }[] = [
  { key: 'reads', label: 'ยอดอ่าน', icon: BookOpen },
  { key: 'views', label: 'ยอดดู', icon: Eye },
  { key: 'popularity', label: 'นิยมสูงสุด', icon: TrendingUp },
]

const TOP_N = 10

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

interface FeaturedCardProps {
  work: Work
  filter: FilterType
}

function FeaturedRankCard({ work, filter }: FeaturedCardProps) {
  return (
    <Link
      href={`/detail?bookId=${work.id}`}
      className="group block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      {/* ปกซ่อนไว้ ค่อย ๆ เผยปกแนวตั้งขนาดเล็กตอน hover */}
      <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-700 ease-in-out group-hover:max-h-64 group-hover:opacity-100">
        <div className="flex justify-center px-3 pt-3">
          <div className="relative aspect-3/4 w-32 translate-y-2 overflow-hidden rounded-lg shadow-sm transition-transform duration-700 ease-in-out group-hover:translate-y-0">
            <Image
              src={work.coverUrl}
              alt={work.title}
              fill
              className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.03]"
              sizes="128px"
            />
          </div>
        </div>
      </div>
      <div className="space-y-1.5 p-3">
        <span className="inline-block rounded-full bg-amber-400 px-2.5 py-1 text-xs font-black text-white shadow">
          อันดับ 1
        </span>
        <p className="line-clamp-2 text-base font-black leading-tight text-foreground">{work.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {GENRE_LABELS[work.genres[0]] ?? work.genres[0]} · {work.authorName}
        </p>
        <p className="text-sm font-bold text-primary tabular-nums">{statValue(work, filter)}</p>
      </div>
    </Link>
  )
}

interface CompactRowProps {
  work: Work
  rank: number
  filter: FilterType
}

function CompactRankRow({ work, rank, filter }: CompactRowProps) {
  return (
    <Link
      href={`/detail?bookId=${work.id}`}
      className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/30"
    >
      <span
        className={cn(
          'w-5 shrink-0 text-center text-sm font-black tabular-nums',
          rank === 2 ? 'text-slate-400' :
          rank === 3 ? 'text-orange-500' :
          'text-muted-foreground',
        )}
      >
        {rank}
      </span>
      <p className="line-clamp-1 flex-1 text-sm font-medium text-foreground group-hover:text-primary">
        {work.title}
      </p>
      <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
        {statValue(work, filter)}
      </span>
    </Link>
  )
}

interface ColumnProps {
  filter: FilterType
  label: string
  icon: typeof Eye
  works: Work[]
}

function RankingColumn({ filter, label, icon: Icon, works }: ColumnProps) {
  const ranked = sortWorks(works, filter).slice(0, TOP_N)
  if (ranked.length === 0) return null

  const [featured, ...rest] = ranked

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-border/60 pb-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-base font-bold text-foreground">{label}</h3>
      </div>

      <FeaturedRankCard work={featured} filter={filter} />

      <div className="divide-y divide-border/50">
        {rest.map((work, i) => (
          <CompactRankRow key={work.id} work={work} rank={i + 2} filter={filter} />
        ))}
      </div>
    </div>
  )
}

interface Props {
  title: string
  works: Work[]
  viewMoreHref?: string
}

export function RankingNovelList({ title, works, viewMoreHref }: Props) {
  if (works.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {viewMoreHref && (
          <Link
            href={viewMoreHref}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ดูเพิ่มเติม
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {COLUMNS.map(({ key, label, icon }) => (
          <RankingColumn key={key} filter={key} label={label} icon={icon} works={works} />
        ))}
      </div>
    </section>
  )
}
