import { ActiveGenreChip } from '@/components/home/ActiveGenreChip'
import { HomeBookStrip } from '@/components/home/landing/HomeBookStrip'
import { HomeHero } from '@/components/home/landing/HomeHero'
import { LandingSectionHeading } from '@/components/home/landing/LandingSectionHeading'
import { LatestUpdates } from '@/components/home/landing/LatestUpdates'
import { LimitedTimeCarousel } from '@/components/home/landing/LimitedTimeCarousel'
import { RankingTables } from '@/components/home/landing/RankingTables'
import styles from '@/components/home/landing/HomeLanding.module.css'
import {
  NOVEL_CATEGORY_BOOKS,
  NOVEL_EDITORIAL_PICKS,
  NOVEL_GENRE_OPTIONS,
  NOVEL_HERO_SLIDES,
  NOVEL_LATEST_UPDATES,
  NOVEL_LIMITED_OFFERS,
  NOVEL_NEW_BOOKS,
  NOVEL_POPULAR_BOOKS,
  NOVEL_RANKING_COLUMNS,
  NOVEL_THAI_BOOKS,
  NOVEL_TRANSLATED_BOOKS,
} from '@/lib/novel-landing-data'
import type { Genre } from '@/lib/types'
import { NovelEditorialBanner } from './NovelEditorialBanner'
import { NovelGenreSpotlight } from './NovelGenreSpotlight'
import { NovelWriterCallout } from './NovelWriterCallout'

function parseGenre(value: string | null): Genre | null {
  if (!value) return null
  return NOVEL_GENRE_OPTIONS.some((option) => option.genre === value)
    ? (value as Genre)
    : null
}

function matchesGenre(genreKeys: Genre[], activeGenre: Genre | null) {
  return !activeGenre || genreKeys.includes(activeGenre)
}

export function NovelLanding({ activeGenre = null }: { activeGenre?: string | null }) {
  const genre = parseGenre(activeGenre)
  const popular = NOVEL_POPULAR_BOOKS.filter((item) => matchesGenre(item.genreKeys, genre))
  const editorial = NOVEL_EDITORIAL_PICKS.filter((item) => matchesGenre(item.genreKeys, genre))
  const newBooks = NOVEL_NEW_BOOKS.filter((item) => matchesGenre(item.genreKeys, genre))
  const thaiBooks = NOVEL_THAI_BOOKS.filter((item) => matchesGenre(item.genreKeys, genre))
  const translatedBooks = NOVEL_TRANSLATED_BOOKS.filter((item) => matchesGenre(item.genreKeys, genre))
  const categoryBooks = NOVEL_CATEGORY_BOOKS.filter((item) => matchesGenre(item.genreKeys, genre))
  const rankings = NOVEL_RANKING_COLUMNS.map((column) => ({
    ...column,
    items: column.items.filter((item) => matchesGenre(item.genreKeys, genre)),
  }))
  const updates = NOVEL_LATEST_UPDATES.filter((item) => matchesGenre(item.genreKeys, genre))

  return (
    <div className={`${styles.root} pb-5 sm:pb-9`}>
      <HomeHero slides={NOVEL_HERO_SLIDES} indicatorTone="neutral" />

      <main className="mx-auto max-w-[1200px] px-5 sm:px-6">
        {genre && (
          <div className="mt-8 rounded-xl border border-[var(--home-line)] bg-[var(--home-soft)] px-4 py-3">
            <ActiveGenreChip genre={genre} clearHref="/novel" />
          </div>
        )}

        <section className="mt-10">
          <LandingSectionHeading title="จำกัดเวลาพิเศษ" href="/discover" />
          <LimitedTimeCarousel items={NOVEL_LIMITED_OFFERS} />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="ความนิยมสูงสุด" href="/ranking" />
          <HomeBookStrip items={popular} variant="popular" />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="อันดับรวมยอดนิยมสูงสุด" href="/ranking" />
          <RankingTables columns={rankings} />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="แนะนำโดยเว็บ" href="/discover" />
          <NovelEditorialBanner key={genre ?? 'all'} items={editorial} />
        </section>

        <section className="mt-10">
          <NovelWriterCallout />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="ผลงานเรื่องใหม่" href="/discover" />
          <HomeBookStrip items={newBooks} variant="recommended" />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="ผลงานไทยเรื่องใหม่" href="/discover" />
          <HomeBookStrip items={thaiBooks} variant="recommended" />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="ผลงานแปลเรื่องใหม่" href="/discover" />
          <HomeBookStrip items={translatedBooks} variant="recommended" />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="เรื่องฮิตตามหมวดหมู่" href="/discover" />
          <NovelGenreSpotlight
            key={genre ?? 'all'}
            items={categoryBooks}
            options={NOVEL_GENRE_OPTIONS}
            activeGenre={genre}
          />
        </section>

        <section className="mt-10" id="latest">
          <LandingSectionHeading title="อัปเดตล่าสุด" href="/discover" />
          <LatestUpdates key={genre ?? 'all'} items={updates} />
        </section>
      </main>
    </div>
  )
}
