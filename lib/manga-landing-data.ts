import type {
  HomeBookStripItem,
  HomeHeroSlide,
  HomeLimitedOffer,
} from '@/lib/home-landing-data'
import type { Genre } from '@/lib/types'

export type MangaGenreKey =
  | 'action'
  | 'romance'
  | 'fantasy'
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

export interface MangaGenreOption {
  key: MangaGenreKey
  label: string
}

export interface MangaBookItem extends HomeBookStripItem {
  filterKeys: MangaGenreKey[]
}

export type MangaRankingId = 'views' | 'daily' | 'monthly' | 'new'

export interface MangaRankingItem extends MangaBookItem {
  value: string
  tagline: string
}

export interface MangaRankingGroup {
  id: MangaRankingId
  label: string
  items: MangaRankingItem[]
}

export interface MangaLatestUpdate extends MangaBookItem {
  updatedLabel: string
}

const COVER_GRADIENTS = [
  'linear-gradient(155deg,#334a73,#18233d)',
  'linear-gradient(155deg,#844a58,#351b28)',
  'linear-gradient(155deg,#4f3d82,#21183f)',
  'linear-gradient(155deg,#347064,#15352f)',
  'linear-gradient(155deg,#8b6647,#3d281a)',
  'linear-gradient(155deg,#53647f,#222b3b)',
  'linear-gradient(155deg,#795178,#321f38)',
  'linear-gradient(155deg,#3d6f8b,#1b3342)',
]

