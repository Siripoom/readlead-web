import { GENRE_LABELS, MOCK_CREATORS, MOCK_WORKS } from '@/lib/mock-data'

export type RankingContentType = 'novel' | 'manga' | 'audiobook'
export type RankingSort = 'recommended' | 'monthly' | 'views' | 'new'
export type RankingView = 'overview' | 'completed' | 'creators' | 'shelf' | 'reviews' | 'favorites'
export type RankingGenreKey =
  | 'fantasy'
  | 'romance'
  | 'action'
  | 'historical'
  | 'mystery'
  | 'sci-fi'
  | 'drama'
  | 'horror'
  | 'other'

export interface RankingRouteState {
  view: RankingView
  type: RankingContentType | null
  sort: RankingSort | null
  genre: RankingGenreKey | null
  page: number
}

export interface RankingWorkItem {
  id: string
  detailId: string
  type: RankingContentType
  title: string
  author: string
  genre: RankingGenreKey
  genreLabel: string
  synopsis: string
  status: 'ongoing' | 'completed'
  origin: 'ไทย' | 'แปล'
  latestEpisode: string
  updatedAt: string
  launchedAt: string
  recommendedVotes: number
  monthlyVotes: number
  views: number
  change: number
  shelfCount: number
  favoriteCount: number
  reviewCount: number
  rating: number
  coverFrom: string
  coverTo: string
}

export interface RankingCreatorItem {
  id: string
  name: string
  genre: RankingGenreKey
  genreLabel: string
  works: number
  followers: number
  totalVotes: number
  totalViews: number
  avatarFrom: string
  avatarTo: string
}

export type RankingOverviewRow = RankingWorkItem

export const RANKING_TYPE_LABELS: Record<RankingContentType, string> = {
  novel: 'นิยาย',
  manga: 'เว็บตูน',
  audiobook: 'หนังสือเสียง',
}

export const RANKING_SORT_LABELS: Record<RankingSort, { label: string; subtitle: string }> = {
  recommended: { label: 'อันดับแนะนำ', subtitle: 'จัดอันดับรายอาทิตย์ยอดนิยม' },
  monthly: { label: 'อันดับรายเดือน', subtitle: 'ผลงานที่ได้รับโหวตรายเดือนสูงสุด' },
  views: { label: 'ยอดวิว', subtitle: 'ผลงานที่มีผู้เข้าชมมากที่สุด' },
  new: { label: 'อันดับเรื่องใหม่', subtitle: 'ผลงานเปิดตัวใหม่ที่กำลังมาแรง' },
}

export const RANKING_VIEW_LABELS: Record<Exclude<RankingView, 'overview'>, { label: string; subtitle: string }> = {
  completed: { label: 'จบแล้ว', subtitle: 'ผลงานจบแล้วที่ได้รับความนิยมสูงสุด' },
  creators: { label: 'เจ้าของผลงาน', subtitle: 'ครีเอเตอร์ที่ผู้อ่านติดตามมากที่สุด' },
  shelf: { label: 'ชั้นเก็บผลงาน', subtitle: 'ผลงานที่ถูกเพิ่มเข้าชั้นมากที่สุด' },
  reviews: { label: 'รีวิว', subtitle: 'ผลงานที่ได้รับรีวิวและคะแนนสูงสุด' },
  favorites: { label: 'ชื่นชอบ', subtitle: 'ผลงานที่ได้รับหัวใจจากผู้อ่านมากที่สุด' },
}

export const RANKING_GENRES: ReadonlyArray<{ key: RankingGenreKey; label: string }> = [
  { key: 'fantasy', label: 'แฟนตาซี' },
  { key: 'romance', label: 'โรแมนซ์' },
  { key: 'action', label: 'กำลังภายใน' },
  { key: 'historical', label: 'ตะวันออก' },
  { key: 'mystery', label: 'สืบสวน' },
  { key: 'sci-fi', label: 'ไซไฟ' },
  { key: 'drama', label: 'ดราม่า' },
  { key: 'horror', label: 'สยองขวัญ' },
  { key: 'other', label: 'อื่นๆ' },
]

