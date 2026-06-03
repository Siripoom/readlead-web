'use client'

import { useState } from 'react'
import { PopularRankingLayout } from '@/components/ranking/PopularRankingLayout'
import {
  POPULAR_SIDEBAR_ITEMS,
  MOCK_POPULAR_FEATURED,
  MOCK_POPULAR_RANKING,
  MOCK_POPULAR_SECTIONS,
} from '@/lib/mock-data'

export default function RankingPage() {
  const [activeSidebar, setActiveSidebar] = useState(POPULAR_SIDEBAR_ITEMS[0].id)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <PopularRankingLayout
        sidebarTitle="รายการความนิยม"
        sidebarItems={POPULAR_SIDEBAR_ITEMS}
        activeSidebarId={activeSidebar}
        featuredItem={MOCK_POPULAR_FEATURED}
        rankingItems={MOCK_POPULAR_RANKING}
        bottomSections={MOCK_POPULAR_SECTIONS}
        onSidebarChange={setActiveSidebar}
      />
    </div>
  )
}
