import {
  HOME_GENRE_LABELS,
  type HomeBookStripItem,
  type HomeLimitedOffer,
} from '@/lib/home-landing-data'
import type { Genre } from '@/lib/types'

export type CmsBannerElement = {
  id: string
  type: 'badge' | 'title' | 'text' | 'button' | 'votes' | 'countdown'
  text: string
  x: number
  y: number
  scale: number
  color: string
  backgroundColor?: string
  bold?: boolean
  shadow?: boolean
  link?: string
  width?: number
  height?: number
  offsetSeconds?: number
}

export type CmsBanner = {
  id: string
  title: string
  imageUrl?: string
  mobileImageUrl?: string
  linkUrl?: string
  background: string
  focal: { x: number; y: number; zoom: number }
  elements: CmsBannerElement[]
}

export type CmsCoverflowCover = {
  id: string
  title: string
  subtitle: string
  imageUrl: string
  linkUrl?: string
}

export type CmsBook = {
  id: string
  type: 'novel' | 'manga' | 'audiobook'
  title: string
  author: string
  category: string
  origin: 'original' | 'translated'
  narrationType: 'human' | 'ai' | null
  tagline: string
  synopsis: string
  views: number
  episodeCount: number
  hasCover: boolean
}

export type CmsSection = Record<string, unknown> & { items: unknown[] }

const GENRES = new Set<Genre>([
  'romance', 'fantasy', 'action', 'mystery', 'horror', 'comedy',
  'drama', 'historical', 'sci-fi', 'slice-of-life', 'bl', 'gl',
])

const GRADIENTS = [
  'linear-gradient(155deg,#7886ad,#273556)',
  'linear-gradient(155deg,#986978,#412638)',
  'linear-gradient(155deg,#6b8c80,#243f39)',
  'linear-gradient(155deg,#8d76aa,#382952)',
  'linear-gradient(155deg,#ad855f,#4e3425)',
  'linear-gradient(155deg,#607b9f,#24364f)',
]

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function genreFor(category: string): Genre | null {
  return GENRES.has(category as Genre) ? category as Genre : null
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Math.max(0, value))
}

export function absoluteMediaUrl(value: unknown, baseUrl: string) {
  if (typeof value !== 'string' || !value.trim()) return undefined
  try {
    const url = new URL(value, `${baseUrl}/`)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined
  } catch {
    return undefined
  }
}

export function safeHref(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return undefined
  const candidate = value.trim()
  if (candidate.startsWith('/') && !candidate.startsWith('//')) return candidate
  try {
    const url = new URL(candidate)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined
  } catch {
    return undefined
  }
}

export function parseCmsBook(value: unknown): CmsBook | null {
  if (!isRecord(value)) return null
  if (!['novel', 'manga', 'audiobook'].includes(String(value.type))) return null
  if (!['original', 'translated'].includes(String(value.origin))) return null
  if (
    typeof value.id !== 'string' || typeof value.title !== 'string' || typeof value.author !== 'string'
    || typeof value.category !== 'string' || typeof value.tagline !== 'string' || typeof value.synopsis !== 'string'
    || typeof value.views !== 'number' || typeof value.episodeCount !== 'number' || typeof value.hasCover !== 'boolean'
  ) return null
  const narrationType = value.type === 'audiobook'
    ? value.narrationType === 'ai' ? 'ai' : 'human'
    : null
  return { ...value, narrationType } as CmsBook
}

function parseElements(value: unknown): CmsBannerElement[] {
  if (!Array.isArray(value)) return []
  const allowed = new Set(['badge', 'title', 'text', 'button', 'votes', 'countdown'])
  return value.flatMap((element) => {
    if (!isRecord(element) || !allowed.has(String(element.type))) return []
    if (
      typeof element.id !== 'string' || typeof element.text !== 'string'
      || typeof element.x !== 'number' || typeof element.y !== 'number'
      || typeof element.scale !== 'number' || typeof element.color !== 'string'
    ) return []
    return [{
      id: element.id,
      type: element.type as CmsBannerElement['type'],
      text: element.text,
      x: element.x,
      y: element.y,
      scale: element.scale,
      color: element.color,
      backgroundColor: typeof element.backgroundColor === 'string' ? element.backgroundColor : undefined,
      bold: element.bold === true,
      shadow: element.shadow === true,
      link: safeHref(element.link),
      width: typeof element.width === 'number' ? element.width : undefined,
      height: typeof element.height === 'number' ? element.height : undefined,
      offsetSeconds: typeof element.offsetSeconds === 'number' ? Math.max(0, Math.round(element.offsetSeconds)) : undefined,
    }]
  })
}

