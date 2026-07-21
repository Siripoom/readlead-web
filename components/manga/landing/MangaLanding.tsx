import { ActiveGenreChip } from '@/components/home/ActiveGenreChip'
import { CmsBannerCarousel } from '@/components/home/landing/CmsBannerCarousel'
import { HomeBookStrip } from '@/components/home/landing/HomeBookStrip'
import { LandingSectionHeading } from '@/components/home/landing/LandingSectionHeading'
import { LimitedTimeCarousel } from '@/components/home/landing/LimitedTimeCarousel'
import homeStyles from '@/components/home/landing/HomeLanding.module.css'
import type { CmsBanner } from '@/lib/cms-catalog'
import type { MangaCmsCatalog } from '@/lib/manga-cms-catalog'
import {
  MANGA_GENRE_OPTIONS,
  MANGA_PRIMARY_GENRES,
  type MangaBookItem,
  type MangaGenreKey,
} from '@/lib/manga-landing-data'
import type { MangaLandingCatalog } from '@/lib/manga-landing-catalog'
import { MangaGenreSpotlight } from './MangaGenreSpotlight'
import { MangaLatestUpdates } from './MangaLatestUpdates'
import styles from './MangaLanding.module.css'
import { MangaRankingShowcase } from './MangaRankingShowcase'

type Props = {
  activeGenre?: MangaGenreKey | null
  cms: MangaCmsCatalog
  catalog: MangaLandingCatalog
  catalogError: string | null
}

function filterBooks<T extends MangaBookItem>(items: T[], genre: MangaGenreKey | null) {
  return genre ? items.filter((item) => item.filterKeys.includes(genre)) : items
}

function BannerColumns({ columns, aspect, slideSeconds, label }: {
  columns: CmsBanner[][]
  aspect: string
  slideSeconds: number
  label: string
}) {
  const visible = columns.filter((items) => items.length > 0)
  if (!visible.length) return null
  const gridClass = visible.length === 1 ? 'grid-cols-1'
    : visible.length === 2 ? 'grid-cols-1 sm:grid-cols-2'
      : visible.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {visible.map((items, index) => (
        <CmsBannerCarousel key={`${label}-${index}`} items={items} aspect={aspect} slideSeconds={slideSeconds} label={`${label} ${index + 1}`} />
      ))}
    </div>
  )
}

function CatalogError({ message }: { message: string }) {
  return (
    <div role="status" className="mt-10 rounded-2xl border border-dashed border-[#e2a9b0] bg-[#fff7f8] px-6 py-10 text-center text-sm text-[#9c3340]">
      {message}
    </div>
  )
}

