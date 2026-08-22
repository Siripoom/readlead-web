import { ActiveGenreChip } from '@/components/home/ActiveGenreChip'
import { CmsBannerCarousel } from '@/components/home/landing/CmsBannerCarousel'
import { HomeBookStrip } from '@/components/home/landing/HomeBookStrip'
import { LatestUpdates } from '@/components/home/landing/LatestUpdates'
import { LimitedTimeCarousel } from '@/components/home/landing/LimitedTimeCarousel'
import { RankingTables } from '@/components/home/landing/RankingTables'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { CmsBanner } from '@/lib/cms-catalog'
import type { NovelCmsCatalog } from '@/lib/novel-cms-catalog'
import type { NovelLandingCatalog } from '@/lib/novel-landing-catalog'
import { NOVEL_GENRE_OPTIONS } from '@/lib/novel-landing-data'
import type { Genre } from '@/lib/types'
import { NovelCmsCoverflow } from './NovelCmsCoverflow'
import { NovelGenreSpotlight } from './NovelGenreSpotlight'
import { NovelPopularityShowcase } from './NovelPopularityShowcase'
import styles from './NovelLanding.module.css'

function parseGenre(value: string | null): Genre | null {
  if (!value) return null
  return NOVEL_GENRE_OPTIONS.some((option) => option.genre === value)
    ? (value as Genre)
    : null
}

function matchesGenre(genreKeys: Genre[], activeGenre: Genre | null) {
  return !activeGenre || genreKeys.includes(activeGenre)
}

function SectionHeading({ title, href }: { title: string; href: string }) {
  return (
    <div className={styles.sectionHeading}>
      <h2>{title}</h2>
      <Link href={href}>ดูเพิ่มเติม <ChevronRight /></Link>
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
    <div className={visibleColumns.length > 1 ? styles.bannerColumns : undefined}>
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
  cms,
}: {
  activeGenre?: string | null
  catalog: NovelLandingCatalog
  cms: NovelCmsCatalog
}) {
  const genre = parseGenre(activeGenre)
  const webBooks = cms.webBooks.filter((item) => matchesGenre(item.genreKeys, genre))
  const hasActivity = cms.activity.some((column) => column.length > 0)
  const hasWebRecommend = cms.webRecommend.some((column) => column.length > 0)
  const hasLaunch = cms.launch.some((column) => column.length > 0)
  const hasWebPicks = Boolean(cms.coverflow) || webBooks.length > 0

  return (
    <div className={styles.root}>
      {cms.hero.length > 0 && (
        <CmsBannerCarousel
          items={cms.hero}
          aspect="1280 / 318"
          slideSeconds={cms.slideSeconds}
          label="แบนเนอร์ใหญ่นิยาย"
          fullWidth
        />
      )}

      <main className={styles.container}>
        {hasActivity && (
          <section className={styles.bannerSection}>
            <CmsBannerColumns
              columns={cms.activity}
              aspect="566 / 169"
              slideSeconds={cms.slideSeconds}
              label="แบนเนอร์ใต้แบนเนอร์ใหญ่"
            />
          </section>
        )}

        {genre && (
          <div className={`${styles.genreNotice} rounded-xl border border-[var(--home-line)] bg-[var(--home-soft)] px-4 py-3`}>
            <ActiveGenreChip genre={genre} clearHref="/novel" />
          </div>
        )}

        {cms.limitedOffers.length > 0 && (
          <section className={styles.section}>
            <SectionHeading title="จำกัดเวลาพิเศษ" href="/discover" />
            <LimitedTimeCarousel items={cms.limitedOffers} />
          </section>
        )}

        <NovelPopularityShowcase items={catalog.popular} />

        {cms.act3.length > 0 && (
          <section className={styles.bannerSection}>
            <CmsBannerCarousel
              items={cms.act3}
              aspect="1152 / 247"
              slideSeconds={cms.slideSeconds}
              label="แบนเนอร์กิจกรรมอันดับ"
            />
          </section>
        )}

        <section className={styles.bannerSection}>
          <SectionHeading title="อันดับรวมยอดนิยมสูงสุด" href="/ranking" />
          <RankingTables columns={catalog.rankings} />
        </section>

        {hasWebPicks && (
          <section className={styles.section}>
            <SectionHeading title="แนะนำโดยเว็บ" href="/discover" />
            {cms.coverflow && <NovelCmsCoverflow data={cms.coverflow} slideSeconds={cms.slideSeconds} />}
            {webBooks.length > 0 && (
              <div className={cms.coverflow ? 'mt-[26px]' : undefined}>
                <HomeBookStrip items={webBooks} variant="recommended" />
              </div>
            )}
          </section>
        )}

        {cms.writerBanners.length > 0 && (
          <section className={styles.section}>
            <CmsBannerCarousel
              items={cms.writerBanners}
              aspect="1152 / 244"
              slideSeconds={cms.slideSeconds}
              label="แบนเนอร์มาเป็นนักเขียนกับเรา"
            />
          </section>
        )}

        <section className={styles.section}>
          <SectionHeading title="ผลงานเรื่องใหม่" href="/discover" />
          <HomeBookStrip items={catalog.newWorks} variant="recommended" />
        </section>

        {hasWebRecommend && (
          <section className={styles.bannerSection}>
            <CmsBannerColumns
              columns={cms.webRecommend}
              aspect="567 / 169"
              slideSeconds={cms.slideSeconds}
              label="แนะนำโดยเว็บ"
            />
          </section>
        )}

        <section className={styles.section}>
          <SectionHeading title="ผลงานไทยเรื่องใหม่" href="/discover" />
          <HomeBookStrip items={catalog.newThaiWorks} variant="recommended" />
        </section>

        <section className={styles.section}>
          <SectionHeading title="ผลงานแปลเรื่องใหม่" href="/discover" />
          <HomeBookStrip items={catalog.translatedWorks} variant="recommended" />
        </section>

        {hasLaunch && (
          <section className={styles.bannerSection}>
            <CmsBannerColumns
              columns={cms.launch}
              aspect="1140 / 400"
              slideSeconds={cms.slideSeconds}
              label="เปิดตัวใหม่ยอดฮิต"
            />
          </section>
        )}

        <section className={styles.section}>
          <SectionHeading title="เรื่องฮิตตามหมวดหมู่" href="/discover" />
          <NovelGenreSpotlight
            key={genre ?? 'all'}
            items={catalog.categoryPopular}
            options={NOVEL_GENRE_OPTIONS}
            activeGenre={genre}
            banners={cms.categoryBanners}
            slideSeconds={cms.slideSeconds}
          />
        </section>

        <section className={styles.section} id="latest">
          <SectionHeading title="อัปเดตล่าสุด" href="/discover" />
          <LatestUpdates key={genre ?? 'all'} items={catalog.latestUpdates} />
        </section>
      </main>
    </div>
  )
}
