import { ActiveGenreChip } from '@/components/home/ActiveGenreChip'
import { CmsBannerCarousel } from '@/components/home/landing/CmsBannerCarousel'
import { HomeBookStrip } from '@/components/home/landing/HomeBookStrip'
import { LandingSectionHeading } from '@/components/home/landing/LandingSectionHeading'
import { LimitedTimeCarousel } from '@/components/home/landing/LimitedTimeCarousel'
import homeStyles from '@/components/home/landing/HomeLanding.module.css'
import type { AudioCmsCatalog } from '@/lib/audio-cms-catalog'
import type { AudioLandingCatalog } from '@/lib/audio-landing-catalog'
import {
  AUDIO_GENRE_OPTIONS,
  AUDIO_PRIMARY_GENRES,
  type AudioBookItem,
  type AudioGenreKey,
} from '@/lib/audiobook-landing-data'
import type { CmsBanner } from '@/lib/cms-catalog'
import { AudioGenreSpotlight } from './AudioGenreSpotlight'
import { AudioLatestUpdates } from './AudioLatestUpdates'
import styles from './AudioLanding.module.css'
import { AudioRankingShowcase } from './AudioRankingShowcase'

type Props = {
  activeGenre?: AudioGenreKey | null
  cms: AudioCmsCatalog
  catalog: AudioLandingCatalog
  catalogError: string | null
}

function filterBooks<T extends AudioBookItem>(items: T[], genre: AudioGenreKey | null) {
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
  return <div role="status" className="mt-10 rounded-2xl border border-dashed border-[#e2a9b0] bg-[#fff7f8] px-6 py-10 text-center text-sm text-[#9c3340]">{message}</div>
}

export function AudioLanding({ activeGenre = null, cms, catalog, catalogError }: Props) {
  const activeOption = AUDIO_GENRE_OPTIONS.find((option) => option.key === activeGenre)
  const cmsWebBooks = filterBooks(cms.webBooks, activeGenre)
  const recommendationBooks = cms.webBooks.length > 0 ? cmsWebBooks : catalog.recommended
  const showRecommendations = cms.webSides.some((items) => items.length)
    || cms.webRecommend.some((items) => items.length)
    || (cms.webBooksEnabled && (recommendationBooks.length > 0 || !catalogError))
  const launchHasBanners = cms.launch.some((items) => items.length)

  return (
    <div className={`${homeStyles.root} ${styles.root} pb-5 sm:pb-9`}>
      {cms.hero.length > 0 && (
        <CmsBannerCarousel items={cms.hero} aspect="1280 / 318" slideSeconds={cms.slideSeconds} label="แบนเนอร์หลักหนังสือเสียง" fullWidth />
      )}

      <main className="mx-auto max-w-[1200px] px-5 sm:px-6">
        {cms.activity.some((items) => items.length) && (
          <section className="mt-7">
            <BannerColumns columns={cms.activity} aspect="566 / 169" slideSeconds={cms.slideSeconds} label="กิจกรรมหนังสือเสียง" />
          </section>
        )}

        {activeGenre && activeOption && (
          <div className="mt-8 rounded-xl border border-[var(--home-line)] bg-[var(--home-soft)] px-4 py-3">
            <ActiveGenreChip genre={activeGenre} label={activeOption.label} clearHref="/audiobook" />
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
              <AudioRankingShowcase key={activeGenre ?? 'all'} groups={catalog.rankings} />
            </section>
          </>
        )}

        {cms.row3.length > 0 && (
          <section className="mt-10">
            <CmsBannerCarousel items={cms.row3} aspect="1152 / 138" slideSeconds={cms.slideSeconds} label="แบนเนอร์ใต้อันดับหนังสือเสียง" />
          </section>
        )}

        {cms.launchEnabled && (launchHasBanners || !catalogError) && (
          <section className="mt-10">
            <LandingSectionHeading title="เปิดตัวหนังสือเสียงใหม่ยอดฮิต" href="/discover" />
            {launchHasBanners
              ? <BannerColumns columns={cms.launch} aspect="1140 / 400" slideSeconds={cms.slideSeconds} label="เปิดตัวหนังสือเสียงใหม่" />
              : <HomeBookStrip items={catalog.newReleases} variant="recommended" />}
          </section>
        )}

        {cms.narrator.length > 0 && (
          <section className="mt-10">
            <CmsBannerCarousel items={cms.narrator} aspect="1152 / 138" slideSeconds={cms.slideSeconds} label="เชิญชวนนักพากย์" />
          </section>
        )}

        {!catalogError && (
          <>
            <section className="mt-10">
              <LandingSectionHeading title="เปิดตัวหนังสือเสียงพากย์" href="/discover" />
              <HomeBookStrip items={catalog.humanVoice} variant="recommended" />
            </section>
            <section className="mt-10">
              <LandingSectionHeading title="เปิดตัวหนังสือเสียงเอไอ" href="/discover" />
              <HomeBookStrip items={catalog.aiVoice} variant="recommended" />
            </section>
            <section className="mt-10">
              <LandingSectionHeading title="จบแล้ว" href="/discover" />
              <HomeBookStrip items={catalog.completed} variant="recommended" />
            </section>
          </>
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
              <LandingSectionHeading title="หนังสือเสียงฮิตตามหมวดหมู่" href="/discover" />
              <AudioGenreSpotlight
                key={activeGenre ?? 'all'}
                items={catalog.categoryPopular}
                primaryOptions={AUDIO_PRIMARY_GENRES}
                allOptions={AUDIO_GENRE_OPTIONS}
                activeGenre={activeGenre}
                banners={cms.categoryBanners}
                slideSeconds={cms.slideSeconds}
              />
            </section>
            <section className="mt-10" id="latest">
              <LandingSectionHeading title="หนังสือเสียงอัปเดตล่าสุด" />
              <AudioLatestUpdates key={activeGenre ?? 'all'} items={catalog.latestUpdates} />
            </section>
          </>
        )}

        {catalogError && cms.categoryBanners.length > 0 && (
          <section className="mt-10">
            <LandingSectionHeading title="หนังสือเสียงฮิตตามหมวดหมู่" href="/discover" />
            <CmsBannerCarousel items={cms.categoryBanners} aspect="1152 / 228" slideSeconds={cms.slideSeconds} label="เติมเต็มทุกอารมณ์" />
          </section>
        )}

        {cms.bottomCta.some((items) => items.length) && (
          <section className="mt-10" aria-label="เมนูลัดหนังสือเสียง">
            <BannerColumns columns={cms.bottomCta} aspect="276 / 130" slideSeconds={cms.slideSeconds} label="เมนูลัดหนังสือเสียง" />
          </section>
        )}
      </main>
    </div>
  )
}
