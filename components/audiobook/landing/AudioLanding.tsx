import { ActiveGenreChip } from '@/components/home/ActiveGenreChip'
import { HomeBookStrip } from '@/components/home/landing/HomeBookStrip'
import { HomeHero } from '@/components/home/landing/HomeHero'
import { LandingSectionHeading } from '@/components/home/landing/LandingSectionHeading'
import { LimitedTimeCarousel } from '@/components/home/landing/LimitedTimeCarousel'
import homeStyles from '@/components/home/landing/HomeLanding.module.css'
import {
  AUDIO_AI_VOICE_BOOKS,
  AUDIO_CATEGORY_BOOKS,
  AUDIO_COMPLETED_BOOKS,
  AUDIO_GENRE_OPTIONS,
  AUDIO_HERO_SLIDES,
  AUDIO_HUMAN_VOICE_BOOKS,
  AUDIO_LATEST_UPDATES,
  AUDIO_LIMITED_OFFERS,
  AUDIO_NEW_RELEASES,
  AUDIO_POPULAR_BOOKS,
  AUDIO_PRIMARY_GENRES,
  AUDIO_RANKING_GROUPS,
  AUDIO_RECOMMENDED_BOOKS,
} from '@/lib/audiobook-landing-data'
import type { AudioBookItem, AudioGenreKey } from '@/lib/audiobook-landing-data'
import { AudioGenreSpotlight } from './AudioGenreSpotlight'
import { AudioLatestUpdates } from './AudioLatestUpdates'
import styles from './AudioLanding.module.css'
import { AudioRankingShowcase } from './AudioRankingShowcase'

function parseGenre(value: string | null): AudioGenreKey | null {
  if (!value) return null
  return AUDIO_GENRE_OPTIONS.some((option) => option.key === value)
    ? (value as AudioGenreKey)
    : null
}

function filterBooks<T extends AudioBookItem>(items: T[], genre: AudioGenreKey | null) {
  return genre ? items.filter((item) => item.filterKeys.includes(genre)) : items
}

export function AudioLanding({ activeGenre = null }: { activeGenre?: string | null }) {
  const genre = parseGenre(activeGenre)
  const activeOption = AUDIO_GENRE_OPTIONS.find((option) => option.key === genre)
  const rankings = AUDIO_RANKING_GROUPS.map((group) => ({
    ...group,
    items: filterBooks(group.items, genre),
  }))

  return (
    <div className={`${homeStyles.root} ${styles.root} pb-5 sm:pb-9`}>
      <HomeHero slides={AUDIO_HERO_SLIDES} />

      <main className="mx-auto max-w-[1200px] px-5 sm:px-6">
        {genre && activeOption && (
          <div className="mt-8 rounded-xl border border-[var(--home-line)] bg-[var(--home-soft)] px-4 py-3">
            <ActiveGenreChip genre={genre} label={activeOption.label} clearHref="/audiobook" />
          </div>
        )}

        <section className="mt-10">
          <LandingSectionHeading title="จำกัดเวลาพิเศษ" href="/discover" />
          <LimitedTimeCarousel items={AUDIO_LIMITED_OFFERS} />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="ความนิยมสูงสุด" href="/ranking" />
          <HomeBookStrip items={filterBooks(AUDIO_POPULAR_BOOKS, genre)} variant="popular" />
        </section>

        <section className="mt-10">
          <AudioRankingShowcase key={genre ?? 'all'} groups={rankings} />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="เปิดตัวหนังสือเสียงใหม่ยอดฮิต" href="/discover" />
          <HomeBookStrip items={filterBooks(AUDIO_NEW_RELEASES, genre)} variant="recommended" />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="เปิดตัวหนังสือเสียงพากย์" href="/discover" />
          <HomeBookStrip items={filterBooks(AUDIO_HUMAN_VOICE_BOOKS, genre)} variant="recommended" />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="เปิดตัวหนังสือเสียงเอไอ" href="/discover" />
          <HomeBookStrip items={filterBooks(AUDIO_AI_VOICE_BOOKS, genre)} variant="recommended" />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="จบแล้ว" href="/discover" />
          <HomeBookStrip items={filterBooks(AUDIO_COMPLETED_BOOKS, genre)} variant="recommended" />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="แนะนำโดยเว็บ" href="/discover" />
          <HomeBookStrip items={filterBooks(AUDIO_RECOMMENDED_BOOKS, genre)} variant="recommended" />
        </section>

        <section className="mt-10">
          <LandingSectionHeading title="หนังสือเสียงฮิตตามหมวดหมู่" href="/discover" />
          <AudioGenreSpotlight
            key={genre ?? 'all'}
            items={filterBooks(AUDIO_CATEGORY_BOOKS, genre)}
            primaryOptions={AUDIO_PRIMARY_GENRES}
            allOptions={AUDIO_GENRE_OPTIONS}
            activeGenre={genre}
          />
        </section>

        <section className="mt-10" id="latest">
          <LandingSectionHeading title="หนังสือเสียงอัปเดตล่าสุด" />
          <AudioLatestUpdates key={genre ?? 'all'} items={filterBooks(AUDIO_LATEST_UPDATES, genre)} />
        </section>
      </main>
    </div>
  )
}
