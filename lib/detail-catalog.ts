import {
  HOME_LATEST_UPDATES,
  HOME_LIMITED_OFFERS,
  HOME_POPULAR_BOOKS,
  HOME_RANKING_COLUMNS,
  HOME_RECOMMENDED_BOOKS,
  type HomeBookStripItem,
} from '@/lib/home-landing-data'
import {
  NOVEL_CATEGORY_BOOKS,
  NOVEL_EDITORIAL_PICKS,
  NOVEL_NEW_BOOKS,
  NOVEL_POPULAR_BOOKS,
  NOVEL_THAI_BOOKS,
  NOVEL_TRANSLATED_BOOKS,
} from '@/lib/novel-landing-data'
import { AUDIO_DETAIL_BOOKS, type AudioBookItem } from '@/lib/audiobook-landing-data'
import { MANGA_DETAIL_BOOKS, type MangaBookItem } from '@/lib/manga-landing-data'
import { RANKING_WORKS } from '@/lib/ranking-page-data'
import { MOCK_EPISODES, MOCK_WORKS } from '@/lib/mock-data'
import type { ContentType, Episode, Genre, Work, WorkStatus } from '@/lib/types'

export interface DetailCatalogItem extends Work {
  detailId: string
  coverGradient: string
  genreLabel: string
  originLabel: string
  narrationType?: 'human' | 'ai'
  availability?: 'coming_soon' | 'published'
}

export type DetailEpisode = Episode

export interface DetailReview {
  id: string
  detailId: string
  userId: string
  authorName: string
  rating: number
  body: string
  recommended: boolean
  spoiler: boolean
  likes: number
  dislikes: number
  viewerReaction?: 'like' | 'dislike' | null
  replies: Array<{ id: string; userId: string; authorName: string; body: string; createdAt: string; updatedAt?: string }>
  createdAt: string
  updatedAt?: string
}

export interface DetailSupportLog {
  id: string
  detailId: string
  userName: string
  kind: 'recommended' | 'monthly' | 'tip'
  amount: number
  message?: string
  createdAt: string
}

const FALLBACK_GRADIENTS = [
  'linear-gradient(155deg,#985267,#321b2a)',
  'linear-gradient(155deg,#526d98,#1e2c49)',
  'linear-gradient(155deg,#6d5598,#281c49)',
  'linear-gradient(155deg,#3d796b,#173930)',
  'linear-gradient(155deg,#9b704d,#432b1b)',
]

const DEFAULT_SYNOPSIS = 'เรื่องราวที่เริ่มต้นจากการพบกันโดยบังเอิญ ก่อนพาทุกคนออกเดินทางผ่านความลับ ความฝัน และบททดสอบที่อาจเปลี่ยนชะตาชีวิตไปตลอดกาล'

function parseCount(value: string | number | undefined, fallback: number) {
  if (typeof value === 'number') return value
  if (!value) return fallback
  const normalized = value.replace(/,/g, '').trim().toUpperCase()
  const amount = Number.parseFloat(normalized)
  if (!Number.isFinite(amount)) return fallback
  if (normalized.endsWith('M')) return Math.round(amount * 1_000_000)
  if (normalized.endsWith('K')) return Math.round(amount * 1_000)
  return Math.round(amount)
}

function hash(value: string) {
  return Array.from(value).reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0, 17)
}

