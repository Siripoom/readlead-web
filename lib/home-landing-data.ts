import type { Genre } from '@/lib/types'

export type LandingMediaType = 'read' | 'audio'

export interface HomeHeroVisual {
  x: number
  y: number
  size: number
  color: string
}

export interface HomeHeroSlide {
  id: string
  badge: string
  title: string
  description: string
  ctaLabel: string
  href: string
  background?: string
  desktopImageUrl?: string
  mobileImageUrl?: string
  visual?: HomeHeroVisual
}

export interface HomeActivityCard {
  id: string
  badge: string
  title: string
  description: string
  ctaLabel: string
  href: string
  tone: 'violet' | 'pink' | 'lavender'
  artwork: 'trophy' | 'reward' | 'invite'
}

export interface HomeBookStripItem {
  id: string
  detailId: string
  title: string
  author: string
  genreLabel: string
  originLabel: string
  genreKeys: Genre[]
  mediaType: LandingMediaType
  views: string
  chapters: string
  workId?: string
  coverUrl?: string
  availability?: 'coming_soon' | 'published'
  contentType?: 'novel' | 'manga' | 'audiobook'
  gradient: string
}

export interface HomeLimitedOffer {
  id: string
  detailId: string
  title: string
  author: string
  initialSeconds: number
  gradient: string
  workId?: string
  coverUrl?: string
  discount?: string
  mediaType?: LandingMediaType
  views?: string
  chapters?: string
}

export interface HomeRankingItem {
  id: string
  detailId: string
  title: string
  author: string
  value: string
  genreLabel: string
  originLabel: string
  genreKeys: Genre[]
  tagline: string
  coverUrl?: string
  workId?: string
  contentType?: 'novel' | 'manga' | 'audiobook'
}

export interface HomeRankingColumn {
  id: 'daily' | 'monthly' | 'views' | 'new'
  title: string
  items: HomeRankingItem[]
}

export interface HomeLatestUpdate {
  id: string
  detailId: string
  title: string
  author: string
  genreLabel: string
  originLabel: string
  genreKeys: Genre[]
  description: string
  episode: string
  episodeTitle: string
  updatedAt: string
  gradient: string
  workId?: string
  coverUrl?: string
  contentType?: 'novel' | 'manga' | 'audiobook'
}

const COVER_GRADIENTS = [
  'linear-gradient(160deg,#3a4763,#1c2440)',
  'linear-gradient(160deg,#2c5a4e,#12302a)',
  'linear-gradient(160deg,#7a3a52,#3a1726)',
  'linear-gradient(160deg,#4a3a7a,#1d1640)',
  'linear-gradient(160deg,#2c2c3e,#14141f)',
  'linear-gradient(160deg,#7a5648,#3a2620)',
  'linear-gradient(160deg,#3a5a8a,#1a2c4a)',
  'linear-gradient(160deg,#5a3a4a,#241420)',
  'linear-gradient(160deg,#6a4a7a,#2a1a3a)',
  'linear-gradient(160deg,#46506e,#20263c)',
]

const OFFER_GRADIENTS = [
  'linear-gradient(150deg,#f3c6d4,#d98aa9)',
  'linear-gradient(150deg,#c9d6f5,#8aa0d9)',
  'linear-gradient(150deg,#f5e2c0,#d9b072)',
  'linear-gradient(150deg,#d7c6f5,#a98ad9)',
  'linear-gradient(150deg,#c6f0e6,#72c8b4)',
  'linear-gradient(150deg,#f5cdc0,#d98a72)',
  'linear-gradient(150deg,#e6c6f5,#bd8ad9)',
]

