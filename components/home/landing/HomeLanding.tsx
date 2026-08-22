import { ActiveGenreChip } from '@/components/home/ActiveGenreChip'
import { HOME_ACTIVITY_CARDS } from '@/lib/home-landing-data'
import type { HomeCmsCatalog, HomeLatestCatalogResult, HomeRankingCatalogResult } from '@/lib/home-catalog'
import type { HomeHeroCatalog } from '@/lib/home-hero-catalog'
import type { Genre } from '@/lib/types'
import { resolveHomeMobileContent } from '@/lib/home-mobile-mock'
import { ActivityPromos } from './ActivityPromos'
import { CmsBannerCarousel } from './CmsBannerCarousel'
import { HomeBookStrip } from './HomeBookStrip'
import { HomeHero } from './HomeHero'
import { LatestUpdates } from './LatestUpdates'
import { LandingSectionHeading } from './LandingSectionHeading'
import { LimitedTimeCarousel } from './LimitedTimeCarousel'
import { MobileQuickAccess } from './MobileQuickAccess'
import { PicksRail } from './PicksRail'
import { PromoSlotsRail } from './PromoSlotsRail'
import { RankingTables } from './RankingTables'
import styles from './HomeLanding.module.css'

function hasGenre(genreKeys: Genre[], activeGenre: Genre | null) {
  return !activeGenre || genreKeys.includes(activeGenre)
}

