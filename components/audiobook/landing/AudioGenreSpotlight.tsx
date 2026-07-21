'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { CmsBannerCarousel } from '@/components/home/landing/CmsBannerCarousel'
import type { CmsBanner } from '@/lib/cms-catalog'
import type {
  AudioBookItem,
  AudioGenreKey,
  AudioGenreOption,
} from '@/lib/audiobook-landing-data'
import { cn } from '@/lib/utils'
import { AudioBookGrid } from './AudioBookGrid'

type Props = {
  items: AudioBookItem[]
  primaryOptions: AudioGenreOption[]
  allOptions: AudioGenreOption[]
  activeGenre: AudioGenreKey | null
  banners: CmsBanner[]
  slideSeconds: number
}

function GenreLink({ option, activeGenre }: { option: AudioGenreOption; activeGenre: AudioGenreKey | null }) {
  const isActive = option.key === activeGenre
  return (
    <Link
      href={`/audiobook?genre=${option.key}`}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex min-h-11 items-center justify-center rounded-lg px-2 text-center text-sm font-semibold text-[#3f3a55] transition hover:bg-[#f7f4fc] hover:text-[#cc4452] focus-visible:outline-2 focus-visible:outline-[#7355df]',
        isActive && 'bg-[#fdf0f2] text-[#cc4452]',
      )}
    >
      {option.label}
    </Link>
  )
}

export function AudioGenreSpotlight({ items, primaryOptions, allOptions, activeGenre, banners, slideSeconds }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div>
      {banners.length > 0 && (
        <div className="mb-4">
          <CmsBannerCarousel items={banners} aspect="1152 / 228" slideSeconds={slideSeconds} label="เติมเต็มทุกอารมณ์" />
        </div>
      )}
      <div className="overflow-hidden rounded-[18px] border border-[#e0e2e9] bg-white shadow-[0_2px_7px_rgba(0,0,0,0.08)]">
        <div className="bg-white px-3 py-2 sm:px-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 lg:divide-x lg:divide-[#e0e2e9]">
            {primaryOptions.map((option) => <GenreLink key={option.key} option={option} activeGenre={activeGenre} />)}
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded((expanded) => !expanded)}
              className="col-span-2 flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-bold text-[#3a3650] transition hover:bg-[#f7f4fc] hover:text-[#cc4452] focus-visible:outline-2 focus-visible:outline-[#7355df] sm:col-span-2 lg:col-span-1"
            >
              ดูหมวดหมู่ทั้งหมด
              <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
            </button>
          </div>
          {isExpanded && (
            <div className="grid grid-cols-2 gap-1 border-t border-[#e0e2e9] px-1 py-4 sm:grid-cols-3 lg:grid-cols-7">
              {allOptions.map((option) => <GenreLink key={option.key} option={option} activeGenre={activeGenre} />)}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6"><AudioBookGrid items={items} /></div>
    </div>
  )
}
