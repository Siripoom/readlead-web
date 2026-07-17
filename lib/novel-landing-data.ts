import {
  HOME_LATEST_UPDATES,
  HOME_LIMITED_OFFERS,
  HOME_RANKING_COLUMNS,
  type HomeBookStripItem,
  type HomeHeroSlide,
} from '@/lib/home-landing-data'
import type { Genre } from '@/lib/types'

export interface NovelEditorialPick {
  id: string
  detailId: string
  title: string
  author: string
  genreKeys: Genre[]
  gradient: string
  workId?: string
}

export interface NovelGenreOption {
  label: string
  genre: Genre
}

const COVER_GRADIENTS = [
  'linear-gradient(155deg,#7886ad,#273556)',
  'linear-gradient(155deg,#986978,#412638)',
  'linear-gradient(155deg,#6b8c80,#243f39)',
  'linear-gradient(155deg,#8d76aa,#382952)',
  'linear-gradient(155deg,#ad855f,#4e3425)',
  'linear-gradient(155deg,#607b9f,#24364f)',
  'linear-gradient(155deg,#9b6f91,#452b43)',
  'linear-gradient(155deg,#71866a,#2c402a)',
  'linear-gradient(155deg,#8d6770,#3d2930)',
  'linear-gradient(155deg,#677291,#282e46)',
  'linear-gradient(155deg,#a47966,#493128)',
  'linear-gradient(155deg,#776798,#312747)',
]

export const NOVEL_HERO_SLIDES: HomeHeroSlide[] = [
  {
    id: 'novel-hero-world',
    badge: 'นิยายแนะนำ',
    title: 'โลกของนิยาย รอให้คุณออกเดินทาง',
    description: 'ค้นพบนิยายดี ๆ ในสไตล์ที่คุณชอบ ทุกวัน',
    ctaLabel: 'อ่านเลย',
    href: '/discover',
    background: 'linear-gradient(110deg,#eceef1 0%,#e4e6e9 55%,#d8dbe0 100%)',
  },
  {
    id: 'novel-hero-new',
    badge: 'เรื่องใหม่ประจำสัปดาห์',
    title: 'เปิดโลกเรื่องใหม่ ก่อนใคร',
    description: 'คัดสรรผลงานใหม่หลากหลายแนว ให้คุณเริ่มอ่านได้ก่อนใคร',
    ctaLabel: 'ดูเรื่องใหม่',
    href: '/discover',
    background: 'linear-gradient(110deg,#f1edf9 0%,#ebe5f7 52%,#f8e1ea 100%)',
  },
  {
    id: 'novel-hero-ranking',
    badge: 'กระดานอันดับ',
    title: 'เชียร์นิยายเรื่องโปรด ให้ขึ้นอันดับหนึ่ง',
    description: 'ติดตามเรื่องมาแรงและร่วมสนับสนุนนักเขียนที่คุณชื่นชอบ',
    ctaLabel: 'ดูกระดานอันดับ',
    href: '/ranking',
    background: 'linear-gradient(110deg,#eaf0f8 0%,#e2e8f4 52%,#eee6f5 100%)',
  },
]

type RawBook = readonly [
  title: string,
  author: string,
  genreLabel: string,
  originLabel: string,
  views: string,
  chapters: string,
  genreKeys: readonly Genre[],
  workId?: string,
]

function toBookItems(prefix: string, items: readonly RawBook[], gradientOffset = 0): HomeBookStripItem[] {
  return items.map((item, index) => ({
    id: `${prefix}-${index + 1}`,
    detailId: `novel:${prefix}-${index + 1}`,
    title: item[0],
    author: item[1],
    genreLabel: item[2],
    originLabel: item[3],
    views: item[4],
    chapters: item[5],
    genreKeys: [...item[6]],
    workId: item[7],
    mediaType: 'read',
    gradient: COVER_GRADIENTS[(index + gradientOffset) % COVER_GRADIENTS.length],
  }))
}

