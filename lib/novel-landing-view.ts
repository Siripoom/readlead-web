import type { CmsBanner, CmsCoverflowCover } from '@/lib/cms-catalog'
import type {
  HomeBookStripItem,
  HomeLatestUpdate,
  HomeLimitedOffer,
  HomeRankingColumn,
  HomeRankingItem,
} from '@/lib/home-landing-data'
import type { NovelCmsCatalog, NovelCmsCoverflow, NovelCmsSectionKey } from '@/lib/novel-cms-catalog'
import type { NovelLandingCatalog } from '@/lib/novel-landing-catalog'
import {
  NOVEL_CATEGORY_BOOKS,
  NOVEL_EDITORIAL_PICKS,
  NOVEL_HERO_SLIDES,
  NOVEL_LATEST_UPDATES,
  NOVEL_LIMITED_OFFERS,
  NOVEL_NEW_BOOKS,
  NOVEL_POPULAR_BOOKS,
  NOVEL_RANKING_COLUMNS,
  NOVEL_THAI_BOOKS,
  NOVEL_TRANSLATED_BOOKS,
} from '@/lib/novel-landing-data'
import type { Genre } from '@/lib/types'

const BOOK_TARGET = 14
const POPULAR_TARGET = 10
const RANKING_TARGET = 10
const CATEGORY_TARGET = 14
const LATEST_TARGET = 26

function normalizedTitle(value: string) {
  return value.trim().toLocaleLowerCase('th-TH').replace(/\s+/g, ' ')
}

function bookKey(item: Pick<HomeBookStripItem, 'workId' | 'detailId' | 'title'>) {
  return item.workId || item.detailId || normalizedTitle(item.title)
}

function rankingKey(item: Pick<HomeRankingItem, 'workId' | 'detailId' | 'title'>) {
  return item.workId || item.detailId || normalizedTitle(item.title)
}

function updateKey(item: Pick<HomeLatestUpdate, 'workId' | 'detailId' | 'title'>) {
  return item.workId || item.detailId || normalizedTitle(item.title)
}

function matchesGenre(genreKeys: Genre[], genre: Genre | null) {
  return !genre || genreKeys.includes(genre)
}

function mockBook(item: HomeBookStripItem, section: string, index: number): HomeBookStripItem {
  return {
    ...item,
    id: `novel-mock-${section}-${index}-${item.id}`,
    detailId: `novel-mock:${section}:${index}`,
    workId: undefined,
    coverUrl: undefined,
    href: '/discover',
    isMock: true,
    contentType: 'novel',
  }
}

function fillBooks(
  real: HomeBookStripItem[],
  preferred: HomeBookStripItem[],
  target: number,
  section: string,
  genre: Genre | null,
) {
  const pool = [
    ...preferred,
    ...NOVEL_POPULAR_BOOKS,
    ...NOVEL_NEW_BOOKS,
    ...NOVEL_THAI_BOOKS,
    ...NOVEL_TRANSLATED_BOOKS,
    ...NOVEL_CATEGORY_BOOKS,
  ].filter((item) => matchesGenre(item.genreKeys, genre))
  const result = real.filter((item) => matchesGenre(item.genreKeys, genre))
  const seen = new Set(result.flatMap((item) => [bookKey(item), normalizedTitle(item.title)]))

  for (const item of pool) {
    if (result.length >= target) break
    const key = bookKey(item)
    const title = normalizedTitle(item.title)
    if (seen.has(key) || seen.has(title)) continue
    result.push(mockBook(item, section, result.length))
    seen.add(key)
    seen.add(title)
  }

  let variant = 0
  while (result.length < target && pool.length > 0) {
    const source = pool[variant % pool.length]
    const volume = Math.floor(variant / pool.length) + 2
    result.push({
      ...mockBook(source, section, result.length),
      id: `novel-mock-${section}-variant-${variant}`,
      title: `${source.title} ภาค ${volume}`,
    })
    variant += 1
  }

  return result
}