const FILTER_TO_GENRE: Record<MangaGenreKey, Genre[]> = {
  action: ['action'],
  romance: ['romance'],
  fantasy: ['fantasy'],
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

type MangaSeed = readonly [
  id: string,
  title: string,
  author: string,
  genreLabel: string,
  originLabel: string,
  filters: readonly MangaGenreKey[],
  workId?: string,
]

const CATALOG_RAW = [
  ['one-piece', 'One Piece', 'Eiichiro Oda', 'ผจญภัย', 'มังงะ', ['action', 'adventure']],
  ['solo-leveling', 'Solo Leveling', 'Chugong', 'แอ็กชัน', 'มังฮวา', ['action', 'fantasy', 'game']],
  ['jujutsu-kaisen', 'Jujutsu Kaisen', 'Gege Akutami', 'แอ็กชัน', 'มังงะ', ['action', 'horror']],
  ['demon-slayer', 'Kimetsu no Yaiba', 'Koyoharu Gotouge', 'แอ็กชัน', 'มังงะ', ['action', 'fantasy']],
  ['tokyo-revengers', 'Tokyo Revengers', 'Ken Wakui', 'ดราม่า', 'มังงะ', ['action', 'time-travel', 'youth']],
  ['attack-on-titan', 'Attack on Titan', 'Hajime Isayama', 'แฟนตาซี', 'มังงะ', ['action', 'fantasy', 'thriller']],
  ['my-hero-academia', 'My Hero Academia', 'Kohei Horikoshi', 'ซูเปอร์ฮีโร่', 'มังงะ', ['action', 'superhero', 'school']],
  ['chainsaw-man', 'Chainsaw Man', 'Tatsuki Fujimoto', 'สยองขวัญ', 'มังงะ', ['action', 'horror', 'thriller']],
  ['black-clover', 'Black Clover', 'Yuki Tabata', 'แฟนตาซี', 'มังงะ', ['action', 'fantasy']],
  ['hunter-x-hunter', 'Hunter x Hunter', 'Yoshihiro Togashi', 'ผจญภัย', 'มังงะ', ['action', 'adventure', 'fantasy']],
  ['blue-lock', 'Blue Lock', 'Muneyuki Kaneshiro', 'กีฬา', 'มังงะ', ['action', 'youth']],
  ['wind-breaker', 'Wind Breaker', 'Satoru Nii', 'แอ็กชัน', 'มังงะ', ['action', 'school', 'youth']],
  ['beginning-after-end', 'The Beginning After the End', 'TurtleMe', 'ต่างโลก', 'เว็บตูน', ['fantasy', 'time-travel', 'adventure']],
  ['tower-of-god', 'Tower of God', 'SIU', 'แฟนตาซี', 'มังฮวา', ['fantasy', 'action', 'game']],
  ['omniscient-reader', 'Omniscient Reader', 'Sing Shong', 'ต่างโลก', 'มังฮวา', ['fantasy', 'game', 'adventure']],
  ['lookism', 'Lookism', 'Taejun Pak', 'ดราม่า', 'มังฮวา', ['school', 'youth', 'slice-of-life']],
  ['eleceed', 'Eleceed', 'Son Jeho', 'ซูเปอร์ฮีโร่', 'มังฮวา', ['action', 'superhero', 'comedy']],
  ['nano-machine', 'Nano Machine', 'Hanjung Wolya', 'กำลังภายใน', 'มังฮวา', ['action', 'martial-arts', 'sci-fi']],
  ['mercenary-enrollment', 'Mercenary Enrollment', 'YC', 'แอ็กชัน', 'มังฮวา', ['action', 'school', 'urban']],
  ['sweet-home', 'Sweet Home', 'Kim Carnby', 'สยองขวัญ', 'มังฮวา', ['horror', 'thriller', 'urban']],
  ['true-beauty', 'True Beauty', 'Yaongyi', 'โรแมนซ์', 'มังฮวา', ['romance', 'school', 'youth']],
  ['tales-demons-gods', 'Tales of Demons and Gods', 'Mad Snail', 'แฟนตาซี', 'ม่านฮว่า', ['fantasy', 'martial-arts', 'time-travel']],
  ['battle-heavens', 'Battle Through the Heavens', 'Heavenly Silkworm', 'กำลังภายใน', 'ม่านฮว่า', ['action', 'fantasy', 'martial-arts']],
  ['soul-land', 'Soul Land', 'Tang Jia San Shao', 'แฟนตาซี', 'ม่านฮว่า', ['fantasy', 'martial-arts', 'game']],
  ['martial-peak', 'Martial Peak', 'Momo', 'กำลังภายใน', 'ม่านฮว่า', ['action', 'martial-arts', 'adventure']],
  ['apotheosis', 'Apotheosis', 'Ranzai Studio', 'แฟนตาซี', 'ม่านฮว่า', ['fantasy', 'martial-arts']],
  ['versatile-mage', 'Versatile Mage', 'Chaos', 'ไซไฟ', 'ม่านฮว่า', ['fantasy', 'sci-fi', 'school']],
  ['spy-family', 'Spy x Family', 'Tatsuya Endo', 'คอมเมดี้', 'มังงะ', ['comedy', 'family', 'action']],
  ['detective-conan', 'Detective Conan', 'Gosho Aoyama', 'สืบสวน', 'มังงะ', ['mystery', 'school', 'thriller']],
  ['love-signal', 'Love Signal 404', 'Han Sol', 'โรแมนซ์', 'เว็บตูน', ['romance', 'sci-fi', 'urban']],
  ['sword-master', '剑道独尊', 'ดาวเดือน', 'กำลังภายใน', 'ม่านฮว่า', ['action', 'fantasy', 'martial-arts'], '5'],
  ['flower-moon', '花好月圆', 'ดาวเดือน', 'โรแมนซ์', 'ม่านฮว่า', ['romance', 'mystery', 'historical'], '6'],
  ['blood-moon', '血月传说', 'ลมดาว', 'สยองขวัญ', 'ม่านฮว่า', ['horror', 'fantasy', 'thriller'], '11'],
] as const satisfies readonly MangaSeed[]

function baseGenres(filters: readonly MangaGenreKey[]) {
  return Array.from(new Set(filters.flatMap((filter) => FILTER_TO_GENRE[filter])))
}

const CATALOG: MangaBookItem[] = CATALOG_RAW.map((item, index) => ({
  id: item[0],
  detailId: `manga:${item[0]}`,
  title: item[1],
  author: item[2],
  genreLabel: item[3],
  originLabel: item[4],
  filterKeys: [...item[5]],
  genreKeys: baseGenres(item[5]),
  mediaType: 'read',
  views: index < 4 ? `${(1.25 - index * 0.12).toFixed(2)}M` : `${980 - index * 23}K`,
  chapters: String(48 + ((index * 37) % 520)),
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

export const MANGA_HERO_SLIDES: HomeHeroSlide[] = [
  {
    id: 'manga-world',
    badge: 'เว็บตูนแนะนำ',
    title: 'โลกของเว็บตูน รอให้คุณออกเดินทาง',
    description: 'อัปเดตทุกวัน ครบทุกแนว เว็บตูนที่คุณไม่ควรพลาด',
    ctaLabel: 'เริ่มอ่านเลย',
    href: '/discover',
    background: 'linear-gradient(110deg,#eceef1 0%,#e5e8ec 55%,#dce0e5 100%)',
  },
  {
    id: 'manga-new',
    badge: 'เปิดตัวเรื่องใหม่',
    title: 'มังงะเรื่องใหม่ มาแรงก่อนใคร',
    description: 'ค้นพบเรื่องสดใหม่จากมังงะ มังฮวา และม่านฮว่าในที่เดียว',
    ctaLabel: 'ค้นพบเรื่องใหม่',
    href: '/discover',
    background: 'linear-gradient(110deg,#eee8ff 0%,#e9e0fb 54%,#f9e3ef 100%)',
  },
  {
    id: 'manga-ranking',
    badge: 'กระดานอันดับ',
    title: 'เชียร์เว็บตูนเรื่องโปรด ให้ขึ้นอันดับหนึ่ง',
    description: 'ติดตามยอดวิวและร่วมโหวตให้เรื่องที่คุณชื่นชอบทุกวัน',
    ctaLabel: 'ดูกระดานอันดับ',
    href: '/ranking',
    background: 'linear-gradient(110deg,#e7f1fb 0%,#e4eafb 50%,#eee5fa 100%)',
  },
]

export const MANGA_DETAIL_BOOKS = CATALOG

export const MANGA_LIMITED_OFFERS: HomeLimitedOffer[] = books(
  ['sword-master', 'flower-moon', 'blood-moon', 'solo-leveling', 'tower-of-god', 'nano-machine', 'true-beauty', 'soul-land', 'wind-breaker', 'spy-family'],
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

export const MANGA_POPULAR_BOOKS = books(
  ['one-piece', 'solo-leveling', 'jujutsu-kaisen', 'demon-slayer', 'tokyo-revengers', 'attack-on-titan', 'my-hero-academia', 'chainsaw-man', 'black-clover', 'hunter-x-hunter'],
  'popular',
)

export const MANGA_NEW_RELEASES = books(
  ['beginning-after-end', 'wind-breaker', 'nano-machine', 'mercenary-enrollment', 'love-signal', 'solo-leveling', 'omniscient-reader', 'sword-master', 'blood-moon', 'versatile-mage', 'true-beauty', 'spy-family', 'detective-conan'],
  'new',
)

export const MANGA_RECOMMENDED_BOOKS = books(
  ['one-piece', 'solo-leveling', 'jujutsu-kaisen', 'chainsaw-man', 'tower-of-god', 'omniscient-reader', 'wind-breaker', 'blue-lock', 'demon-slayer', 'attack-on-titan', 'my-hero-academia', 'black-clover', 'sweet-home', 'flower-moon'],
  'recommended',
)

export const MANGA_MANHWA_BOOKS = books(
  ['solo-leveling', 'tower-of-god', 'omniscient-reader', 'lookism', 'eleceed', 'nano-machine', 'mercenary-enrollment', 'sweet-home', 'true-beauty', 'wind-breaker', 'beginning-after-end'],
  'manhwa',
)

export const MANGA_MANHUA_BOOKS = books(
  ['tales-demons-gods', 'battle-heavens', 'soul-land', 'martial-peak', 'apotheosis', 'versatile-mage', 'sword-master', 'flower-moon', 'blood-moon'],
  'manhua',
)

const RANKING_COPY: Record<string, string> = {
  'one-piece': 'การผจญภัยครั้งยิ่งใหญ่เพื่อตามหาขุมทรัพย์และก้าวขึ้นเป็นราชาโจรสลัด',
  'solo-leveling': 'นักล่าที่อ่อนแอที่สุดได้รับพลังให้เลเวลอัปได้อย่างไร้ขีดจำกัด',
  'jujutsu-kaisen': 'เด็กหนุ่มก้าวเข้าสู่โลกของนักปราบวิญญาณเพื่อกำจัดคำสาปทั้งมวล',
  'wind-breaker': 'นักเรียนผู้ต้องการเป็นที่หนึ่งได้พบโรงเรียนที่ใช้กำปั้นปกป้องเมือง',
}

function rankingItems(ids: readonly string[], values: readonly string[], prefix: string) {
  return books(ids, prefix).map((item, index): MangaRankingItem => ({
    ...item,
    value: values[index] ?? '-',
    tagline: RANKING_COPY[ids[index]] ?? `ติดตามการเดินทางครั้งใหม่ของ ${item.title} และเหล่าตัวละครที่คุณชื่นชอบ`,
  }))
}

const RANK_IDS = ['one-piece', 'solo-leveling', 'jujutsu-kaisen', 'attack-on-titan', 'demon-slayer', 'my-hero-academia', 'chainsaw-man', 'tokyo-revengers', 'hunter-x-hunter', 'blue-lock'] as const

export const MANGA_RANKING_GROUPS: MangaRankingGroup[] = [
  {
    id: 'views',
    label: 'ยอดวิว',
    items: rankingItems(RANK_IDS, ['580M', '520M', '450M', '330M', '300M', '250M', '210M', '190M', '180M', '160M'], 'rank-views'),
  },
  {
    id: 'daily',
    label: 'โหวตรายวัน',
    items: rankingItems(['solo-leveling', 'jujutsu-kaisen', 'one-piece', 'demon-slayer', 'chainsaw-man', 'blue-lock', 'attack-on-titan', 'wind-breaker', 'my-hero-academia', 'tokyo-revengers'], ['48,200', '42,100', '39,800', '35,600', '31,200', '28,900', '26,400', '24,100', '22,800', '20,500'], 'rank-daily'),
  },
  {
    id: 'monthly',
    label: 'โหวตรายเดือน',
    items: rankingItems(['jujutsu-kaisen', 'one-piece', 'solo-leveling', 'demon-slayer', 'chainsaw-man', 'attack-on-titan', 'blue-lock', 'my-hero-academia', 'wind-breaker', 'hunter-x-hunter'], ['1.28M', '1.15M', '1.02M', '880K', '760K', '690K', '610K', '540K', '480K', '420K'], 'rank-monthly'),
  },
  {
    id: 'new',
    label: 'เรื่องใหม่',
    items: rankingItems(['wind-breaker', 'nano-machine', 'mercenary-enrollment', 'love-signal', 'beginning-after-end', 'blood-moon', 'versatile-mage', 'sword-master', 'true-beauty', 'detective-conan'], ['1 วันก่อน', '1 วันก่อน', '2 วันก่อน', '2 วันก่อน', '3 วันก่อน', '3 วันก่อน', '4 วันก่อน', '4 วันก่อน', '5 วันก่อน', '5 วันก่อน'], 'rank-new'),
  },
]

export const MANGA_PRIMARY_GENRES: MangaGenreOption[] = [
  { key: 'sci-fi', label: 'ไซไฟ' },
  { key: 'mystery', label: 'สืบสวน' },
  { key: 'time-travel', label: 'ย้อนเวลา' },
  { key: 'horror', label: 'สยองขวัญ' },
  { key: 'youth', label: 'วัยรุ่น' },
  { key: 'market', label: 'ตลาด' },
]

export const MANGA_GENRE_OPTIONS: MangaGenreOption[] = [
  { key: 'action', label: 'แอ็กชัน' },
  { key: 'romance', label: 'โรแมนซ์' },
  { key: 'fantasy', label: 'แฟนตาซี' },
  { key: 'horror', label: 'สยองขวัญ' },
  { key: 'mystery', label: 'สืบสวน' },
  { key: 'time-travel', label: 'ย้อนเวลา' },
  { key: 'translated', label: 'มังงะแปล' },
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

export const MANGA_CATEGORY_BOOKS = books(
  ['one-piece', 'solo-leveling', 'jujutsu-kaisen', 'chainsaw-man', 'demon-slayer', 'tower-of-god', 'omniscient-reader', 'wind-breaker', 'blue-lock', 'black-clover', 'my-hero-academia', 'tokyo-revengers', 'spy-family', 'detective-conan', 'sweet-home', 'true-beauty', 'sword-master', 'flower-moon'],
  'category',
)

const UPDATE_LABELS = ['10 นาทีที่แล้ว', '25 นาทีที่แล้ว', '38 นาทีที่แล้ว', '1 ชม.ที่แล้ว', '2 ชม.ที่แล้ว', '3 ชม.ที่แล้ว', '5 ชม.ที่แล้ว', '6 ชม.ที่แล้ว', '7 ชม.ที่แล้ว', '8 ชม.ที่แล้ว', '9 ชม.ที่แล้ว', '10 ชม.ที่แล้ว']

export const MANGA_LATEST_UPDATES: MangaLatestUpdate[] = books(
  [...CATALOG_RAW.slice(0, 30).map((item) => item[0])],
  'update',
).map((item, index) => ({
  ...item,
  updatedLabel: UPDATE_LABELS[index] ?? `${index - 1} วันที่แล้ว`,
}))