export const HOME_HERO_SLIDES: HomeHeroSlide[] = [
  {
    id: 'hero-reading-world',
    badge: 'นิยายแนะนำ',
    title: 'โลกของนิยาย รอให้คุณออกเดินทาง',
    description: 'ค้นพบนิยายดี ๆ ในสไตล์ที่คุณชอบ ทุกวัน',
    ctaLabel: 'อ่านเลย',
    href: '/discover',
    background: 'linear-gradient(110deg,#eceef1 0%,#e4e6e9 55%,#d8dbe0 100%)',
  },
  {
    id: 'hero-ranking-vote',
    badge: 'กระดานอันดับ',
    title: 'โหวตเรื่องโปรด ให้ขึ้นสู่อันดับหนึ่ง',
    description: 'ใช้ตั๋วรายวันและรายเดือน เพื่อสนับสนุนนักเขียนที่คุณชอบ',
    ctaLabel: 'ดูกระดานอันดับ',
    href: '/ranking',
    background: 'linear-gradient(110deg,#f3effd 0%,#eee7fb 52%,#f8dfe9 100%)',
  },
  {
    id: 'hero-every-format',
    badge: 'อ่านได้ทุกสไตล์',
    title: 'นิยาย เว็บตูน และหนังสือเสียง ครบในที่เดียว',
    description: 'เลือกอ่านหรือฟังเรื่องโปรดได้ทุกที่ ทุกเวลา',
    ctaLabel: 'ค้นพบเรื่องใหม่',
    href: '/discover',
    background: 'linear-gradient(110deg,#eaf1fb 0%,#e4eaf8 52%,#eee6f7 100%)',
  },
]

export const HOME_ACTIVITY_CARDS: HomeActivityCard[] = [
  {
    id: 'monthly-vote',
    badge: 'โหวตให้เรื่องที่คุณชอบ',
    title: 'จัดอันดับนิยาย',
    description: 'ประจำเดือนนี้!',
    ctaLabel: 'ร่วมโหวตตอนนี้ ›',
    href: '/ranking',
    tone: 'violet',
    artwork: 'trophy',
  },
  {
    id: 'daily-reading',
    badge: 'ภารกิจอ่านประจำวัน',
    title: 'อ่านนิยายครบ รับเหรียญ',
    description: 'ลุ้นของรางวัลพิเศษมากมาย',
    ctaLabel: 'ดูภารกิจ ›',
    href: '/dashboard',
    tone: 'pink',
    artwork: 'reward',
  },
  {
    id: 'invite-friends',
    badge: 'ชวนเพื่อนมาอ่าน',
    title: 'รับโบนัสเพิ่มไม่จำกัด',
    description: 'ยิ่งชวน ยิ่งได้!',
    ctaLabel: 'ชวนเพื่อนเลย ›',
    href: '/register',
    tone: 'lavender',
    artwork: 'invite',
  },
]

const POPULAR_RAW = [
  ['เคียงข้างเธอทุกชาติภพ', 'มณีนุช', 'โรแมนซ์', 'ไทย', 'read', '892.5K', '1,204', ['romance', 'fantasy'], '1'],
  ['Solo Leveling', 'ชูกง', 'แอ็กชัน', 'มังฮวา', 'read', '1.25M', '312', ['action', 'fantasy'], '5'],
  ['ตำนานรักนิรันดร์เสียงสวรรค์', 'ธีระวัฒน์', 'โรแมนซ์', 'พากย์', 'audio', '845K', '237', ['romance'], '7'],
  ['One Piece', 'Eiichiro Oda', 'ผจญภัย', 'มังงะ', 'read', '1.18M', '1,089', ['action'], '5'],
  ['One Piece', 'Eiichiro Oda', 'ผจญภัย', 'มังงะ', 'read', '1.18M', '1,089', ['action'], '5'],
  ['เกิดใหม่ในวังหลังของอนุภรรยา', 'ลลิตา', 'ย้อนเวลา', 'แปล', 'read', '664.8K', '1,530', ['historical', 'drama'], '3'],
  ['ระบบเทพสุดโกงข้ามภพ', 'ก้องภพ', 'แฟนตาซี', 'เอไอ', 'audio', '512K', '188', ['fantasy'], '11'],
  ['Tower of God', 'SIU', 'แฟนตาซี', 'มังฮวา', 'read', '580K', '620', ['fantasy', 'action'], '5'],
  ['ชะตาฟ้าลิขิตวันสิ้นสลายแห่งโลกันต์', 'เดชาวุธ', 'แฟนตาซี', 'แปล', 'read', '430K', '905', ['fantasy'], '11'],
  ['เสียงกระซิบแห่งดวงดาว', 'อรุณี', 'แฟนตาซี', 'พากย์', 'audio', '326K', '156', ['fantasy', 'sci-fi'], '7'],
  ['Jujutsu Kaisen', 'Gege Akutami', 'แอ็กชัน', 'มังงะ', 'read', '980K', '271', ['action', 'horror'], '11'],
  ['สัญญารักใต้แสงจันทร์ของจอมมาร', 'พิมพ์ชนก', 'โรแมนซ์', 'ไทย', 'read', '548.7K', '712', ['romance', 'fantasy'], '4'],
  ['ม่านฮวาจอมเวทย์พันปี', 'นภัสสร', 'แฟนตาซี', 'ม่านฮว่า', 'read', '298K', '488', ['fantasy'], '11'],
] as const