export const RANKING_STATS = [
  { id: 'creators', value: '24,876', unit: 'คน', label: 'ครีเอเตอร์ทั้งหมด', accent: '#cc4452', parts: ['นักเขียน 18,420', 'นักวาด 4,860', 'ผู้แปล 1,596'] },
  { id: 'works', value: '6,231', unit: 'ผลงาน', label: 'ผลงานทั้งหมด', accent: '#8b5cf6', parts: ['นิยาย 4,180', 'เว็บตูน 1,420', 'เสียง 631'] },
  { id: 'views', value: '245.8M', unit: 'วิว', label: 'ยอดวิวทั้งหมด', accent: '#3b9af0', parts: ['นิยาย 180.4M', 'เว็บตูน 52.1M', 'เสียง 13.3M'] },
  { id: 'new', value: '36', unit: 'ผลงาน', label: 'เปิดตัวผลงานใหม่วันนี้', accent: '#f06aa0', parts: ['นิยาย 22', 'เว็บตูน 10', 'เสียง 4'] },
] as const

const TITLES = [
  'เกิดใหม่ทั้งที ขอเป็นนางร้ายที่แล้วกัน', 'สะดุดรักมาเฟียเพื่อนบ้าน', 'เจ้าสาวตัวปลอมของท่านอสูร',
  'ท่านอ๋องของข้า ข้าจะไม่หนีอีกแล้ว', 'ทะลุมิติไปเป็นแม่ค้าขายขนม', 'ระบบนี้เพื่อคุณคนเดียว',
  'คุณหมูใหญ่ผู้ไม่ยอมแพ้', 'เด็กใหม่เป็นลูกสาวมาเฟีย', 'จอมมารซ่อนหัวใจ', 'รักนี้มีเพียงเธอ',
  'คมดาบเหนือเมฆา', 'ลำนำพิรุณกลางราตรี', 'รหัสจักรกลพิทักษ์โลก', 'มนต์เวทแห่งรุ่งอรุณ',
  'ร้านเบเกอรี่วันฝนพรำ', 'คฤหาสน์ลับในป่าหมอก', 'บันทึกข้ามกาลเวลา', 'นักรบไร้เงา',
  'ดวงดาวคืนสู่ฟ้า', 'เจ้าหญิงกับอัศวินพเนจร',
] as const

const AUTHORS = ['BlackPeony', 'MidnightRose', 'LilacNovel', 'ปลายฝัน', 'ลมดาว', 'ดาวเดือน', 'กุหลาบราตรี', 'InkSpire', 'NovaQuill', 'StarPen'] as const
const GENRE_KEYS: RankingGenreKey[] = ['fantasy', 'romance', 'action', 'historical', 'mystery', 'sci-fi', 'drama', 'horror', 'other']
const COVER_PAIRS = [
  ['#b8455f', '#5e1a2e'], ['#3a3550', '#171526'], ['#7a5a55', '#3a2420'], ['#5a6a8a', '#28324a'],
  ['#a06a5a', '#5a3024'], ['#6a5a8a', '#33284d'], ['#8a4858', '#4a1d28'], ['#4a6a7a', '#22343f'],
] as const

const genreLabel = (key: RankingGenreKey) => RANKING_GENRES.find((genre) => genre.key === key)?.label ?? 'อื่นๆ'

function mapWorkGenre(genres: readonly string[]): RankingGenreKey {
  const first = genres[0]
  if (first === 'romance') return 'romance'
  if (first === 'fantasy') return 'fantasy'
  if (first === 'action') return 'action'
  if (first === 'historical') return 'historical'
  if (first === 'mystery') return 'mystery'
  if (first === 'sci-fi') return 'sci-fi'
  if (first === 'drama') return 'drama'
  if (first === 'horror') return 'horror'
  return 'other'
}

