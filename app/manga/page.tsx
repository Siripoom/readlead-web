import { MangaLanding } from '@/components/manga/landing/MangaLanding'
import { getMangaCmsCatalog } from '@/lib/manga-cms-catalog'
import { MANGA_GENRE_OPTIONS, type MangaGenreKey } from '@/lib/manga-landing-data'
import { getMangaLandingCatalog } from '@/lib/manga-landing-catalog'

type Props = {
  searchParams: Promise<{ genre?: string | string[] }>
}

export default async function MangaPage({ searchParams }: Props) {
  const cmsPromise = getMangaCmsCatalog()
  const { genre } = await searchParams
  const requestedGenre =
    typeof genre === 'string' ? genre : Array.isArray(genre) ? genre[0] : null
  const activeGenre = MANGA_GENRE_OPTIONS.some((option) => option.key === requestedGenre)
    ? requestedGenre as MangaGenreKey
    : null
  const [cms, catalogResult] = await Promise.all([
    cmsPromise,
    getMangaLandingCatalog(activeGenre),
  ])
  return <MangaLanding activeGenre={activeGenre} cms={cms} catalog={catalogResult.catalog} catalogError={catalogResult.error} />
}