export const HOME_POPULAR_BOOKS: HomeBookStripItem[] = POPULAR_RAW.map((item, index) => ({
  id: `popular-${index + 1}`,
  detailId: `home:popular-${index + 1}`,
  title: item[0],
  author: item[1],
  genreLabel: item[2],
  originLabel: item[3],
  mediaType: item[4],
  views: item[5],
  chapters: item[6],
  genreKeys: [...item[7]] as Genre[],
  workId: item[8],
  gradient: COVER_GRADIENTS[index % COVER_GRADIENTS.length],
}))

const RECOMMENDED_RAW = [
  ['ดาบพิฆาตเทวสวรรค์', 'กระบี่ไร้เงา', 'แอ็กชัน', 'ไทย', 'read', '9K', '6', ['action', 'fantasy'], '5'],
  ['ท่านอ๋องอย่าทำข้าจ๊าก', 'บุตลับธาตรี', 'โรแมนซ์', 'พากย์', 'audio', '6K', '2', ['romance', 'comedy'], '10'],
  ['คลื่นเทคทรรน์ปลายหมอก', 'เท่อ่ฉาน: Misty', 'ไซไฟ', 'มังฮวา', 'read', '5K', '4', ['sci-fi'], '6'],
  ['จอมเวทย์ข้ามภพสามชาติ', 'อักษรเงา', 'แฟนตาซี', 'แปล', 'read', '11K', '7', ['fantasy'], '11'],
  ['รักลวงของท่านอ๋อง', 'พิมพ์ดาว', 'โรแมนซ์', 'เอไอ', 'audio', '8.5K', '5', ['romance', 'historical'], '8'],
  ['นักสืบเงาราตรี', 'มืดมิด', 'สืบสวน', 'มังงะ', 'read', '6.4K', '3', ['mystery'], '7'],
  ['ตำนานพ่อมดน้อยแห่งหุบเขา', 'เวทมนต์', 'แฟนตาซี', 'ไทย', 'read', '9.2K', '6', ['fantasy'], '11'],
] as const

export const HOME_RECOMMENDED_BOOKS: HomeBookStripItem[] = RECOMMENDED_RAW.map((item, index) => ({
  id: `recommended-${index + 1}`,
  detailId: `home:recommended-${index + 1}`,
  title: item[0],
  author: item[1],
  genreLabel: item[2],
  originLabel: item[3],
  mediaType: item[4],
  views: item[5],
  chapters: item[6],
  genreKeys: [...item[7]] as Genre[],
  workId: item[8],
  gradient: COVER_GRADIENTS[(index + 4) % COVER_GRADIENTS.length],
}))