export function parseCmsBanner(value: unknown, baseUrl: string): CmsBanner | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.title !== 'string' || !isRecord(value.visual)) return null
  const focal = isRecord(value.visual.focal) ? value.visual.focal : {}
  const elements = parseElements(value.visual.elements)
  const background = typeof value.visual.background === 'string' ? value.visual.background : ''
  const imageUrl = absoluteMediaUrl(value.imageUrl, baseUrl)
  if (!elements.length && !imageUrl && !background) return null
  return {
    id: value.id,
    title: value.title,
    imageUrl,
    mobileImageUrl: absoluteMediaUrl(value.mobileImageUrl, baseUrl) ?? imageUrl,
    linkUrl: safeHref(value.linkUrl),
    background,
    focal: {
      x: typeof focal.x === 'number' ? focal.x : 50,
      y: typeof focal.y === 'number' ? focal.y : 50,
      zoom: typeof focal.zoom === 'number' ? focal.zoom : 100,
    },
    elements,
  }
}

export function parseCoverflowCover(value: unknown, baseUrl: string): CmsCoverflowCover | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.title !== 'string') return null
  const imageUrl = absoluteMediaUrl(value.imageUrl, baseUrl)
  if (!imageUrl) return null
  return {
    id: value.id,
    title: value.title,
    subtitle: typeof value.subtitle === 'string' ? value.subtitle : '',
    imageUrl,
    linkUrl: safeHref(value.linkUrl),
  }
}

export function cmsPlacement(value: unknown) {
  if (!isRecord(value)) return { variant: 'default', column: 0 }
  return {
    variant: typeof value.variant === 'string' ? value.variant : 'default',
    column: Number.isInteger(value.column) ? Number(value.column) : 0,
  }
}

export function findCmsSection(payload: unknown, key: string): CmsSection | null {
  if (!isRecord(payload) || !Array.isArray(payload.sections)) return null
  const section = payload.sections.find((candidate) => isRecord(candidate) && candidate.key === key)
  return isRecord(section) && Array.isArray(section.items) ? section as CmsSection : null
}

export function enabledCmsSection(payload: unknown, key: string): CmsSection | null {
  const section = findCmsSection(payload, key)
  return section?.enabled === true ? section : null
}

export function mapCmsBook(raw: CmsBook, itemId: string, index: number): HomeBookStripItem {
  const genre = genreFor(raw.category)
  return {
    id: itemId,
    detailId: raw.id,
    title: raw.title,
    author: raw.author,
    genreLabel: genre ? HOME_GENRE_LABELS[genre] : raw.category,
    originLabel: raw.type === 'audiobook' ? raw.narrationType === 'ai' ? 'เอไอ' : 'พากย์' : raw.origin === 'translated' ? 'แปล' : 'ไทย',
    genreKeys: genre ? [genre] : [],
    mediaType: raw.type === 'audiobook' ? 'audio' : 'read',
    views: compactNumber(raw.views),
    chapters: Math.max(0, raw.episodeCount).toLocaleString('th-TH'),
    workId: raw.id,
    coverUrl: raw.hasCover ? `/api/catalog/works/${encodeURIComponent(raw.id)}/cover` : undefined,
    availability: 'published',
    contentType: raw.type,
    gradient: GRADIENTS[index % GRADIENTS.length],
  }
}

export function mapCmsLimitedOffer(item: Record<string, unknown>, book: CmsBook, index: number): HomeLimitedOffer {
  const promotion = isRecord(item.promotion) ? item.promotion : {}
  return {
    id: String(item.id),
    detailId: book.id,
    title: book.title,
    author: book.author,
    initialSeconds: typeof promotion.countdownSeconds === 'number' ? Math.max(0, Math.round(promotion.countdownSeconds)) : 0,
    gradient: GRADIENTS[index % GRADIENTS.length],
    workId: book.id,
    coverUrl: book.hasCover ? `/api/catalog/works/${encodeURIComponent(book.id)}/cover` : undefined,
    discount: typeof promotion.discount === 'string' ? promotion.discount : '',
    mediaType: book.type === 'audiobook' ? 'audio' : 'read',
    views: compactNumber(book.views),
    chapters: Math.max(0, book.episodeCount).toLocaleString('th-TH'),
  }
}