function makeItem(input: {
  detailId: string
  type: ContentType
  title: string
  author: string
  genres?: Genre[]
  genreLabel?: string
  originLabel?: string
  gradient?: string
  views?: string | number
  chapters?: string | number
  synopsis?: string
  status?: WorkStatus
  narrationType?: 'human' | 'ai'
  votes?: number
  monthlyVotes?: number
  updatedAt?: string
}): DetailCatalogItem {
  const seed = hash(input.detailId)
  const episodeCount = Math.max(1, parseCount(input.chapters, 36 + (seed % 84)))
  const viewCount = parseCount(input.views, 18_000 + (seed % 820_000))
  const voteCount = input.votes ?? (900 + (seed % 19_000))
  const genres: Genre[] = input.genres?.length ? input.genres : ['fantasy']
  return {
    id: input.detailId,
    detailId: input.detailId,
    type: input.type,
    title: input.title,
    coverUrl: '',
    coverGradient: input.gradient ?? FALLBACK_GRADIENTS[seed % FALLBACK_GRADIENTS.length],
    synopsis: input.synopsis ?? DEFAULT_SYNOPSIS,
    genres,
    tags: [input.genreLabel ?? 'เรื่องน่าอ่าน', input.originLabel ?? 'ReadLead', input.type === 'audiobook' ? 'ฟังเพลิน' : 'อัปเดตต่อเนื่อง'],
    authorId: `author:${encodeURIComponent(input.author)}`,
    authorName: input.author,
    status: input.status ?? 'ongoing',
    origin: input.originLabel === 'แปล' ? 'translated' : 'original',
    originLabel: input.originLabel ?? (input.type === 'audiobook' ? 'พากย์' : 'ไทย'),
    genreLabel: input.genreLabel ?? 'แฟนตาซี',
    rating: 4.2 + ((seed % 8) / 10),
    voteCount,
    viewCount,
    readCount: Math.round(viewCount * 1.22),
    vipTopUpTotal: 20_000 + (seed % 320_000),
    episodeCount,
    latestEpisode: `${input.type === 'manga' ? 'บท' : 'ตอน'}ที่ ${episodeCount}: ปลายทางบทใหม่`,
    isFeatured: seed % 3 === 0,
    rankingScore: 65 + (seed % 35),
    updatedAt: input.updatedAt ?? '2026-07-15T08:30:00Z',
    weeklyVoteCount: input.monthlyVotes ?? Math.max(120, Math.round(voteCount / 5)),
    narrationType: input.narrationType,
  }
}

function fromBook(item: HomeBookStripItem, type: ContentType = item.mediaType === 'audio' ? 'audiobook' : 'novel') {
  return makeItem({
    detailId: item.detailId,
    type,
    title: item.title,
    author: item.author,
    genres: item.genreKeys,
    genreLabel: item.genreLabel,
    originLabel: item.originLabel,
    gradient: item.gradient,
    views: item.views,
    chapters: item.chapters,
    narrationType: type === 'audiobook' && item.originLabel === 'เอไอ' ? 'ai' : type === 'audiobook' ? 'human' : undefined,
  })
}

const catalog = new Map<string, DetailCatalogItem>()
const add = (item: DetailCatalogItem) => catalog.set(item.detailId, item)

MOCK_WORKS.forEach((work, index) => add({
  ...work,
  detailId: work.id,
  coverGradient: FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length],
  genreLabel: work.genres.join(' · '),
  originLabel: work.type === 'audiobook' ? 'พากย์' : work.origin === 'translated' ? 'แปล' : 'ไทย',
  narrationType: work.type === 'audiobook' ? 'human' : undefined,
}))

;[
  ...HOME_POPULAR_BOOKS,
  ...HOME_RECOMMENDED_BOOKS,
  ...NOVEL_POPULAR_BOOKS,
  ...NOVEL_NEW_BOOKS,
  ...NOVEL_THAI_BOOKS,
  ...NOVEL_TRANSLATED_BOOKS,
  ...NOVEL_CATEGORY_BOOKS,
].forEach((item) => add(fromBook(item)))

MANGA_DETAIL_BOOKS.forEach((item: MangaBookItem) => add(fromBook(item, 'manga')))
AUDIO_DETAIL_BOOKS.forEach((item: AudioBookItem) => add(fromBook(item, 'audiobook')))

HOME_LIMITED_OFFERS.forEach((item) => add(makeItem({
  detailId: item.detailId,
  type: 'novel',
  title: item.title,
  author: item.author,
  genreLabel: 'โรแมนซ์',
  originLabel: 'ไทย',
  gradient: item.gradient,
})))

HOME_RANKING_COLUMNS.flatMap((column) => column.items).forEach((item) => add(makeItem({
  detailId: item.detailId,
  type: 'novel',
  title: item.title,
  author: item.author,
  genres: item.genreKeys,
  genreLabel: item.genreLabel,
  originLabel: item.originLabel,
  synopsis: item.tagline,
  votes: parseCount(item.value, 1200),
})))

HOME_LATEST_UPDATES.forEach((item) => add(makeItem({
  detailId: item.detailId,
  type: 'novel',
  title: item.title,
  author: item.author,
  genres: item.genreKeys,
  genreLabel: item.genreLabel,
  originLabel: item.originLabel,
  synopsis: item.description,
  chapters: item.episode,
  gradient: item.gradient,
  updatedAt: item.updatedAt,
})))