const POPULAR_RAW: RawBook[] = [
  ['เคียงข้างเธอทุกชาติภพ', 'มณีนุช', 'โรแมนซ์', 'ไทย', '892.5K', '1,204', ['romance', 'fantasy'], '1'],
  ['จอมยุทธ์สาวพันธุ์เอก', 'ธีระวัฒน์', 'กำลังภายใน', 'แปล', '781.2K', '978', ['action', 'historical'], '9'],
  ['เกิดใหม่ในวังหลัง', 'ลลิตา', 'ย้อนเวลา', 'แปล', '664.8K', '1,530', ['historical', 'drama'], '3'],
  ['ดาวเหนือเส้นขอบฟ้า', 'วิชิต', 'แฟนตาซี', 'ไทย', '602.1K', '845', ['fantasy'], '11'],
  ['สัญญารักใต้แสงจันทร์', 'พิมพ์ชนก', 'โรแมนซ์', 'ไทย', '548.7K', '712', ['romance'], '4'],
  ['ตำนานดาบเทพสวรรค์', 'ก้องภพ', 'แฟนตาซี', 'แปล', '503.3K', '1,889', ['fantasy', 'action'], '5'],
  ['เจ้าสาวจำเป็นของท่านเสนาบดี', 'อรุณี', 'ดราม่า', 'ไทย', '467.9K', '654', ['drama', 'historical'], '8'],
  ['ราชันย์อมตะนิรันดร์', 'เดชาวุธ', 'แอ็กชัน', 'แปล', '421K', '2,134', ['action'], '2'],
  ['หัวใจไม่ลับของคุณหมอ', 'ศิริพร', 'คอเมดี้', 'ไทย', '389.6K', '438', ['comedy', 'romance'], '10'],
  ['โลกคู่ขนานของฉัน', 'นภัสสร', 'ไซไฟ', 'ไทย', '352.2K', '796', ['sci-fi'], '6'],
]

const NEW_RAW: RawBook[] = [
  ['ราชันย์แห่งเงา', 'เถื่อนเล้า', 'แฟนตาซี', 'ไทย', '12K', '5', ['fantasy', 'action'], '11'],
  ['เพื่อนสนิทคิดไม่ซื่อ', 'ขนแอ๋น', 'โรแมนซ์', 'ไทย', '8K', '3', ['romance', 'slice-of-life'], '4'],
  ['มิติที่หายไป', 'Eclipse', 'ไซไฟ', 'ไทย', '7K', '4', ['sci-fi', 'mystery'], '6'],
  ['ดาบพิฆาตเทวสวรรค์', 'กระบี่ไร้เงา', 'แอ็กชัน', 'ไทย', '9K', '6', ['action', 'fantasy'], '5'],
  ['ท่านอ๋องอย่าทำข้าตกใจ', 'บุปผาราตรี', 'ย้อนเวลา', 'ไทย', '6K', '2', ['historical', 'comedy'], '8'],
  ['คลื่นทะเลปลายหมอก', 'Misty', 'ลึกลับ', 'ไทย', '5K', '4', ['mystery'], '7'],
  ['จอมเวทย์ข้ามภพ', 'อักษรา', 'แฟนตาซี', 'ไทย', '11K', '7', ['fantasy'], '11'],
  ['เงาจันทรา', 'วรรณา', 'สยองขวัญ', 'ไทย', '10K', '9', ['horror'], '12'],
  ['ดาวซ่อนเร้น', 'อักษรา', 'GL', 'ไทย', '10K', '5', ['gl', 'romance'], '4'],
  ['พายุมนตรา', 'พิมพ์ใจ', 'แฟนตาซี', 'ไทย', '5K', '9', ['fantasy'], '11'],
  ['ม่านนิรันดร์', 'มินตรา', 'ดราม่า', 'ไทย', '13K', '4', ['drama'], '3'],
  ['ลำนำคืนชีพ', 'ชนกานต์', 'BL', 'ไทย', '4K', '9', ['bl', 'fantasy'], '2'],
  ['รักรัตติกาล', 'ก้องภพ', 'โรแมนซ์', 'ไทย', '7K', '4', ['romance'], '1'],
  ['ปีกพิฆาต', 'ธนพล', 'แอ็กชัน', 'ไทย', '4K', '2', ['action'], '9'],
]

