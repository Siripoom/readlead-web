import { AudioLanding } from '@/components/audiobook/landing/AudioLanding'
import { getAudioCmsCatalog } from '@/lib/audio-cms-catalog'
import { getAudioLandingCatalog } from '@/lib/audio-landing-catalog'
import { AUDIO_GENRE_OPTIONS, type AudioGenreKey } from '@/lib/audiobook-landing-data'

type Props = {
  searchParams: Promise<{ genre?: string | string[] }>
}

export default async function AudiobookPage({ searchParams }: Props) {
  const cmsPromise = getAudioCmsCatalog()
  const { genre } = await searchParams
  const requestedGenre =
    typeof genre === 'string' ? genre : Array.isArray(genre) ? genre[0] : null
  const activeGenre = AUDIO_GENRE_OPTIONS.some((option) => option.key === requestedGenre)
    ? requestedGenre as AudioGenreKey
    : null
  const [cms, catalogResult] = await Promise.all([cmsPromise, getAudioLandingCatalog(activeGenre)])
  return <AudioLanding activeGenre={activeGenre} cms={cms} catalog={catalogResult.catalog} catalogError={catalogResult.error} />
}
