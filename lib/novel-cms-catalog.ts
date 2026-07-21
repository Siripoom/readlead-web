import type { HomeBookStripItem, HomeLimitedOffer } from '@/lib/home-landing-data'
import {
  cmsPlacement,
  enabledCmsSection,
  isRecord,
  mapCmsBook,
  mapCmsLimitedOffer,
  parseCmsBanner,
  parseCmsBook,
  parseCoverflowCover,
  type CmsBanner,
  type CmsCoverflowCover,
  type CmsSection,
} from '@/lib/cms-catalog'

export type NovelCmsCoverflow = {
  main: CmsBanner
  covers: CmsCoverflowCover[]
}

export type NovelCmsCatalog = {
  slideSeconds: number
  hero: CmsBanner[]
  activity: CmsBanner[][]
  limitedOffers: HomeLimitedOffer[]
  writerBanners: CmsBanner[]
  coverflow: NovelCmsCoverflow | null
  webBooks: HomeBookStripItem[]
  categoryBanners: CmsBanner[]
  webRecommend: CmsBanner[][]
  launch: CmsBanner[][]
}

const EMPTY_CMS: NovelCmsCatalog = {
  slideSeconds: 5,
  hero: [],
  activity: [[], []],
  limitedOffers: [],
  writerBanners: [],
  coverflow: null,
  webBooks: [],
  categoryBanners: [],
  webRecommend: [[], []],
  launch: [[], []],
}

function bannersFor(section: CmsSection | null, baseUrl: string) {
  return (section?.items ?? []).flatMap((item) => {
    const banner = parseCmsBanner(item, baseUrl)
    return banner ? [banner] : []
  })
}

function bannerColumns(section: CmsSection | null, columns: number, baseUrl: string) {
  return Array.from({ length: columns }, (_, column) => (section?.items ?? []).flatMap((item) => {
    if (!isRecord(item) || cmsPlacement(item.placement).column !== column) return []
    const banner = parseCmsBanner(item, baseUrl)
    return banner ? [banner] : []
  }))
}

export async function getNovelCmsCatalog(): Promise<NovelCmsCatalog> {
  const baseUrl = process.env.BACKOFFICE_API_URL?.replace(/\/+$/, '')
  if (!baseUrl) return EMPTY_CMS

  try {
    const response = await fetch(`${baseUrl}/api/public/cms/novel`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 30 },
    })
    if (!response.ok) throw new Error(`Novel CMS API responded with ${response.status}`)
    const payload: unknown = await response.json()
    if (!isRecord(payload) || !isRecord(payload.page)) throw new Error('Novel CMS API returned an invalid payload')

    const slideSeconds = typeof payload.page.slideSeconds === 'number'
      ? Math.min(60, Math.max(1, payload.page.slideSeconds))
      : 5
    const hero = enabledCmsSection(payload, 'hero')
    const activity = enabledCmsSection(payload, 'activity')
    const sale = enabledCmsSection(payload, 'sale')
    const writer = enabledCmsSection(payload, 'writer-banner')
    const coverflowSection = enabledCmsSection(payload, 'web-coverflow')
    const webBooksSection = enabledCmsSection(payload, 'web-books')
    const category = enabledCmsSection(payload, 'category')
    const webRecommend = enabledCmsSection(payload, 'web-recommend')
    const launch = enabledCmsSection(payload, 'launch')

    const limitedOffers = (sale?.items ?? []).flatMap((item, index) => {
      if (!isRecord(item) || typeof item.id !== 'string' || cmsPlacement(item.placement).variant !== 'book') return []
      const book = parseCmsBook(item.book)
      return book?.type === 'novel' ? [mapCmsLimitedOffer(item, book, index)] : []
    })

    const webBooks = (webBooksSection?.items ?? []).flatMap((item, index) => {
      if (!isRecord(item) || typeof item.id !== 'string' || cmsPlacement(item.placement).variant !== 'book') return []
      const book = parseCmsBook(item.book)
      return book?.type === 'novel' ? [mapCmsBook(book, item.id, index)] : []
    })

    const main = (coverflowSection?.items ?? []).flatMap((item) => {
      if (!isRecord(item) || cmsPlacement(item.placement).variant !== 'main') return []
      const banner = parseCmsBanner(item, baseUrl)
      return banner ? [banner] : []
    })[0]
    const covers = (coverflowSection?.items ?? []).flatMap((item) => {
      if (!isRecord(item) || cmsPlacement(item.placement).variant !== 'cover') return []
      const cover = parseCoverflowCover(item, baseUrl)
      return cover ? [cover] : []
    })

    return {
      slideSeconds,
      hero: bannersFor(hero, baseUrl),
      activity: bannerColumns(activity, 2, baseUrl),
      limitedOffers,
      writerBanners: bannersFor(writer, baseUrl),
      coverflow: main && covers.length ? { main, covers } : null,
      webBooks,
      categoryBanners: bannersFor(category, baseUrl),
      webRecommend: bannerColumns(webRecommend, 2, baseUrl),
      launch: bannerColumns(launch, 2, baseUrl),
    }
  } catch (error) {
    console.error('Novel CMS catalog load failed', error instanceof Error ? error.message : 'UnknownError')
    return EMPTY_CMS
  }
}
