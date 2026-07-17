import type {
  HomeBookStripItem,
  HomeHeroSlide,
  HomeLimitedOffer,
} from '@/lib/home-landing-data'
import type { Genre } from '@/lib/types'

export type AudioGenreKey =
  | 'action'
  | 'romance'
  | 'fantasy'
  | 'drama'
  | 'horror'
  | 'mystery'
  | 'time-travel'
  | 'translated'
  | 'sci-fi'
  | 'comedy'
  | 'school'
  | 'slice-of-life'
  | 'bl'
  | 'harem'
  | 'martial-arts'
  | 'historical'
  | 'game'
  | 'urban'
  | 'family'
  | 'superhero'
  | 'adventure'
  | 'thriller'
  | 'youth'
  | 'market'

export type AudioNarrationType = 'human' | 'ai'

export interface AudioGenreOption {
  key: AudioGenreKey
  label: string
}

export interface AudioBookItem extends HomeBookStripItem {
  filterKeys: AudioGenreKey[]
  narrationType: AudioNarrationType
}

export type AudioRankingId = 'vote_d' | 'vote_m' | 'listens' | 'new'

export interface AudioRankingItem extends AudioBookItem {
  value: string
  tagline: string
}

export interface AudioRankingGroup {
  id: AudioRankingId
  label: string
  items: AudioRankingItem[]
}

export interface AudioLatestUpdate extends AudioBookItem {
  updatedLabel: string
}

const COVER_GRADIENTS = [
  'linear-gradient(155deg,#3d4f7e,#1a2545)',
  'linear-gradient(155deg,#8a4d61,#371c2a)',
  'linear-gradient(155deg,#5d468f,#251b48)',
  'linear-gradient(155deg,#3d786c,#173a33)',
  'linear-gradient(155deg,#916a48,#402a1b)',
  'linear-gradient(155deg,#566b88,#242e42)',
  'linear-gradient(155deg,#80527d,#351f3a)',
  'linear-gradient(155deg,#3f7892,#1c3747)',
]

const FILTER_TO_GENRE: Record<AudioGenreKey, Genre[]> = {
  action: ['action'],
  romance: ['romance'],
  fantasy: ['fantasy'],
  drama: ['drama'],
  horror: ['horror'],
  mystery: ['mystery'],
  'time-travel': ['historical', 'fantasy'],
  translated: ['fantasy'],
  'sci-fi': ['sci-fi'],
  comedy: ['comedy'],
  school: ['slice-of-life'],
  'slice-of-life': ['slice-of-life'],
  bl: ['bl'],
  harem: ['romance'],
  'martial-arts': ['action'],
  historical: ['historical'],
  game: ['fantasy', 'action'],
  urban: ['slice-of-life'],
  family: ['drama'],
  superhero: ['action', 'sci-fi'],
  adventure: ['action', 'fantasy'],
  thriller: ['mystery', 'horror'],
  youth: ['slice-of-life'],
  market: ['slice-of-life', 'drama'],
}

type AudioSeed = readonly [
  id: string,
  title: string,
  author: string,
  genreLabel: string,
  filters: readonly AudioGenreKey[],
  narrationType: AudioNarrationType,
  workId?: string,
]

