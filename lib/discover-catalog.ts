import { MOCK_WORKS } from '@/lib/mock-data'
import type { ContentType, Genre, WorkStatus } from '@/lib/types'
import {
  absoluteMediaUrl,
  cmsPlacement,
  enabledCmsSection,
  findCmsSection,
  isRecord,
  parseCmsBanner,
  type CmsBanner,
} from '@/lib/cms-catalog'
import type { PublicCreatorWork } from '@/lib/server-creator-catalog'

export const DISCOVER_GENRES = [
  'romance', 'fantasy', 'action', 'mystery', 'horror', 'comedy',
  'drama', 'historical', 'sci-fi', 'slice-of-life', 'bl', 'gl',
] as const satisfies readonly Genre[]

export type DiscoverGenre = (typeof DISCOVER_GENRES)[number]
export type DiscoverOrigin = 'original' | 'translated'
export type DiscoverNarration = 'human' | 'ai' | null
export type DiscoverMangaRegion = 'thai' | 'manhwa' | 'manhua' | 'manga'

export type DiscoverWork = {
  id: string
  detailId: string
  type: ContentType
  title: string
  author: string
  authorId: string
  category: string
  genres: Genre[]
  tags: string[]
  synopsis: string
  status: WorkStatus
  origin: DiscoverOrigin
  narrationType: DiscoverNarration
  mangaRegion: DiscoverMangaRegion
  coverUrl?: string
  coverGradient: string
  views: number
  votes: number
  comments: number
  episodes: number
  rating: number
  publishedAt: string
  updatedAt: string
  isMock: boolean
}

export type DiscoverCmsData = {
  hero: CmsBanner
  categoryImages: Array<string | null>
  sectionState: {
    hero: 'enabled' | 'disabled' | 'unavailable'
    categories: 'enabled' | 'disabled' | 'unavailable'
  }
}

export type DiscoverPageData = {
  works: DiscoverWork[]
  cms: DiscoverCmsData
  catalogSource: 'live' | 'mixed' | 'mock'
}

type CatalogListItem = {
  id: string
  type: ContentType
  title: string
  category: string
  tagline: string
  seriesStatus: string
  publishedAt: string | null
  updatedAt: string
  views: number
  dailyVotes: number
  monthlyVotes: number
  reviewCount: number
  creator: { id: string; name: string; writerApplication: { penName: string } | null }
  _count: { episodes: number }
}

const GRADIENTS = [
  'linear-gradient(150deg,#7c89ad,#273553)',
  'linear-gradient(150deg,#a16d79,#432937)',
  'linear-gradient(150deg,#6e9489,#26423b)',
  'linear-gradient(150deg,#967eb0,#3b2c54)',
  'linear-gradient(150deg,#b28b65,#523727)',
  'linear-gradient(150deg,#6681a5,#263a54)',
]

const FALLBACK_HERO: CmsBanner = {
  id: 'discover-fallback-hero',
  title: 'ค้นพบเรื่องที่ใช่ในแบบของคุณ',
  imageUrl: '/discover/hero-reference.jpg',
  mobileImageUrl: '/discover/hero-reference.jpg',
  background: 'linear-gradient(110deg,#f1f5fb,#dce8fa 56%,#a8c3ec)',
  focal: { x: 50, y: 20, zoom: 100 },
  elements: [
    { id: 'fallback-title', type: 'title', text: 'ค้นพบเรื่องที่ใช่ในแบบของคุณ', x: 3.7, y: 21, scale: 1, color: '#2e2a3d', bold: true },
    { id: 'fallback-text', type: 'text', text: 'ค้นหานิยาย เว็บตูน หนังสือเสียงที่คุณสนใจ', x: 3.7, y: 44, scale: 1, color: '#6b6580' },
  ],
}

const EMPTY_CMS: DiscoverCmsData = {
  hero: FALLBACK_HERO,
  categoryImages: Array.from({ length: 7 }, () => null),
  sectionState: { hero: 'unavailable', categories: 'unavailable' },
}

export function isDiscoverGenre(value: unknown): value is DiscoverGenre {
  return typeof value === 'string' && DISCOVER_GENRES.includes(value as DiscoverGenre)
}

function genreOf(value: string): Genre {
  return isDiscoverGenre(value) ? value : 'fantasy'
}

function workStatus(value: string): WorkStatus {
  if (value === 'completed' || value === 'hiatus') return value
  return 'ongoing'
}

function normalizeTitle(value: string) {
  return value.normalize('NFKC').trim().toLocaleLowerCase('th-TH').replace(/\s+/g, ' ')
}