const LIMITED_RAW = [
  ['เชิญเหล่าอนุแย่งชิงให้สนุก', 'มณีนุช', 6, 11, 57, 44, '1'],
  ['แม่สาวเข็มเงิน [จบ]', 'ธีระวัฒน์', 7, 11, 57, 45, '8'],
  ['ทะลุมิติในยุค 80', 'ลลิตา', 6, 11, 57, 45, '3'],
  ['หม่ามี้ตัวร้ายกับเสนาบดี', 'วิชิต', 4, 8, 12, 9, '10'],
  ['วาดชีวิต ลิขิตชะตา', 'พิมพ์ชนก', 2, 19, 3, 27, '6'],
  ['เกิดใหม่ในวังหลัง', 'ก้องภพ', 5, 6, 41, 52, '3'],
  ['เจ้าสาวจำเป็นของท่านอ๋อง', 'อรุณี', 1, 22, 15, 3, '8'],
  ['ราชันย์อมตะนิรันดร์', 'เดชาวุธ', 3, 14, 29, 38, '5'],
  ['สัญญารักใต้แสงจันทร์', 'ศิริพร', 8, 3, 7, 11, '4'],
  ['จอมยุทธ์สาวพันธุ์เอก', 'นภัสสร', 2, 9, 48, 20, '9'],
  ['ดาวเหนือเส้นขอบฟ้า', 'วรรณา', 6, 1, 33, 5, '12'],
  ['ตำนานดาบเทพสวรรค์', 'ปาริชาต', 4, 17, 22, 49, '5'],
  ['รักลวงท่านประธาน', 'มินตรา', 1, 5, 56, 14, '10'],
  ['นางพญาจิ้งจอกเก้าหาง', 'อลิส', 7, 20, 11, 33, '11'],
] as const

export const HOME_LIMITED_OFFERS: HomeLimitedOffer[] = LIMITED_RAW.map((item, index) => ({
  id: `limited-${index + 1}`,
  detailId: `home:limited-${index + 1}`,
  title: item[0],
  author: item[1],
  initialSeconds: (((item[2] * 24 + item[3]) * 60 + item[4]) * 60) + item[5],
  gradient: OFFER_GRADIENTS[index % OFFER_GRADIENTS.length],
  workId: item[6],
}))

