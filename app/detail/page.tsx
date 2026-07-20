import { notFound } from 'next/navigation'
import { DetailLanding } from '@/components/detail/landing/DetailLanding'
import { getDetailEpisodes, getDetailWork, getRelatedDetailWorks, type DetailReview } from '@/lib/detail-catalog'
import { mapPublicCreatorWork, type PublicCreatorWork } from '@/lib/server-creator-catalog'

interface Props {
  searchParams: Promise<{ bookId?: string | string[] }>
}

export default async function DetailPage({ searchParams }: Props) {
  const params = await searchParams
  const detailId = Array.isArray(params.bookId) ? params.bookId[0] : params.bookId
  let work = getDetailWork(detailId)
  let episodes = work ? getDetailEpisodes(work.detailId) : []
  let initialReviews: DetailReview[] | undefined
  let serverBacked = false

  if (!work && detailId) {
    const base = process.env.BACKOFFICE_API_URL?.replace(/\/+$/, '')
    if (base) {
      const response = await fetch(`${base}/api/public/catalog/works/${encodeURIComponent(detailId)}`, { cache: 'no-store' }).catch(() => null)
      if (response?.ok) {
        const data = await response.json() as { work: PublicCreatorWork }
        const mapped = mapPublicCreatorWork(data.work)
        work = mapped.work; episodes = mapped.episodes; initialReviews = mapped.reviews; serverBacked = true
      }
    }
  }

  if (!work) notFound()

  return (
    <DetailLanding
      work={work}
      episodes={episodes}
      related={getRelatedDetailWorks(work)}
      initialReviews={initialReviews}
      serverBacked={serverBacked}
    />
  )
}
