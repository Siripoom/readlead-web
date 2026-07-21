import { ActiveGenreChip } from '@/components/home/ActiveGenreChip'
import { CmsBannerCarousel } from '@/components/home/landing/CmsBannerCarousel'
import { HomeBookStrip } from '@/components/home/landing/HomeBookStrip'
import { LandingSectionHeading } from '@/components/home/landing/LandingSectionHeading'
import { LatestUpdates } from '@/components/home/landing/LatestUpdates'
import { LimitedTimeCarousel } from '@/components/home/landing/LimitedTimeCarousel'
import { RankingTables } from '@/components/home/landing/RankingTables'
import styles from '@/components/home/landing/HomeLanding.module.css'
import type { CmsBanner } from '@/lib/cms-catalog'
import type { NovelCmsCatalog } from '@/lib/novel-cms-catalog'
import type { NovelLandingCatalog } from '@/lib/novel-landing-catalog'
import { NOVEL_GENRE_OPTIONS } from '@/lib/novel-landing-data'
import type { Genre } from '@/lib/types'
import { cn } from '@/lib/utils'
import { NovelCmsCoverflow } from './NovelCmsCoverflow'
import { NovelGenreSpotlight } from './NovelGenreSpotlight'

function parseGenre(value: string | null): Genre | null {
  if (!value) return null
  return NOVEL_GENRE_OPTIONS.some((option) => option.genre === value)
    ? (value as Genre)
    : null
}

function matchesGenre(genreKeys: Genre[], activeGenre: Genre | null) {
  return !activeGenre || genreKeys.includes(activeGenre)
}

function CatalogError({ message }: { message: string }) {
  return (
    <div role="status" className="rounded-2xl border border-dashed border-[var(--home-line)] bg-[var(--home-soft)] px-6 py-10 text-center text-sm text-[var(--home-ink-2)]">
      {message}
    </div>
  )
}

function CmsBannerColumns({
  columns,
  aspect,
  slideSeconds,
  label,
}: {
  columns: CmsBanner[][]
  aspect: string
  slideSeconds: number
  label: string
}) {
  const visibleColumns = columns.filter((items) => items.length > 0)
  if (!visibleColumns.length) return null
  return (
    <div className={cn('grid gap-5', visibleColumns.length > 1 && 'sm:grid-cols-2')}>
      {visibleColumns.map((items, index) => (
        <CmsBannerCarousel
          key={`${label}-${index}-${items[0]?.id}`}
          items={items}
          aspect={aspect}
          slideSeconds={slideSeconds}
          label={`${label} คอลัมน์ ${index + 1}`}
        />
      ))}
    </div>
  )
}

