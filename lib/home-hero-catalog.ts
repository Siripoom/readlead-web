import { HOME_HERO_SLIDES, type HomeHeroSlide, type HomeHeroVisual } from '@/lib/home-landing-data'

type RawHeroItem = {
  id: string
  badge: string
  title: string
  description: string
  ctaLabel: string
  href: string
  desktopImageUrl: string
  mobileImageUrl: string
  visual: HomeHeroVisual
}

type RawHeroPayload = {
  enabled: boolean
  slideSeconds: number
  items: RawHeroItem[]
}

export type HomeHeroCatalog = {
  slides: HomeHeroSlide[]
  slideSeconds: number
}

const FALLBACK: HomeHeroCatalog = { slides: HOME_HERO_SLIDES, slideSeconds: 6 }

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isVisual(value: unknown): value is HomeHeroVisual {
  return isRecord(value)
    && typeof value.x === 'number'
    && typeof value.y === 'number'
    && typeof value.size === 'number'
    && typeof value.color === 'string'
    && /^#[0-9a-f]{6}$/i.test(value.color)
}

function isItem(value: unknown): value is RawHeroItem {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.badge === 'string'
    && typeof value.title === 'string'
    && value.title.trim().length > 0
    && typeof value.description === 'string'
    && typeof value.ctaLabel === 'string'
    && typeof value.href === 'string'
    && typeof value.desktopImageUrl === 'string'
    && typeof value.mobileImageUrl === 'string'
    && isVisual(value.visual)
}

function isPayload(value: unknown): value is RawHeroPayload {
  return isRecord(value)
    && typeof value.enabled === 'boolean'
    && typeof value.slideSeconds === 'number'
    && Array.isArray(value.items)
    && value.items.every(isItem)
}

function absoluteMediaUrl(value: string, baseUrl: string) {
  try {
    const url = new URL(value, `${baseUrl}/`)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

function safeHref(value: string) {
  const candidate = value.trim()
  if (candidate.startsWith('/') && !candidate.startsWith('//')) return candidate
  try {
    const url = new URL(candidate)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '/discover'
  } catch {
    return '/discover'
  }
}

export async function getHomeHeroCatalog(): Promise<HomeHeroCatalog> {
  const baseUrl = process.env.BACKOFFICE_API_URL?.replace(/\/+$/, '')
  if (!baseUrl) return FALLBACK

  try {
    const response = await fetch(`${baseUrl}/api/public/cms/home/hero`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 30 },
    })
    if (!response.ok) throw new Error(`Home hero API responded with ${response.status}`)
    const payload: unknown = await response.json()
    if (!isPayload(payload)) throw new Error('Home hero API returned an invalid payload')
    if (!payload.enabled) return { slides: [], slideSeconds: payload.slideSeconds }

    const slides = payload.items.flatMap<HomeHeroSlide>((item) => {
      const desktopImageUrl = absoluteMediaUrl(item.desktopImageUrl, baseUrl)
      const mobileImageUrl = absoluteMediaUrl(item.mobileImageUrl, baseUrl) ?? desktopImageUrl
      if (!desktopImageUrl || !mobileImageUrl) return []
      return [{
        id: item.id,
        badge: item.badge,
        title: item.title,
        description: item.description,
        ctaLabel: item.ctaLabel.trim() || 'อ่านเลย',
        href: safeHref(item.href),
        desktopImageUrl,
        mobileImageUrl,
        visual: item.visual,
      }]
    })

    return slides.length
      ? { slides, slideSeconds: Math.min(60, Math.max(1, payload.slideSeconds)) }
      : FALLBACK
  } catch (error) {
    console.error('Home hero catalog load failed', error instanceof Error ? error.message : 'UnknownError')
    return FALLBACK
  }
}