function buildWork(index: number): RankingWorkItem {
  const source = MOCK_WORKS[index]
  const type: RankingContentType = source?.type ?? (index % 3 === 0 ? 'novel' : index % 3 === 1 ? 'manga' : 'audiobook')
  const genre = source ? mapWorkGenre(source.genres) : GENRE_KEYS[index % GENRE_KEYS.length]
  const colors = COVER_PAIRS[index % COVER_PAIRS.length]
  const decay = Math.pow(0.965, index)
  const recommendedVotes = source?.weeklyVoteCount ?? Math.max(320, Math.round(19850 * decay + ((index * 137) % 860)))
  const monthlyVotes = source?.voteCount ?? Math.max(1800, Math.round(128000 * Math.pow(0.968, index)))
  const views = source?.viewCount ?? Math.max(85000, Math.round(58_400_000 * Math.pow(0.958, index)))
  const day = (index * 7) % 28 + 1
  const month = index % 6 + 1

  return {
    id: source ? `work-${source.id}` : `ranking-work-${index + 1}`,
    detailId: source?.id ?? `ranking:ranking-work-${index + 1}`,
    type,
    title: source?.title ?? TITLES[index % TITLES.length],
    author: source?.authorName ?? AUTHORS[index % AUTHORS.length],
    genre,
    genreLabel: source ? source.genres.map((key) => GENRE_LABELS[key]).join(' · ') : genreLabel(genre),
    synopsis: source?.synopsis ?? 'เรื่องราวการเดินทางที่เต็มไปด้วยความลับ มิตรภาพ และการตัดสินใจซึ่งอาจเปลี่ยนชะตาของโลกทั้งใบ',
    status: source?.status === 'completed' || index % 5 === 0 ? 'completed' : 'ongoing',
    origin: source?.origin === 'translated' || index % 3 === 1 ? 'แปล' : 'ไทย',
    latestEpisode: source?.latestEpisode ?? `ตอนที่ ${Math.max(24, 740 - index * 7)} บททดสอบครั้งใหม่`,
    updatedAt: source?.updatedAt ?? `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00Z`,
    launchedAt: `${day} ${['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'][month - 1]} 69`,
    recommendedVotes,
    monthlyVotes,
    views,
    change: index === 0 ? 0 : index % 4 === 0 ? -(index % 3 + 1) : index % 3 === 0 ? index % 5 + 1 : 0,
    shelfCount: Math.max(240, Math.round(87000 * Math.pow(0.972, index) + (index % 9) * 270)),
    favoriteCount: Math.max(180, Math.round(69000 * Math.pow(0.97, index) + (index % 7) * 310)),
    reviewCount: Math.max(32, Math.round(8400 * Math.pow(0.966, index) + (index % 5) * 48)),
    rating: Math.min(5, 4.1 + (index % 9) * 0.1),
    coverFrom: colors[0],
    coverTo: colors[1],
  }
}

export const RANKING_WORKS: RankingWorkItem[] = Array.from({ length: 100 }, (_, index) => buildWork(index))

export const RANKING_CREATORS: RankingCreatorItem[] = Array.from({ length: 36 }, (_, index) => {
  const source = MOCK_CREATORS[index % MOCK_CREATORS.length]
  const genre = GENRE_KEYS[index % GENRE_KEYS.length]
  const colors = COVER_PAIRS[(index + 3) % COVER_PAIRS.length]
  return {
    id: `ranking-creator-${index + 1}`,
    name: index < MOCK_CREATORS.length ? source.name : `${AUTHORS[index % AUTHORS.length]} ${index + 1}`,
    genre,
    genreLabel: genreLabel(genre),
    works: Math.max(2, 42 - (index % 18)),
    followers: Math.max(1200, 185000 - index * 4300),
    totalVotes: Math.max(8000, 980000 - index * 21500),
    totalViews: Math.max(120000, 42_000_000 - index * 870000),
    avatarFrom: colors[0],
    avatarTo: colors[1],
  }
})

export const VALID_RANKING_TYPES = new Set<RankingContentType>(['novel', 'manga', 'audiobook'])
export const VALID_RANKING_SORTS = new Set<RankingSort>(['recommended', 'monthly', 'views', 'new'])
export const VALID_RANKING_VIEWS = new Set<Exclude<RankingView, 'overview'>>(['completed', 'creators', 'shelf', 'reviews', 'favorites'])
export const VALID_RANKING_GENRES = new Set<RankingGenreKey>(RANKING_GENRES.map((genre) => genre.key))

export function rankingMetric(item: RankingWorkItem, state: RankingRouteState) {
  if (state.view === 'shelf') return item.shelfCount
  if (state.view === 'favorites') return item.favoriteCount
  if (state.view === 'reviews') return item.reviewCount
  if (state.sort === 'monthly') return item.monthlyVotes
  if (state.sort === 'views') return item.views
  if (state.sort === 'new') return new Date(item.updatedAt).getTime()
  return item.recommendedVotes
}

export function getRankingWorks(state: RankingRouteState) {
  let items = RANKING_WORKS
  if (state.type) items = items.filter((item) => item.type === state.type)
  if (state.view === 'completed') items = items.filter((item) => item.status === 'completed')
  if (state.genre) items = items.filter((item) => item.genre === state.genre)
  return [...items].sort((left, right) => rankingMetric(right, state) - rankingMetric(left, state))
}

export function getRankingCreators(state: RankingRouteState) {
  const creators = state.genre ? RANKING_CREATORS.filter((creator) => creator.genre === state.genre) : RANKING_CREATORS
  return [...creators].sort((left, right) => right.followers - left.followers)
}