const THAI_RAW: RawBook[] = [
  ['รักเธอทุกวันคืน', 'ปาริชาต', 'โรแมนซ์', 'ไทย', '3,204', '42', ['romance'], '1'],
  ['เงาในม่านฝน', 'ธนพล', 'ลึกลับ', 'ไทย', '2,890', '55', ['mystery'], '7'],
  ['ดอกไม้ในพายุ', 'กชกร', 'ดราม่า', 'ไทย', '2,510', '38', ['drama'], '3'],
  ['สัญญาใจนิรันดร์', 'วรรณา', 'BL', 'ไทย', '2,180', '61', ['bl', 'romance'], '2'],
  ['ปลายทางของหัวใจ', 'ศุภชัย', 'GL', 'ไทย', '1,940', '29', ['gl', 'romance'], '4'],
  ['ฝันที่เป็นจริง', 'มาลี', 'ชีวิตประจำวัน', 'ไทย', '1,720', '47', ['slice-of-life'], '10'],
  ['ลมหายใจของดาว', 'อาทิตยา', 'ไซไฟ', 'ไทย', '1,560', '33', ['sci-fi'], '6'],
  ['ลายเงินยวง', 'กชกร', 'อิงประวัติศาสตร์', 'ไทย', '3,987', '133', ['historical'], '8'],
  ['ฝนอสูร', 'มาลี', 'สยองขวัญ', 'ไทย', '2,136', '127', ['horror'], '12'],
  ['เถาพเนจร', 'อาทิตยา', 'แฟนตาซี', 'ไทย', '3,220', '65', ['fantasy'], '11'],
  ['มนต์แดนสนธยา', 'ฟ้าใส', 'แฟนตาซี', 'ไทย', '2,926', '74', ['fantasy'], '11'],
  ['จันทร์ลวง', 'เจน', 'คอเมดี้', 'ไทย', '3,422', '90', ['comedy'], '10'],
  ['สายอาคม', 'ดารินทร์', 'แอ็กชัน', 'ไทย', '2,847', '16', ['action'], '9'],
  ['ภพจันทรา', 'ปาริชาต', 'ย้อนเวลา', 'ไทย', '3,513', '36', ['historical', 'romance'], '8'],
]

const TRANSLATED_RAW: RawBook[] = [
  ['ราชาปีศาจกับเจ้าสาว', 'แปล: มินตรา', 'แฟนตาซี', 'แปล', '4,120', '88', ['fantasy', 'romance'], '11'],
  ['ภพหน้าข้าจะรักเจ้า', 'แปล: อลิส', 'โรแมนซ์', 'แปล', '3,760', '120', ['romance', 'historical'], '1'],
  ['ท่านประธานที่รัก', 'แปล: เจน', 'โรแมนซ์', 'แปล', '3,330', '95', ['romance', 'drama'], '10'],
  ['ดาบเทพมังกรหยก', 'แปล: กิตติ', 'กำลังภายใน', 'แปล', '2,980', '150', ['action', 'historical'], '9'],
  ['ภรรยาลับท่านประธาน', 'แปล: ฟ้าใส', 'ดราม่า', 'แปล', '2,640', '73', ['drama'], '3'],
  ['นางพญาจิ้งจอกเก้าหาง', 'แปล: พิม', 'แฟนตาซี', 'แปล', '2,400', '64', ['fantasy'], '11'],
  ['จอมมารคืนชีพ', 'แปล: นภา', 'แอ็กชัน', 'แปล', '2,210', '58', ['action', 'fantasy'], '5'],
  ['อักษรพิศวง', 'แปล: ศุภชัย', 'ลึกลับ', 'แปล', '3,106', '42', ['mystery'], '7'],
  ['วสันต์สวรรค์', 'แปล: นภา', 'BL', 'แปล', '2,440', '42', ['bl'], '2'],
  ['เงาเร้นกาย', 'แปล: กิตติ', 'สยองขวัญ', 'แปล', '4,267', '89', ['horror'], '12'],
  ['ดาวเงินยวง', 'แปล: อลิส', 'ไซไฟ', 'แปล', '2,383', '32', ['sci-fi'], '6'],
  ['พายุอสูร', 'แปล: ภูริ', 'แฟนตาซี', 'แปล', '869', '15', ['fantasy'], '11'],
  ['ม่านพเนจร', 'แปล: ลลิตา', 'GL', 'แปล', '1,674', '68', ['gl'], '4'],
  ['ลำนำแดนสนธยา', 'แปล: กชกร', 'คอเมดี้', 'แปล', '1,014', '135', ['comedy'], '10'],
]

