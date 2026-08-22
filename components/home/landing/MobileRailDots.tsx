'use client'

import { cn } from '@/lib/utils'
import styles from './HomeLanding.module.css'

export function MobileRailDots({
  activePage,
  pageCount,
  onSelect,
  label,
}: {
  activePage: number
  pageCount: number
  onSelect: (page: number) => void
  label: string
}) {
  if (pageCount <= 1) return null

  return (
    <div className={styles.mobileRailDots} role="group" aria-label={label}>
      {Array.from({ length: pageCount }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`ไปยังหน้า ${index + 1}`}
          aria-current={index === activePage ? 'true' : undefined}
          onClick={() => onSelect(index)}
          className={cn(index === activePage && styles.mobileRailDotActive)}
        />
      ))}
    </div>
  )
}
