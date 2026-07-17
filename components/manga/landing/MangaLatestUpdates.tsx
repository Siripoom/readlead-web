'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { MangaLatestUpdate } from '@/lib/manga-landing-data'
import { MangaBookGrid } from './MangaBookGrid'

const INITIAL_COUNT = 12
const EXPANDED_COUNT = 24

export function MangaLatestUpdates({ items }: { items: MangaLatestUpdate[] }) {
  const [expanded, setExpanded] = useState(false)
  const visibleItems = items.slice(0, expanded ? EXPANDED_COUNT : INITIAL_COUNT)

  return (
    <div>
      <MangaBookGrid items={visibleItems} emptyLabel="ไม่พบมังงะอัปเดตในหมวดนี้" />

      {items.length > INITIAL_COUNT && (
        <div className="mt-5 text-center">
          {expanded ? (
            <Link href="/discover" className="inline-flex px-5 py-2.5 text-sm font-semibold text-[var(--home-ink-2)] transition hover:text-[#cc4452]">
              ดูทั้งหมด
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="px-5 py-2.5 text-sm font-semibold text-[var(--home-ink-2)] transition hover:text-[#cc4452]"
            >
              แสดงเพิ่มเติม
            </button>
          )}
        </div>
      )}
    </div>
  )
}
