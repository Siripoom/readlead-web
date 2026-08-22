'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { CmsBanner } from '@/lib/cms-catalog'
import type { AudioBookItem, AudioGenreKey, AudioGenreOption } from '@/lib/audiobook-landing-data'
import { AudioBannerCarousel } from './AudioBannerCarousel'
import { AudioBookCard } from './AudioBookCarousel'
import styles from './AudioLanding.module.css'

type Props = {
  items: AudioBookItem[]
  primaryOptions: AudioGenreOption[]
  allOptions: AudioGenreOption[]
  activeGenre: AudioGenreKey | null
  banners: CmsBanner[]
  slideSeconds: number
}

function GenreLink({ option, activeGenre, compact = false }: { option: AudioGenreOption; activeGenre: AudioGenreKey | null; compact?: boolean }) {
  return (
    <Link
      href={`/audiobook?genre=${option.key}`}
      aria-current={activeGenre === option.key ? 'page' : undefined}
      className={`${styles.genreLink} ${compact ? styles.genreLinkCompact : ''} ${activeGenre === option.key ? styles.genreLinkActive : ''}`}
    >
      {option.label}
    </Link>
  )
}

export function AudioGenreSpotlight({ items, primaryOptions, allOptions, activeGenre, banners, slideSeconds }: Props) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div>
      {banners.length > 0 && (
        <div className={styles.categoryBanner}>
          <AudioBannerCarousel items={banners} aspect="1152 / 228" slideSeconds={slideSeconds} label="เติมเต็มทุกอารมณ์" />
        </div>
      )}
      <div className={`${styles.genrePanel} ${expanded ? styles.genrePanelExpanded : ''}`}>
        <div className={styles.genrePrimary}>
          {primaryOptions.map((option) => <GenreLink key={option.key} option={option} activeGenre={activeGenre} />)}
          <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
            ดูหมวดหมู่ทั้งหมด <ChevronDown />
          </button>
        </div>
        {expanded && (
          <div className={styles.genreAll}>
            {allOptions.slice(0, 21).map((option) => <GenreLink compact key={option.key} option={option} activeGenre={activeGenre} />)}
          </div>
        )}
      </div>
      <div className={styles.categoryBooks}>
        {items.slice(0, 6).map((item, index) => <AudioBookCard key={item.id} item={item} index={index} />)}
      </div>
    </div>
  )
}
