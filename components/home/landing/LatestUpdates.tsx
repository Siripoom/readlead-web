'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContentType, HomeUpdateItem } from '@/lib/types'

const BATCH = 12

const CHIPS: { label: string; value: ContentType | 'all' }[] = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'นิยาย', value: 'novel' },
  { label: 'หนังสือเสียง', value: 'audiobook' },
  { label: 'มังงะ', value: 'manga' },
]

function UpdateCard({ item }: { item: HomeUpdateItem }) {
  return (
    <Link
      href="/discover"
      className="flex items-start gap-3.5 rounded-[14px] border border-rl-line bg-white p-3.5 transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(230,57,80,0.12)]"
    >
      <div className="relative h-[130px] w-[100px] shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-rl-cream-deep to-rl-pink">
        <Image src={item.coverUrl} alt={item.title} fill sizes="100px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-bold text-black">{item.title}</div>
        <div className="mb-1.5 text-xs text-rl-ink-soft">{item.author}</div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded bg-rl-cream-deep px-2 py-0.5 text-[11px] font-bold text-rl-red-deep">{item.genreLabel}</span>
          <span className="rounded bg-rl-cream-deep px-2 py-0.5 text-[11px] font-bold text-rl-red-deep">{item.originLabel}</span>
        </div>
        <p className="mt-1.5 line-clamp-3 text-[13px] text-rl-ink-soft">{item.description}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-rl-ink-soft">
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {item.views}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {item.episodeLabel}
          </span>
          <span className="font-semibold text-rl-red-deep">{item.updatedAtLabel}</span>
        </div>
      </div>
    </Link>
  )
}

export function LatestUpdates({ items }: { items: HomeUpdateItem[] }) {
  const [filter, setFilter] = useState<ContentType | 'all'>('all')
  const [visible, setVisible] = useState(BATCH)

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.type === filter)),
    [items, filter],
  )
  const shown = filtered.slice(0, visible)
  const hasMore = visible < filtered.length

  function selectFilter(value: ContentType | 'all') {
    setFilter(value)
    setVisible(BATCH)
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2.5">
        {CHIPS.map((chip) => {
          const active = filter === chip.value
          return (
            <button
              key={chip.value}
              type="button"
              onClick={() => selectFilter(chip.value)}
              className={cn(
                'rounded-full border-[1.5px] px-[18px] py-[7px] text-[13px] font-semibold transition',
                active
                  ? 'border-rl-red bg-rl-red text-white'
                  : 'border-rl-line bg-white text-rl-ink-soft hover:border-rl-red hover:bg-rl-red hover:text-white',
              )}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        {shown.map((item) => (
          <UpdateCard key={item.id} item={item} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-7 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + BATCH)}
            className="rounded-full border-[1.5px] border-rl-red bg-white px-10 py-3 text-sm font-bold text-rl-red-deep transition hover:bg-rl-red hover:text-white"
          >
            แสดงเพิ่มเติม
          </button>
        </div>
      )}
    </div>
  )
}
