import { NovelLanding } from '@/components/novel/landing/NovelLanding'

type Props = {
  searchParams: Promise<{ genre?: string | string[] }>
}

export default async function NovelPage({ searchParams }: Props) {
  const { genre } = await searchParams
  const activeGenre =
    typeof genre === 'string' ? genre : Array.isArray(genre) ? genre[0] : null
  return <NovelLanding activeGenre={activeGenre} />
}
