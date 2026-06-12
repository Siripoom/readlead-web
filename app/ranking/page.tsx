'use client'

import { useState } from 'react'
import { PopularRankingLayout } from '@/components/ranking/PopularRankingLayout'
import { NovelRankingSection } from '@/components/NovelRankingSection'
import {
  POPULAR_SIDEBAR_ITEMS,
  MOCK_POPULAR_RANKING,
  MOCK_NOVEL_RANKING_TOP,
} from '@/lib/mock-data'

export default function RankingPage() {
  const [activeSidebar, setActiveSidebar] = useState(POPULAR_SIDEBAR_ITEMS[0].id)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <PopularRankingLayout
        sidebarTitle="รายการความนิยม"
        sidebarItems={POPULAR_SIDEBAR_ITEMS}
        activeSidebarId={activeSidebar}
        rankingItems={MOCK_POPULAR_RANKING}
        onSidebarChange={setActiveSidebar}
        topContent={
          <NovelRankingSection
            title="อันดับนิยายยอดนิยม"
            books={MOCK_NOVEL_RANKING_TOP}
          />
        }
      />
    </div>
  )
}