const CATALOG_RAW = [
  ['eternal-time', 'กาลเวลานิรันดร์', 'มณีนุช', 'แฟนตาซี', ['fantasy', 'time-travel'], 'ai'],
  ['blood-moon', 'จันทราสีเลือด', 'ธีระวัฒน์', 'แฟนตาซี', ['fantasy', 'horror'], 'human'],
  ['secret-love', 'รักลับนพญา', 'ลลิตา', 'โรแมนติก', ['romance', 'historical'], 'human'],
  ['reborn-consort', 'เกิดใหม่เป็นยอดชายา', 'วิชิต', 'แฟนตาซี', ['fantasy', 'time-travel', 'historical'], 'ai'],
  ['emperor-love', 'บันทึกรักจักรพรรดิ', 'พิมพ์ชนก', 'วาย', ['bl', 'historical', 'romance'], 'human'],
  ['night-shadow-love', 'เงารักในราตรีสำนัก', 'ก้องภพ', 'โรแมนติก', ['romance', 'mystery'], 'ai'],
  ['isekai-billionaire', 'ทะลุมิติเป็นมหาเศรษฐี', 'อรุณี', 'ต่างโลก', ['fantasy', 'time-travel', 'market'], 'human'],
  ['false-wedding', 'วิวาห์ลวงใจ', 'เดชาวุธ', 'โรแมนติก', ['romance', 'urban'], 'ai'],
  ['cheat-life-system', 'ระบบชีวิตสุดโกง', 'ศิริพร', 'แฟนตาซี', ['fantasy', 'game', 'urban'], 'ai'],
  ['necessary-bride', 'เจ้าสาวจำเป็น', 'นภัสสร', 'โรแมนติก', ['romance', 'harem'], 'human'],
  ['new-beginning', 'The Beginning After the End', 'กมลชนก', 'ต่างโลก', ['fantasy', 'time-travel', 'adventure'], 'ai'],
  ['wind-breaker', 'Wind Breaker', 'ปวีณา', 'แอ็กชัน', ['action', 'school', 'youth'], 'human'],
  ['nano-machine', 'Nano Machine', 'สุทธิดา', 'กำลังภายใน', ['action', 'martial-arts', 'sci-fi'], 'ai'],
  ['mercenary', 'Mercenary Enrollment', 'ธนกฤต', 'แอ็กชัน', ['action', 'school', 'urban'], 'human'],
  ['villain-family', "I Became the Villain's Family", 'อาริยา', 'แฟนตาซี', ['fantasy', 'family', 'translated'], 'human'],
  ['omniscient-reader', 'Omniscient Reader', 'ภาคิน', 'ต่างโลก', ['fantasy', 'game', 'adventure'], 'ai'],
  ['silver-bride', 'เจ้าสาวเงินตรา', 'ชนากานต์', 'โรแมนติก', ['romance', 'market'], 'human'],
  ['flowers-storm', 'ดอกไม้ในพายุ', 'รัชชานนท์', 'โรแมนติก', ['romance', 'drama'], 'human'],
  ['love-horizon', 'รักนี้ที่ปลายฟ้า', 'มณีนุช', 'โรแมนติก', ['romance', 'adventure'], 'human'],
  ['eternal-promise', 'สัญญารักนิรันดร์', 'ธีระวัฒน์', 'โรแมนติก', ['romance', 'time-travel'], 'human'],
  ['dragon-heir', 'ทายาทตระกูลมังกร', 'ลลิตา', 'แฟนตาซี', ['fantasy', 'family', 'action'], 'human'],
  ['hidden-revenge', 'ปมรักซ่อนแค้น', 'วิชิต', 'ดราม่า', ['drama', 'mystery', 'thriller'], 'human'],
  ['wolf-queen', 'ราชินีหมาป่า', 'พิมพ์ชนก', 'แฟนตาซี', ['fantasy', 'romance'], 'human'],
  ['magic-girl', 'สาวน้อยมหาเวท', 'ก้องภพ', 'แฟนตาซี', ['fantasy', 'school', 'youth'], 'human'],
  ['god-system', 'ระบบเทพสุดโกง', 'อรุณี', 'แฟนตาซี', ['fantasy', 'game'], 'ai'],
  ['reborn-mage', 'เกิดใหม่เป็นจอมเวท', 'เดชาวุธ', 'แฟนตาซี', ['fantasy', 'time-travel'], 'ai'],
  ['peerless-sword', 'ตำนานนักดาบไร้เทียมทาน', 'ศิริพร', 'แอ็กชัน', ['action', 'martial-arts'], 'ai'],
  ['treasure-world', 'ทะลุมิติล่าสมบัติ', 'นภัสสร', 'ผจญภัย', ['adventure', 'time-travel', 'fantasy'], 'ai'],
  ['divine-farm', 'ปลุกระบบฟาร์มเทพ', 'กมลชนก', 'แฟนตาซี', ['fantasy', 'game', 'slice-of-life'], 'ai'],
  ['demon-return', 'ข้าคือจอมมารคืนชีพ', 'ปวีณา', 'แฟนตาซี', ['fantasy', 'horror', 'action'], 'ai'],
  ['eternal-love', 'ตำนานรักนิรันดร์', 'สุทธิดา', 'โรแมนติก', ['romance', 'historical'], 'human'],
  ['destiny-sword', 'ดาบแห่งโชคชะตา', 'ธนกฤต', 'แอ็กชัน', ['action', 'martial-arts'], 'ai'],
  ['moon-queen', 'ราชินีเงาจันทร์', 'อาริยา', 'แฟนตาซี', ['fantasy', 'horror'], 'human'],
  ['warrior-road', 'เส้นทางจอมยุทธ์', 'ภาคิน', 'กำลังภายใน', ['action', 'martial-arts', 'adventure'], 'human'],
  ['golden-dragon', 'พิภพมังกรทอง', 'ชนากานต์', 'แฟนตาซี', ['fantasy', 'adventure'], 'ai'],
  ['time-mystery', 'ปริศนาแห่งกาลเวลา', 'รัชชานนท์', 'สืบสวน', ['mystery', 'time-travel', 'sci-fi'], 'human'],
  ['star-whisper', 'เสียงกระซิบแห่งดวงดาว', 'มณีนุช', 'ไซไฟ', ['sci-fi', 'romance'], 'human'],
  ['world-traveler', 'บันทึกนักเดินทางข้ามภพ', 'ธีระวัฒน์', 'ต่างโลก', ['fantasy', 'adventure', 'time-travel'], 'ai'],
  ['hidden-city', 'นครซ่อนเร้น', 'ลลิตา', 'สืบสวน', ['mystery', 'urban', 'thriller'], 'human'],
  ['guardian-light', 'ผู้พิทักษ์แห่งแสง', 'วิชิต', 'ซูเปอร์ฮีโร่', ['superhero', 'action', 'sci-fi'], 'ai'],
  ['jianghu-rain', '江湖夜雨', 'ปลายฝัน', 'สืบสวน', ['mystery', 'historical', 'martial-arts'], 'human', '7'],
  ['campus-yesterday', 'วันวานในรั้วมหาลัย', 'วิชิต', 'โรแมนติก', ['romance', 'school', 'youth'], 'human'],
] as const satisfies readonly AudioSeed[]

