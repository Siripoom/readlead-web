import type { HomeLimitedOffer } from '@/lib/home-landing-data'
import type { CmsBanner } from '@/lib/cms-catalog'
import type { AudioCmsCatalog, AudioCmsSectionKey } from '@/lib/audio-cms-catalog'
import type { AudioLandingCatalog } from '@/lib/audio-landing-catalog'
import {
  AUDIO_AI_VOICE_BOOKS,
  AUDIO_CATEGORY_BOOKS,
  AUDIO_COMPLETED_BOOKS,
  AUDIO_DETAIL_BOOKS,
  AUDIO_HERO_SLIDES,
  AUDIO_HUMAN_VOICE_BOOKS,
  AUDIO_LATEST_UPDATES,
  AUDIO_LIMITED_OFFERS,
  AUDIO_NEW_RELEASES,
  AUDIO_POPULAR_BOOKS,
  AUDIO_RANKING_GROUPS,
  AUDIO_RECOMMENDED_BOOKS,
  type AudioBookItem,
  type AudioGenreKey,
  type AudioLatestUpdate,
  type AudioRankingGroup,
  type AudioRankingItem,
} from '@/lib/audiobook-landing-data'

const POPULAR_TARGET = 10
const BOOK_TARGET = 12
const RANKING_TARGET = 10
const CATEGORY_TARGET = 6
const LATEST_TARGET = 26

function normalizedTitle(value: string) {
  return value.trim().toLocaleLowerCase('th-TH').replace(/\s+/g, ' ')
}

function keyFor(item: { workId?: string; detailId: string; title: string }) {
  return item.workId || item.detailId || normalizedTitle(item.title)
}

function matchesGenre(item: AudioBookItem, genre: AudioGenreKey | null) {
  return !genre || item.filterKeys.includes(genre)
}

function mockBook(item: AudioBookItem, section: string, index: number, variant = 0): AudioBookItem {
  const suffix = variant ? ` · เรื่องพิเศษ ${variant + 1}` : ''
  return {
    ...item,
    id: `audio-mock-${section}-${index}`,
    detailId: `audio-mock:${section}:${index}`,
    title: `${item.title}${suffix}`,
    workId: undefined,
    coverUrl: undefined,
    href: '/discover',
    isMock: true,
    contentType: 'audiobook',
  }
}

function fillBooks(real: AudioBookItem[], fallback: AudioBookItem[], target: number, section: string, genre: AudioGenreKey | null) {
  const result = real.filter((item) => matchesGenre(item, genre))
  const seen = new Set(result.flatMap((item) => [keyFor(item), normalizedTitle(item.title)]))
  const candidateSeen = new Set<string>()
  const candidates = [...fallback, ...AUDIO_DETAIL_BOOKS].filter((item) => {
    const key = keyFor(item)
    if (!matchesGenre(item, genre) || candidateSeen.has(key)) return false
    candidateSeen.add(key)
    return true
  })
  for (const item of candidates) {
    if (result.length >= target) break
    if (seen.has(keyFor(item)) || seen.has(normalizedTitle(item.title))) continue
    const next = mockBook(item, section, result.length)
    result.push(next)
    seen.add(keyFor(item))
    seen.add(normalizedTitle(item.title))
  }
  let variant = 1
  while (result.length < target && candidates.length) {
    const source = candidates[(result.length + variant) % candidates.length]
    result.push(mockBook(source, section, result.length, variant))
    variant += 1
  }
  return result.slice(0, target)
}

function mockRanking(item: AudioRankingItem, group: string, index: number, variant = 0): AudioRankingItem {
  return {
    ...mockBook(item, `rank-${group}`, index, variant),
    value: item.value,
    tagline: item.tagline,
    href: '/ranking',
  }
}

function fillRanking(real: AudioRankingGroup | undefined, fallback: AudioRankingGroup, genre: AudioGenreKey | null): AudioRankingGroup {
  const result = (real?.items ?? []).filter((item) => matchesGenre(item, genre))
  const rankSeeds: AudioRankingItem[] = AUDIO_DETAIL_BOOKS.map((item, index) => ({
    ...item,
    value: fallback.items[index % fallback.items.length]?.value ?? `${100 - index}K`,
    tagline: item.tagline || `ฟังเรื่องราวของ ${item.title} ผ่านเสียงบรรยายที่ถ่ายทอดทุกอารมณ์`,
  }))
  const candidateSeen = new Set<string>()
  const candidates = [...fallback.items, ...rankSeeds].filter((item) => {
    const key = keyFor(item)
    if (!matchesGenre(item, genre) || candidateSeen.has(key)) return false
    candidateSeen.add(key)
    return true
  })
  const seen = new Set(result.flatMap((item) => [keyFor(item), normalizedTitle(item.title)]))
  for (const item of candidates) {
    if (result.length >= RANKING_TARGET) break
    if (seen.has(keyFor(item)) || seen.has(normalizedTitle(item.title))) continue
    result.push(mockRanking(item, fallback.id, result.length))
    seen.add(keyFor(item))
    seen.add(normalizedTitle(item.title))
  }
  let variant = 1
  while (result.length < RANKING_TARGET && candidates.length) {
    result.push(mockRanking(candidates[(result.length + variant) % candidates.length], fallback.id, result.length, variant))
    variant += 1
  }
  return { id: fallback.id, label: fallback.label, items: result.slice(0, RANKING_TARGET) }
}

