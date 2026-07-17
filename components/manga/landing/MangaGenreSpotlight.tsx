'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, ChevronDown, Sparkles } from 'lucide-react'
import type {
  MangaBookItem,
  MangaGenreKey,
  MangaGenreOption,
} from '@/lib/manga-landing-data'
import { cn } from '@/lib/utils'
import { MangaBookGrid } from './MangaBookGrid'

type Props = {
  items: MangaBookItem[]
  primaryOptions: MangaGenreOption[]
  allOptions: MangaGenreOption[]
  activeGenre: MangaGenreKey | null
}

function GenreLink({ option, activeGenre }: { option: MangaGenreOption; activeGenre: MangaGenreKey | null }) {
  const isActive = option.key === activeGenre
  return (
    <Link
      href={`/manga?genre=${option.key}`}
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

export function MangaGenreSpotlight({ items, primaryOptions, allOptions, activeGenre }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div>
      <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_2px_7px_rgba(0,0,0,0.12)]">
        <div className="relative min-h-[228px] overflow-hidden bg-[radial-gradient(130%_150%_at_88%_8%,#f6ecff_0%,rgba(246,236,255,0)_46%),linear-gradient(110deg,#ece1ff_0%,#f1e8ff_30%,#f9ebf4_64%,#ffeef5_100%)] px-6 py-8 sm:px-10">
          <div className="relative z-10 max-w-[680px]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#cc4452]/20 bg-white/75 px-4 py-1.5 text-xs font-semibold text-[#cc4452] sm:text-sm">
              <Sparkles className="h-3.5 w-3.5" /> มังงะดี ๆ ที่รอให้คุณค้นพบ
            </span>
            <h3 className="mt-5 text-[30px] font-extrabold leading-tight text-[#2a2540] sm:text-[40px]">เติมเต็มทุกอารมณ์</h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#6b6580] sm:text-base">
              คัดสรรมังงะคุณภาพ หลากหลายแนว ครบทุกอารมณ์ ให้คุณสนุกได้ไม่รู้จบ
            </p>
          </div>
          <div className="absolute bottom-[-34px] right-[-18px] hidden h-[230px] w-[330px] opacity-80 sm:block" aria-hidden="true">
            <BookOpen className="h-full w-full stroke-[1] text-[#bca7ec]" />
          </div>
        </div>

        <div className="border-t border-[#e0e2e9] bg-white px-3 py-2 sm:px-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 lg:divide-x lg:divide-[#e0e2e9]">
            {primaryOptions.map((option) => (
              <GenreLink key={option.key} option={option} activeGenre={activeGenre} />
            ))}
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
              {allOptions.map((option) => (
                <GenreLink key={option.key} option={option} activeGenre={activeGenre} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <MangaBookGrid items={items} />
      </div>
    </div>
  )
}
