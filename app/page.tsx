import { HeroSlider } from '@/components/home/HeroSlider'
import { HomePromotionCards } from '@/components/home/HomePromotionCards'
import { HomeContentTypeSelector } from '@/components/home/HomeContentTypeSelector'
import { BookCarousel } from '@/components/home/BookCarousel'
import { RankingList } from '@/components/home/RankingList'
import { MangaRankingSection } from '@/components/home/MangaRankingSection'
import OrnamentalDivider from '@/components/shared/OrnamentalDivider'
import { MOCK_HOME_PROMOTION_SLIDES, MOCK_WORKS } from '@/lib/mock-data'
import { CONTENT_TYPE_LABELS, parseHomeContentType } from '@/lib/content-types'
import type { ContentType, Work } from '@/lib/types'

type Props = {
  searchParams: Promise<{ type?: string | string[] }>
}

function getTopWorks(works: Work[], selector: (work: Work) => number) {
  return [...works].sort((left, right) => selector(right) - selector(left)).slice(0, 6)
}

function renderStandardRankingBlocks(works: Work[], typeLabel: string) {
  return (
    <div className="space-y-7">
      <RankingList
        title={`${typeLabel}ยอดดู`}
        chineseTitle="观看榜"
        works={getTopWorks(works, work => work.viewCount)}
        statLabel="ยอดดู"
        statVariant="views"
        actionHref="/discover"
      />
      <RankingList
        title={`${typeLabel}นิยมสูงสุด`}
        chineseTitle="人气榜"
        works={getTopWorks(works, work => work.rankingScore)}
        statLabel="นิยม"
        statVariant="popularity"
        actionHref="/discover"
      />
      <RankingList
        title={`${typeLabel}ยอดเติม VIP`}
        chineseTitle="贵宾充值榜"
        works={getTopWorks(works, work => work.vipTopUpTotal)}
        statLabel="VIP"
        statVariant="vip"
        actionHref="/discover"
      />
    </div>
  )
}

function renderContentSections(activeType: ContentType, works: Work[]) {
  const typeLabel = CONTENT_TYPE_LABELS[activeType]
  const topByReads = getTopWorks(works, work => work.readCount)

  return (
    <>
      <section className="space-y-6">
        <HomeContentTypeSelector activeType={activeType} />

        <BookCarousel
          title={`${typeLabel}น่าอ่านตอนนี้`}
          chineseTitle="本周推荐"
          statLabel="ยอดอ่าน"
          statVariant="reads"
          works={topByReads}
          actionHref="/discover"
        />
      </section>

      <section className="space-y-7">
        {activeType === 'manga' ? (
          <>
            <RankingList
              title="มังงะยอดดู"
              chineseTitle="观看榜"
              works={getTopWorks(works, work => work.viewCount)}
              statLabel="ยอดดู"
              statVariant="views"
              actionHref="/discover"
            />
            <MangaRankingSection works={works} />
            <RankingList
              title="มังงะยอดเติม VIP"
              chineseTitle="贵宾充值榜"
              works={getTopWorks(works, work => work.vipTopUpTotal)}
              statLabel="VIP"
              statVariant="vip"
              actionHref="/discover"
            />
          </>
        ) : (
          renderStandardRankingBlocks(works, typeLabel)
        )}
      </section>
    </>
  )
}

export default async function HomePage({ searchParams }: Props) {
  const { type } = await searchParams
  const activeType = parseHomeContentType(type)
  const filteredWorks = MOCK_WORKS.filter(work => work.type === activeType)
  const heroSlides = MOCK_HOME_PROMOTION_SLIDES
    .map(slide => ({
      ...slide,
      banners: slide.banners.slice(0, 1),
    }))
    .filter(slide => slide.banners.length > 0)
  const promotionItems = MOCK_HOME_PROMOTION_SLIDES.flatMap(slide => slide.banners.slice(1))

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-6 md:space-y-12">
      <HeroSlider slides={heroSlides} />
      <HomePromotionCards items={promotionItems} />
      <OrnamentalDivider />
      {renderContentSections(activeType, filteredWorks)}
    </main>
  )
}
