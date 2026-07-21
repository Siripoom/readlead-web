import { HOME_GENRE_LABELS } from '@/lib/home-landing-data'
import { compactNumber, genreFor, isRecord } from '@/lib/cms-catalog'
import type {
  MangaBookItem,
  MangaGenreKey,
  MangaLatestUpdate,
  MangaRankingGroup,
  MangaRankingId,
} from '@/lib/manga-landing-data'

type RawMangaCard = {
  id: string
  type: 'manga'
  title: string
  category: string
  origin: 'original' | 'translated'
  originalLanguage: string | null
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

type RawMangaUpdate = RawMangaCard & {
  latestEpisode: { id: string; episodeNumber: number; title: string; publishedAt: string }
}

type RawMangaLandingPayload = {
  popular: RawMangaCard[]
  newReleases: RawMangaCard[]
  recommended: RawMangaCard[]
  categoryPopular: RawMangaCard[]
  manhwa: RawMangaCard[]
  manhua: RawMangaCard[]
  rankings: Record<MangaRankingId, RawMangaCard[]>
  latestUpdates: RawMangaUpdate[]
}

export type MangaLandingCatalog = {
  popular: MangaBookItem[]
  newReleases: MangaBookItem[]
  recommended: MangaBookItem[]
  categoryPopular: MangaBookItem[]
  manhwa: MangaBookItem[]
  manhua: MangaBookItem[]
  rankings: MangaRankingGroup[]
  latestUpdates: MangaLatestUpdate[]
}

export type MangaLandingCatalogResult = { catalog: MangaLandingCatalog; error: string | null }

const RANKING_LABELS: Record<MangaRankingId, string> = {
  views: 'ยอดวิว',
  daily: 'โหวตรายวัน',
  monthly: 'โหวตรายเดือน',
  new: 'เรื่องใหม่',
}

const FILTER_CATEGORIES: Record<MangaGenreKey, readonly string[]> = {
  action: ['action'], romance: ['romance'], fantasy: ['fantasy'], horror: ['horror'], mystery: ['mystery'],
  'time-travel': ['historical', 'fantasy'], translated: [], 'sci-fi': ['sci-fi'], comedy: ['comedy'],
  school: ['slice-of-life'], 'slice-of-life': ['slice-of-life'], bl: ['bl'], harem: ['romance'],
  'martial-arts': ['action'], historical: ['historical'], game: ['fantasy', 'action'], urban: ['slice-of-life'],
  family: ['drama'], superhero: ['action', 'sci-fi'], adventure: ['action', 'fantasy'],
  thriller: ['mystery', 'horror'], youth: ['slice-of-life'], market: ['slice-of-life', 'drama'],
}

const GRADIENTS = [
  'linear-gradient(155deg,#334a73,#18233d)', 'linear-gradient(155deg,#844a58,#351b28)',
  'linear-gradient(155deg,#4f3d82,#21183f)', 'linear-gradient(155deg,#347064,#15352f)',
  'linear-gradient(155deg,#8b6647,#3d281a)', 'linear-gradient(155deg,#53647f,#222b3b)',
]

const EMPTY_CATALOG: MangaLandingCatalog = {
  popular: [], newReleases: [], recommended: [], categoryPopular: [], manhwa: [], manhua: [],
  rankings: (['views', 'daily', 'monthly', 'new'] as const).map((id) => ({ id, label: RANKING_LABELS[id], items: [] })),
  latestUpdates: [],
}

function isDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function isMangaCard(value: unknown): value is RawMangaCard {
  if (!isRecord(value) || !isRecord(value.creator)) return false
  const application = value.creator.writerApplication
  return value.type === 'manga'
    && typeof value.id === 'string' && typeof value.title === 'string' && typeof value.category === 'string'
    && (value.origin === 'original' || value.origin === 'translated')
    && (value.originalLanguage === null || typeof value.originalLanguage === 'string')
    && typeof value.tagline === 'string' && typeof value.synopsis === 'string'
    && typeof value.views === 'number' && typeof value.dailyVotes === 'number' && typeof value.monthlyVotes === 'number'
    && (value.publishedAt === null || isDateString(value.publishedAt)) && isDateString(value.displayedAt)
    && (value.availability === 'coming_soon' || value.availability === 'published')
    && typeof value.episodeCount === 'number' && typeof value.hasCover === 'boolean'
    && typeof value.creator.name === 'string'
    && (application === null || (isRecord(application) && typeof application.penName === 'string'))
}

function isMangaUpdate(value: unknown): value is RawMangaUpdate {
  if (!isMangaCard(value)) return false
  const episode = (value as RawMangaCard & { latestEpisode?: unknown }).latestEpisode
  return isRecord(episode) && typeof episode.id === 'string' && typeof episode.episodeNumber === 'number'
    && typeof episode.title === 'string' && isDateString(episode.publishedAt)
}

function isPayload(value: unknown): value is RawMangaLandingPayload {
  if (!isRecord(value) || !isRecord(value.rankings)) return false
  const rankings = value.rankings
  const cardLists = ['popular', 'newReleases', 'recommended', 'categoryPopular', 'manhwa', 'manhua'] as const
  const rankingLists = ['views', 'daily', 'monthly', 'new'] as const
  return cardLists.every((key) => Array.isArray(value[key]) && value[key].every(isMangaCard))
    && rankingLists.every((key) => Array.isArray(rankings[key]) && rankings[key].every(isMangaCard))
    && Array.isArray(value.latestUpdates) && value.latestUpdates.every(isMangaUpdate)
}

export function mangaFilterKeys(category: string, origin: 'original' | 'translated'): MangaGenreKey[] {
  const keys = (Object.entries(FILTER_CATEGORIES) as Array<[MangaGenreKey, readonly string[]]>)
    .flatMap(([key, categories]) => categories.includes(category) ? [key] : [])
  if (origin === 'translated') keys.push('translated')
  return Array.from(new Set(keys))
}

function normalizedRegionalLabel(value: string | null) {
  const normalized = value?.normalize('NFKC').trim().toLocaleLowerCase('en-US') ?? ''
  if (['ko', 'kor', 'korean', '한국어'].includes(normalized) || normalized.includes('เกาหลี')) return 'มังฮวา'
  if (['zh', 'zho', 'chi', 'chinese', '中文', '汉语', '漢語'].includes(normalized) || normalized.includes('จีน')) return 'ม่านฮว่า'
  return null
}

function mapCard(raw: RawMangaCard, index: number): MangaBookItem {
  const genre = genreFor(raw.category)
  return {
    id: raw.id,
    detailId: raw.id,
    title: raw.title,
    author: raw.creator.writerApplication?.penName || raw.creator.name,
    genreLabel: genre ? HOME_GENRE_LABELS[genre] : raw.category,
    originLabel: normalizedRegionalLabel(raw.originalLanguage) ?? (raw.origin === 'translated' ? 'มังงะแปล' : 'มังงะ'),
    filterKeys: mangaFilterKeys(raw.category, raw.origin),
    genreKeys: genre ? [genre] : [],
    mediaType: 'read',
    views: compactNumber(raw.views),
    chapters: Math.max(0, raw.episodeCount).toLocaleString('th-TH'),
    workId: raw.id,
    coverUrl: raw.hasCover ? `/api/catalog/works/${encodeURIComponent(raw.id)}/cover` : undefined,
    availability: raw.availability,
    contentType: 'manga',
    gradient: GRADIENTS[index % GRADIENTS.length],
  }
}

function mapRanking(id: MangaRankingId, items: RawMangaCard[]): MangaRankingGroup {
  return {
    id,
    label: RANKING_LABELS[id],
    items: items.map((raw, index) => ({
      ...mapCard(raw, index),
      id: `${id}-${raw.id}`,
      value: id === 'daily' ? raw.dailyVotes.toLocaleString('th-TH')
        : id === 'monthly' ? raw.monthlyVotes.toLocaleString('th-TH') : compactNumber(raw.views),
      tagline: raw.tagline.trim() || raw.synopsis.trim(),
    })),
  }
}

function mapLatest(raw: RawMangaUpdate, index: number): MangaLatestUpdate {
  return { ...mapCard(raw, index), id: raw.latestEpisode.id, updatedLabel: `ตอนที่ ${raw.latestEpisode.episodeNumber}` }
}

export async function getMangaLandingCatalog(genre?: MangaGenreKey | null): Promise<MangaLandingCatalogResult> {
  const baseUrl = process.env.BACKOFFICE_API_URL?.replace(/\/+$/, '')
  if (!baseUrl) return { catalog: EMPTY_CATALOG, error: 'ระบบข้อมูลมังงะยังไม่พร้อมใช้งาน' }
  try {
    const url = new URL('/api/public/catalog/manga-landing', `${baseUrl}/`)
    if (genre) url.searchParams.set('genre', genre)
    const response = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate: 30 } })
    if (!response.ok) throw new Error(`Manga landing API responded with ${response.status}`)
    const payload: unknown = await response.json()
    if (!isPayload(payload)) throw new Error('Manga landing API returned an invalid payload')
    return {
      catalog: {
        popular: payload.popular.map(mapCard),
        newReleases: payload.newReleases.map(mapCard),
        recommended: payload.recommended.map(mapCard),
        categoryPopular: payload.categoryPopular.map(mapCard),
        manhwa: payload.manhwa.map(mapCard),
        manhua: payload.manhua.map(mapCard),
        rankings: (['views', 'daily', 'monthly', 'new'] as const).map((id) => mapRanking(id, payload.rankings[id])),
        latestUpdates: payload.latestUpdates.map(mapLatest),
      },
      error: null,
    }
  } catch (error) {
    console.error('Manga landing catalog load failed', error instanceof Error ? error.message : 'UnknownError')
    return { catalog: EMPTY_CATALOG, error: 'ไม่สามารถโหลดข้อมูลมังงะล่าสุดได้ในขณะนี้' }
  }
}
