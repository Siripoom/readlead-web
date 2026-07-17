import { ActiveGenreChip } from '@/components/home/ActiveGenreChip'
import { HomeBookStrip } from '@/components/home/landing/HomeBookStrip'
import { HomeHero } from '@/components/home/landing/HomeHero'
import { LandingSectionHeading } from '@/components/home/landing/LandingSectionHeading'
import { LimitedTimeCarousel } from '@/components/home/landing/LimitedTimeCarousel'
import homeStyles from '@/components/home/landing/HomeLanding.module.css'
import {
  MANGA_CATEGORY_BOOKS,
  MANGA_GENRE_OPTIONS,
  MANGA_HERO_SLIDES,
  MANGA_LATEST_UPDATES,
  MANGA_LIMITED_OFFERS,
  MANGA_MANHUA_BOOKS,
  MANGA_MANHWA_BOOKS,
  MANGA_NEW_RELEASES,
  MANGA_POPULAR_BOOKS,
  MANGA_PRIMARY_GENRES,
  MANGA_RANKING_GROUPS,
  MANGA_RECOMMENDED_BOOKS,
} from '@/lib/manga-landing-data'
import type { MangaBookItem, MangaGenreKey } from '@/lib/manga-landing-data'
import { MangaGenreSpotlight } from './MangaGenreSpotlight'
import { MangaLatestUpdates } from './MangaLatestUpdates'
import styles from './MangaLanding.module.css'
import { MangaRankingShowcase } from './MangaRankingShowcase'

function parseGenre(value: string | null): MangaGenreKey | null {
  if (!value) return null
  return MANGA_GENRE_OPTIONS.some((option) => option.key === value)
    ? (value as MangaGenreKey)
    : null
}

function filterBooks<T extends MangaBookItem>(items: T[], genre: MangaGenreKey | null) {
  return genre ? items.filter((item) => item.filterKeys.includes(genre)) : items
}

export function MangaLanding({ activeGenre = null }: { activeGenre?: string | null }) {
  const genre = parseGenre(activeGenre)
  const activeOption = MANGA_GENRE_OPTIONS.find((option) => option.key === genre)
  const rankings = MANGA_RANKING_GROUPS.map((group) => ({
    ...group,
    items: filterBooks(group.items, genre),
  }))

  return (
    <div className={`${homeStyles.root} ${styles.root} pb-5 sm:pb-9`}>
      <HomeHero slides={MANGA_HERO_SLIDES} indicatorTone="neutral" />

      <main className="mx-auto max-w-[1200px] px-5 sm:px-6">
        {genre && activeOption && (
          <div className="mt-8 rounded-xl border border-[var(--home-line)] bg-[var(--home-soft)] px-4 py-3">
            <ActiveGenreChip genre={genre} label={activeOption.label} clearHref="/manga" />
          </div>
        )}

        <section className="mt-10">
          <LandingSectionHeading title="จำกัดเวลาพิเศษ" href="/discover" />
          <LimitedTimeCarousel items={MANGA_LIMITED_OFFERS} />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="ความนิยมสูงสุด" href="/ranking" />
          <HomeBookStrip items={filterBooks(MANGA_POPULAR_BOOKS, genre)} variant="popular" />
        </section>

        <section className="mt-10">
          <MangaRankingShowcase key={genre ?? 'all'} groups={rankings} />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="เปิดตัวมังงะใหม่ยอดฮิต" href="/discover" />
          <HomeBookStrip items={filterBooks(MANGA_NEW_RELEASES, genre)} variant="recommended" />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="แนะนำโดยเว็บ" href="/discover" />
          <HomeBookStrip items={filterBooks(MANGA_RECOMMENDED_BOOKS, genre)} variant="recommended" />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="มังฮวา" href="/discover" />
          <HomeBookStrip items={filterBooks(MANGA_MANHWA_BOOKS, genre)} variant="recommended" />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="ม่านฮว่า" href="/discover" />
          <HomeBookStrip items={filterBooks(MANGA_MANHUA_BOOKS, genre)} variant="recommended" />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="มังงะฮิตตามหมวดหมู่" href="/discover" />
          <MangaGenreSpotlight
            key={genre ?? 'all'}
            items={filterBooks(MANGA_CATEGORY_BOOKS, genre)}
            primaryOptions={MANGA_PRIMARY_GENRES}
            allOptions={MANGA_GENRE_OPTIONS}
            activeGenre={genre}
          />
        </section>

        <section className="mt-10" id="latest">
          <LandingSectionHeading title="มังงะอัปเดตล่าสุด" href="/discover" />
          <MangaLatestUpdates key={genre ?? 'all'} items={filterBooks(MANGA_LATEST_UPDATES, genre)} />
        </section>
      </main>
    </div>
  )
}
