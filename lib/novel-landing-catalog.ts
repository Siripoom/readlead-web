import type { HomeBookStripItem, HomeLatestUpdate } from '@/lib/home-landing-data'
import { HOME_GENRE_LABELS } from '@/lib/home-landing-data'
import type { Genre } from '@/lib/types'

type RawNovelCard = {
  id: string
  title: string
  category: string
  origin: 'original' | 'translated'
  tagline: string
  synopsis: string
  views: number
  publishedAt: string | null
  displayedAt: string
  availability: 'coming_soon' | 'published'
  episodeCount: number
  hasCover: boolean
  creator: { name: string; writerApplication: { penName: string } | null }
}

type RawNovelUpdate = RawNovelCard & {
  latestEpisode: {
    id: string
    episodeNumber: number
    title: string
    publishedAt: string
  }
}

type RawNovelLandingPayload = {
  newWorks: RawNovelCard[]
  newThaiWorks: RawNovelCard[]
  latestUpdates: RawNovelUpdate[]
}

export type NovelLandingCatalog = {
  newWorks: HomeBookStripItem[]
  newThaiWorks: HomeBookStripItem[]
  latestUpdates: HomeLatestUpdate[]
}

export type NovelLandingCatalogResult = {
  catalog: NovelLandingCatalog
  error: string | null
}

const EMPTY_CATALOG: NovelLandingCatalog = { newWorks: [], newThaiWorks: [], latestUpdates: [] }
const GENRES = new Set<Genre>([
  'romance', 'fantasy', 'action', 'mystery', 'horror', 'comedy',
  'drama', 'historical', 'sci-fi', 'slice-of-life', 'bl', 'gl',
])
const REAL_COVER_GRADIENTS = [
  'linear-gradient(155deg,#7886ad,#273556)',
  'linear-gradient(155deg,#986978,#412638)',
  'linear-gradient(155deg,#6b8c80,#243f39)',
  'linear-gradient(155deg,#8d76aa,#382952)',
  'linear-gradient(155deg,#ad855f,#4e3425)',
  'linear-gradient(155deg,#607b9f,#24364f)',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function isNovelCard(value: unknown): value is RawNovelCard {
  if (!isRecord(value) || !isRecord(value.creator)) return false
  const writerApplication = value.creator.writerApplication
  return typeof value.id === 'string'
    && typeof value.title === 'string'
    && typeof value.category === 'string'
    && (value.origin === 'original' || value.origin === 'translated')
    && typeof value.tagline === 'string'
    && typeof value.synopsis === 'string'
    && typeof value.views === 'number'
    && (value.publishedAt === null || isDateString(value.publishedAt))
    && isDateString(value.displayedAt)
    && (value.availability === 'coming_soon' || value.availability === 'published')
    && typeof value.episodeCount === 'number'
    && typeof value.hasCover === 'boolean'
    && typeof value.creator.name === 'string'
    && (writerApplication === null
      || (isRecord(writerApplication) && typeof writerApplication.penName === 'string'))
}

function isNovelUpdate(value: unknown): value is RawNovelUpdate {
  if (!isNovelCard(value)) return false
  const candidate = value as RawNovelCard & { latestEpisode?: unknown }
  if (!isRecord(candidate.latestEpisode)) return false
  return typeof candidate.latestEpisode.id === 'string'
    && typeof candidate.latestEpisode.episodeNumber === 'number'
    && typeof candidate.latestEpisode.title === 'string'
    && isDateString(candidate.latestEpisode.publishedAt)
}

function isPayload(value: unknown): value is RawNovelLandingPayload {
  return isRecord(value)
    && Array.isArray(value.newWorks) && value.newWorks.every(isNovelCard)
    && Array.isArray(value.newThaiWorks) && value.newThaiWorks.every(isNovelCard)
    && Array.isArray(value.latestUpdates) && value.latestUpdates.every(isNovelUpdate)
}

function genreFor(category: string): Genre | null {
  return GENRES.has(category as Genre) ? category as Genre : null
}

function compact(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Math.max(0, value))
}

function mapCard(raw: RawNovelCard, index: number): HomeBookStripItem {
  const genre = genreFor(raw.category)
  return {
    id: raw.id,
    detailId: raw.id,
    title: raw.title,
    author: raw.creator.writerApplication?.penName || raw.creator.name,
    genreLabel: genre ? HOME_GENRE_LABELS[genre] : raw.category,
    originLabel: raw.origin === 'translated' ? 'แปล' : 'ไทย',
    genreKeys: genre ? [genre] : [],
    mediaType: 'read',
    views: compact(raw.views),
    chapters: Math.max(0, raw.episodeCount).toLocaleString('th-TH'),
    workId: raw.id,
    coverUrl: raw.hasCover ? `/api/catalog/works/${encodeURIComponent(raw.id)}/cover` : undefined,
    availability: raw.availability,
    gradient: REAL_COVER_GRADIENTS[index % REAL_COVER_GRADIENTS.length],
  }
}

function mapUpdate(raw: RawNovelUpdate, index: number): HomeLatestUpdate {
  const card = mapCard(raw, index)
  return {
    id: raw.latestEpisode.id,
    detailId: raw.id,
    title: raw.title,
    author: card.author,
    genreLabel: card.genreLabel,
    originLabel: card.originLabel,
    genreKeys: card.genreKeys,
    description: raw.synopsis.trim() || raw.tagline.trim(),
    episode: String(raw.latestEpisode.episodeNumber),
    episodeTitle: raw.latestEpisode.title,
    updatedAt: raw.latestEpisode.publishedAt,
    workId: raw.id,
    coverUrl: card.coverUrl,
    gradient: card.gradient,
  }
}

export async function getNovelLandingCatalog(): Promise<NovelLandingCatalogResult> {
  const baseUrl = process.env.BACKOFFICE_API_URL?.replace(/\/+$/, '')
  if (!baseUrl) return { catalog: EMPTY_CATALOG, error: 'ระบบข้อมูลนิยายยังไม่พร้อมใช้งาน' }

  try {
    const response = await fetch(`${baseUrl}/api/public/catalog/novel-landing`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 30 },
    })
    if (!response.ok) throw new Error(`Novel landing API responded with ${response.status}`)
    const payload: unknown = await response.json()
    if (!isPayload(payload)) throw new Error('Novel landing API returned an invalid payload')
    return {
      catalog: {
        newWorks: payload.newWorks.map(mapCard),
        newThaiWorks: payload.newThaiWorks.map(mapCard),
        latestUpdates: payload.latestUpdates.map(mapUpdate),
      },
      error: null,
    }
  } catch (error) {
    console.error('Novel landing catalog load failed', error instanceof Error ? error.message : 'UnknownError')
    return { catalog: EMPTY_CATALOG, error: 'ไม่สามารถโหลดข้อมูลนิยายล่าสุดได้ในขณะนี้' }
  }
}
