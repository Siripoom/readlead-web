import { DiscoverExperience } from '@/components/discover/DiscoverExperience'
import { getDiscoverPageData, isDiscoverGenre } from '@/lib/discover-catalog'
import type { ContentType } from '@/lib/types'

const CONTENT_TYPES: ContentType[] = ['novel', 'manga', 'audiobook']

function isContentType(value: unknown): value is ContentType {
  return typeof value === 'string' && CONTENT_TYPES.includes(value as ContentType)
}

type Props = {
  searchParams: Promise<{ genre?: string | string[]; type?: string | string[] }>
}

export default async function DiscoverPage({ searchParams }: Props) {
  const params = await searchParams
  const requestedGenre = Array.isArray(params.genre) ? params.genre[0] : params.genre
  const initialGenre = isDiscoverGenre(requestedGenre) ? requestedGenre : null
  const requestedType = Array.isArray(params.type) ? params.type[0] : params.type
  const initialType = isContentType(requestedType) ? requestedType : null
  const data = await getDiscoverPageData()

  return <DiscoverExperience data={data} initialGenre={initialGenre} initialType={initialType} />
}