function baseGenres(filters: readonly AudioGenreKey[]) {
  return Array.from(new Set(filters.flatMap((filter) => FILTER_TO_GENRE[filter])))
}

const CATALOG: AudioBookItem[] = CATALOG_RAW.map((item, index) => ({
  id: item[0],
  detailId: `audio:${item[0]}`,
  title: item[1],
  author: item[2],
  genreLabel: item[3],
  originLabel: item[5] === 'ai' ? 'เอไอ' : 'พากย์',
  filterKeys: [...item[4]],
  genreKeys: baseGenres(item[4]),
  narrationType: item[5],
  mediaType: 'audio',
  views: index < 4 ? `${(125.6 - index * 9.3).toFixed(1)}K` : `${118 - index * 2}K`,
  chapters: String(18 + ((index * 17) % 280)),
  gradient: COVER_GRADIENTS[index % COVER_GRADIENTS.length],
  workId: item[6],
}))

const BOOK_BY_ID = new Map(CATALOG.map((item) => [item.id, item]))

function books(ids: readonly string[], prefix: string) {
  return ids.flatMap((id, index) => {
    const item = BOOK_BY_ID.get(id)
    return item ? [{ ...item, id: `${prefix}-${index + 1}-${item.id}` }] : []
  })
}

export const AUDIO_HERO_SLIDES: HomeHeroSlide[] = [
  {
    id: 'audio-world',
    badge: 'หนังสือเสียงแนะนำ',
    title: 'โลกของหนังสือเสียง รอให้คุณออกเดินทาง',
    description: 'ฟังหนังสือเสียงคุณภาพ ทุกที่ทุกเวลา',
    ctaLabel: 'เริ่มฟังเลย',
    href: '/discover',
    background: 'linear-gradient(110deg,#eceef1 0%,#e5e8ec 55%,#dce0e5 100%)',
  },
  {
    id: 'audio-voices',
    badge: 'เลือกเสียงที่คุณชอบ',
    title: 'เสียงพากย์และเสียงเอไอ ครบทุกอารมณ์',
    description: 'เลือกฟังเรื่องโปรดด้วยสไตล์เสียงที่เข้ากับคุณ',
    ctaLabel: 'ค้นพบเรื่องใหม่',
    href: '/discover',
    background: 'linear-gradient(110deg,#eee8ff 0%,#e9e0fb 54%,#f9e3ef 100%)',
  },
  {
    id: 'audio-ranking',
    badge: 'อันดับยอดฟัง',
    title: 'เรื่องดัง เสียงดี ที่ผู้ฟังเลือกแล้ว',
    description: 'ติดตามหนังสือเสียงยอดนิยมและร่วมโหวตให้เรื่องโปรดทุกวัน',
    ctaLabel: 'ดูกระดานอันดับ',
    href: '/ranking',
    background: 'linear-gradient(110deg,#e7f1fb 0%,#e4eafb 50%,#eee5fa 100%)',
  },
]