function mockLatest(item: AudioLatestUpdate, index: number, variant = 0): AudioLatestUpdate {
  const book = mockBook(item, 'latest', index, variant)
  return {
    ...book,
    updatedLabel: item.updatedLabel || `ตอนที่ ${index + 1}`,
    description: item.description || `ติดตามเรื่องราวของ ${book.title} ผ่านเสียงบรรยายที่ถ่ายทอดทุกอารมณ์`,
    episodeTitle: item.episodeTitle || ['จุดเริ่มต้นใหม่', 'ความลับที่ถูกเปิดเผย', 'บทพิสูจน์หัวใจ'][index % 3],
    updatedAt: item.updatedAt || `${String(11 - (index % 9)).padStart(2, '0')} มิ.ย. 2569`,
  }
}

function fillLatest(real: AudioLatestUpdate[], genre: AudioGenreKey | null) {
  const result = real.filter((item) => matchesGenre(item, genre))
  const candidates = AUDIO_LATEST_UPDATES.filter((item) => matchesGenre(item, genre))
  const seen = new Set(result.flatMap((item) => [keyFor(item), normalizedTitle(item.title)]))
  for (const item of candidates) {
    if (result.length >= LATEST_TARGET) break
    if (seen.has(keyFor(item)) || seen.has(normalizedTitle(item.title))) continue
    result.push(mockLatest(item, result.length))
    seen.add(keyFor(item))
    seen.add(normalizedTitle(item.title))
  }
  let variant = 1
  while (result.length < LATEST_TARGET && candidates.length) {
    result.push(mockLatest(candidates[(result.length + variant) % candidates.length], result.length, variant))
    variant += 1
  }
  return result.slice(0, LATEST_TARGET)
}

export function prepareAudioLandingCatalog(catalog: AudioLandingCatalog, genre: AudioGenreKey | null): AudioLandingCatalog {
  return {
    popular: fillBooks(catalog.popular, AUDIO_POPULAR_BOOKS, POPULAR_TARGET, 'popular', genre),
    newReleases: fillBooks(catalog.newReleases, AUDIO_NEW_RELEASES, BOOK_TARGET, 'new', genre),
    humanVoice: fillBooks(catalog.humanVoice, AUDIO_HUMAN_VOICE_BOOKS, BOOK_TARGET, 'human', genre),
    aiVoice: fillBooks(catalog.aiVoice, AUDIO_AI_VOICE_BOOKS, BOOK_TARGET, 'ai', genre),
    completed: fillBooks(catalog.completed, AUDIO_COMPLETED_BOOKS, BOOK_TARGET, 'completed', genre),
    recommended: fillBooks(catalog.recommended, AUDIO_RECOMMENDED_BOOKS, BOOK_TARGET, 'recommended', genre),
    categoryPopular: fillBooks(catalog.categoryPopular, AUDIO_CATEGORY_BOOKS, CATEGORY_TARGET, 'category', genre),
    rankings: AUDIO_RANKING_GROUPS.map((fallback) => fillRanking(
      catalog.rankings.find((group) => group.id === fallback.id), fallback, genre,
    )),
    latestUpdates: fillLatest(catalog.latestUpdates, genre),
  }
}

function banner(
  id: string,
  title: string,
  background: string,
  copy: { badge?: string; title: string; text?: string; button?: string; link?: string },
): CmsBanner {
  return {
    id: `audio-mock-banner-${id}`,
    title,
    background,
    linkUrl: copy.link,
    focal: { x: 50, y: 50, zoom: 100 },
    elements: [
      copy.badge ? { id: `${id}-badge`, type: 'badge' as const, text: copy.badge, x: 4, y: 15, scale: 1, color: '#3a3f47', backgroundColor: '#fff', bold: true } : null,
      { id: `${id}-title`, type: 'title' as const, text: copy.title, x: 4, y: copy.badge ? 34 : 25, scale: 1, color: '#2b2f36', bold: true },
      copy.text ? { id: `${id}-text`, type: 'text' as const, text: copy.text, x: 4, y: copy.badge ? 58 : 54, scale: 1, color: '#5b6068' } : null,
      copy.button ? { id: `${id}-button`, type: 'button' as const, text: copy.button, x: 4, y: 74, scale: 1, color: '#fff', backgroundColor: '#3a3f47', bold: true, link: copy.link ?? '/discover', width: 16, height: 12 } : null,
    ].filter((element): element is NonNullable<typeof element> => element !== null),
  }
}

