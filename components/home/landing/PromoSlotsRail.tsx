'use client'

import type { CmsBanner } from '@/lib/cms-catalog'
import { cn } from '@/lib/utils'
import { CmsBannerCarousel } from './CmsBannerCarousel'
import styles from './HomeLanding.module.css'
import { MobileRailDots } from './MobileRailDots'
import { useHorizontalScroll } from './useHorizontalScroll'

export function PromoSlotsRail({ items, slideSeconds }: { items: CmsBanner[][]; slideSeconds: number }) {
  const {
    rowRef,
    activePage,
    pageCount,
    updateControls,
    scrollToPage,
    pointerHandlers,
  } = useHorizontalScroll({ autoplayMs: 3000, stopAutoplayAfterInteraction: true })
  const visibleSlots = items.filter((slot) => slot.length > 0)

  if (visibleSlots.length === 0) return null

  return (
    <div>
      <div
        ref={rowRef}
        onScroll={updateControls}
        className={cn(styles.scrollRow, 'flex gap-3 overflow-x-auto pb-1 pt-1')}
        {...pointerHandlers}
      >
        {visibleSlots.map((slot, index) => (
          <div key={slot.map((item) => item.id).join(':')} className="w-[177px] shrink-0 snap-start">
            <CmsBannerCarousel
              items={slot}
              aspect="177 / 111"
              mobileAspect="177 / 111"
              slideSeconds={slideSeconds}
              label={`แบนเนอร์โปรโมชั่นช่อง ${index + 1}`}
            />
          </div>
        ))}
      </div>
      <MobileRailDots
        activePage={activePage}
        pageCount={pageCount}
        onSelect={(page) => scrollToPage(page, true)}
        label="เลือกหน้าโปรโมชั่น"
      />
    </div>
  )
}
