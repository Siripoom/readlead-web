'use client'

import { use } from 'react'
import CreatorEpisodePageLoader from '@/components/creator/CreatorEpisodePageLoader'

export default function NewEpisodePage({ params }: { params: Promise<{ workId: string }> }) {
  const { workId } = use(params)
  return <CreatorEpisodePageLoader workId={workId} />
}
