import { notFound } from 'next/navigation'
import { DetailLanding } from '@/components/detail/landing/DetailLanding'
import { getDetailEpisodes, getDetailWork, getRelatedDetailWorks } from '@/lib/detail-catalog'

interface Props {
  searchParams: Promise<{ bookId?: string | string[] }>
}

export default async function DetailPage({ searchParams }: Props) {
  const params = await searchParams
  const detailId = Array.isArray(params.bookId) ? params.bookId[0] : params.bookId
  const work = getDetailWork(detailId)

  if (!work) notFound()

  return (
    <DetailLanding
      work={work}
      episodes={getDetailEpisodes(work.detailId)}
      related={getRelatedDetailWorks(work)}
    />
  )
}