const RANKING_SOURCE = {
  daily: [
    ['เคียงข้างเธอทุกชาติภพ', 'มณีนุช', '2,043', 'โรแมนซ์', 'ไทย', ['romance', 'fantasy'], '1'],
    ['จอมยุทธ์สาวพันธุ์เอก', 'ธีระ', '1,820', 'แอ็กชัน', 'ไทย', ['action'], '9'],
    ['รักนี้ข้ามภพชาติ', 'วิชิต', '1,540', 'โรแมนซ์', 'ไทย', ['romance'], '4'],
    ['ใต้ร่มต้นท้อแห่งรัก', 'มณีนุช', '1,290', 'โรแมนซ์', 'ไทย', ['romance'], '8'],
    ['เจ้าสาวจำเป็นของท่านเสนาบดี', 'ลลิตา', '1,105', 'โรแมนซ์', 'ไทย', ['romance', 'historical'], '3'],
    ['หมั้นซ้อนรักของเสนาบดี', 'มณีนุช', '980', 'ดราม่า', 'ไทย', ['drama'], '3'],
    ['รักแรกในม่านหมอก', 'ลลิตา', '845', 'โรแมนซ์', 'ไทย', ['romance'], '12'],
    ['โชคชะตาที่ฝ่าฝืนไม่ได้', 'สรรพสิทธิ์', '700', 'แอ็กชัน', 'แปล', ['action', 'historical'], '2'],
    ['ระบบรักนี้ต้องชนะ', 'สรรพสิทธิ์', '620', 'แฟนตาซี', 'แปล', ['fantasy'], '11'],
    ['ใต้เงาจันทร์ ณ วังหลวง', 'ธีระ', '540', 'สืบสวน', 'ไทย', ['mystery', 'historical'], '7'],
  ],
  monthly: [
    ['เคียงข้างเธอทุกชาติภพ', 'มณีนุช', '6,535', 'โรแมนซ์', 'ไทย', ['romance', 'fantasy'], '1'],
    ['จอมยุทธ์สาวพันธุ์เอก', 'ธีระ', '5,021', 'แอ็กชัน', 'ไทย', ['action'], '9'],
    ['รักนี้ข้ามภพชาติ', 'วิชิต', '3,838', 'โรแมนซ์', 'ไทย', ['romance'], '4'],
    ['ใต้ร่มต้นท้อแห่งรัก', 'มณีนุช', '2,759', 'โรแมนซ์', 'ไทย', ['romance'], '8'],
    ['เจ้าสาวจำเป็นของท่านเสนาบดี', 'ลลิตา', '2,070', 'โรแมนซ์', 'ไทย', ['romance', 'historical'], '3'],
    ['หมั้นซ้อนรักของเสนาบดี', 'มณีนุช', '1,611', 'ดราม่า', 'ไทย', ['drama'], '3'],
    ['รักแรกในม่านหมอก', 'ลลิตา', '1,477', 'โรแมนซ์', 'ไทย', ['romance'], '12'],
    ['โชคชะตาที่ฝ่าฝืนไม่ได้', 'สรรพสิทธิ์', '1,292', 'แอ็กชัน', 'แปล', ['action', 'historical'], '2'],
    ['ระบบรักนี้ต้องชนะ', 'สรรพสิทธิ์', '1,108', 'แฟนตาซี', 'แปล', ['fantasy'], '11'],
    ['ใต้เงาจันทร์ ณ วังหลวง', 'ธีระ', '980', 'สืบสวน', 'ไทย', ['mystery', 'historical'], '7'],
  ],
  views: [
    ['เคียงข้างเธอทุกชาติภพ', 'มณีนุช', '48K', 'โรแมนซ์', 'ไทย', ['romance', 'fantasy'], '1'],
    ['จอมยุทธ์สาวพันธุ์เอก', 'ธีระ', '32K', 'แอ็กชัน', 'ไทย', ['action'], '9'],
    ['รักนี้ข้ามภพชาติ', 'วิชิต', '28K', 'โรแมนซ์', 'ไทย', ['romance'], '4'],
    ['ใต้ร่มต้นท้อแห่งรัก', 'มณีนุช', '21K', 'โรแมนซ์', 'ไทย', ['romance'], '8'],
    ['บุปผาในม่านไหม', 'วิชิต', '18K', 'ดราม่า', 'ไทย', ['drama'], '3'],
    ['เจ้าสาวจำเป็นของท่านเสนาบดี', 'ลลิตา', '15K', 'โรแมนซ์', 'ไทย', ['romance'], '3'],
    ['หมั้นซ้อนรักของเสนาบดี', 'มณีนุช', '13K', 'ดราม่า', 'ไทย', ['drama'], '3'],
    ['รักแรกในม่านหมอก', 'ลลิตา', '11K', 'โรแมนซ์', 'ไทย', ['romance'], '12'],
    ['ระบบรักนี้ต้องชนะ', 'สรรพสิทธิ์', '9K', 'แฟนตาซี', 'แปล', ['fantasy'], '11'],
    ['ใต้เงาจันทร์ ณ วังหลวง', 'ธีระ', '7K', 'สืบสวน', 'ไทย', ['mystery', 'historical'], '7'],
  ],
  new: [
    ['บุปผาในม่านไหม', 'วิชิต', '38K', 'ดราม่า', 'ไทย', ['drama'], '3'],
    ['ระบบรักนี้ต้องชนะ', 'สรรพสิทธิ์', '29K', 'แฟนตาซี', 'แปล', ['fantasy'], '11'],
    ['หมั้นซ้อนรักเสนาบดี', 'มณีนุช', '22K', 'ดราม่า', 'ไทย', ['drama'], '3'],
    ['รักแรกในม่านหมอก', 'ลลิตา', '18K', 'โรแมนซ์', 'ไทย', ['romance'], '12'],
    ['เกราะทองของนางพญา', 'วิชิต', '14K', 'แอ็กชัน', 'ไทย', ['action'], '9'],
    ['ใต้เงาจันทร์ ณ วังหลวง', 'ธีระ', '11K', 'สืบสวน', 'ไทย', ['mystery', 'historical'], '7'],
    ['รักนี้ยังรอคอย', 'มณีนุช', '8.5K', 'โรแมนซ์', 'ไทย', ['romance'], '12'],
    ['โชคชะตาที่ฝ่าฝืนไม่ได้', 'สรรพสิทธิ์', '6.2K', 'แอ็กชัน', 'แปล', ['action', 'historical'], '2'],
    ['จอมเซียนผู้พลิกฟ้า', 'ธีระ', '5.4K', 'แฟนตาซี', 'แปล', ['fantasy'], '11'],
    ['ชีวิตลอยล่องดั่งความฝัน', 'ลลิตา', '4.1K', 'อิงประวัติศาสตร์', 'แปล', ['historical'], '8'],
  ],
} as const