export function MangaLanding({ activeGenre = null, cms, catalog, catalogError }: Props) {
  const activeOption = MANGA_GENRE_OPTIONS.find((option) => option.key === activeGenre)
  const cmsWebBooks = filterBooks(cms.webBooks, activeGenre)
  const recommendationBooks = cms.webBooks.length > 0 ? cmsWebBooks : catalog.recommended
  const showRecommendations = cms.webSides.some((items) => items.length)
    || cms.webRecommend.some((items) => items.length)
    || (cms.webBooksEnabled && (recommendationBooks.length > 0 || !catalogError))
  const launchHasBanners = cms.launch.some((items) => items.length)

  return (
    <div className={`${homeStyles.root} ${styles.root} pb-5 sm:pb-9`}>
      {cms.hero.length > 0 && (
        <CmsBannerCarousel items={cms.hero} aspect="1280 / 318" slideSeconds={cms.slideSeconds} label="แบนเนอร์หลักมังงะ" fullWidth />
      )}

      <main className="mx-auto max-w-[1200px] px-5 sm:px-6">
        {cms.activity.some((items) => items.length) && (
          <section className="mt-7">
            <BannerColumns columns={cms.activity} aspect="566 / 169" slideSeconds={cms.slideSeconds} label="กิจกรรม" />
          </section>
        )}

        {activeGenre && activeOption && (
          <div className="mt-8 rounded-xl border border-[var(--home-line)] bg-[var(--home-soft)] px-4 py-3">
            <ActiveGenreChip genre={activeGenre} label={activeOption.label} clearHref="/manga" />
          </div>
        )}

        {cms.limitedOffers.length > 0 && (
          <section className="mt-10">
            <LandingSectionHeading title="จำกัดเวลาพิเศษ" href="/discover" />
            <LimitedTimeCarousel items={cms.limitedOffers} />
          </section>
        )}

        {catalogError ? <CatalogError message={catalogError} /> : (
          <>
            <section className="mt-10">
              <LandingSectionHeading title="ความนิยมสูงสุด" href="/ranking" />
              <HomeBookStrip items={catalog.popular} variant="popular" />
            </section>

            <section className="mt-10">
              <MangaRankingShowcase key={activeGenre ?? 'all'} groups={catalog.rankings} />
            </section>
          </>
        )}

        {cms.row3.length > 0 && (
          <section className="mt-10">
            <CmsBannerCarousel items={cms.row3} aspect="1152 / 138" slideSeconds={cms.slideSeconds} label="แบนเนอร์ใต้อันดับรวม" />
          </section>
        )}

        {cms.launchEnabled && (launchHasBanners || !catalogError) && (
          <section className="mt-10">
            <LandingSectionHeading title="เปิดตัวมังงะใหม่ยอดฮิต" href="/discover" />
            {launchHasBanners
              ? <BannerColumns columns={cms.launch} aspect="1140 / 400" slideSeconds={cms.slideSeconds} label="เปิดตัวมังงะใหม่" />
              : <HomeBookStrip items={catalog.newReleases} variant="recommended" />}
          </section>
        )}

        {showRecommendations && (
          <section className="mt-10">
            <LandingSectionHeading title="แนะนำโดยเว็บ" href="/discover" />
            {cms.webSides.some((items) => items.length) && (
              <BannerColumns columns={cms.webSides} aspect="567 / 135" slideSeconds={cms.slideSeconds} label="แนะนำโดยเว็บ" />
            )}
            {cms.webRecommend.some((items) => items.length) && (
              <div className={cms.webSides.some((items) => items.length) ? 'mt-4' : undefined}>
                <BannerColumns columns={cms.webRecommend} aspect="567 / 169" slideSeconds={cms.slideSeconds} label="แนะนำโดยเว็บ" />
              </div>
            )}
            {cms.webBooksEnabled && (
              <div className={cms.webSides.some((items) => items.length) || cms.webRecommend.some((items) => items.length) ? 'mt-6' : undefined}>
                <HomeBookStrip items={recommendationBooks} variant="recommended" />
              </div>
            )}
          </section>
        )}

        {!catalogError && (
          <>
            <section className="mt-10">
              <LandingSectionHeading title="มังฮวา" href="/discover" />
              <HomeBookStrip items={catalog.manhwa} variant="recommended" />
            </section>

            <section className="mt-10">
              <LandingSectionHeading title="ม่านฮว่า" href="/discover" />
              <HomeBookStrip items={catalog.manhua} variant="recommended" />
            </section>

            <section className="mt-10">
              <LandingSectionHeading title="มังงะฮิตตามหมวดหมู่" href="/discover" />
              <MangaGenreSpotlight
                key={activeGenre ?? 'all'}
                items={catalog.categoryPopular}
                primaryOptions={MANGA_PRIMARY_GENRES}
                allOptions={MANGA_GENRE_OPTIONS}
                activeGenre={activeGenre}
                banners={cms.categoryBanners}
                slideSeconds={cms.slideSeconds}
              />
            </section>

            <section className="mt-10" id="latest">
              <LandingSectionHeading title="มังงะอัปเดตล่าสุด" href="/discover" />
              <MangaLatestUpdates key={activeGenre ?? 'all'} items={catalog.latestUpdates} />
            </section>
          </>
        )}

        {catalogError && cms.categoryBanners.length > 0 && (
          <section className="mt-10">
            <LandingSectionHeading title="มังงะฮิตตามหมวดหมู่" href="/discover" />
            <CmsBannerCarousel items={cms.categoryBanners} aspect="1152 / 228" slideSeconds={cms.slideSeconds} label="เติมเต็มทุกอารมณ์" />
          </section>
        )}

        {cms.bottomCta.some((items) => items.length) && (
          <section className="mt-10" aria-label="เมนูลัดมังงะ">
            <BannerColumns columns={cms.bottomCta} aspect="276 / 130" slideSeconds={cms.slideSeconds} label="เมนูลัด" />
          </section>
        )}
      </main>
    </div>
  )
}