function mangaRegion(tags: string[], origin: DiscoverOrigin, index: number): DiscoverMangaRegion {
  const text = tags.join(' ').normalize('NFKC').toLocaleLowerCase('th-TH')
  if (/มังฮวา|manhwa|เกาหลี/.test(text)) return 'manhwa'
  if (/ม่านฮว่า|manhua|จีน/.test(text)) return 'manhua'
  if (/มังงะ|manga|ญี่ปุ่น/.test(text)) return 'manga'
  if (origin === 'original') return 'thai'
  return (['manhua', 'manhwa', 'manga'] as const)[index % 3]
}

function parseCatalogItem(value: unknown): CatalogListItem | null {
  if (!isRecord(value) || !['novel', 'manga', 'audiobook'].includes(String(value.type))) return null
  if (
    typeof value.id !== 'string' || typeof value.title !== 'string' || typeof value.category !== 'string'
    || typeof value.tagline !== 'string' || typeof value.seriesStatus !== 'string'
    || typeof value.updatedAt !== 'string' || typeof value.views !== 'number'
    || typeof value.dailyVotes !== 'number' || typeof value.monthlyVotes !== 'number'
    || typeof value.reviewCount !== 'number' || !isRecord(value.creator) || !isRecord(value._count)
  ) return null
  if (typeof value.creator.id !== 'string' || typeof value.creator.name !== 'string' || typeof value._count.episodes !== 'number') return null
  const writerApplication = isRecord(value.creator.writerApplication) && typeof value.creator.writerApplication.penName === 'string'
    ? { penName: value.creator.writerApplication.penName }
    : null
  return {
    id: value.id,
    type: value.type as ContentType,
    title: value.title,
    category: value.category,
    tagline: value.tagline,
    seriesStatus: value.seriesStatus,
    publishedAt: typeof value.publishedAt === 'string' ? value.publishedAt : null,
    updatedAt: value.updatedAt,
    views: value.views,
    dailyVotes: value.dailyVotes,
    monthlyVotes: value.monthlyVotes,
    reviewCount: value.reviewCount,
    creator: { id: value.creator.id, name: value.creator.name, writerApplication },
    _count: { episodes: value._count.episodes },
  }
}

function liveWork(list: CatalogListItem, detail: PublicCreatorWork | null, index: number): DiscoverWork {
  const origin = detail?.origin === 'translated' ? 'translated' : 'original'
  const tags = detail?.tags ?? []
  const genres = [genreOf(detail?.category ?? list.category)]
  const type = detail?.type ?? list.type
  return {
    id: `discover-live-${list.id}`,
    detailId: list.id,
    type,
    title: detail?.title ?? list.title,
    author: detail ? detail.creator.writerApplication?.penName || detail.creator.name : list.creator.writerApplication?.penName || list.creator.name,
    authorId: detail?.creator.id ?? list.creator.id,
    category: detail?.category ?? list.category,
    genres,
    tags,
    synopsis: detail?.synopsis || detail?.tagline || list.tagline,
    status: workStatus(detail?.seriesStatus ?? list.seriesStatus),
    origin,
    narrationType: type === 'audiobook' ? detail?.narrationType ?? 'human' : null,
    mangaRegion: mangaRegion(tags, origin, index),
    coverUrl: detail?.hasCover ? `/api/catalog/works/${encodeURIComponent(list.id)}/cover` : undefined,
    coverGradient: GRADIENTS[index % GRADIENTS.length],
    views: detail?.views ?? list.views,
    votes: (detail?.dailyVotes ?? list.dailyVotes) + (detail?.monthlyVotes ?? list.monthlyVotes),
    comments: detail?.commentCount ?? list.reviewCount,
    episodes: detail?.episodes.length ?? list._count.episodes,
    rating: detail?.reviews.length ? detail.reviews.reduce((sum, review) => sum + review.rating, 0) / detail.reviews.length : 0,
    publishedAt: detail?.publishedAt ?? list.publishedAt ?? list.updatedAt,
    updatedAt: detail?.updatedAt ?? list.updatedAt,
    isMock: false,
  }
}

function mockWork(index: number): DiscoverWork {
  const work = MOCK_WORKS[index]
  const origin = work.origin === 'translated' ? 'translated' : 'original'
  return {
    id: `discover-mock-${work.id}`,
    detailId: work.id,
    type: work.type,
    title: work.title,
    author: work.authorName,
    authorId: work.authorId,
    category: work.genres[0] ?? 'fantasy',
    genres: work.genres,
    tags: work.tags,
    synopsis: work.synopsis,
    status: work.status,
    origin,
    narrationType: work.type === 'audiobook' ? (index % 2 ? 'ai' : 'human') : null,
    mangaRegion: mangaRegion(work.tags, origin, index),
    coverUrl: work.coverUrl,
    coverGradient: GRADIENTS[index % GRADIENTS.length],
    views: work.viewCount,
    votes: work.voteCount + work.weeklyVoteCount,
    comments: Math.max(24, Math.round(work.voteCount / 5)),
    episodes: work.episodeCount,
    rating: work.rating,
    publishedAt: work.updatedAt,
    updatedAt: work.updatedAt,
    isMock: true,
  }
}