export const NOVEL_POPULAR_BOOKS = toBookItems('novel-popular', POPULAR_RAW)
export const NOVEL_NEW_BOOKS = toBookItems('novel-new', NEW_RAW, 2)
export const NOVEL_THAI_BOOKS = toBookItems('novel-thai', THAI_RAW, 4)
export const NOVEL_TRANSLATED_BOOKS = toBookItems('novel-translated', TRANSLATED_RAW, 6)

export const NOVEL_EDITORIAL_PICKS: NovelEditorialPick[] = [
  ['จอมมารคืนชีพสะท้านปฐพี', 'มังกรคราม', ['fantasy', 'action'], '11'],
  ['สามก๊ก: ภริยาข้าผู้สูงศักดิ์', 'หลินเยว่', ['historical', 'romance'], '8'],
  ['วิวัฒน์ยุทธ์: ปลุกพลังเทพอสูร', 'กระบี่เหนือเมฆ', ['action', 'fantasy'], '9'],
  ['ราชาเวทย์แห่งดินแดนต้องสาป', 'อักษรา', ['fantasy', 'horror'], '12'],
  ['ตำนานดาบเทพสะท้านสวรรค์', 'เดชาวุธ', ['action'], '5'],
  ['เกิดใหม่เป็นเจ้าสำนักอันดับหนึ่ง', 'วรรณา', ['fantasy', 'comedy'], '10'],
  ['นักล่าในโลกหลังวันสิ้นโลก', 'ชนาธิป', ['sci-fi', 'horror'], '6'],
  ['เทพยุทธ์พิชิตหมื่นภพ', 'ธีระวัฒน์', ['action', 'historical'], '2'],
].map((item, index) => ({
  id: `editorial-${index + 1}`,
  detailId: `novel:editorial-${index + 1}`,
  title: item[0] as string,
  author: item[1] as string,
  genreKeys: [...(item[2] as Genre[])],
  workId: item[3] as string,
  gradient: COVER_GRADIENTS[(index + 3) % COVER_GRADIENTS.length],
}))

