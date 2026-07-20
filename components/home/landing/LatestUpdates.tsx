'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { HomeLatestUpdate } from '@/lib/home-landing-data'

const INITIAL_COUNT = 6
const EXPANDED_COUNT = 26

function normalizedDate(value: string) {
  if (value.includes('T')) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('th-TH', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'Asia/Bangkok',
      }).format(date)
    }
  }
  const [date, time = ''] = value.split(' ')
  const [day, month, year] = date.split('-')
  return `${year}-${month}-${day}${time ? ` ${time}` : ''}`
}

function UpdateCover({ item }: { item: HomeLatestUpdate }) {
  const [coverFailed, setCoverFailed] = useState(false)
  return (
    <div
      className="relative h-[120px] w-20 shrink-0 overflow-hidden rounded-[11px] shadow-sm sm:h-[135px] sm:w-[90px]"
      style={{ background: item.gradient }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_24%,rgba(255,255,255,0.42),transparent_28%),linear-gradient(to_top,rgba(40,20,50,0.22),transparent_55%)] transition-transform duration-300 group-hover:scale-105" />
      {item.coverUrl && !coverFailed && (
        <Image
          unoptimized
          fill
          sizes="(max-width: 640px) 80px, 90px"
          src={item.coverUrl}
          alt={`ภาพปก ${item.title}`}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setCoverFailed(true)}
        />
      )}
    </div>
  )
}

function UpdateCard({ item }: { item: HomeLatestUpdate }) {
  return (
    <Link
      href={`/detail?bookId=${encodeURIComponent(item.detailId)}`}
      className="group flex gap-4 rounded-2xl border border-[var(--home-line)] bg-white p-3.5 transition hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(80,60,140,0.10)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc4452] sm:p-4"
    >
      <UpdateCover item={item} />
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="truncate text-[15px] font-bold text-[var(--home-ink)] sm:text-base">{item.title}</h3>
        <p className="mt-0.5 text-xs text-[var(--home-ink-2)] sm:text-[13px]">{item.author}</p>
        <p className="mt-1.5 text-[11px] text-[var(--home-ink-2)] sm:text-xs">{item.genreLabel} · {item.originLabel === 'แปล' ? 'แปล' : 'ไทย'}</p>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--home-ink-3)] sm:text-[13px]">{item.description}</p>
        <p className="mt-auto truncate pt-2 text-[10px] text-[var(--home-ink-3)] sm:text-[11px]">
          <span className="mr-1 font-semibold text-[var(--home-ink-2)]">อัปเดตล่าสุด</span>
          ตอนที่ {item.episode} {item.episodeTitle} · {normalizedDate(item.updatedAt)}
        </p>
      </div>
    </Link>
  )
}

export function LatestUpdates({ items }: { items: HomeLatestUpdate[] }) {
  const [expanded, setExpanded] = useState(false)
  const visibleItems = items.slice(0, expanded ? EXPANDED_COUNT : INITIAL_COUNT)

  return (
    <div>
      {visibleItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-2">
          {visibleItems.map((item) => <UpdateCard key={item.id} item={item} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--home-line)] bg-[var(--home-soft)] px-6 py-10 text-center text-sm text-[var(--home-ink-2)]">
          ไม่พบรายการอัปเดตในหมวดนี้
        </div>
      )}

      {items.length > INITIAL_COUNT && (
        <div className="mt-5 text-center">
          {expanded ? (
            <Link href="/discover" className="inline-flex px-5 py-2.5 text-sm font-semibold text-[var(--home-ink-2)] transition hover:text-[var(--home-red)]">
              ดูทั้งหมด
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="px-5 py-2.5 text-sm font-semibold text-[var(--home-ink-2)] transition hover:text-[var(--home-red)]"
            >
              ดูเพิ่มเติม
            </button>
          )}
        </div>
      )}
    </div>
  )
}