function fillRankingColumn(real: HomeRankingColumn, fallback: HomeRankingColumn, genre: Genre | null): HomeRankingColumn {
  const items = real.items.filter((item) => matchesGenre(item.genreKeys, genre))
  const pool = [
    ...fallback.items,
    ...NOVEL_RANKING_COLUMNS.flatMap((column) => column.items),
  ].filter((item) => matchesGenre(item.genreKeys, genre))
  const seen = new Set(items.flatMap((item) => [rankingKey(item), normalizedTitle(item.title)]))

  for (const item of pool) {
    if (items.length >= RANKING_TARGET) break
    const key = rankingKey(item)
    const title = normalizedTitle(item.title)
    if (seen.has(key) || seen.has(title)) continue
    items.push({
      ...item,
      id: `novel-mock-ranking-${real.id}-${items.length}-${item.id}`,
      detailId: `novel-mock:ranking:${real.id}:${items.length}`,
      workId: undefined,
      href: '/discover',
      isMock: true,
      contentType: 'novel',
    })
    seen.add(key)
    seen.add(title)
  }

  let variant = 0
  while (items.length < RANKING_TARGET && pool.length > 0) {
    const source = pool[variant % pool.length]
    const volume = Math.floor(variant / pool.length) + 2
    items.push({
      ...source,
      id: `novel-mock-ranking-${real.id}-variant-${variant}`,
      detailId: `novel-mock:ranking:${real.id}:variant:${variant}`,
      title: `${source.title} ภาค ${volume}`,
      workId: undefined,
      href: '/discover',
      isMock: true,
      contentType: 'novel',
    })
    variant += 1
  }

  return { ...real, items }
}

function fillUpdates(real: HomeLatestUpdate[], genre: Genre | null) {
  const items = real.filter((item) => matchesGenre(item.genreKeys, genre))
  const pool = NOVEL_LATEST_UPDATES.filter((item) => matchesGenre(item.genreKeys, genre))
  const seen = new Set(items.flatMap((item) => [updateKey(item), normalizedTitle(item.title)]))
  for (const item of pool) {
    if (items.length >= LATEST_TARGET) break
    const key = updateKey(item)
    const title = normalizedTitle(item.title)
    if (seen.has(key) || seen.has(title)) continue
    items.push({
      ...item,
      id: `novel-mock-update-${items.length}-${item.id}`,
      detailId: `novel-mock:update:${items.length}`,
      workId: undefined,
      coverUrl: undefined,
      href: '/discover',
      isMock: true,
      contentType: 'novel',
    })
    seen.add(key)
    seen.add(title)
  }
  let variant = 0
  while (items.length < LATEST_TARGET && pool.length > 0) {
    const source = pool[variant % pool.length]
    const volume = Math.floor(variant / pool.length) + 2
    items.push({
      ...source,
      id: `novel-mock-update-variant-${variant}`,
      detailId: `novel-mock:update:variant:${variant}`,
      title: `${source.title} ภาค ${volume}`,
      episode: String(Number(source.episode || 0) + volume),
      workId: undefined,
      coverUrl: undefined,
      href: '/discover',
      isMock: true,
      contentType: 'novel',
    })
    variant += 1
  }
  return items
}

export function prepareNovelLandingCatalog(catalog: NovelLandingCatalog, genre: Genre | null): NovelLandingCatalog {
  return {
    popular: fillBooks(catalog.popular, NOVEL_POPULAR_BOOKS, POPULAR_TARGET, 'popular', genre),
    newWorks: fillBooks(catalog.newWorks, NOVEL_NEW_BOOKS, BOOK_TARGET, 'new', genre),
    newThaiWorks: fillBooks(catalog.newThaiWorks, NOVEL_THAI_BOOKS, BOOK_TARGET, 'thai', genre),
    translatedWorks: fillBooks(catalog.translatedWorks, NOVEL_TRANSLATED_BOOKS, BOOK_TARGET, 'translated', genre),
    categoryPopular: fillBooks(catalog.categoryPopular, NOVEL_CATEGORY_BOOKS, CATEGORY_TARGET, 'category', genre),
    rankings: catalog.rankings.map((column, index) => fillRankingColumn(
      column,
      NOVEL_RANKING_COLUMNS.find((fallback) => fallback.id === column.id) ?? NOVEL_RANKING_COLUMNS[index],
      genre,
    )),
    latestUpdates: fillUpdates(catalog.latestUpdates, genre),
  }
}

