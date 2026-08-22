import { NovelLanding } from '@/components/novel/landing/NovelLanding'
import { getNovelCmsCatalog } from '@/lib/novel-cms-catalog'
import { getNovelLandingCatalog } from '@/lib/novel-landing-catalog'
import { NOVEL_GENRE_OPTIONS } from '@/lib/novel-landing-data'
import { prepareNovelCmsCatalog, prepareNovelLandingCatalog } from '@/lib/novel-landing-view'
import type { Genre } from '@/lib/types'

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
  const genreKey = activeGenre as Genre | null
  return (
    <NovelLanding
      activeGenre={activeGenre}
      catalog={prepareNovelLandingCatalog(catalogResult.catalog, genreKey)}
      cms={prepareNovelCmsCatalog(cms, genreKey)}
    />
  )
}