async function getLiveWorks(baseUrl: string): Promise<DiscoverWork[]> {
  const response = await fetch(`${baseUrl}/api/public/catalog/works?pageSize=50`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 30 },
  })
  if (!response.ok) throw new Error(`Discover catalog API responded with ${response.status}`)
  const payload: unknown = await response.json()
  if (!isRecord(payload) || !Array.isArray(payload.items)) throw new Error('Discover catalog API returned an invalid payload')
  const items = payload.items.flatMap((item) => {
    const parsed = parseCatalogItem(item)
    return parsed ? [parsed] : []
  })
  const details = await Promise.all(items.map(async (item) => {
    try {
      const detailResponse = await fetch(`${baseUrl}/api/public/catalog/works/${encodeURIComponent(item.id)}`, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 30 },
      })
      if (!detailResponse.ok) return null
      const detailPayload: unknown = await detailResponse.json()
      if (!isRecord(detailPayload) || !isRecord(detailPayload.work)) return null
      return detailPayload.work as unknown as PublicCreatorWork
    } catch {
      return null
    }
  }))
  return items.map((item, index) => liveWork(item, details[index], index))
}

function stateFor(payload: unknown, key: string): 'enabled' | 'disabled' | 'unavailable' {
  const section = findCmsSection(payload, key)
  if (!section) return 'unavailable'
  return section.enabled === false ? 'disabled' : 'enabled'
}

async function getDiscoverCms(baseUrl: string): Promise<DiscoverCmsData> {
  try {
    const response = await fetch(`${baseUrl}/api/public/cms/search`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 30 },
    })
    if (!response.ok) throw new Error(`Discover CMS API responded with ${response.status}`)
    const payload: unknown = await response.json()
    const heroSection = enabledCmsSection(payload, 'hero')
    const cmsHero = (heroSection?.items ?? []).flatMap((item) => {
      const banner = parseCmsBanner(item, baseUrl)
      return banner ? [banner] : []
    })[0]
    // A color-only CMS placeholder is not treated as final artwork. Keep the
    // reference design until an editor uploads an actual desktop/mobile image.
    const hero = cmsHero?.imageUrl ? cmsHero : FALLBACK_HERO
    const categorySection = enabledCmsSection(payload, 'search-categories')
    const categoryImages = Array.from({ length: 7 }, () => null as string | null)
    for (const item of categorySection?.items ?? []) {
      if (!isRecord(item)) continue
      const placement = cmsPlacement(item.placement)
      const rawGroup = isRecord(item.placement) && typeof item.placement.group === 'string' ? item.placement.group : null
      const slot = rawGroup && /^\d$/.test(rawGroup) ? Number(rawGroup) : placement.column
      const imageUrl = absoluteMediaUrl(item.imageUrl, baseUrl)
      if (imageUrl && slot >= 0 && slot < categoryImages.length) categoryImages[slot] = imageUrl
    }
    return {
      hero,
      categoryImages,
      sectionState: {
        hero: stateFor(payload, 'hero'),
        categories: stateFor(payload, 'search-categories'),
      },
    }
  } catch (error) {
    console.error('Discover CMS load failed', error instanceof Error ? error.message : 'UnknownError')
    return EMPTY_CMS
  }
}

function mergeWithMocks(live: DiscoverWork[]) {
  const result = [...live]
  const ids = new Set(live.map((work) => work.detailId))
  const titles = new Set(live.map((work) => normalizeTitle(work.title)))
  for (let index = 0; index < MOCK_WORKS.length; index += 1) {
    const candidate = mockWork(index)
    if (ids.has(candidate.detailId) || titles.has(normalizeTitle(candidate.title))) continue
    result.push(candidate)
    ids.add(candidate.detailId)
    titles.add(normalizeTitle(candidate.title))
  }
  return result
}

export async function getDiscoverPageData(): Promise<DiscoverPageData> {
  const baseUrl = process.env.BACKOFFICE_API_URL?.replace(/\/+$/, '')
  if (!baseUrl) return { works: mergeWithMocks([]), cms: EMPTY_CMS, catalogSource: 'mock' }
  const [cms, liveResult] = await Promise.all([
    getDiscoverCms(baseUrl),
    getLiveWorks(baseUrl).catch((error) => {
      console.error('Discover catalog load failed', error instanceof Error ? error.message : 'UnknownError')
      return []
    }),
  ])
  const works = mergeWithMocks(liveResult)
  return {
    works,
    cms,
    catalogSource: liveResult.length === 0 ? 'mock' : works.length === liveResult.length ? 'live' : 'mixed',
  }
}
