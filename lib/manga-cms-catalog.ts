import type { HomeLimitedOffer } from '@/lib/home-landing-data'
import {
  cmsPlacement,
  enabledCmsSection,
  findCmsSection,
  isRecord,
  mapCmsBook,
  mapCmsLimitedOffer,
  parseCmsBanner,
  parseCmsBook,
  type CmsBanner,
  type CmsSection,
} from '@/lib/cms-catalog'
import type { MangaBookItem } from '@/lib/manga-landing-data'
import { mangaFilterKeys } from '@/lib/manga-landing-catalog'

export type MangaCmsCatalog = {
  available: boolean
  slideSeconds: number
  hero: CmsBanner[]
  activity: CmsBanner[][]
  limitedOffers: HomeLimitedOffer[]
  row3: CmsBanner[]
  webSides: CmsBanner[][]
  webBooks: MangaBookItem[]
  webBooksEnabled: boolean
  categoryBanners: CmsBanner[]
  bottomCta: CmsBanner[][]
  webRecommend: CmsBanner[][]
  launch: CmsBanner[][]
  launchEnabled: boolean
}

const EMPTY_CMS: MangaCmsCatalog = {
  available: false,
  slideSeconds: 5,
  hero: [], activity: [[], []], limitedOffers: [], row3: [], webSides: [[], []], webBooks: [],
  webBooksEnabled: true, categoryBanners: [], bottomCta: [[], [], [], []], webRecommend: [[], []],
  launch: [[], []], launchEnabled: true,
}

function bannersFor(section: CmsSection | null, baseUrl: string) {
  return (section?.items ?? []).flatMap((item) => {
    const banner = parseCmsBanner(item, baseUrl)
    return banner ? [banner] : []
  })
}

function bannerColumns(section: CmsSection | null, columns: number, baseUrl: string, useSlots = false) {
  return Array.from({ length: columns }, (_, column) => (section?.items ?? []).flatMap((item) => {
    if (!isRecord(item) || !isRecord(item.placement)) return []
    const placement = item.placement
    const position = useSlots && Number.isInteger(placement.slot) ? Number(placement.slot) : cmsPlacement(placement).column
    if (position !== column) return []
    const banner = parseCmsBanner(item, baseUrl)
    return banner ? [banner] : []
  }))
}

function sectionIsEnabled(payload: unknown, key: string) {
  return findCmsSection(payload, key)?.enabled === true
}

function ctaColumns(section: CmsSection | null, baseUrl: string) {
  if (!section) return [[], [], [], []] as CmsBanner[][]
  const slotEnabled = isRecord(section.config) && isRecord(section.config.slotEnabled)
    ? section.config.slotEnabled
    : {}
  const columns = bannerColumns(section, 4, baseUrl, true)
  return columns.map((items, slot) => slotEnabled[String(slot)] === false ? [] : items)
}

export async function getMangaCmsCatalog(): Promise<MangaCmsCatalog> {
  const baseUrl = process.env.BACKOFFICE_API_URL?.replace(/\/+$/, '')
  if (!baseUrl) return EMPTY_CMS
  try {
    const response = await fetch(`${baseUrl}/api/public/cms/manga`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 30 },
    })
    if (!response.ok) throw new Error(`Manga CMS API responded with ${response.status}`)
    const payload: unknown = await response.json()
    if (!isRecord(payload) || !isRecord(payload.page)) throw new Error('Manga CMS API returned an invalid payload')

    const slideSeconds = typeof payload.page.slideSeconds === 'number'
      ? Math.min(60, Math.max(1, payload.page.slideSeconds)) : 5
    const hero = enabledCmsSection(payload, 'hero')
    const activity = enabledCmsSection(payload, 'activity')
    const sale = enabledCmsSection(payload, 'sale')
    const row3 = enabledCmsSection(payload, 'row-3')
    const webSides = enabledCmsSection(payload, 'web-sides')
    const webBooksSection = enabledCmsSection(payload, 'web-books')
    const category = enabledCmsSection(payload, 'category')
    const bottomCta = enabledCmsSection(payload, 'bottom-cta')
    const webRecommend = enabledCmsSection(payload, 'web-recommend')
    const launch = enabledCmsSection(payload, 'launch')

    const limitedOffers = (sale?.items ?? []).flatMap((item, index) => {
      if (!isRecord(item) || typeof item.id !== 'string' || cmsPlacement(item.placement).variant !== 'book') return []
      const book = parseCmsBook(item.book)
      return book?.type === 'manga' ? [mapCmsLimitedOffer(item, book, index)] : []
    })

    const webBooks = (webBooksSection?.items ?? []).flatMap((item, index) => {
      if (!isRecord(item) || typeof item.id !== 'string' || cmsPlacement(item.placement).variant !== 'book') return []
      const book = parseCmsBook(item.book)
      if (book?.type !== 'manga') return []
      const card = mapCmsBook(book, item.id, index)
      return [{ ...card, filterKeys: mangaFilterKeys(book.category, book.origin) } satisfies MangaBookItem]
    })

    return {
      available: true,
      slideSeconds,
      hero: bannersFor(hero, baseUrl),
      activity: bannerColumns(activity, 2, baseUrl),
      limitedOffers,
      row3: bannersFor(row3, baseUrl),
      webSides: bannerColumns(webSides, 2, baseUrl),
      webBooks,
      webBooksEnabled: sectionIsEnabled(payload, 'web-books'),
      categoryBanners: bannersFor(category, baseUrl),
      bottomCta: ctaColumns(bottomCta, baseUrl),
      webRecommend: bannerColumns(webRecommend, 2, baseUrl),
      launch: bannerColumns(launch, 2, baseUrl),
      launchEnabled: sectionIsEnabled(payload, 'launch'),
    }
  } catch (error) {
    console.error('Manga CMS catalog load failed', error instanceof Error ? error.message : 'UnknownError')
    return EMPTY_CMS
  }
}
