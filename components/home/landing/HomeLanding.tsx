import { ActiveGenreChip } from '@/components/home/ActiveGenreChip'
import {
  HOME_ACTIVITY_CARDS,
  HOME_HERO_SLIDES,
  HOME_LATEST_UPDATES,
  HOME_LIMITED_OFFERS,
  HOME_POPULAR_BOOKS,
  HOME_RANKING_COLUMNS,
  HOME_RECOMMENDED_BOOKS,
} from '@/lib/home-landing-data'
import type { Genre } from '@/lib/types'
import { ActivityPromos } from './ActivityPromos'
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

export function HomeLanding({ activeGenre = null }: { activeGenre?: string | null }) {
  const genre = activeGenre as Genre | null
  const popular = HOME_POPULAR_BOOKS.filter((item) => hasGenre(item.genreKeys, genre))
  const recommended = HOME_RECOMMENDED_BOOKS.filter((item) => hasGenre(item.genreKeys, genre))
  const rankings = HOME_RANKING_COLUMNS.map((column) => ({
    ...column,
    items: column.items.filter((item) => hasGenre(item.genreKeys, genre)),
  }))
  const updates = HOME_LATEST_UPDATES.filter((item) => hasGenre(item.genreKeys, genre))

  return (
    <div className={`${styles.root} pb-4 sm:pb-8`}>
      <HomeHero slides={HOME_HERO_SLIDES} />

      <div className="mx-auto max-w-[1200px] px-5 sm:px-6">
        <div className="mt-6">
          <ActivityPromos cards={HOME_ACTIVITY_CARDS} />
        </div>

        {activeGenre && (
          <div className="mt-8 rounded-xl border border-[var(--home-line)] bg-[var(--home-soft)] px-4 py-3">
            <ActiveGenreChip genre={activeGenre} clearHref="/" />
          </div>
        )}

        <section className="mt-10">
          <LandingSectionHeading title="จำกัดเวลาพิเศษ" href="/discover" />
          <LimitedTimeCarousel items={HOME_LIMITED_OFFERS} />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="ความนิยมสูงสุด" href="/ranking" />
          <HomeBookStrip items={popular} variant="popular" />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="จัดอันดับรวม" href="/ranking" />
          <RankingTables columns={rankings} />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="แนะนำสำหรับคุณ" href="/discover" />
          <HomeBookStrip items={recommended} variant="recommended" />
        </section>

        <section className="mt-10" id="latest">
          <LandingSectionHeading title="อัปเดตล่าสุด" href="/discover" />
          <LatestUpdates key={activeGenre ?? 'all'} items={updates} />
        </section>
      </div>
    </div>
  )
}
