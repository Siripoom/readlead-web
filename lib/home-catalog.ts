import {
  HOME_GENRE_LABELS,
  type HomeBookStripItem,
  type HomeLatestUpdate,
  type HomeLimitedOffer,
  type HomeRankingColumn,
} from '@/lib/home-landing-data'
import {
  cmsPlacement as placement,
  compactNumber as compact,
  enabledCmsSection as enabledSection,
  genreFor,
  isRecord,
  mapCmsBook as mapBook,
  mapCmsLimitedOffer,
  parseCmsBanner as parseBanner,
  parseCmsBook as parseBook,
  type CmsBanner,
  type CmsBook as RawBook,
  type CmsSection as RawSection,
} from '@/lib/cms-catalog'

export type { CmsBanner, CmsBannerElement } from '@/lib/cms-catalog'

export type HomeCmsCatalog = {
  slideSeconds: number
  limitedOffers: HomeLimitedOffer[]
  act3: CmsBanner[]
  act4: CmsBanner[]
  recommendBanners: CmsBanner[][]
  recommendedBooks: HomeBookStripItem[]
}

export type HomeLatestCatalogResult = {
  items: HomeLatestUpdate[]
  error: string | null
}

export type HomeRankingCatalogResult = {
  popular: HomeBookStripItem[]
  rankings: HomeRankingColumn[]
  error: string | null
}

const EMPTY_CMS: HomeCmsCatalog = {
  slideSeconds: 5,
  limitedOffers: [],
  act3: [],
  act4: [],
  recommendBanners: [[], [], []],
  recommendedBooks: [],
}

const RANKING_TITLES: Record<HomeRankingColumn['id'], string> = {
  daily: 'ตั๋วรายวัน',
  monthly: 'ตั๋วรายเดือน',
  views: 'ยอดวิว',
  new: 'เรื่องใหม่',
}

type RawRankingWork = RawBook & {
  dailyVotes: number
  monthlyVotes: number
  publishedAt: string
}

function parseRankingWork(value: unknown): RawRankingWork | null {
  if (!isRecord(value) || !isRecord(value.creator)) return null
  const writerApplication = value.creator.writerApplication
  const author = isRecord(writerApplication) && typeof writerApplication.penName === 'string'
    ? writerApplication.penName
    : value.creator.name
  const book = parseBook({ ...value, author, synopsis: '' })
  if (!book || typeof value.dailyVotes !== 'number' || typeof value.monthlyVotes !== 'number' || !isDateString(value.publishedAt)) return null
  return { ...book, dailyVotes: value.dailyVotes, monthlyVotes: value.monthlyVotes, publishedAt: value.publishedAt }
}

function emptyRankings(): HomeRankingColumn[] {
  return (['daily', 'monthly', 'views', 'new'] as const).map((id) => ({ id, title: RANKING_TITLES[id], items: [] }))
}

function mapRankingColumn(id: HomeRankingColumn['id'], values: unknown[]): HomeRankingColumn {
  const items = values.flatMap((value) => {
    const work = parseRankingWork(value)
    if (!work) return []
    const genre = genreFor(work.category)
    const metric = id === 'daily'
      ? work.dailyVotes.toLocaleString('th-TH')
      : id === 'monthly'
        ? work.monthlyVotes.toLocaleString('th-TH')
        : compact(work.views)
    return [{
      id: `${id}-${work.id}`,
      detailId: work.id,
      title: work.title,
      author: work.author,
      value: metric,
      genreLabel: genre ? HOME_GENRE_LABELS[genre] : work.category,
      originLabel: work.type === 'audiobook' ? 'พากย์' : work.origin === 'translated' ? 'แปล' : 'ไทย',
      genreKeys: genre ? [genre] : [],
      tagline: work.tagline,
      coverUrl: work.hasCover ? `/api/catalog/works/${encodeURIComponent(work.id)}/cover` : undefined,
      workId: work.id,
      contentType: work.type,
    }]
  })
  return { id, title: RANKING_TITLES[id], items }
}

export async function getHomeCmsCatalog(): Promise<HomeCmsCatalog> {
  const baseUrl = process.env.BACKOFFICE_API_URL?.replace(/\/+$/, '')
  if (!baseUrl) return EMPTY_CMS
  try {
    const response = await fetch(`${baseUrl}/api/public/cms/home`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 30 },
    })
    if (!response.ok) throw new Error(`Home CMS API responded with ${response.status}`)
    const payload: unknown = await response.json()
    if (!isRecord(payload) || !isRecord(payload.page)) throw new Error('Home CMS API returned an invalid payload')

    const slideSeconds = typeof payload.page.slideSeconds === 'number'
      ? Math.min(60, Math.max(1, payload.page.slideSeconds))
      : 5
    const sale = enabledSection(payload, 'sale')
    const recommend = enabledSection(payload, 'recommend')
    const act3 = enabledSection(payload, 'act3')
    const act4 = enabledSection(payload, 'act4')

    const limitedOffers = (sale?.items ?? []).flatMap((item, index) => {
      if (!isRecord(item) || typeof item.id !== 'string' || placement(item.placement).variant !== 'book') return []
      const book = parseBook(item.book)
      if (!book) return []
      return [mapCmsLimitedOffer(item, book, index)]
    })

    const recommendItems = recommend?.items ?? []
    const recommendedBooks = recommendItems.flatMap((item, index) => {
      if (!isRecord(item) || typeof item.id !== 'string' || placement(item.placement).variant !== 'book') return []
      const book = parseBook(item.book)
      return book ? [mapBook(book, item.id, index)] : []
    })
    const recommendBanners = [0, 1, 2].map((column) => recommendItems.flatMap((item) => {
      if (!isRecord(item)) return []
      const itemPlacement = placement(item.placement)
      if (itemPlacement.variant !== 'banner' || itemPlacement.column !== column) return []
      const banner = parseBanner(item, baseUrl)
      return banner ? [banner] : []
    }))

    const bannersFor = (section: RawSection | null) => (section?.items ?? []).flatMap((item) => {
      const banner = parseBanner(item, baseUrl)
      return banner ? [banner] : []
    })

    return {
      slideSeconds,
      limitedOffers,
      act3: bannersFor(act3),
      act4: bannersFor(act4),
      recommendBanners,
      recommendedBooks,
    }
  } catch (error) {
    console.error('Home CMS catalog load failed', error instanceof Error ? error.message : 'UnknownError')
    return EMPTY_CMS
  }
}

function isDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

export async function getHomeLatestCatalog(): Promise<HomeLatestCatalogResult> {
  const baseUrl = process.env.BACKOFFICE_API_URL?.replace(/\/+$/, '')
  if (!baseUrl) return { items: [], error: 'ระบบข้อมูลอัปเดตล่าสุดยังไม่พร้อมใช้งาน' }
  try {
    const response = await fetch(`${baseUrl}/api/public/catalog/home-latest`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 30 },
    })
    if (!response.ok) throw new Error(`Home latest API responded with ${response.status}`)
    const payload: unknown = await response.json()
    if (!isRecord(payload) || !Array.isArray(payload.items)) throw new Error('Home latest API returned an invalid payload')
    const items = payload.items.flatMap((item, index) => {
      if (!isRecord(item) || !isRecord(item.latestEpisode) || !isRecord(item.creator)) return []
      const book = parseBook({
        ...item,
        author: isRecord(item.creator.writerApplication) && typeof item.creator.writerApplication.penName === 'string'
          ? item.creator.writerApplication.penName
          : item.creator.name,
      })
      if (!book || typeof item.latestEpisode.id !== 'string' || typeof item.latestEpisode.episodeNumber !== 'number'
        || typeof item.latestEpisode.title !== 'string' || !isDateString(item.latestEpisode.publishedAt)) return []
      const genre = genreFor(book.category)
      const mappedBook = mapBook(book, item.latestEpisode.id, index)
      return [{
        id: item.latestEpisode.id,
        detailId: book.id,
        title: book.title,
        author: book.author,
        genreLabel: genre ? HOME_GENRE_LABELS[genre] : book.category,
        originLabel: book.type === 'audiobook' ? 'พากย์' : book.origin === 'translated' ? 'แปล' : 'ไทย',
        genreKeys: genre ? [genre] : [],
        description: book.synopsis.trim() || book.tagline.trim(),
        episode: String(item.latestEpisode.episodeNumber),
        episodeTitle: item.latestEpisode.title,
        updatedAt: item.latestEpisode.publishedAt,
        gradient: mappedBook.gradient,
        workId: book.id,
        coverUrl: book.hasCover ? `/api/catalog/works/${encodeURIComponent(book.id)}/cover` : undefined,
        contentType: book.type,
      }]
    })
    return { items, error: null }
  } catch (error) {
    console.error('Home latest catalog load failed', error instanceof Error ? error.message : 'UnknownError')
    return { items: [], error: 'ไม่สามารถโหลดผลงานอัปเดตล่าสุดได้ในขณะนี้' }
  }
}

export async function getHomeRankingCatalog(): Promise<HomeRankingCatalogResult> {
  const baseUrl = process.env.BACKOFFICE_API_URL?.replace(/\/+$/, '')
  if (!baseUrl) return { popular: [], rankings: emptyRankings(), error: 'ระบบข้อมูลจัดอันดับยังไม่พร้อมใช้งาน' }
  try {
    const response = await fetch(`${baseUrl}/api/public/catalog/home-rankings`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 30 },
    })
    if (!response.ok) throw new Error(`Home rankings API responded with ${response.status}`)
    const payload: unknown = await response.json()
    if (!isRecord(payload) || !Array.isArray(payload.popular) || !isRecord(payload.rankings)) {
      throw new Error('Home rankings API returned an invalid payload')
    }
    const rankingPayload = payload.rankings
    const ids = ['daily', 'monthly', 'views', 'new'] as const
    if (ids.some((id) => !Array.isArray(rankingPayload[id]))) throw new Error('Home rankings API returned invalid columns')

    const popular = payload.popular.flatMap((value, index) => {
      const work = parseRankingWork(value)
      return work ? [mapBook(work, `popular-${work.id}`, index)] : []
    })
    const rankings = ids.map((id) => mapRankingColumn(id, rankingPayload[id] as unknown[]))
    return { popular, rankings, error: null }
  } catch (error) {
    console.error('Home ranking catalog load failed', error instanceof Error ? error.message : 'UnknownError')
    return { popular: [], rankings: emptyRankings(), error: 'ไม่สามารถโหลดข้อมูลความนิยมและจัดอันดับได้ในขณะนี้' }
  }
}
