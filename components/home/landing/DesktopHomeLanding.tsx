import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ActiveGenreChip } from '@/components/home/ActiveGenreChip'
import type { HomeCmsCatalog } from '@/lib/home-catalog'
import { genreFor } from '@/lib/cms-catalog'
import { CmsBannerCarousel } from './CmsBannerCarousel'
import { HomeBookStrip } from './HomeBookStrip'
import { PicksRail } from './PicksRail'
import styles from './HomeLanding.module.css'

const RECOMMENDATIONS = [
  { key: 'novel', title: 'แนะนำนิยาย', href: '/novel' },
  { key: 'manga', title: 'แนะนำเว็บตูน', href: '/manga' },
  { key: 'audio', title: 'แนะนำหนังสือเสียง', href: '/audiobook' },
] as const

const PROMO_WIDTHS = [369, 250.5, 228, 250.5]

function SectionHeading({ title, href, allLabel = 'ดูทั้งหมด' }: { title: string; href: string; allLabel?: string }) {
  return (
    <div className={styles.desktopSectionHeading}>
      <h2>{title}</h2>
      <Link href={href}>{allLabel}<ChevronRight size={12} strokeWidth={3} /></Link>
    </div>
  )
}

export function DesktopHomeLanding({ cms, activeGenre }: { cms: HomeCmsCatalog; activeGenre: string | null }) {
  const genre = activeGenre ? genreFor(activeGenre) : null
  const matchesGenre = (item: HomeCmsCatalog['curatedPicks']['top'][number]) => !genre || item.genreKeys.includes(genre)
  const recommendations = RECOMMENDATIONS.map((column) => ({
    ...column,
    items: cms.recommendColumns[column.key].filter(matchesGenre),
  })).filter((column) => column.items.length > 0)
  const topPicks = cms.curatedPicks.top.filter(matchesGenre)
  const bottomPicks = cms.curatedPicks.bottom.filter(matchesGenre)
  const hasTopPicks = cms.editorsChoice.length > 0 || topPicks.length > 0

  return (
    <div className={styles.desktopFrame} data-home-desktop>
      <div className={styles.desktopStage}>
        <div className={styles.desktopWrap}>
          {(cms.hero.length > 0 || cms.side.length > 0) && (
            <div className={styles.desktopHeroRow}>
              {cms.hero.length > 0 && <div className={styles.desktopHero}>
                <CmsBannerCarousel desktop items={cms.hero} aspect="804 / 296" slideSeconds={cms.slideSeconds} label="เรื่องแนะนำ" priority />
              </div>}
              {cms.side.length > 0 && <div className={styles.desktopSide}>
                <CmsBannerCarousel desktop items={cms.side} aspect="330 / 296" slideSeconds={cms.slideSeconds} label="แบนเนอร์ข้าง Hero" />
              </div>}
            </div>
          )}
          {activeGenre && <div className={styles.desktopGenre}><ActiveGenreChip genre={activeGenre} clearHref="/" /></div>}
          {recommendations.length > 0 && <div className={styles.desktopColumns}>
            {recommendations.map((column) => <section key={column.key}>
              <SectionHeading title={column.title} href={column.href} />
              <HomeBookStrip items={column.items} variant="desktop" slideSeconds={cms.slideSeconds} />
            </section>)}
          </div>}
          {hasTopPicks && <section className={styles.desktopCurated}>
            <SectionHeading title="คัดสรรพิเศษสำหรับคุณ" href="/discover" allLabel="ดูเพิ่มเติม" />
            <div className={styles.desktopPicksRow}>
              {cms.editorsChoice.length > 0 && <div className={styles.desktopEditor}>
                <CmsBannerCarousel desktop items={cms.editorsChoice} aspect="452 / 172" slideSeconds={cms.slideSeconds} label="แบนเนอร์คัดสรรพิเศษสำหรับคุณ" />
              </div>}
              {topPicks.length > 0 && <div className={styles.desktopPicks}>
                <PicksRail items={topPicks} desktop slideSeconds={cms.slideSeconds} />
              </div>}
            </div>
          </section>}
          {cms.promoSlots.some((slot) => slot.length > 0) && <section className={styles.desktopPromos} aria-label="โปรโมชั่นพิเศษ">
            {cms.promoSlots.map((slot, index) => slot.length > 0 && <div key={index} style={{ flexBasis: PROMO_WIDTHS[index] }}>
              <CmsBannerCarousel desktop items={slot} aspect={`${PROMO_WIDTHS[index]} / 171`} slideSeconds={cms.slideSeconds} label={`แบนเนอร์โปรโมชั่นช่อง ${index + 1}`} />
            </div>)}
          </section>}
          {bottomPicks.length > 0 && <section className={styles.desktopBottomPicks} aria-label="คัดสรรพิเศษเพิ่มเติม">
            <PicksRail items={bottomPicks} desktop slideSeconds={cms.slideSeconds} />
          </section>}
        </div>
      </div>
    </div>
  )
}
