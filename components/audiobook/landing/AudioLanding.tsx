import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ActiveGenreChip } from '@/components/home/ActiveGenreChip'
import type { AudioCmsCatalog } from '@/lib/audio-cms-catalog'
import type { AudioLandingCatalog } from '@/lib/audio-landing-catalog'
import { AUDIO_GENRE_OPTIONS, AUDIO_PRIMARY_GENRES, type AudioGenreKey } from '@/lib/audiobook-landing-data'
import type { CmsBanner } from '@/lib/cms-catalog'
import { AudioBannerCarousel } from './AudioBannerCarousel'
import { AudioBookCarousel } from './AudioBookCarousel'
import { AudioGenreSpotlight } from './AudioGenreSpotlight'
import { AudioLatestUpdates } from './AudioLatestUpdates'
import { AudioLimitedCarousel } from './AudioLimitedCarousel'
import { AudioPopularityShowcase } from './AudioPopularityShowcase'
import { AudioRankingShowcase } from './AudioRankingShowcase'
import styles from './AudioLanding.module.css'

type Props = {
  activeGenre?: AudioGenreKey | null
  cms: AudioCmsCatalog
  catalog: AudioLandingCatalog
}

function SectionHeading({ title, href = '/discover' }: { title: string; href?: string }) {
  return (
    <div className={styles.sectionHeading}>
      <h2>{title}</h2>
      <Link href={href}>ดูเพิ่มเติม <ChevronRight /></Link>
    </div>
  )
}

function BannerColumns({ columns, aspect, slideSeconds, label, className = '' }: {
  columns: CmsBanner[][]
  aspect: string
  slideSeconds: number
  label: string
  className?: string
}) {
  const visible = columns.filter((items) => items.length > 0)
  if (!visible.length) return null
  return (
    <div className={`${styles.bannerColumns} ${visible.length === 1 ? styles.bannerColumnsSingle : ''} ${className}`}>
      {visible.map((items, index) => (
        <AudioBannerCarousel key={`${label}-${index}-${items[0]?.id}`} items={items} aspect={aspect} slideSeconds={slideSeconds} label={`${label} ${index + 1}`} />
      ))}
    </div>
  )
}

export function AudioLanding({ activeGenre = null, cms, catalog }: Props) {
  const activeOption = AUDIO_GENRE_OPTIONS.find((option) => option.key === activeGenre)
  const recommendationColumns = cms.webSides.some((column) => column.length > 0) ? cms.webSides : cms.webRecommend
  const hasLaunch = cms.launch.some((column) => column.length > 0)

  return (
    <div className={styles.root}>
      {cms.hero.length > 0 && (
        <AudioBannerCarousel items={cms.hero} aspect="1280 / 318" slideSeconds={cms.slideSeconds} label="แบนเนอร์หลักหนังสือเสียง" hero />
      )}

      <main className={styles.container}>
        {cms.activity.some((column) => column.length > 0) && (
          <div className={styles.activityRow}>
            <BannerColumns columns={cms.activity} aspect="566 / 169" slideSeconds={cms.slideSeconds} label="กิจกรรมหนังสือเสียง" />
          </div>
        )}

        {activeGenre && activeOption && (
          <div className={styles.genreNotice}>
            <ActiveGenreChip genre={activeGenre} label={activeOption.label} clearHref="/audiobook" />
          </div>
        )}

        {cms.limitedOffers.length > 0 && (
          <section className={styles.section}>
            <SectionHeading title="จำกัดเวลาพิเศษ" />
            <AudioLimitedCarousel items={cms.limitedOffers} />
          </section>
        )}

        <AudioPopularityShowcase items={catalog.popular} />

        <section className={styles.section}>
          <SectionHeading title="อันดับรวมยอดนิยมสูงสุด" href="/ranking" />
          <AudioRankingShowcase groups={catalog.rankings} />
        </section>

        {cms.row3.length > 0 && (
          <section className={styles.bannerSection}>
            <AudioBannerCarousel items={cms.row3} aspect="1152 / 138" slideSeconds={cms.slideSeconds} label="แบนเนอร์ใต้อันดับหนังสือเสียง" />
          </section>
        )}

        <section className={styles.section}>
          <SectionHeading title="เปิดตัวหนังสือเสียงใหม่ยอดฮิต" />
          {hasLaunch && (
            <BannerColumns columns={cms.launch} aspect="1140 / 400" slideSeconds={cms.slideSeconds} label="เปิดตัวหนังสือเสียงใหม่" className={styles.launchBanners} />
          )}
          <AudioBookCarousel items={catalog.newReleases} label="เปิดตัวหนังสือเสียงใหม่" />
        </section>

        {cms.narrator.length > 0 && (
          <section className={styles.bannerSection}>
            <AudioBannerCarousel items={cms.narrator} aspect="1152 / 138" slideSeconds={cms.slideSeconds} label="เชิญชวนนักพากย์" />
          </section>
        )}

        <section className={styles.section}>
          <SectionHeading title="เปิดตัวหนังสือเสียงพากย์" />
          <AudioBookCarousel items={catalog.humanVoice} label="หนังสือเสียงพากย์" />
        </section>

        <section className={styles.section}>
          <SectionHeading title="เปิดตัวหนังสือเสียงเอไอ" />
          <AudioBookCarousel items={catalog.aiVoice} label="หนังสือเสียงเอไอ" />
        </section>

        <section className={styles.section}>
          <SectionHeading title="จบแล้ว" />
          <AudioBookCarousel items={catalog.completed} label="หนังสือเสียงจบแล้ว" />
        </section>

        {(recommendationColumns.some((column) => column.length > 0) || cms.webBooks.length > 0) && (
          <section className={styles.section}>
            <SectionHeading title="แนะนำโดยเว็บ" />
            <BannerColumns columns={recommendationColumns} aspect="567 / 135" slideSeconds={cms.slideSeconds} label="แนะนำโดยเว็บ" />
            {cms.webBooks.length > 0 && (
              <div className={recommendationColumns.some((column) => column.length > 0) ? styles.recommendBooks : undefined}>
                <AudioBookCarousel items={cms.webBooks} label="หนังสือเสียงแนะนำโดยเว็บ" />
              </div>
            )}
          </section>
        )}

        <section className={styles.section}>
          <SectionHeading title="หนังสือเสียงฮิตตามหมวดหมู่" />
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

        <section className={styles.section} id="latest">
          <SectionHeading title="หนังสือเสียงอัปเดตล่าสุด" />
          <AudioLatestUpdates key={activeGenre ?? 'all'} items={catalog.latestUpdates} />
        </section>

        {cms.bottomCta.some((column) => column.length > 0) && (
          <section className={styles.bottomCta} aria-label="เมนูลัดหนังสือเสียง">
            <BannerColumns columns={cms.bottomCta} aspect="276 / 130" slideSeconds={cms.slideSeconds} label="เมนูลัดหนังสือเสียง" />
          </section>
        )}
      </main>
    </div>
  )
}