const MOCK_HERO = AUDIO_HERO_SLIDES.map((slide) => banner(
  slide.id,
  slide.title,
  slide.background ?? '#eceef1',
  { badge: slide.badge, title: slide.title, text: slide.description, button: slide.ctaLabel, link: slide.href },
))

const MOCK_ACTIVITY = [
  banner('activity-listen', 'ฟังทุกวัน รับรางวัลทุกวัน', 'linear-gradient(120deg,#f7e8ed,#f1edf8)', { badge: 'กิจกรรมสำหรับผู้ฟัง', title: 'ฟังครบภารกิจ รับโบนัสพิเศษ', text: 'สะสมชั่วโมงฟังและปลดล็อกรางวัล', button: 'ร่วมกิจกรรม', link: '/dashboard' }),
  banner('activity-vote', 'โหวตเสียงที่คุณชอบ', 'linear-gradient(120deg,#ece8fa,#f8e9f1)', { badge: 'โหวตประจำเดือน', title: 'ส่งเรื่องโปรดขึ้นอันดับ', text: 'ทุกคะแนนของคุณมีความหมาย', button: 'ดูอันดับ', link: '/ranking' }),
]

const MOCK_ROW3 = [banner('row3', 'เรื่องเด่นประจำเดือน', 'linear-gradient(110deg,#e9ecf2,#f2e9f5)', { badge: 'หนังสือเสียงยอดนิยม', title: 'เรื่องดัง เสียงดี ที่ผู้ฟังเลือกแล้ว', text: 'เริ่มฟังเรื่องฮิตได้ทุกที่ทุกเวลา', button: 'ฟังเลย', link: '/discover' })]
const MOCK_NARRATOR = [banner('narrator', 'มาเป็นนักพากย์กับเรา', 'linear-gradient(110deg,#f7e8ee,#efe8fb)', { badge: 'เปิดรับนักพากย์', title: 'เปลี่ยนเสียงของคุณให้เป็นเรื่องราว', text: 'ร่วมสร้างประสบการณ์การฟังกับ ReadLead', button: 'สมัครนักพากย์', link: '/creator' })]
const MOCK_WEB_SIDES = [
  banner('web-left', 'คัดสรรโดยทีมงาน', 'linear-gradient(120deg,#eee9f8,#e9edf4)', { title: 'เสียงพากย์คุณภาพประจำสัปดาห์', text: 'รวมเรื่องเด่นที่ทีมงานอยากแนะนำ', button: 'ฟังเลย', link: '/discover' }),
  banner('web-right', 'เรื่องใหม่ที่น่าจับตา', 'linear-gradient(120deg,#f7e9ef,#eee9f8)', { title: 'เปิดโลกเรื่องเล่าผ่านเสียง', text: 'ค้นพบหนังสือเสียงเรื่องใหม่ก่อนใคร', button: 'ดูทั้งหมด', link: '/discover' }),
]
const MOCK_CATEGORY = [banner('category', 'เติมเต็มทุกอารมณ์', 'radial-gradient(130% 150% at 88% 8%,#f6ecff 0%,transparent 46%),linear-gradient(110deg,#ece1ff,#f1e8ff 30%,#f9ebf4 64%,#ffeef5)', { badge: '✦ หนังสือเสียงดี ๆ ที่รอให้คุณค้นพบ', title: 'เติมเต็มทุกอารมณ์', text: 'คัดสรรหนังสือเสียงคุณภาพ หลากหลายแนว ครบทุกอารมณ์ ให้คุณสนุกได้ไม่รู้จบ' })]
const MOCK_BOTTOM_CTA = [
  banner('cta-1', 'เริ่มฟังหนังสือเสียง', 'linear-gradient(125deg,#f6e8ee,#eadff7)', { title: 'เริ่มฟังเรื่องโปรด', text: 'ค้นหาเรื่องที่ใช่สำหรับคุณ', button: 'ค้นหา', link: '/discover' }),
  banner('cta-2', 'สร้างผลงาน', 'linear-gradient(125deg,#e9edf7,#ece5fa)', { title: 'มีเรื่องอยากเล่าไหม', text: 'เริ่มสร้างผลงานของคุณ', button: 'เริ่มเลย', link: '/creator' }),
  banner('cta-3', 'อันดับยอดนิยม', 'linear-gradient(125deg,#f7eee2,#f6e7ec)', { title: 'เรื่องฮิตติดอันดับ', text: 'ดูเรื่องที่ผู้ฟังเลือก', button: 'ดูอันดับ', link: '/ranking' }),
  banner('cta-4', 'ชั้นหนังสือ', 'linear-gradient(125deg,#e7f1ef,#ece8f8)', { title: 'เก็บเรื่องโปรดไว้ฟัง', text: 'กลับมาฟังต่อได้ทุกเวลา', button: 'เข้าชั้น', link: '/dashboard' }),
]

