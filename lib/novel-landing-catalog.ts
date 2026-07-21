import type { HomeBookStripItem, HomeLatestUpdate, HomeRankingColumn } from '@/lib/home-landing-data'
import { HOME_GENRE_LABELS } from '@/lib/home-landing-data'
import { compactNumber as compact, genreFor, isRecord } from '@/lib/cms-catalog'

type RawNovelCard = {
  id: string
  type: 'novel'
  title: string
  category: string
  origin: 'original' | 'translated'
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
  translatedWorks: RawNovelCard[]
  categoryPopular: RawNovelCard[]
  popular: RawNovelCard[]
  rankings: {
    daily: RawNovelCard[]
    monthly: RawNovelCard[]
    views: RawNovelCard[]
    new: RawNovelCard[]
  }
  latestUpdates: RawNovelUpdate[]
}

export type NovelLandingCatalog = {
  newWorks: HomeBookStripItem[]
  newThaiWorks: HomeBookStripItem[]
  translatedWorks: HomeBookStripItem[]
  categoryPopular: HomeBookStripItem[]
  popular: HomeBookStripItem[]
  rankings: HomeRankingColumn[]
  latestUpdates: HomeLatestUpdate[]
}

export type NovelLandingCatalogResult = {
  catalog: NovelLandingCatalog
  error: string | null
}

const RANKING_TITLES: Record<HomeRankingColumn['id'], string> = {
  daily: 'ตั๋วรายวัน',
  monthly: 'ตั๋วรายเดือน',
  views: 'ยอดวิว',
  new: 'เรื่องใหม่',
}
const EMPTY_CATALOG: NovelLandingCatalog = {
  newWorks: [],
  newThaiWorks: [],
  translatedWorks: [],
  categoryPopular: [],
  popular: [],
  rankings: (['daily', 'monthly', 'views', 'new'] as const).map((id) => ({ id, title: RANKING_TITLES[id], items: [] })),
  latestUpdates: [],
}
const REAL_COVER_GRADIENTS = [
  'linear-gradient(155deg,#7886ad,#273556)',
  'linear-gradient(155deg,#986978,#412638)',
  'linear-gradient(155deg,#6b8c80,#243f39)',
  'linear-gradient(155deg,#8d76aa,#382952)',
  'linear-gradient(155deg,#ad855f,#4e3425)',
  'linear-gradient(155deg,#607b9f,#24364f)',
]

function isDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function isNovelCard(value: unknown): value is RawNovelCard {
  if (!isRecord(value) || !isRecord(value.creator)) return false
  const writerApplication = value.creator.writerApplication
  return typeof value.id === 'string'
    && value.type === 'novel'
    && typeof value.title === 'string'
    && typeof value.category === 'string'
    && (value.origin === 'original' || value.origin === 'translated')
    && typeof value.tagline === 'string'
    && typeof value.synopsis === 'string'
    && typeof value.views === 'number'
    && typeof value.dailyVotes === 'number'
    && typeof value.monthlyVotes === 'number'
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
    && Array.isArray(value.translatedWorks) && value.translatedWorks.every(isNovelCard)
    && Array.isArray(value.categoryPopular) && value.categoryPopular.every(isNovelCard)
    && Array.isArray(value.popular) && value.popular.every(isNovelCard)
    && isRecord(value.rankings)
    && Array.isArray(value.rankings.daily) && value.rankings.daily.every(isNovelCard)
    && Array.isArray(value.rankings.monthly) && value.rankings.monthly.every(isNovelCard)
    && Array.isArray(value.rankings.views) && value.rankings.views.every(isNovelCard)
    && Array.isArray(value.rankings.new) && value.rankings.new.every(isNovelCard)
    && Array.isArray(value.latestUpdates) && value.latestUpdates.every(isNovelUpdate)
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
    contentType: 'novel',
    gradient: REAL_COVER_GRADIENTS[index % REAL_COVER_GRADIENTS.length],
  }
}

function mapRankingColumn(id: HomeRankingColumn['id'], items: RawNovelCard[]): HomeRankingColumn {
  return {
    id,
    title: RANKING_TITLES[id],
    items: items.map((raw) => {
      const card = mapCard(raw, 0)
      const value = id === 'daily'
        ? raw.dailyVotes.toLocaleString('th-TH')
        : id === 'monthly'
          ? raw.monthlyVotes.toLocaleString('th-TH')
          : compact(raw.views)
      return {
        id: `${id}-${raw.id}`,
        detailId: raw.id,
        title: raw.title,
        author: card.author,
        value,
        genreLabel: card.genreLabel,
        originLabel: card.originLabel,
        genreKeys: card.genreKeys,
        tagline: raw.tagline,
        coverUrl: card.coverUrl,
        workId: raw.id,
        contentType: 'novel' as const,
      }
    }),
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

export async function getNovelLandingCatalog(category?: string | null): Promise<NovelLandingCatalogResult> {
  const baseUrl = process.env.BACKOFFICE_API_URL?.replace(/\/+$/, '')
  if (!baseUrl) return { catalog: EMPTY_CATALOG, error: 'ระบบข้อมูลนิยายยังไม่พร้อมใช้งาน' }

  try {
    const url = new URL('/api/public/catalog/novel-landing', `${baseUrl}/`)
    if (category) url.searchParams.set('category', category)
    const response = await fetch(url, {
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
        translatedWorks: payload.translatedWorks.map(mapCard),
        categoryPopular: payload.categoryPopular.map(mapCard),
        popular: payload.popular.map(mapCard),
        rankings: (['daily', 'monthly', 'views', 'new'] as const).map((id) => mapRankingColumn(id, payload.rankings[id])),
        latestUpdates: payload.latestUpdates.map(mapUpdate),
      },
      error: null,
    }
  } catch (error) {
    console.error('Novel landing catalog load failed', error instanceof Error ? error.message : 'UnknownError')
    return { catalog: EMPTY_CATALOG, error: 'ไม่สามารถโหลดข้อมูลนิยายล่าสุดได้ในขณะนี้' }
  }
}
