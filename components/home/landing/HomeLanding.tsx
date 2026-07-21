import { ActiveGenreChip } from '@/components/home/ActiveGenreChip'
import { HOME_ACTIVITY_CARDS } from '@/lib/home-landing-data'
import type { HomeCmsCatalog, HomeLatestCatalogResult, HomeRankingCatalogResult } from '@/lib/home-catalog'
import type { HomeHeroCatalog } from '@/lib/home-hero-catalog'
import type { Genre } from '@/lib/types'
import { ActivityPromos } from './ActivityPromos'
import { CmsBannerCarousel } from './CmsBannerCarousel'
import { HomeBookStrip } from './HomeBookStrip'
import { HomeHero } from './HomeHero'
import { LatestUpdates } from './LatestUpdates'
import { LandingSectionHeading } from './LandingSectionHeading'
import { LimitedTimeCarousel } from './LimitedTimeCarousel'
import { RankingTables } from './RankingTables'
import styles from './HomeLanding.module.css'

function hasGenre(genreKeys: Genre[], activeGenre: Genre | null) {
  return !activeGenre || genreKeys.includes(activeGenre)
}

export function HomeLanding({
  activeGenre = null,
  hero,
  cms,
  latest,
  ranking,
}: {
  activeGenre?: string | null
  hero: HomeHeroCatalog
  cms: HomeCmsCatalog
  latest: HomeLatestCatalogResult
  ranking: HomeRankingCatalogResult
}) {
  const genre = activeGenre as Genre | null
  const popular = ranking.popular.filter((item) => hasGenre(item.genreKeys, genre))
  const recommended = cms.recommendedBooks.filter((item) => hasGenre(item.genreKeys, genre))
  const rankings = ranking.rankings.map((column) => ({
    ...column,
    items: column.items.filter((item) => hasGenre(item.genreKeys, genre)),
  }))
  const updates = latest.items.filter((item) => hasGenre(item.genreKeys, genre))
  const recommendBannerColumns = cms.recommendBanners.filter((items) => items.length > 0)
  const showRecommended = recommendBannerColumns.length > 0 || recommended.length > 0
  const recommendGridClass = recommendBannerColumns.length === 1
    ? 'grid-cols-1'
    : recommendBannerColumns.length === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-3'

  return (
    <div className={`${styles.root} pb-4 sm:pb-8`}>
      <HomeHero slides={hero.slides} slideSeconds={hero.slideSeconds} />

      <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
        <div className="mt-6">
          <ActivityPromos cards={HOME_ACTIVITY_CARDS} />
        </div>

        {activeGenre && (
          <div className="mt-8 rounded-xl border border-[var(--home-line)] bg-[var(--home-soft)] px-4 py-3">
            <ActiveGenreChip genre={activeGenre} clearHref="/" />
          </div>
        )}

        {cms.limitedOffers.length > 0 && <section className="mt-10">
          <LandingSectionHeading title="จำกัดเวลาพิเศษ" href="/discover" />
          <LimitedTimeCarousel items={cms.limitedOffers} />
        </section>}

        <section className="mt-10">
          <LandingSectionHeading title="ความนิยมสูงสุด" href="/ranking" />
          {ranking.error
            ? <div role="alert" className="rounded-2xl border border-dashed border-[#e8c9cf] bg-[#fff7f8] px-6 py-10 text-center text-sm text-[var(--home-red-deep)]">{ranking.error}</div>
            : <HomeBookStrip items={popular} variant="popular" />}
        </section>

        {cms.act3.length > 0 && <section className="mt-10">
          <CmsBannerCarousel items={cms.act3} aspect="1180 / 247" slideSeconds={cms.slideSeconds} label="แบนเนอร์กิจกรรมเหนือจัดอันดับรวม" />
        </section>}

        <section className="mt-10">
          <LandingSectionHeading title="จัดอันดับรวม" href="/ranking" />
          {ranking.error
            ? <div role="alert" className="rounded-2xl border border-dashed border-[#e8c9cf] bg-[#fff7f8] px-6 py-10 text-center text-sm text-[var(--home-red-deep)]">{ranking.error}</div>
            : <RankingTables columns={rankings} />}
        </section>

        {cms.act4.length > 0 && <section className="mt-10">
          <CmsBannerCarousel items={cms.act4} aspect="1180 / 247" slideSeconds={cms.slideSeconds} label="แบนเนอร์กิจกรรมใต้จัดอันดับรวม" />
        </section>}

        {showRecommended && <section className="mt-10">
          <LandingSectionHeading title="แนะนำสำหรับคุณ" href="/discover" />
          {recommendBannerColumns.length > 0 && <div className={`mb-[22px] grid gap-[18px] ${recommendGridClass}`}>
            {recommendBannerColumns.map((items, index) => (
              <CmsBannerCarousel key={items.map((item) => item.id).join(':')} items={items} aspect="372 / 174" slideSeconds={cms.slideSeconds} label={`แบนเนอร์แนะนำสำหรับคุณ ${index + 1}`} />
            ))}
          </div>}
          {recommended.length > 0 && <HomeBookStrip items={recommended} variant="recommended" />}
        </section>}

        <section className="mt-10" id="latest">
          <LandingSectionHeading title="อัปเดตล่าสุด" href="/discover" />
          <LatestUpdates key={activeGenre ?? 'all'} items={updates} error={latest.error} />
        </section>
      </div>
    </div>
  )
}
