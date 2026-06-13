import Link from 'next/link'
import { CalendarDays, ChevronRight, Eye, Ticket, TrendingUp } from 'lucide-react'
import { HeroSlider } from '@/components/home/HeroSlider'
import { HomePromotionCards } from '@/components/home/HomePromotionCards'
import {
  MOCK_WORKS,
  MOCK_HOME_PROMOTION_SLIDES,
  MOCK_HOME_UPDATES,
} from '@/lib/mock-data'
import type { Work } from '@/lib/types'
import { MedalDefs } from './MedalDefs'
import { PopularStrip } from './PopularStrip'
import { RankingTables, type RankingTableData } from './RankingTables'
import { RecommendedGrid } from './RecommendedGrid'
import { LatestUpdates } from './LatestUpdates'
import { formatCompact, formatGrouped } from './format'

function SectionHead({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-5 flex items-baseline gap-3">
      <h2 className="text-2xl font-black text-black">{title}</h2>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-rl-red-deep hover:underline"
        >
          ดูเพิ่มเติม <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}

function sortBy(works: Work[], selector: (w: Work) => number) {
  return [...works].sort((a, b) => selector(b) - selector(a)).slice(0, 10)
}

function buildTable(
  heading: string,
  icon: React.ReactNode,
  works: Work[],
  format: (w: Work) => string,
  suffix: string,
): RankingTableData {
  return {
    heading,
    icon,
    items: works.map((work, i) => ({
      work,
      value: i === 0 ? `${format(work)} ${suffix}` : format(work),
    })),
  }
}

export function HomeLanding() {
  const heroSlides = MOCK_HOME_PROMOTION_SLIDES.map((slide) => ({
    ...slide,
    banners: slide.banners.slice(0, 1),
  })).filter((slide) => slide.banners.length > 0)

  const popular = sortBy(MOCK_WORKS, (w) => w.viewCount)

  const tables: RankingTableData[] = [
    buildTable(
      'ตั๋วรายวัน',
      <Ticket />,
      sortBy(MOCK_WORKS, (w) => w.weeklyVoteCount),
      (w) => formatGrouped(w.weeklyVoteCount),
      'ตั๋ว',
    ),
    buildTable(
      'ตั๋วรายเดือน',
      <CalendarDays />,
      sortBy(MOCK_WORKS, (w) => w.voteCount),
      (w) => formatGrouped(w.voteCount),
      'ตั๋ว',
    ),
    buildTable(
      'ยอดดู',
      <Eye />,
      sortBy(MOCK_WORKS, (w) => w.viewCount),
      (w) => formatCompact(w.viewCount),
      'ครั้ง',
    ),
    buildTable(
      'อันดับเรื่องใหม่',
      <TrendingUp />,
      sortBy(MOCK_WORKS, (w) => Date.parse(w.updatedAt)),
      (w) => formatCompact(w.readCount),
      'วิว',
    ),
  ]

  const recommended = [...MOCK_WORKS]
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.rating - a.rating)
    .slice(0, 6)

  return (
    <div className="bg-white pb-12">
      <MedalDefs />

      {/* Hero + activity row */}
      <div className="pt-8">
        <HeroSlider slides={heroSlides} />
      </div>
      <div className="mx-auto mt-[18px] max-w-[1200px] px-6">
        <HomePromotionCards slides={MOCK_HOME_PROMOTION_SLIDES} />
      </div>

      {/* ความนิยมสูงสุด */}
      <section className="mx-auto max-w-[1200px] px-6 pt-12">
        <SectionHead title="ความนิยมสูงสุด" href="/ranking" />
        <PopularStrip works={popular} />
      </section>

      {/* อันดับรวมยอดนิยมสูงสุด */}
      <section className="mx-auto max-w-[1200px] px-6 pt-12">
        <SectionHead title="อันดับรวมยอดนิยมสูงสุด" href="/ranking" />
        <RankingTables tables={tables} />
      </section>

      {/* แนะนำสำหรับคุณ */}
      <section className="mx-auto max-w-[1200px] px-6 pt-12">
        <SectionHead title="แนะนำสำหรับคุณ" href="/discover" />
        <RecommendedGrid works={recommended} />
      </section>

      {/* อัปเดตล่าสุด */}
      <section className="mx-auto max-w-[1200px] px-6 pt-12">
        <SectionHead title="อัปเดตล่าสุด" />
        <LatestUpdates items={MOCK_HOME_UPDATES} />
      </section>
    </div>
  )
}
