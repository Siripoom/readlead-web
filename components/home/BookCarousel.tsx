'use client'

import { RankingList, type RankingStatVariant } from '@/components/home/RankingList'
import type { Work } from '@/lib/types'

interface Props {
  title: string
  chineseTitle?: string
  statLabel: string
  statVariant: RankingStatVariant
  works: Work[]
  actionHref?: string
}

export function BookCarousel({ title, chineseTitle, statLabel, statVariant, works, actionHref }: Props) {
  return (
    <RankingList
      title={title}
      chineseTitle={chineseTitle}
      works={works}
      statLabel={statLabel}
      statVariant={statVariant}
      actionHref={actionHref}
    />
  )
}