const TAGLINES = [
  'รักข้ามภพที่ไม่มีวันลืมเลือน',
  'ชะตาลิขิตให้สองเรากลับมาพบกันอีกครั้ง',
  'เมื่อหัวใจเลือกเดินสวนทางโชคชะตา',
  'ปริศนาที่ซ่อนอยู่ใต้รอยยิ้มอันอ่อนโยน',
  'สงครามแห่งอำนาจ ความแค้น และความรัก',
  'ทุกบรรทัดคือลมหายใจที่เธอมอบให้ในค่ำคืน',
  'ความลับที่ถูกฝังกลบมานานยี่สิบปี',
  'เส้นทางที่ไม่มีวันหวนกลับของจอมยุทธ์หนุ่ม',
]

const RANKING_TITLES: Record<keyof typeof RANKING_SOURCE, string> = {
  daily: 'ตั๋วรายวัน',
  monthly: 'ตั๋วรายเดือน',
  views: 'ยอดวิว',
  new: 'เรื่องใหม่',
}

export const HOME_RANKING_COLUMNS: HomeRankingColumn[] = (
  Object.keys(RANKING_SOURCE) as Array<keyof typeof RANKING_SOURCE>
).map((key) => ({
  id: key,
  title: RANKING_TITLES[key],
  items: RANKING_SOURCE[key].map((item, index) => ({
    id: `${key}-${index + 1}`,
    detailId: `home:ranking-${key}-${index + 1}`,
    title: item[0],
    author: item[1],
    value: item[2],
    genreLabel: item[3],
    originLabel: item[4],
    genreKeys: [...item[5]] as Genre[],
    tagline: TAGLINES[index % TAGLINES.length],
    coverUrl: `https://picsum.photos/seed/home-${key}-${index + 1}/120/180`,
    workId: item[6],
  })),
}))