const CONTENT_TYPE_RAILS = {
  novel: { title: 'แนะนำนิยาย', href: '/discover?type=novel' },
  manga: { title: 'แนะนำเว็บตูน', href: '/discover?type=manga' },
  audio: { title: 'แนะนำหนังสือเสียง', href: '/discover?type=audiobook' },
} as const

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
  const mobileCms = resolveHomeMobileContent(cms)
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

  const recommendColumnRails = (['novel', 'manga', 'audio'] as const)
    .map((key) => ({ key, items: mobileCms.recommendColumns[key].filter((item) => hasGenre(item.genreKeys, genre)) }))
    .filter((rail) => rail.items.length > 0)
  const hasRecommendColumnRails = recommendColumnRails.length > 0

  const curatedTop = mobileCms.curatedPicks.top.filter((item) => hasGenre(item.genreKeys, genre))
  const curatedBottom = mobileCms.curatedPicks.bottom.filter((item) => hasGenre(item.genreKeys, genre))
  const showEditorsPicksTop = mobileCms.editorsChoice.length > 0 || curatedTop.length > 0
  const promoSlotColumns = mobileCms.promoSlots.filter((items) => items.length > 0)

  return (
    <div data-home-landing className={`${styles.root} pb-2 sm:pb-8`}>
      <HomeHero slides={hero.slides} slideSeconds={hero.slideSeconds} />

      <div className="mx-auto max-w-[480px] px-3 sm:max-w-[1200px] sm:px-6">
        {/* เมนูลัด (มือถือ) */}
        <div className="mt-[18px] sm:hidden">
          <MobileQuickAccess />
        </div>

        {/* แบนเนอร์ข้าง Hero (มือถือ) */}
        {mobileCms.side.length > 0 && (
          <div className="mt-4 sm:hidden">
            <CmsBannerCarousel
              items={mobileCms.side}
              aspect="330 / 296"
              mobileAspect="366 / 113.4"
              slideSeconds={cms.slideSeconds}
              label="แบนเนอร์ข้าง Hero"
            />
          </div>
        )}

        <div className="mt-6 hidden sm:block">
          <ActivityPromos cards={HOME_ACTIVITY_CARDS} />
        </div>

        {activeGenre && (
          <div className="mt-8 rounded-xl border border-[var(--home-line)] bg-[var(--home-soft)] px-4 py-3">
            <ActiveGenreChip genre={activeGenre} clearHref="/" />
          </div>
        )}

        {cms.limitedOffers.length > 0 && <section className="mt-10 hidden sm:block">
          <LandingSectionHeading title="จำกัดเวลาพิเศษ" href="/discover" />
          <LimitedTimeCarousel items={cms.limitedOffers} />
        </section>}

        <section className="mt-10 hidden sm:block">
          <LandingSectionHeading title="ความนิยมสูงสุด" href="/ranking" />
          {ranking.error
            ? <div role="alert" className="rounded-2xl border border-dashed border-[#e8c9cf] bg-[#fff7f8] px-6 py-10 text-center text-sm text-[var(--home-red-deep)]">{ranking.error}</div>
            : <HomeBookStrip items={popular} variant="popular" />}
        </section>

        {/* นิยาย / เว็บตูน / หนังสือเสียง (มือถือ) */}
        {hasRecommendColumnRails && (
          <section className="mt-6 flex flex-col gap-6 sm:hidden">
            {recommendColumnRails.map((rail) => (
              <div key={rail.key}>
                <LandingSectionHeading title={CONTENT_TYPE_RAILS[rail.key].title} href={CONTENT_TYPE_RAILS[rail.key].href} allLabel="ดูทั้งหมด" />
                <HomeBookStrip items={rail.items} variant="compact" />
              </div>
            ))}
          </section>
        )}

        {cms.act3.length > 0 && <section className="mt-10 hidden sm:block">
          <CmsBannerCarousel items={cms.act3} aspect="1180 / 247" slideSeconds={cms.slideSeconds} label="แบนเนอร์กิจกรรมเหนือจัดอันดับรวม" />
        </section>}

        <section className="mt-10 hidden sm:block">
          <LandingSectionHeading title="จัดอันดับรวม" href="/ranking" />
          {ranking.error
            ? <div role="alert" className="rounded-2xl border border-dashed border-[#e8c9cf] bg-[#fff7f8] px-6 py-10 text-center text-sm text-[var(--home-red-deep)]">{ranking.error}</div>
            : <RankingTables columns={rankings} />}
        </section>

        {cms.act4.length > 0 && <section className="mt-10 hidden sm:block">
          <CmsBannerCarousel items={cms.act4} aspect="1180 / 247" slideSeconds={cms.slideSeconds} label="แบนเนอร์กิจกรรมใต้จัดอันดับรวม" />
        </section>}

        {showRecommended && <section className="mt-10 hidden sm:block">
          <LandingSectionHeading title="แนะนำสำหรับคุณ" href="/discover" />
          {recommendBannerColumns.length > 0 && <div className={`mb-[22px] grid gap-[18px] ${recommendGridClass}`}>
            {recommendBannerColumns.map((items, index) => (
              <CmsBannerCarousel key={items.map((item) => item.id).join(':')} items={items} aspect="372 / 174" slideSeconds={cms.slideSeconds} label={`แบนเนอร์แนะนำสำหรับคุณ ${index + 1}`} />
            ))}
          </div>}
          {recommended.length > 0 && <HomeBookStrip items={recommended} variant="recommended" />}
        </section>}

        {/* บทบรรณาธิการพิเศษสำหรับคุณ — บนสุด (มือถือ) */}
        {showEditorsPicksTop && (
          <section className="mt-6 sm:hidden">
            <LandingSectionHeading title="คัดสรรพิเศษสำหรับคุณ" href="/discover" />
            <div className="flex flex-col gap-3.5">
              {mobileCms.editorsChoice.length > 0 && (
                <CmsBannerCarousel
                  items={mobileCms.editorsChoice}
                  aspect="452 / 172"
                  mobileAspect="366 / 139"
                  slideSeconds={cms.slideSeconds}
                  label="แบนเนอร์คัดสรรพิเศษสำหรับคุณ"
                />
              )}
              {curatedTop.length > 0 && <PicksRail items={curatedTop} />}
            </div>
          </section>
        )}

        {/* โปรโมชั่นพิเศษ (มือถือ) */}
        {promoSlotColumns.length > 0 && (
          <section className="mt-6 sm:hidden">
            <PromoSlotsRail items={mobileCms.promoSlots} slideSeconds={cms.slideSeconds} />
          </section>
        )}

        {/* บทบรรณาธิการพิเศษสำหรับคุณ — ล่างสุด (มือถือ) */}
        {curatedBottom.length > 0 && (
          <section className="mt-[26px] sm:hidden">
            <PicksRail items={curatedBottom} />
          </section>
        )}

        <section className="mt-10 hidden sm:block" id="latest">
          <LandingSectionHeading title="อัปเดตล่าสุด" href="/discover" />
          <LatestUpdates key={activeGenre ?? 'all'} items={updates} error={latest.error} />
        </section>
      </div>
    </div>
  )
}