function banner(
  id: string,
  title: string,
  background: string,
  copy: { badge?: string; title: string; text?: string; button?: string; link?: string },
): CmsBanner {
  return {
    id: `novel-mock-banner-${id}`,
    title,
    background,
    linkUrl: copy.link,
    focal: { x: 50, y: 50, zoom: 100 },
    elements: [
      copy.badge ? { id: `${id}-badge`, type: 'badge' as const, text: copy.badge, x: 5, y: 15, scale: 1, color: '#cc4452', backgroundColor: 'rgba(255,255,255,.88)', bold: true } : null,
      { id: `${id}-title`, type: 'title' as const, text: copy.title, x: 5, y: copy.badge ? 36 : 28, scale: 1, color: '#2e2a3d', bold: true },
      copy.text ? { id: `${id}-text`, type: 'text' as const, text: copy.text, x: 5, y: copy.badge ? 59 : 56, scale: 1, color: '#6b6580' } : null,
      copy.button ? { id: `${id}-button`, type: 'button' as const, text: copy.button, x: 5, y: 74, scale: 1, color: '#fff', backgroundColor: '#3a3f47', bold: true, link: copy.link ?? '/discover', width: 18, height: 12 } : null,
    ].filter((element): element is NonNullable<typeof element> => element !== null),
  }
}

const MOCK_HERO = NOVEL_HERO_SLIDES.map((slide) => banner(
  slide.id,
  slide.title,
  slide.background ?? '#eceef1',
  { badge: slide.badge, title: slide.title, text: slide.description, button: slide.ctaLabel, link: slide.href },
))

const MOCK_ACTIVITY = [
  banner('activity-vote', 'โหวตเรื่องโปรด', 'linear-gradient(120deg,#eceef1,#e6e8eb)', { badge: 'กิจกรรมประจำเดือน', title: 'ส่งนิยายที่คุณรักขึ้นอันดับ', text: 'ร่วมโหวตและรับรางวัลพิเศษ', button: 'ร่วมกิจกรรม', link: '/ranking' }),
  banner('activity-read', 'ภารกิจนักอ่าน', 'linear-gradient(120deg,#f0ecf8,#eceef1)', { badge: 'ภารกิจนักอ่าน', title: 'อ่านทุกวัน รับโบนัสทุกวัน', text: 'สะสมสิทธิพิเศษจากการอ่าน', button: 'ดูภารกิจ', link: '/dashboard' }),
]

const MOCK_ACT3 = [banner('act3', 'กิจกรรมอันดับ', 'linear-gradient(115deg,#eceef1,#e7e9ed)', { badge: 'กิจกรรมพิเศษ', title: 'ร่วมเชียร์นิยายเรื่องโปรด', text: 'ทุกคะแนนของคุณมีความหมาย', button: 'ดูอันดับ', link: '/ranking' })]
const MOCK_WRITER = [banner('writer', 'มาเป็นนักเขียนกับเรา', 'linear-gradient(120deg,#fbeef5,#f0e8fb)', { title: 'มาเป็นนักเขียนกับเรา', text: 'แบ่งปันจินตนาการ สร้างสรรค์ผลงาน ให้โลกของนิยายเป็นที่รู้จัก', button: 'เริ่มเขียนนิยายเลย', link: '/creator' })]
const MOCK_CATEGORY = [banner('category', 'เติมเต็มทุกอารมณ์', 'radial-gradient(80% 140% at 85% 10%,#f7edff,transparent 58%),linear-gradient(110deg,#ece1ff,#f9ebf4 65%,#ffeef5)', { badge: '✦ นิยายดี ๆ ที่รอให้คุณค้นพบ', title: 'เติมเต็มทุกอารมณ์', text: 'คัดสรรนิยายคุณภาพ หลากหลายแนว ครบทุกอารมณ์ ให้คุณสนุกได้ไม่รู้จบ' })]
const MOCK_WEB_RECOMMEND = [
  banner('web-recommend-1', 'เรื่องเด่นประจำสัปดาห์', '#eceef1', { title: 'เรื่องเด่นประจำสัปดาห์', text: 'คัดสรรโดยทีมงาน', button: 'อ่านเลย', link: '/discover' }),
  banner('web-recommend-2', 'เปิดโลกนิยายเรื่องใหม่', '#eceef1', { title: 'เปิดโลกนิยายเรื่องใหม่', text: 'เริ่มอ่านก่อนใครวันนี้', button: 'ดูเรื่องใหม่', link: '/discover' }),
]
const MOCK_LAUNCH = [banner('launch', 'เปิดตัวใหม่ยอดฮิต', 'linear-gradient(120deg,#eceef1,#e6e8eb)', { badge: 'เปิดตัวใหม่', title: 'เรื่องใหม่ที่กำลังมาแรง', text: 'ค้นพบเรื่องน่าอ่านก่อนใคร', button: 'อ่านเลย', link: '/discover' })]

