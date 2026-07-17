import { MangaLanding } from '@/components/manga/landing/MangaLanding'

type Props = {
  searchParams: Promise<{ genre?: string | string[] }>
}

export default async function MangaPage({ searchParams }: Props) {
  const { genre } = await searchParams
  const activeGenre =
    typeof genre === 'string' ? genre : Array.isArray(genre) ? genre[0] : null
  return <MangaLanding activeGenre={activeGenre} />
}