function sectionEnabled(cms: AudioCmsCatalog, key: AudioCmsSectionKey) {
  return cms.sectionState[key] !== 'disabled'
}

function limitedMatchesGenre(item: HomeLimitedOffer, genre: AudioGenreKey | null) {
  if (!genre) return true
  const source = AUDIO_DETAIL_BOOKS.find((book) => normalizedTitle(book.title) === normalizedTitle(item.title))
  return Boolean(source?.filterKeys.includes(genre))
}

function fillOffers(real: HomeLimitedOffer[], genre: AudioGenreKey | null) {
  const result = real.filter((item) => limitedMatchesGenre(item, genre))
  const seen = new Set(result.flatMap((item) => [item.workId || item.detailId, normalizedTitle(item.title)]))
  const generatedOffers: HomeLimitedOffer[] = AUDIO_DETAIL_BOOKS.map((item, index) => ({
    id: `audio-offer-seed-${item.id}`,
    detailId: item.detailId,
    title: item.title,
    author: item.author,
    initialSeconds: ((index % 7) + 1) * 86400 + 43140 + index,
    gradient: item.gradient,
    views: item.views,
    chapters: item.chapters,
    mediaType: 'audio',
  }))
  const candidateSeen = new Set<string>()
  const candidates = [...AUDIO_LIMITED_OFFERS, ...generatedOffers].filter((item) => {
    const key = item.workId || item.detailId
    if (!limitedMatchesGenre(item, genre) || candidateSeen.has(key)) return false
    candidateSeen.add(key)
    return true
  })
  for (const item of candidates) {
    if (result.length >= BOOK_TARGET) break
    if (seen.has(item.workId || item.detailId) || seen.has(normalizedTitle(item.title))) continue
    result.push({ ...item, id: `audio-mock-offer-${result.length}`, detailId: `audio-mock:offer:${result.length}`, workId: undefined, coverUrl: undefined, href: '/discover', isMock: true })
  }
  let variant = 1
  while (result.length < BOOK_TARGET && candidates.length) {
    const item = candidates[(result.length + variant) % candidates.length]
    result.push({ ...item, id: `audio-mock-offer-${result.length}`, detailId: `audio-mock:offer:${result.length}`, title: `${item.title} · โปรพิเศษ ${variant + 1}`, workId: undefined, coverUrl: undefined, href: '/discover', isMock: true })
    variant += 1
  }
  return result.slice(0, BOOK_TARGET)
}

export function prepareAudioCmsCatalog(cms: AudioCmsCatalog, genre: AudioGenreKey | null): AudioCmsCatalog {
  const webBooks = fillBooks(cms.webBooks, AUDIO_RECOMMENDED_BOOKS, BOOK_TARGET, 'web-books', genre)
  return {
    ...cms,
    hero: sectionEnabled(cms, 'hero') ? (cms.hero.length ? cms.hero : MOCK_HERO) : [],
    activity: sectionEnabled(cms, 'activity')
      ? cms.activity.map((column, index) => column.length ? column : [MOCK_ACTIVITY[index]])
      : [[], []],
    limitedOffers: sectionEnabled(cms, 'sale') ? fillOffers(cms.limitedOffers, genre) : [],
    row3: sectionEnabled(cms, 'row-3') ? (cms.row3.length ? cms.row3 : MOCK_ROW3) : [],
    narrator: sectionEnabled(cms, 'narrator') ? (cms.narrator.length ? cms.narrator : MOCK_NARRATOR) : [],
    webSides: sectionEnabled(cms, 'web-sides')
      ? cms.webSides.map((column, index) => column.length ? column : [MOCK_WEB_SIDES[index]])
      : [[], []],
    webBooks: sectionEnabled(cms, 'web-books') ? webBooks : [],
    categoryBanners: sectionEnabled(cms, 'category') ? (cms.categoryBanners.length ? cms.categoryBanners : MOCK_CATEGORY) : [],
    bottomCta: sectionEnabled(cms, 'bottom-cta')
      ? cms.bottomCta.map((column, index) => cms.bottomCtaSlotEnabled[index] === false ? [] : (column.length ? column : [MOCK_BOTTOM_CTA[index]]))
      : [[], [], [], []],
    webRecommend: sectionEnabled(cms, 'web-recommend') ? cms.webRecommend : [[], []],
    launch: sectionEnabled(cms, 'launch') ? cms.launch : [[], []],
  }
}
