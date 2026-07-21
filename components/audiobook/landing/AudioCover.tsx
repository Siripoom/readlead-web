'use client'

import Image from 'next/image'
import { useState } from 'react'
import { AudioCoverArt } from './AudioCoverArt'

type Props = { index: number; coverUrl?: string; title: string; sizes?: string }

export function AudioCover({ index, coverUrl, title, sizes = '(max-width: 640px) 160px, 180px' }: Props) {
  const [failed, setFailed] = useState(false)
  return (
    <>
      <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.03]">
        <AudioCoverArt index={index} />
      </div>
      {coverUrl && !failed && (
        <Image
          unoptimized
          fill
          sizes={sizes}
          src={coverUrl}
          alt={`ภาพปก ${title}`}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          onError={() => setFailed(true)}
        />
      )}
    </>
  )
}
