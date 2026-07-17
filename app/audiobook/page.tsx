import { AudioLanding } from '@/components/audiobook/landing/AudioLanding'

type Props = {
  searchParams: Promise<{ genre?: string | string[] }>
}

export default async function AudiobookPage({ searchParams }: Props) {
  const { genre } = await searchParams
  const activeGenre =
    typeof genre === 'string' ? genre : Array.isArray(genre) ? genre[0] : null
  return <AudioLanding activeGenre={activeGenre} />
}