export const AUDIO_DETAIL_BOOKS = CATALOG

export const AUDIO_LIMITED_OFFERS: HomeLimitedOffer[] = books(
  ['jianghu-rain', 'eternal-time', 'blood-moon', 'secret-love', 'reborn-consort', 'emperor-love', 'god-system', 'silver-bride', 'star-whisper', 'destiny-sword'],
  'limited',
).map((item, index) => ({
  id: item.id,
  detailId: item.detailId,
  title: item.title,
  author: item.author,
  initialSeconds: (((index % 7) + 1) * 86400) + (11 * 3600) + (57 * 60) + index,
  gradient: item.gradient,
  workId: item.workId,
}))

export const AUDIO_POPULAR_BOOKS = books(
  ['eternal-time', 'blood-moon', 'secret-love', 'reborn-consort', 'emperor-love', 'night-shadow-love', 'isekai-billionaire', 'false-wedding', 'cheat-life-system', 'necessary-bride'],
  'popular',
)

export const AUDIO_NEW_RELEASES = books(
  ['new-beginning', 'wind-breaker', 'nano-machine', 'mercenary', 'villain-family', 'omniscient-reader', 'jianghu-rain', 'silver-bride', 'god-system', 'star-whisper', 'hidden-city', 'guardian-light'],
  'new',
)

export const AUDIO_HUMAN_VOICE_BOOKS = books(
  ['silver-bride', 'flowers-storm', 'love-horizon', 'eternal-promise', 'blood-moon', 'dragon-heir', 'hidden-revenge', 'wolf-queen', 'magic-girl', 'secret-love', 'emperor-love', 'jianghu-rain'],
  'human',
)

export const AUDIO_AI_VOICE_BOOKS = books(
  ['god-system', 'reborn-mage', 'peerless-sword', 'treasure-world', 'divine-farm', 'demon-return', 'eternal-time', 'cheat-life-system', 'destiny-sword', 'golden-dragon', 'guardian-light', 'omniscient-reader'],
  'ai',
)

export const AUDIO_COMPLETED_BOOKS = books(
  ['eternal-love', 'destiny-sword', 'moon-queen', 'warrior-road', 'love-horizon', 'golden-dragon', 'time-mystery', 'emperor-love', 'eternal-promise', 'jianghu-rain', 'flowers-storm', 'hidden-revenge'],
  'completed',
)

export const AUDIO_RECOMMENDED_BOOKS = books(
  ['star-whisper', 'world-traveler', 'flowers-storm', 'reborn-mage', 'eternal-promise', 'hidden-city', 'emperor-love', 'guardian-light', 'blood-moon', 'treasure-world', 'time-mystery', 'jianghu-rain'],
  'recommended',
)

const RANK_IDS = ['eternal-time', 'blood-moon', 'secret-love', 'reborn-consort', 'emperor-love', 'night-shadow-love', 'isekai-billionaire', 'false-wedding', 'cheat-life-system', 'necessary-bride'] as const
const RANK_COPY: Record<string, string> = {
  'eternal-time': 'การเดินทางข้ามกาลเวลาที่จะพาคุณเข้าสู่โลกแฟนตาซีผ่านเสียงเล่าอันน่าติดตาม',
  'blood-moon': 'ค่ำคืนจันทราสีเลือดซ่อนความลับที่รอให้ผู้ฟังค้นพบไปพร้อมกัน',
  'secret-love': 'เรื่องรักต้องห้ามท่ามกลางอำนาจและความลับในราชสำนัก',
}

function rankingItems(order: readonly number[], values: readonly string[], prefix: string) {
  return order.flatMap((catalogIndex, rankIndex): AudioRankingItem[] => {
    const seedId = RANK_IDS[catalogIndex]
    const item = BOOK_BY_ID.get(seedId)
    return item ? [{
      ...item,
      id: `${prefix}-${rankIndex + 1}-${item.id}`,
      value: values[rankIndex] ?? '-',
      tagline: RANK_COPY[seedId] ?? `ฟังเรื่องราวของ ${item.title} ผ่านเสียงบรรยายที่ถ่ายทอดทุกอารมณ์`,
    }] : []
  })
}

