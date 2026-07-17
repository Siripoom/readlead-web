import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, Crown, Eye, Sparkles, Ticket } from 'lucide-react'
import type { HomeRankingColumn, HomeRankingItem } from '@/lib/home-landing-data'
import { cn } from '@/lib/utils'
import styles from './HomeLanding.module.css'

const columnIcons = {
  daily: Ticket,
  monthly: CalendarDays,
  views: Eye,
  new: Sparkles,
}

const medalStyles = {
  1: 'border-[#d99c23] bg-[linear-gradient(145deg,#ffe9a7,#e9ad31)] text-[#744800]',
  2: 'border-[#a7acb4] bg-[linear-gradient(145deg,#f2f4f6,#aeb4bd)] text-[#4d535b]',
  3: 'border-[#a96b3c] bg-[linear-gradient(145deg,#eab381,#a96839)] text-[#563015]',
} as const

function RankBadge({ rank, featured = false }: { rank: number; featured?: boolean }) {
  if (rank > 3) {
    return <span className="flex h-6 w-6 shrink-0 items-center justify-center text-xs font-extrabold text-[var(--home-ink-3)]">{rank}</span>
  }

  return (
    <span
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full border font-extrabold shadow-sm',
        featured ? 'h-8 w-8 text-xs' : 'h-6 w-6 text-[10px]',
        medalStyles[rank as 1 | 2 | 3],
      )}
    >
      <Crown className={cn('absolute -top-2 fill-current', featured ? 'h-4 w-4' : 'h-3 w-3')} />
      {rank}
    </span>
  )
}

function detailHref(item: HomeRankingItem) {
  return `/detail?bookId=${encodeURIComponent(item.detailId)}`
}

function FeaturedRank({ item }: { item: HomeRankingItem }) {
  return (
    <Link
      href={detailHref(item)}
      className={cn(
        styles.rankGroup,
        'group block border-b border-[var(--home-line)] py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc4452]',
      )}
    >
      <div className="flex items-center gap-2.5">
        <RankBadge rank={1} featured />
        <div className="relative h-[90px] w-[60px] shrink-0 overflow-hidden rounded-md bg-[#e7e4ee] shadow-sm">
          <Image src={item.coverUrl} alt={item.title} fill sizes="60px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-xs font-extrabold text-black">{item.title}</h4>
          <p className="mt-0.5 truncate text-[10px] text-[var(--home-ink-3)]">{item.author}</p>
          <p className="truncate text-[10px] text-[var(--home-ink-3)]">{item.genreLabel} · {item.originLabel}</p>
          <p className="mt-1 text-[13px] font-black text-[var(--home-red-deep)]">{item.value}</p>
        </div>
      </div>
      <div className={styles.rankDetail}>
        <div>
          <p className="pl-[42px] pt-2 text-[10px] leading-relaxed text-[var(--home-ink-3)]">{item.tagline}</p>
        </div>
      </div>
    </Link>
  )
}

function RankingRow({ item, rank }: { item: HomeRankingItem; rank: number }) {
  return (
    <Link
      href={detailHref(item)}
      className={cn(
        styles.rankGroup,
        'group block border-b border-[var(--home-line)] py-[7px] last:border-b-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc4452]',
      )}
    >
      <div className="flex items-center gap-2">
        <RankBadge rank={rank} />
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-black">{item.title}</span>
        <span className="shrink-0 text-[11px] font-bold text-[var(--home-red-deep)]">{item.value}</span>
      </div>
      <div className={styles.rankDetail}>
        <div>
          <div className="flex gap-2.5 pl-8 pt-2">
            <div className="relative h-[66px] w-11 shrink-0 overflow-hidden rounded bg-[#e7e4ee]">
              <Image src={item.coverUrl} alt="" fill sizes="44px" className="object-cover" />
            </div>
            <div className="min-w-0 pt-0.5 text-[10px] text-[var(--home-ink-3)]">
              <p className="truncate">{item.author}</p>
              <p className="truncate">{item.genreLabel} · {item.originLabel}</p>
              <p className="mt-1 line-clamp-2 leading-relaxed">{item.tagline}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function RankingTables({ columns }: { columns: HomeRankingColumn[] }) {
  return (
    <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
      {columns.map((column) => {
        const Icon = columnIcons[column.id]
        const [featured, ...rows] = column.items
        return (
          <section key={column.id} aria-label={column.title} className="min-w-0">
            <h3 className="mb-2.5 flex items-center gap-1.5 px-0.5 text-sm font-bold text-black">
              <Icon className="h-4 w-4 text-[var(--home-red-deep)]" />
              {column.title}
            </h3>
            <div className="min-h-[362px] rounded-[14px] border border-[var(--home-line)] bg-white px-4 py-3.5">
              {featured ? (
                <>
                  <FeaturedRank item={featured} />
                  {rows.map((item, index) => (
                    <RankingRow key={item.id} item={item} rank={index + 2} />
                  ))}
                </>
              ) : (
                <div className="grid min-h-[330px] place-items-center text-xs text-[var(--home-ink-3)]">ไม่มีข้อมูลในหมวดนี้</div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
