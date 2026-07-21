import { NovelLanding } from '@/components/novel/landing/NovelLanding'
import { getNovelCmsCatalog } from '@/lib/novel-cms-catalog'
import { getNovelLandingCatalog } from '@/lib/novel-landing-catalog'
import { NOVEL_GENRE_OPTIONS } from '@/lib/novel-landing-data'

type Props = {
  searchParams: Promise<{ genre?: string | string[] }>
}

export default async function NovelPage({ searchParams }: Props) {
  const cmsPromise = getNovelCmsCatalog()
  const { genre } = await searchParams
  const requestedGenre = typeof genre === 'string' ? genre : Array.isArray(genre) ? genre[0] : null
  const activeGenre = requestedGenre && NOVEL_GENRE_OPTIONS.some((option) => option.genre === requestedGenre)
    ? requestedGenre
    : null
  const [cms, catalogResult] = await Promise.all([
    cmsPromise,
    getNovelLandingCatalog(activeGenre),
  ])
  return (
    <NovelLanding
      activeGenre={activeGenre}
      catalog={catalogResult.catalog}
      catalogError={catalogResult.error}
      cms={cms}
    />
  )
}
