import { ActiveGenreChip } from '@/components/home/ActiveGenreChip'
import type { HomeCmsCatalog } from '@/lib/home-catalog'
import type { HomeHeroCatalog } from '@/lib/home-hero-catalog'
import type { Genre } from '@/lib/types'
import { resolveHomeMobileContent } from '@/lib/home-mobile-mock'
import { CmsBannerCarousel } from './CmsBannerCarousel'
import { HomeBookStrip } from './HomeBookStrip'
import { HomeHero } from './HomeHero'
import { LandingSectionHeading } from './LandingSectionHeading'
import { MobileQuickAccess } from './MobileQuickAccess'
import { PicksRail } from './PicksRail'
import { PromoSlotsRail } from './PromoSlotsRail'
import { DesktopHomeLanding } from './DesktopHomeLanding'
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
}: {
  activeGenre?: string | null
  hero: HomeHeroCatalog
  cms: HomeCmsCatalog
}) {
  const genre = activeGenre as Genre | null
  const mobileCms = resolveHomeMobileContent(cms)
  const recommendColumnRails = (['novel', 'manga', 'audio'] as const)
    .map((key) => ({ key, items: mobileCms.recommendColumns[key].filter((item) => hasGenre(item.genreKeys, genre)) }))
    .filter((rail) => rail.items.length > 0)
  const hasRecommendColumnRails = recommendColumnRails.length > 0

  const curatedTop = mobileCms.curatedPicks.top.filter((item) => hasGenre(item.genreKeys, genre))
  const curatedBottom = mobileCms.curatedPicks.bottom.filter((item) => hasGenre(item.genreKeys, genre))
  const showEditorsPicksTop = mobileCms.editorsChoice.length > 0 || curatedTop.length > 0
  const promoSlotColumns = mobileCms.promoSlots.filter((items) => items.length > 0)

  return (
    <div data-home-landing className={styles.root}>
      <DesktopHomeLanding cms={cms} activeGenre={activeGenre} />
      <div className="pb-2 sm:hidden">
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

          {activeGenre && (
            <div className="mt-8 rounded-xl border border-[var(--home-line)] bg-[var(--home-soft)] px-4 py-3">
              <ActiveGenreChip genre={activeGenre} clearHref="/" />
            </div>
          )}

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

        </div>
      </div>
    </div>
  )
}