function coverSvg(index: number, title: string) {
  const colors = [['#7886ad', '#273556'], ['#986978', '#412638'], ['#6b8c80', '#243f39'], ['#8d76aa', '#382952']][index % 4]
  const letter = title.trim().charAt(0) || 'R'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient></defs><rect width="300" height="450" rx="18" fill="url(#g)"/><circle cx="210" cy="105" r="62" fill="white" opacity=".14"/><path d="M0 360 88 225l70 99 73-156 69 188v94H0z" fill="#080812" opacity=".25"/><text x="150" y="245" text-anchor="middle" fill="white" opacity=".9" font-size="88" font-family="sans-serif" font-weight="700">${letter}</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const MOCK_COVERFLOW_COVERS: CmsCoverflowCover[] = NOVEL_EDITORIAL_PICKS.slice(0, 4).map((item, index) => ({
  id: `novel-mock-coverflow-${index}`,
  title: item.title,
  subtitle: item.author,
  imageUrl: coverSvg(index, item.title),
  linkUrl: '/discover',
}))

const MOCK_COVERFLOW: NovelCmsCoverflow = {
  main: banner('coverflow', 'นิยายน่าอ่านประจำสัปดาห์', 'linear-gradient(120deg,#8b6df0,#7355df 58%,#cc4452)', { badge: 'คัดสรรโดยทีมงาน', title: 'นิยายน่าอ่านประจำสัปดาห์', text: 'รวมเรื่องเด่นที่ทีมงานคัดมาให้คุณโดยเฉพาะ', button: 'ดูทั้งหมด', link: '/discover' }),
  covers: MOCK_COVERFLOW_COVERS,
}

function sectionEnabled(cms: NovelCmsCatalog, key: NovelCmsSectionKey) {
  return cms.sectionState[key] !== 'disabled'
}

function withMockOffers(real: HomeLimitedOffer[]) {
  const result = [...real]
  const seen = new Set(result.flatMap((item) => [item.workId || item.detailId, normalizedTitle(item.title)]))
  for (const item of NOVEL_LIMITED_OFFERS) {
    if (result.length >= BOOK_TARGET) break
    if (seen.has(item.workId || item.detailId) || seen.has(normalizedTitle(item.title))) continue
    result.push({ ...item, id: `novel-mock-offer-${result.length}`, detailId: `novel-mock:offer:${result.length}`, workId: undefined, coverUrl: undefined, href: '/discover', isMock: true })
  }
  return result
}

export function prepareNovelCmsCatalog(cms: NovelCmsCatalog, genre: Genre | null): NovelCmsCatalog {
  const webBooks = fillBooks(cms.webBooks, NOVEL_NEW_BOOKS, 7, 'web-recommend', genre)
  return {
    ...cms,
    hero: sectionEnabled(cms, 'hero') ? (cms.hero.length ? cms.hero : MOCK_HERO) : [],
    activity: sectionEnabled(cms, 'activity')
      ? cms.activity.map((column, index) => column.length ? column : [MOCK_ACTIVITY[index]])
      : [[], []],
    act3: sectionEnabled(cms, 'act3') ? (cms.act3.length ? cms.act3 : MOCK_ACT3) : [],
    limitedOffers: sectionEnabled(cms, 'sale') ? withMockOffers(cms.limitedOffers) : [],
    writerBanners: sectionEnabled(cms, 'writer-banner') ? (cms.writerBanners.length ? cms.writerBanners : MOCK_WRITER) : [],
    coverflow: sectionEnabled(cms, 'web-coverflow') ? (cms.coverflow ?? MOCK_COVERFLOW) : null,
    webBooks: sectionEnabled(cms, 'web-books') ? webBooks : [],
    categoryBanners: sectionEnabled(cms, 'category') ? (cms.categoryBanners.length ? cms.categoryBanners : MOCK_CATEGORY) : [],
    webRecommend: sectionEnabled(cms, 'web-recommend')
      ? cms.webRecommend.map((column, index) => column.length ? column : [MOCK_WEB_RECOMMEND[index]])
      : [[], []],
    launch: sectionEnabled(cms, 'launch')
      ? cms.launch.map((column, index) => column.length ? column : index === 0 ? MOCK_LAUNCH : [])
      : [[], []],
  }
}