const BASE_UPDATES = [
  ['เคียงข้างเธอทุกชาติภพ', 'มณีนุช', 'โรแมนซ์', 'แต่งเอง', ['romance', 'fantasy'], 'รักที่ข้ามภพข้ามชาติ ทุกครั้งที่พบกันโชคชะตาพาพราก แต่หัวใจยังจดจำกันอยู่เสมอ ชาตินี้เธอจะยอมให้เขาไปอีกไหม...', '248', 'บทสรุปของหัวใจ', '13-06-2026 08:24', '1'],
  ['กระบี่เย้ยยุทธจักร', 'กิตติพงษ์', 'กำลังภายใน', 'แปล', ['action', 'historical'], 'เด็กหนุ่มผู้สูญเสียทุกอย่างในคืนเดียว ลุกขึ้นจับกระบี่เพื่อทวงคืนความยุติธรรม เส้นทางจอมยุทธ์ที่เต็มไปด้วยเลือดและน้ำตา', '156', 'ดวลเดือด ณ ยอดเขา', '13-06-2026 07:10', '2'],
  ['ดาวดวงสุดท้าย', 'ชนาธิป', 'ไซไฟ', 'แต่งเอง', ['sci-fi'], 'เมื่อโลกใกล้ถึงจุดจบ มนุษย์กลุ่มสุดท้ายออกเดินทางสู่ดาวดวงใหม่ แต่ในความมืดของอวกาศ มีบางอย่างกำลังเฝ้ามองพวกเขาอยู่', '64', 'สัญญาณสุดท้าย', '12-06-2026 22:48', '6'],
  ['คดีปริศนาคืนฝนตก', 'อรุณี', 'สืบสวน', 'แต่งเอง', ['mystery'], 'ศพปริศนาในคฤหาสน์ร้าง กับเบาะแสที่นำไปสู่ความลับที่ถูกฝังมานานยี่สิบปี นักสืบสาวต้องไขคดีก่อนเหยื่อรายต่อไปจะปรากฏ', '27', 'เบาะแสในสายฝน', '12-06-2026 19:30', '7'],
  ['ตำนานมังกรเพลิง', 'พิมพ์ชนก', 'แฟนตาซี', 'แปล', ['fantasy'], 'ในดินแดนที่เวทมนตร์คือทุกสิ่ง เด็กสาวผู้ถูกสาปค้นพบว่าตนเองคือทายาทมังกรเพลิงตัวสุดท้าย ชะตาของอาณาจักรอยู่ในมือเธอ', '89', 'เปลวเพลิงตื่น', '12-06-2026 15:12', '11'],
  ['ย้อนเวลาหารัก', 'ฟ้าใส', 'ย้อนเวลา', 'โรแมนซ์', ['romance', 'historical'], 'อุบัติเหตุพาเธอย้อนกลับไปสิบปีก่อน วันที่ยังไม่สาย วันที่เขายังอยู่ ครั้งนี้เธอจะไม่ปล่อยให้ความรักหลุดมือไปอีก', '42', 'ย้อนกลับไปวันนั้น', '12-06-2026 10:05', '8'],
] as const

const EXTRA_TITLES = ['ดาบเทพสังหาร', 'เจ้าหญิงนิทรากลางพายุ', 'รักลวงของท่านอ๋อง', 'บันทึกหมอเทวดา', 'เมื่อข้ากลายเป็นนางร้าย', 'ภพรักนิรันดร์', 'ราชันย์เงา', 'สัญญาใต้แสงจันทร์', 'เกมล่าท้าตาย', 'ดวงใจในม่านหมอก', 'คฤหาสน์เลือด', 'พ่อมดน้อยกับคำสาป', 'รหัสลับพันปี', 'นางพญางูขาว', 'ทะเลดาวและเธอ', 'สงครามบัลลังก์', 'รักแรกพบครั้งสุดท้าย', 'ปริศนาเกาะร้าง', 'จอมเวทย์ต่างโลก', 'เถ้าแก่หญิงคนเก่ง', 'ฝ่ามิติตามหารัก', 'ดอกไม้ในเปลวไฟ', 'เงาอดีตที่รัก', 'ผู้พิทักษ์ดวงดาว']
const EXTRA_AUTHORS = ['อาทิตยา', 'ธนกฤต', 'พิมพ์มาดา', 'ศรัณย์', 'กนกวรรณ', 'ภาคิน', 'รวิสรา', 'ณัฐพล', 'สุพิชญา', 'กิตติภพ', 'วราภรณ์', 'ชัยวัฒน์']
const EXTRA_GENRES: Array<[string, string, Genre[]]> = [
  ['โรแมนซ์', 'แต่งเอง', ['romance']],
  ['กำลังภายใน', 'แปล', ['action', 'historical']],
  ['แฟนตาซี', 'แปล', ['fantasy']],
  ['สืบสวน', 'แต่งเอง', ['mystery']],
  ['ไซไฟ', 'แต่งเอง', ['sci-fi']],
  ['ย้อนเวลา', 'แต่งเอง', ['romance', 'historical']],
  ['ระบบ', 'แปล', ['fantasy']],
  ['ดราม่า', 'แต่งเอง', ['drama']],
]
const EXTRA_DESCRIPTIONS = [
  'เรื่องราวที่จะพาคุณดำดิ่งสู่โลกอีกใบ เต็มไปด้วยความลับ การหักเหของชะตา และหัวใจที่ไม่ยอมแพ้',
  'เมื่อทุกอย่างพังทลาย เธอต้องลุกขึ้นสู้อีกครั้ง เพื่อคนที่รักและความจริงที่ถูกซ่อนไว้',
  'การเดินทางที่ไม่มีวันหวนกลับ บททดสอบที่โหดร้าย และมิตรภาพที่ก่อตัวขึ้นกลางสมรภูมิ',
  'ความรักที่มาผิดเวลา ผิดที่ ผิดคน แต่หัวใจกลับเลือกไม่ได้ที่จะหยุดเต้นเพื่อเขา',
  'ปริศนาที่ซ่อนอยู่ใต้รอยยิ้ม เบาะแสที่นำไปสู่ความจริงอันน่าตกใจเกินจินตนาการ',
]
const EXTRA_EPISODES = ['จุดเริ่มต้นใหม่', 'ความลับที่ถูกเปิดเผย', 'ศึกชิงบัลลังก์', 'คืนที่ดาวร่วง', 'คำสัญญาที่ไม่ลืม', 'เส้นทางสู่จุดสูงสุด', 'เงามืดปรากฏ', 'บทพิสูจน์หัวใจ', 'รอยร้าวแห่งรัก', 'การกลับมาของเขา', 'ปลายทางของความฝัน', 'สงครามครั้งสุดท้าย']

