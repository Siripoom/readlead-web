import { NovelLanding } from '@/components/novel/landing/NovelLanding'
import { getNovelLandingCatalog } from '@/lib/novel-landing-catalog'

type Props = {
  searchParams: Promise<{ genre?: string | string[] }>
}

export default async function NovelPage({ searchParams }: Props) {
  const [{ genre }, catalogResult] = await Promise.all([
    searchParams,
    getNovelLandingCatalog(),
  ])
  const activeGenre =
    typeof genre === 'string' ? genre : Array.isArray(genre) ? genre[0] : null
  return (
    <NovelLanding
      activeGenre={activeGenre}
      catalog={catalogResult.catalog}
      catalogError={catalogResult.error}
    />
  )
}
