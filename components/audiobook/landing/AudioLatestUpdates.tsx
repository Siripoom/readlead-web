'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { AudioLatestUpdate } from '@/lib/audiobook-landing-data'
import { AudioBookGrid } from './AudioBookGrid'

const INITIAL_COUNT = 12
const LOAD_COUNT = 24

export function AudioLatestUpdates({ items }: { items: AudioLatestUpdate[] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT)
  const visibleItems = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length

  return (
    <div>
      <AudioBookGrid items={visibleItems} emptyLabel="ไม่พบหนังสือเสียงอัปเดตในหมวดนี้" />

      {items.length > INITIAL_COUNT && (
        <div className="mt-5 text-center">
          {hasMore ? (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => Math.min(count + LOAD_COUNT, items.length))}
              className="px-5 py-2.5 text-sm font-semibold text-[var(--home-ink-2)] transition hover:text-[#cc4452]"
            >
              ดูเพิ่มเติม
            </button>
          ) : (
            <Link href="/discover" className="inline-flex px-5 py-2.5 text-sm font-semibold text-[var(--home-ink-2)] transition hover:text-[#cc4452]">
              ดูทั้งหมด
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
