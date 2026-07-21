import { HOME_GENRE_LABELS } from '@/lib/home-landing-data'
import { compactNumber, genreFor, isRecord } from '@/lib/cms-catalog'
import type {
  AudioBookItem,
  AudioGenreKey,
  AudioLatestUpdate,
  AudioNarrationType,
  AudioRankingGroup,
  AudioRankingId,
} from '@/lib/audiobook-landing-data'

type RawAudioCard = {
  id: string
  type: 'audiobook'
  title: string
  category: string
  origin: 'original' | 'translated'
  narrationType: AudioNarrationType | null
  seriesStatus: string
  tagline: string
  synopsis: string
  views: number
  dailyVotes: number
  monthlyVotes: number
  publishedAt: string | null
  displayedAt: string
  availability: 'coming_soon' | 'published'
  episodeCount: number
  hasCover: boolean
  creator: { name: string; writerApplication: { penName: string } | null }
}

type RawAudioUpdate = RawAudioCard & {
  latestEpisode: { id: string; episodeNumber: number; title: string; publishedAt: string }
}

type RawAudioLandingPayload = {
  popular: RawAudioCard[]
  newReleases: RawAudioCard[]
  humanVoice: RawAudioCard[]
  aiVoice: RawAudioCard[]
  completed: RawAudioCard[]
  recommended: RawAudioCard[]
  categoryPopular: RawAudioCard[]
  rankings: Record<AudioRankingId, RawAudioCard[]>
  latestUpdates: RawAudioUpdate[]
}

export type AudioLandingCatalog = {
  popular: AudioBookItem[]
  newReleases: AudioBookItem[]
  humanVoice: AudioBookItem[]
  aiVoice: AudioBookItem[]
  completed: AudioBookItem[]
  recommended: AudioBookItem[]
  categoryPopular: AudioBookItem[]
  rankings: AudioRankingGroup[]
  latestUpdates: AudioLatestUpdate[]
}

export type AudioLandingCatalogResult = { catalog: AudioLandingCatalog; error: string | null }

const RANKING_LABELS: Record<AudioRankingId, string> = {
  vote_d: 'โหวตแนะนำ', vote_m: 'โหวตรายเดือน', listens: 'ยอดฟัง', new: 'เรื่องใหม่',
}

const FILTER_CATEGORIES: Record<AudioGenreKey, readonly string[]> = {
  action: ['action'], romance: ['romance'], fantasy: ['fantasy'], drama: ['drama'], horror: ['horror'], mystery: ['mystery'],
  'time-travel': ['historical', 'fantasy'], translated: [], 'sci-fi': ['sci-fi'], comedy: ['comedy'],
  school: ['slice-of-life'], 'slice-of-life': ['slice-of-life'], bl: ['bl'], harem: ['romance'],
  'martial-arts': ['action'], historical: ['historical'], game: ['fantasy', 'action'], urban: ['slice-of-life'],
  family: ['drama'], superhero: ['action', 'sci-fi'], adventure: ['action', 'fantasy'],
  thriller: ['mystery', 'horror'], youth: ['slice-of-life'], market: ['slice-of-life', 'drama'],
}

const GRADIENTS = [
  'linear-gradient(155deg,#3d4f7e,#1a2545)', 'linear-gradient(155deg,#8a4d61,#371c2a)',
  'linear-gradient(155deg,#5d468f,#251b48)', 'linear-gradient(155deg,#3d786c,#173a33)',
  'linear-gradient(155deg,#916a48,#402a1b)', 'linear-gradient(155deg,#566b88,#242e42)',
]

const EMPTY_CATALOG: AudioLandingCatalog = {
  popular: [], newReleases: [], humanVoice: [], aiVoice: [], completed: [], recommended: [], categoryPopular: [],
  rankings: (['vote_d', 'vote_m', 'listens', 'new'] as const).map((id) => ({ id, label: RANKING_LABELS[id], items: [] })),
  latestUpdates: [],
}

function isDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function isAudioCard(value: unknown): value is RawAudioCard {
  if (!isRecord(value) || !isRecord(value.creator)) return false
  const application = value.creator.writerApplication
  return value.type === 'audiobook'
    && typeof value.id === 'string' && typeof value.title === 'string' && typeof value.category === 'string'
    && (value.origin === 'original' || value.origin === 'translated')
    && (value.narrationType === null || value.narrationType === 'human' || value.narrationType === 'ai')
    && typeof value.seriesStatus === 'string' && typeof value.tagline === 'string' && typeof value.synopsis === 'string'
    && typeof value.views === 'number' && typeof value.dailyVotes === 'number' && typeof value.monthlyVotes === 'number'
    && (value.publishedAt === null || isDateString(value.publishedAt)) && isDateString(value.displayedAt)
    && (value.availability === 'coming_soon' || value.availability === 'published')
    && typeof value.episodeCount === 'number' && typeof value.hasCover === 'boolean'
    && typeof value.creator.name === 'string'
    && (application === null || (isRecord(application) && typeof application.penName === 'string'))
}