export function NovelLanding({
  activeGenre = null,
  catalog,
  catalogError,
  cms,
}: {
  activeGenre?: string | null
  catalog: NovelLandingCatalog
  catalogError: string | null
  cms: NovelCmsCatalog
}) {
  const genre = parseGenre(activeGenre)
  const webBooks = cms.webBooks.filter((item) => matchesGenre(item.genreKeys, genre))
  const hasActivity = cms.activity.some((column) => column.length > 0)
  const hasWebRecommend = cms.webRecommend.some((column) => column.length > 0)
  const hasLaunch = cms.launch.some((column) => column.length > 0)
  const hasWebPicks = Boolean(cms.coverflow) || webBooks.length > 0

  return (
    <div className={`${styles.root} pb-5 sm:pb-9`}>
      {cms.hero.length > 0 && (
        <CmsBannerCarousel
          items={cms.hero}
          aspect="1280 / 318"
          slideSeconds={cms.slideSeconds}
          label="แบนเนอร์ใหญ่นิยาย"
          fullWidth
        />
      )}

      <main className="mx-auto max-w-[1200px] px-5 sm:px-6">
        {hasActivity && (
          <section className="mt-8">
            <CmsBannerColumns
              columns={cms.activity}
              aspect="566 / 169"
              slideSeconds={cms.slideSeconds}
              label="แบนเนอร์ใต้แบนเนอร์ใหญ่"
            />
          </section>
        )}

        {genre && (
          <div className="mt-8 rounded-xl border border-[var(--home-line)] bg-[var(--home-soft)] px-4 py-3">
            <ActiveGenreChip genre={genre} clearHref="/novel" />
          </div>
        )}

        {cms.limitedOffers.length > 0 && (
          <section className="mt-10">
            <LandingSectionHeading title="จำกัดเวลาพิเศษ" href="/discover" />
            <LimitedTimeCarousel items={cms.limitedOffers} />
          </section>
        )}

        <section className="mt-10">
          <LandingSectionHeading title="ความนิยมสูงสุด" href="/ranking" />
          {catalogError
            ? <CatalogError message={catalogError} />
            : <HomeBookStrip items={catalog.popular} variant="popular" />}
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="อันดับรวมยอดนิยมสูงสุด" href="/ranking" />
          {catalogError
            ? <CatalogError message={catalogError} />
            : <RankingTables columns={catalog.rankings} />}
        </section>

        {hasWebPicks && (
          <section className="mt-10">
            <LandingSectionHeading title="แนะนำโดยเว็บ" href="/discover" />
            {cms.coverflow && <NovelCmsCoverflow data={cms.coverflow} slideSeconds={cms.slideSeconds} />}
            {webBooks.length > 0 && (
              <div className={cms.coverflow ? 'mt-7' : undefined}>
                <HomeBookStrip items={webBooks} variant="recommended" />
              </div>
            )}
          </section>
        )}

        {cms.writerBanners.length > 0 && (
          <section className="mt-10">
            <CmsBannerCarousel
              items={cms.writerBanners}
              aspect="1152 / 244"
              slideSeconds={cms.slideSeconds}
              label="แบนเนอร์มาเป็นนักเขียนกับเรา"
            />
          </section>
        )}

        <section className="mt-10">
          <LandingSectionHeading title="ผลงานเรื่องใหม่" href="/discover" />
          {catalogError
            ? <CatalogError message={catalogError} />
            : <HomeBookStrip items={catalog.newWorks} variant="recommended" />}
        </section>

        {hasWebRecommend && (
          <section className="mt-10">
            <CmsBannerColumns
              columns={cms.webRecommend}
              aspect="567 / 169"
              slideSeconds={cms.slideSeconds}
              label="แนะนำโดยเว็บ"
            />
          </section>
        )}

        <section className="mt-10">
          <LandingSectionHeading title="ผลงานไทยเรื่องใหม่" href="/discover" />
          {catalogError
            ? <CatalogError message={catalogError} />
            : <HomeBookStrip items={catalog.newThaiWorks} variant="recommended" />}
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="ผลงานแปลเรื่องใหม่" href="/discover" />
          {catalogError
            ? <CatalogError message={catalogError} />
            : <HomeBookStrip items={catalog.translatedWorks} variant="recommended" />}
        </section>

        {hasLaunch && (
          <section className="mt-10">
            <CmsBannerColumns
              columns={cms.launch}
              aspect="1140 / 400"
              slideSeconds={cms.slideSeconds}
              label="เปิดตัวใหม่ยอดฮิต"
            />
          </section>
        )}

        <section className="mt-10">
          <LandingSectionHeading title="เรื่องฮิตตามหมวดหมู่" href="/discover" />
          {catalogError
            ? (
                <>
                  {cms.categoryBanners.length > 0 && (
                    <CmsBannerCarousel
                      items={cms.categoryBanners}
                      aspect="1152 / 228"
                      slideSeconds={cms.slideSeconds}
                      label="แบนเนอร์เติมเต็มทุกอารมณ์"
                    />
                  )}
                  <div className={cms.categoryBanners.length > 0 ? 'mt-6' : undefined}>
                    <CatalogError message={catalogError} />
                  </div>
                </>
              )
            : (
                <NovelGenreSpotlight
                  key={genre ?? 'all'}
                  items={catalog.categoryPopular}
                  options={NOVEL_GENRE_OPTIONS}
                  activeGenre={genre}
                  banners={cms.categoryBanners}
                  slideSeconds={cms.slideSeconds}
                />
              )}
        </section>

        <section className="mt-10" id="latest">
          <LandingSectionHeading title="อัปเดตล่าสุด" href="/discover" />
          {catalogError
            ? <CatalogError message={catalogError} />
            : <LatestUpdates key={genre ?? 'all'} items={catalog.latestUpdates} />}
        </section>
      </main>
    </div>
  )
}