const CATEGORY_RAW: RawBook[] = [
  ['รักนี้ของเรา', 'ปาริชาต', 'โรแมนซ์', 'ไทย', '3,120', '20', ['romance'], '1'],
  ['สัญญารักนิรันดร์', 'ธนพล', 'โรแมนซ์', 'ไทย', '2,970', '29', ['romance'], '4'],
  ['เถาสวรรค์', 'ก้องภพ', 'แฟนตาซี', 'ไทย', '2,704', '139', ['fantasy'], '11'],
  ['จอมเวทย์ต่างโลก', 'อักษรา', 'แฟนตาซี', 'แปล', '2,540', '87', ['fantasy'], '11'],
  ['ทะเลพิฆาต', 'พิมพ์ใจ', 'แอ็กชัน', 'ไทย', '1,351', '78', ['action'], '9'],
  ['ดาบซ่อนเร้น', 'วรรณา', 'แอ็กชัน', 'ไทย', '2,673', '86', ['action'], '5'],
  ['ฝนพิศวง', 'ชนกานต์', 'ลึกลับ', 'ไทย', '844', '30', ['mystery'], '7'],
  ['คดีปริศนาคืนฝนตก', 'อรุณี', 'สืบสวน', 'ไทย', '1,920', '27', ['mystery'], '7'],
  ['สายต้องสาป', 'นภา', 'สยองขวัญ', 'ไทย', '2,884', '63', ['horror'], '12'],
  ['คฤหาสน์เลือด', 'วราภรณ์', 'สยองขวัญ', 'ไทย', '1,480', '44', ['horror'], '12'],
  ['รักวุ่นของนายจ้าง', 'พิมพ์ชนก', 'คอเมดี้', 'ไทย', '1,920', '92', ['comedy'], '10'],
  ['เถ้าแก่หญิงคนเก่ง', 'กนกวรรณ', 'คอเมดี้', 'ไทย', '1,260', '38', ['comedy'], '10'],
  ['ปรารถนาในม่านหมอก', 'ฟ้าใส', 'ดราม่า', 'ไทย', '1,620', '110', ['drama'], '3'],
  ['ดอกไม้ในเปลวไฟ', 'พิมพ์มาดา', 'ดราม่า', 'ไทย', '1,530', '67', ['drama'], '3'],
  ['ลายข้ามภพ', 'มินตรา', 'ประวัติศาสตร์', 'ไทย', '3,695', '40', ['historical'], '8'],
  ['สงครามบัลลังก์', 'ศรัณย์', 'ประวัติศาสตร์', 'แปล', '2,180', '95', ['historical'], '8'],
  ['ของขวัญจากดวงดาว', 'ชนาธิป', 'ไซไฟ', 'ไทย', '1,470', '119', ['sci-fi'], '6'],
  ['ผู้พิทักษ์ดวงดาว', 'ชัยวัฒน์', 'ไซไฟ', 'ไทย', '1,390', '72', ['sci-fi'], '6'],
  ['หัวใจที่รอเธอ', 'กชกร', 'ชีวิตประจำวัน', 'ไทย', '2,820', '38', ['slice-of-life'], '10'],
  ['เพลงรักสองหัวใจ', 'กิตติพงษ์', 'ชีวิตประจำวัน', 'ไทย', '1,770', '101', ['slice-of-life'], '10'],
  ['วสันต์สวรรค์', 'นภา', 'BL', 'แปล', '2,440', '42', ['bl'], '2'],
  ['รักแรกพบครั้งสุดท้าย', 'สุพิชญา', 'BL', 'ไทย', '1,680', '53', ['bl'], '2'],
  ['ดาวซ่อนเร้น', 'อักษรา', 'GL', 'ไทย', '1,940', '58', ['gl'], '4'],
  ['ม่านพเนจร', 'ลลิตา', 'GL', 'แปล', '1,674', '68', ['gl'], '4'],
]

export const NOVEL_CATEGORY_BOOKS = toBookItems('novel-category', CATEGORY_RAW, 8)

export const NOVEL_GENRE_OPTIONS: NovelGenreOption[] = [
  { label: 'โรแมนติก', genre: 'romance' },
  { label: 'แฟนตาซี', genre: 'fantasy' },
  { label: 'แอคชั่น', genre: 'action' },
  { label: 'ลึกลับ', genre: 'mystery' },
  { label: 'สยองขวัญ', genre: 'horror' },
  { label: 'คอมเมดี', genre: 'comedy' },
  { label: 'ดราม่า', genre: 'drama' },
  { label: 'ประวัติศาสตร์', genre: 'historical' },
  { label: 'ไซไฟ', genre: 'sci-fi' },
  { label: 'ชีวิตประจำวัน', genre: 'slice-of-life' },
  { label: 'BL', genre: 'bl' },
  { label: 'GL', genre: 'gl' },
]

export const NOVEL_LIMITED_OFFERS = HOME_LIMITED_OFFERS
export const NOVEL_RANKING_COLUMNS = HOME_RANKING_COLUMNS
export const NOVEL_LATEST_UPDATES = HOME_LATEST_UPDATES
