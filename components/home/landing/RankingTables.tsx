import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CONTENT_TYPE_LABELS } from '@/lib/content-types'
import { GENRE_LABELS } from '@/lib/mock-data'
import type { Work } from '@/lib/types'
import { Medal } from './MedalDefs'

export interface RankingTableItem {
  work: Work
  value: string
}

export interface RankingTableData {
  heading: string
  icon: ReactNode
  items: RankingTableItem[]
}

function metaOf(work: Work) {
  return `${CONTENT_TYPE_LABELS[work.type]} · ${GENRE_LABELS[work.genres[0]] ?? work.genres[0]}`
}

function Row({ work, value, rank }: { work: Work; value: string; rank: number }) {
  return (
    <Link
      href={`/detail/${work.id}`}
      className="group/row relative flex flex-wrap items-center gap-2 border-b border-rl-line py-[7px] last:border-b-0"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-xs font-extrabold text-rl-ink-soft">
        {rank <= 3 ? <Medal rank={rank as 1 | 2 | 3} className="h-6 w-6 drop-shadow-sm" /> : rank}
      </span>
      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-black">{work.title}</span>
      <span className="shrink-0 text-[11px] font-semibold text-rl-ink-soft">{value}</span>

      {/* hover-expand */}
      <div className="flex max-h-0 w-full items-center gap-2.5 overflow-hidden pl-8 opacity-0 transition-all duration-300 group-hover/row:max-h-24 group-hover/row:py-1.5 group-hover/row:opacity-100">
        <div className="relative h-[66px] w-12 shrink-0 overflow-hidden rounded-md bg-rl-cream-deep">
          <Image src={work.coverUrl} alt="" fill sizes="48px" className="object-cover" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="text-[11px] text-rl-ink-soft">{work.authorName}</div>
          <span className="w-fit rounded-full bg-rl-cream-deep px-2 py-0.5 text-[10px] font-bold text-rl-red-deep">
            {metaOf(work)}
          </span>
        </div>
      </div>
    </Link>
  )
}

function Table({ table }: { table: RankingTableData }) {
  const [feature, ...rest] = table.items
  return (
    <div className="min-w-0 rounded-[14px] bg-white py-3 pl-4 pr-3">
      <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-bold text-black">
        <span className="text-rl-red-deep [&>svg]:h-4 [&>svg]:w-4">{table.icon}</span>
        {table.heading}
      </h3>

      {feature && (
        <Link
          href={`/detail/${feature.work.id}`}
          className="relative mb-2.5 flex items-start gap-2 pl-2"
        >
          <div className="relative h-[100px] w-[72px] shrink-0 rounded-md bg-rl-cream-deep">
            <span className="absolute -left-2.5 -top-2.5 z-[2] h-[34px] w-[34px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
              <Medal rank={1} className="h-full w-full" />
            </span>
            <Image
              src={feature.work.coverUrl}
              alt={feature.work.title}
              fill
              sizes="72px"
              className="rounded-md object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 pt-[22px]">
            <div className="mb-0.5 truncate text-xs font-extrabold text-black">{feature.work.title}</div>
            <div className="mb-0.5 truncate text-[10px] text-rl-ink-soft">{feature.work.authorName}</div>
            <div className="mb-1 truncate text-[10px] text-rl-ink-soft">{metaOf(feature.work)}</div>
            <div className="text-[13px] font-black text-rl-red-deep">{feature.value}</div>
          </div>
        </Link>
      )}

      {rest.map((item, i) => (
        <Row key={item.work.id} work={item.work} value={item.value} rank={i + 2} />
      ))}
    </div>
  )
}

export function RankingTables({ tables }: { tables: RankingTableData[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {tables.map((table) => (
        <Table key={table.heading} table={table} />
      ))}
    </div>
  )
}
