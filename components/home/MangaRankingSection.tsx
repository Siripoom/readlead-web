'use client'

import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Genre, Work } from '@/lib/types'
import { GENRE_LABELS } from '@/lib/mock-data'
import { RankingList } from '@/components/home/RankingList'

interface Props {
  works: Work[]
}

export function MangaRankingSection({ works }: Props) {
  const availableGenres = Array.from(new Set(works.flatMap(work => work.genres))) as Genre[]
  const [activeGenre, setActiveGenre] = useState<Genre | 'all'>('all')

  const rankedWorks = works
    .filter(work => activeGenre === 'all' || work.genres.includes(activeGenre))
    .sort((left, right) => right.rankingScore - left.rankingScore)

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveGenre('all')}
          className={cn(
            buttonVariants({ variant: activeGenre === 'all' ? 'default' : 'outline', size: 'sm' }),
            'rounded-full px-4',
          )}
        >
          ทั้งหมด
        </button>
        {availableGenres.map(genre => (
          <button
            key={genre}
            type="button"
            onClick={() => setActiveGenre(genre)}
            className={cn(
              buttonVariants({ variant: activeGenre === genre ? 'default' : 'outline', size: 'sm' }),
              'rounded-full px-4',
            )}
          >
            {GENRE_LABELS[genre]}
          </button>
        ))}
      </div>

      <RankingList
        title="มังงะยอดนิยม"
        chineseTitle="人气榜"
        works={rankedWorks}
        statLabel="นิยม"
        statVariant="popularity"
        actionHref="/discover"
      />
    </section>
  )
}