function isAudioUpdate(value: unknown): value is RawAudioUpdate {
  if (!isAudioCard(value)) return false
  const episode = (value as RawAudioCard & { latestEpisode?: unknown }).latestEpisode
  return isRecord(episode) && typeof episode.id === 'string' && typeof episode.episodeNumber === 'number'
    && typeof episode.title === 'string' && isDateString(episode.publishedAt)
}

function isPayload(value: unknown): value is RawAudioLandingPayload {
  if (!isRecord(value) || !isRecord(value.rankings)) return false
  const rankings = value.rankings
  const cardLists = ['popular', 'newReleases', 'humanVoice', 'aiVoice', 'completed', 'recommended', 'categoryPopular'] as const
  const rankingLists = ['vote_d', 'vote_m', 'listens', 'new'] as const
  return cardLists.every((key) => Array.isArray(value[key]) && value[key].every(isAudioCard))
    && rankingLists.every((key) => Array.isArray(rankings[key]) && rankings[key].every(isAudioCard))
    && Array.isArray(value.latestUpdates) && value.latestUpdates.every(isAudioUpdate)
}

export function audioFilterKeys(category: string, origin: 'original' | 'translated'): AudioGenreKey[] {
  const keys = (Object.entries(FILTER_CATEGORIES) as Array<[AudioGenreKey, readonly string[]]>)
    .flatMap(([key, categories]) => categories.includes(category) ? [key] : [])
  if (origin === 'translated') keys.push('translated')
  return Array.from(new Set(keys))
}

function mapCard(raw: RawAudioCard, index: number): AudioBookItem {
  const genre = genreFor(raw.category)
  const narrationType = raw.narrationType ?? 'human'
  return {
    id: raw.id,
    detailId: raw.id,
    title: raw.title,
    author: raw.creator.writerApplication?.penName || raw.creator.name,
    genreLabel: genre ? HOME_GENRE_LABELS[genre] : raw.category,
    originLabel: narrationType === 'ai' ? 'เอไอ' : 'พากย์',
    filterKeys: audioFilterKeys(raw.category, raw.origin),
    genreKeys: genre ? [genre] : [],
    narrationType,
    mediaType: 'audio',
    views: compactNumber(raw.views),
    chapters: Math.max(0, raw.episodeCount).toLocaleString('th-TH'),
    workId: raw.id,
    coverUrl: raw.hasCover ? `/api/catalog/works/${encodeURIComponent(raw.id)}/cover` : undefined,
    availability: raw.availability,
    contentType: 'audiobook',
    gradient: GRADIENTS[index % GRADIENTS.length],
  }
}

function mapRanking(id: AudioRankingId, items: RawAudioCard[]): AudioRankingGroup {
  return {
    id,
    label: RANKING_LABELS[id],
    items: items.map((raw, index) => ({
      ...mapCard(raw, index),
      id: `${id}-${raw.id}`,
      value: id === 'vote_d' ? raw.dailyVotes.toLocaleString('th-TH')
        : id === 'vote_m' ? raw.monthlyVotes.toLocaleString('th-TH') : compactNumber(raw.views),
      tagline: raw.tagline.trim() || raw.synopsis.trim(),
    })),
  }
}

function mapLatest(raw: RawAudioUpdate, index: number): AudioLatestUpdate {
  return { ...mapCard(raw, index), id: raw.latestEpisode.id, updatedLabel: `ตอนที่ ${raw.latestEpisode.episodeNumber}` }
}

export async function getAudioLandingCatalog(genre?: AudioGenreKey | null): Promise<AudioLandingCatalogResult> {
  const baseUrl = process.env.BACKOFFICE_API_URL?.replace(/\/+$/, '')
  if (!baseUrl) return { catalog: EMPTY_CATALOG, error: 'ระบบข้อมูลหนังสือเสียงยังไม่พร้อมใช้งาน' }
  try {
    const url = new URL('/api/public/catalog/audio-landing', `${baseUrl}/`)
    if (genre) url.searchParams.set('genre', genre)
    const response = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate: 30 } })
    if (!response.ok) throw new Error(`Audio landing API responded with ${response.status}`)
    const payload: unknown = await response.json()
    if (!isPayload(payload)) throw new Error('Audio landing API returned an invalid payload')
    return {
      catalog: {
        popular: payload.popular.map(mapCard),
        newReleases: payload.newReleases.map(mapCard),
        humanVoice: payload.humanVoice.map(mapCard),
        aiVoice: payload.aiVoice.map(mapCard),
        completed: payload.completed.map(mapCard),
        recommended: payload.recommended.map(mapCard),
        categoryPopular: payload.categoryPopular.map(mapCard),
        rankings: (['vote_d', 'vote_m', 'listens', 'new'] as const).map((id) => mapRanking(id, payload.rankings[id])),
        latestUpdates: payload.latestUpdates.map(mapLatest),
      },
      error: null,
    }
  } catch (error) {
    console.error('Audio landing catalog load failed', error instanceof Error ? error.message : 'UnknownError')
    return { catalog: EMPTY_CATALOG, error: 'ไม่สามารถโหลดข้อมูลหนังสือเสียงล่าสุดได้ในขณะนี้' }
  }
}
