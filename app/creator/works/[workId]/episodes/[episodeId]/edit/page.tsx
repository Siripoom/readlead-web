'use client'

import { useParams } from 'next/navigation'
import CreatorEpisodePageLoader from '@/components/creator/CreatorEpisodePageLoader'

export default function EditEpisodePage() {
  const { workId, episodeId } = useParams<{ workId: string; episodeId: string }>()
  return <CreatorEpisodePageLoader workId={workId} episodeId={episodeId} />
}