const pad = (value: number) => String(value).padStart(2, '0')

const extraUpdates: HomeLatestUpdate[] = EXTRA_TITLES.map((title, index) => {
  const genre = EXTRA_GENRES[index % EXTRA_GENRES.length]
  return {
    id: `update-${index + 7}`,
    detailId: `home:update-${index + 7}`,
    title,
    author: EXTRA_AUTHORS[index % EXTRA_AUTHORS.length],
    genreLabel: genre[0],
    originLabel: genre[1],
    genreKeys: genre[2],
    description: EXTRA_DESCRIPTIONS[index % EXTRA_DESCRIPTIONS.length],
    episode: String(300 - index * 9),
    episodeTitle: EXTRA_EPISODES[index % EXTRA_EPISODES.length],
    updatedAt: `${pad(11 - (index % 10))}-06-2026 ${pad(23 - (index % 24))}:${pad((index * 13) % 60)}`,
    gradient: OFFER_GRADIENTS[index % OFFER_GRADIENTS.length],
    workId: String((index % 12) + 1),
  }
})

export const HOME_LATEST_UPDATES: HomeLatestUpdate[] = [
  ...BASE_UPDATES.map((item, index) => ({
    id: `update-${index + 1}`,
    detailId: `home:update-${index + 1}`,
    title: item[0],
    author: item[1],
    genreLabel: item[2],
    originLabel: item[3],
    genreKeys: [...item[4]] as Genre[],
    description: item[5],
    episode: item[6],
    episodeTitle: item[7],
    updatedAt: item[8],
    gradient: OFFER_GRADIENTS[index % OFFER_GRADIENTS.length],
    workId: item[9],
  })),
  ...extraUpdates,
]

export const HOME_GENRE_LABELS: Record<Genre, string> = {
  romance: 'โรแมนซ์',
  fantasy: 'แฟนตาซี',
  action: 'แอ็กชัน',
  mystery: 'สืบสวน',
  horror: 'สยองขวัญ',
  comedy: 'คอเมดี้',
  drama: 'ดราม่า',
  historical: 'อิงประวัติศาสตร์',
  'sci-fi': 'ไซไฟ',
  'slice-of-life': 'ชีวิตประจำวัน',
  bl: 'BL',
  gl: 'GL',
}
