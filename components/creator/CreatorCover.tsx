'use client'

import Image from 'next/image'
import { BookOpen, Headphones, ImageIcon } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import type { CreatorWorkType } from '@/lib/creator-studio-types'

export default function CreatorCover({ workId, type, title, className, style, iconSize = 28 }: { workId: string; type: CreatorWorkType; title: string; className?: string; style?: CSSProperties; iconSize?: number }) {
  const [failed, setFailed] = useState(false)
  const Icon = type === 'novel' ? BookOpen : type === 'manga' ? ImageIcon : Headphones
  return <div className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
    {!failed && <Image unoptimized fill sizes="(max-width: 700px) 96px, 160px" src={`/api/creator/works/${encodeURIComponent(workId)}/cover`} alt={`ภาพปก ${title}`} style={{ objectFit: 'cover' }} onError={() => setFailed(true)} />}
    {failed && <Icon size={iconSize} aria-label={`ยังไม่มีภาพปก ${title}`} />}
  </div>
}