export const AUDIO_RANKING_GROUPS: AudioRankingGroup[] = [
  { id: 'vote_d', label: 'โหวตแนะนำ', items: rankingItems([3, 0, 5, 1, 8, 2, 7, 4, 9, 6], ['14,892', '13,945', '12,812', '12,047', '11,380', '10,538', '9,930', '8,706', '7,996', '6,994'], 'rank-daily') },
  { id: 'vote_m', label: 'โหวตรายเดือน', items: rankingItems([1, 4, 0, 6, 2, 9, 3, 8, 5, 7], ['98.2K', '91.6K', '88.4K', '82.7K', '76.3K', '71.8K', '65.2K', '58.9K', '52.4K', '47.1K'], 'rank-monthly') },
  { id: 'listens', label: 'ยอดฟัง', items: rankingItems([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], ['125.6K', '98.2K', '87.5K', '76.3K', '71.0K', '65.4K', '60.1K', '54.8K', '48.9K', '42.3K'], 'rank-listens') },
  { id: 'new', label: 'เรื่องใหม่', items: rankingItems([9, 7, 5, 8, 2, 4, 6, 1, 3, 0], ['1 วันก่อน', '1 วันก่อน', '2 วันก่อน', '2 วันก่อน', '3 วันก่อน', '3 วันก่อน', '4 วันก่อน', '4 วันก่อน', '5 วันก่อน', '5 วันก่อน'], 'rank-new') },
]

export const AUDIO_PRIMARY_GENRES: AudioGenreOption[] = [
  { key: 'sci-fi', label: 'ไซไฟ' },
  { key: 'mystery', label: 'สืบสวน' },
  { key: 'time-travel', label: 'ย้อนเวลา' },
  { key: 'horror', label: 'สยองขวัญ' },
  { key: 'youth', label: 'วัยรุ่น' },
  { key: 'market', label: 'ตลาด' },
]

export const AUDIO_GENRE_OPTIONS: AudioGenreOption[] = [
  { key: 'action', label: 'แอ็กชัน' },
  { key: 'romance', label: 'โรแมนซ์' },
  { key: 'fantasy', label: 'แฟนตาซี' },
  { key: 'drama', label: 'ดราม่า' },
  { key: 'horror', label: 'สยองขวัญ' },
  { key: 'mystery', label: 'สืบสวน' },
  { key: 'time-travel', label: 'ย้อนเวลา' },
  { key: 'translated', label: 'หนังสือแปล' },
  { key: 'sci-fi', label: 'ไซไฟ' },
  { key: 'comedy', label: 'ตลก' },
  { key: 'school', label: 'โรงเรียน' },
  { key: 'slice-of-life', label: 'ชีวิต' },
  { key: 'bl', label: 'วาย' },
  { key: 'harem', label: 'ฮาเร็ม' },
  { key: 'martial-arts', label: 'กำลังภายใน' },
  { key: 'historical', label: 'ประวัติศาสตร์' },
  { key: 'game', label: 'เกม' },
  { key: 'urban', label: 'เมือง' },
  { key: 'family', label: 'ครอบครัว' },
  { key: 'superhero', label: 'ซูเปอร์ฮีโร่' },
  { key: 'adventure', label: 'ผจญภัย' },
  { key: 'thriller', label: 'ระทึกขวัญ' },
  { key: 'youth', label: 'วัยรุ่น' },
  { key: 'market', label: 'ตลาด' },
]

export const AUDIO_CATEGORY_BOOKS = books(
  ['peerless-sword', 'blood-moon', 'golden-dragon', 'secret-love', 'world-traveler', 'magic-girl', 'guardian-light', 'false-wedding', 'star-whisper', 'time-mystery', 'demon-return', 'jianghu-rain', 'necessary-bride', 'campus-yesterday', 'hidden-city', 'emperor-love', 'nano-machine', 'flowers-storm'],
  'category',
)

const UPDATE_LABELS = ['10 นาทีที่แล้ว', '25 นาทีที่แล้ว', '38 นาทีที่แล้ว', '1 ชม.ที่แล้ว', '2 ชม.ที่แล้ว', '3 ชม.ที่แล้ว', '5 ชม.ที่แล้ว', '6 ชม.ที่แล้ว', '7 ชม.ที่แล้ว', '8 ชม.ที่แล้ว', '9 ชม.ที่แล้ว', '10 ชม.ที่แล้ว']

export const AUDIO_LATEST_UPDATES: AudioLatestUpdate[] = books(
  CATALOG_RAW.slice(0, 40).map((item) => item[0]),
  'update',
).map((item, index) => ({
  ...item,
  updatedLabel: UPDATE_LABELS[index] ?? `${index - 9} วันที่แล้ว`,
}))