NOVEL_EDITORIAL_PICKS.forEach((item) => add(makeItem({
  detailId: item.detailId,
  type: 'novel',
  title: item.title,
  author: item.author,
  genres: item.genreKeys,
  genreLabel: 'แฟนตาซี',
  originLabel: 'แปล',
  gradient: item.gradient,
})))

RANKING_WORKS.forEach((item) => {
  if (catalog.has(item.detailId)) return
  add(makeItem({
    detailId: item.detailId,
    type: item.type,
    title: item.title,
    author: item.author,
    genres: item.genre === 'other' ? ['slice-of-life'] : [item.genre],
    genreLabel: item.genreLabel,
    originLabel: item.origin,
    gradient: `linear-gradient(155deg,${item.coverFrom},${item.coverTo})`,
    views: item.views,
    chapters: Number.parseInt(item.latestEpisode.match(/\d+/)?.[0] ?? '48', 10),
    synopsis: item.synopsis,
    status: item.status,
    votes: item.recommendedVotes,
    monthlyVotes: item.monthlyVotes,
    updatedAt: item.updatedAt,
  }))
})

export const DETAIL_CATALOG = Array.from(catalog.values())

export function getDetailWork(detailId?: string | null) {
  if (!detailId) return undefined
  return catalog.get(detailId)
}

function episodeContent(work: DetailCatalogItem, episodeNum: number) {
  const lead = work.type === 'audiobook' ? 'เสียงบรรยายเริ่มต้นอย่างนุ่มนวล' : work.type === 'manga' ? 'ภาพแรกเปิดด้วยท้องฟ้าสีครามเหนือเมืองเก่า' : 'รุ่งเช้าวันนั้นสายลมพัดผ่านหน้าต่างไม้บานเดิม'
  return `${lead} และพาเราเข้าสู่ตอนที่ ${episodeNum} ของ ${work.title}\n\n${work.synopsis}\n\nการตัดสินใจครั้งนี้ทำให้ทุกอย่างเปลี่ยนไป ไม่มีใครรู้ว่าปลายทางจะเป็นเช่นไร แต่พวกเขาต่างเลือกก้าวต่อไปพร้อมความหวังที่ยังเหลืออยู่\n\n“ไม่ว่าจะเกิดอะไรขึ้น เราจะกลับมาพบกันตรงนี้” คำสัญญานั้นดังก้องอยู่ท่ามกลางแสงสุดท้ายของวัน`
}

export function getDetailEpisodes(detailId: string): DetailEpisode[] {
  const work = getDetailWork(detailId)
  if (!work) return []
  const existing = MOCK_EPISODES[detailId] ?? []
  return Array.from({ length: work.episodeCount }, (_, index) => {
    const episodeNum = index + 1
    const legacy = existing[index]
    if (legacy) return legacy
    return {
      id: `${encodeURIComponent(detailId)}:episode-${episodeNum}`,
      workId: detailId,
      title: `${work.type === 'manga' ? 'บท' : 'ตอน'}ที่ ${episodeNum}: ${episodeNum === 1 ? 'จุดเริ่มต้นของเรื่องราว' : 'เส้นทางที่เลือกเดิน'}`,
      episodeNum,
      price: episodeNum <= 2 ? 0 : episodeNum % 3 === 0 ? 8 : 5,
      status: 'published',
      type: work.type === 'manga' ? 'image' : work.type === 'audiobook' ? 'audio' : 'text',
      content: episodeContent(work, episodeNum),
      wordCount: work.type === 'novel' ? 1800 + ((episodeNum * 73) % 1200) : 0,
      publishedAt: new Date(Date.UTC(2026, 6, Math.max(1, 16 - (episodeNum % 15)), 8, 0)).toISOString(),
    }
  })
}

export function getRelatedDetailWorks(work: DetailCatalogItem, limit = 6) {
  const matchesGenre = (candidate: DetailCatalogItem) => candidate.genres.some((genre) => work.genres.includes(genre))
  return DETAIL_CATALOG
    .filter((candidate) => candidate.detailId !== work.detailId && candidate.type === work.type)
    .sort((a, b) => Number(matchesGenre(b)) - Number(matchesGenre(a)) || b.rankingScore - a.rankingScore)
    .slice(0, limit)
}
