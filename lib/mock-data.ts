import type { Work, Episode, Creator, TopUpOption, Review, UserProfile, HomePromotionSlide, DiscountNovelItem, RankingNovelItem, RankingShowcaseItem, SidebarItem, PopularRankingItem, PopularRankingSection, HomeUpdateItem } from './types'
import type { Book } from '@/components/BookCategorySection'
import type { Novel } from '@/components/LatestNovelUpdatesSection'
import type { Story } from '@/components/PopularByCategorySection'
import type { DailyManga, DailyMangaEpisode } from '@/components/DailyMangaSection'
import type { RankingBook } from '@/components/NovelRankingSection'

export const MOCK_WORKS: Work[] = [
  {
    id: '1', type: 'novel', title: '用情至深', coverUrl: 'https://picsum.photos/seed/novel1/200/300',
    synopsis: 'เรื่องราวของหญิงสาวผู้เดินทางข้ามมิติเพื่อตามหาชายที่เธอรัก ผจญภัยในอาณาจักรโบราณท่ามกลางสงครามและการทรยศ',
    genres: ['romance', 'fantasy'], tags: ['穿越', 'ชีวิตหลังความตาย', 'ราชวงศ์'],
    authorId: 'c1', authorName: 'ปลายฝัน', status: 'ongoing', origin: 'original',
    rating: 4.8, voteCount: 12400, viewCount: 890000, readCount: 1140000, vipTopUpTotal: 485000, episodeCount: 120,
    latestEpisode: 'ตอนที่ 120: คืนแห่งดวงจันทร์แดง', isFeatured: true, rankingScore: 98,
    updatedAt: '2026-05-15T10:00:00Z', weeklyVoteCount: 1500,
  },
  {
    id: '2', type: 'novel', title: '天命难违', coverUrl: 'https://picsum.photos/seed/novel2/200/300',
    synopsis: 'นักฆ่าจากโลกสมัยใหม่ถูกส่งย้อนกลับไปสู่ราชวงศ์ถัง ต้องใช้ความรู้ล้ำสมัยเพื่อเอาตัวรอดและปกป้องคนที่รัก',
    genres: ['action', 'historical'], tags: ['ย้อนอดีต', 'นักฆ่า', 'ราชสำนัก'],
    authorId: 'c2', authorName: 'ลมดาว', status: 'ongoing', origin: 'translated',
    rating: 4.6, voteCount: 8900, viewCount: 650000, readCount: 790000, vipTopUpTotal: 342000, episodeCount: 85,
    latestEpisode: 'ตอนที่ 85: ดาบที่ซ่อนอยู่', isFeatured: true, rankingScore: 92,
    updatedAt: '2026-05-14T08:00:00Z', weeklyVoteCount: 1000,
  },
  {
    id: '3', type: 'novel', title: '锦绣江山', coverUrl: 'https://picsum.photos/seed/novel3/200/300',
    synopsis: 'เจ้าหญิงผู้ถูกลืมลุกขึ้นมากอบกู้อาณาจักรด้วยสติปัญญาและความกล้าหาญ เผชิญหน้ากับการสมคบคิดในราชสำนัก',
    genres: ['drama', 'historical'], tags: ['เจ้าหญิง', 'การเมือง', 'อำนาจ'],
    authorId: 'c1', authorName: 'ปลายฝัน', status: 'completed', origin: 'translated',
    rating: 4.9, voteCount: 21000, viewCount: 1200000, readCount: 1480000, vipTopUpTotal: 562000, episodeCount: 200,
    latestEpisode: null, isFeatured: true, rankingScore: 99,
    updatedAt: '2026-03-01T00:00:00Z', weeklyVoteCount: 600,
  },
  {
    id: '4', type: 'novel', title: '红尘一梦', coverUrl: 'https://picsum.photos/seed/novel4/200/300',
    synopsis: 'สองวิญญาณที่พบกันซ้ำแล้วซ้ำเล่าในทุกชาติภพ ชะตากรรมนำพาให้พวกเขามาพบกัน แต่กลับพรากจากกันทุกครั้ง',
    genres: ['romance', 'fantasy'], tags: ['ชาติภพ', 'รักชั่วนิรันดร์', 'โลกวิญญาณ'],
    authorId: 'c2', authorName: 'ลมดาว', status: 'ongoing', origin: 'original',
    rating: 4.7, voteCount: 9800, viewCount: 720000, readCount: 865000, vipTopUpTotal: 298000, episodeCount: 60,
    latestEpisode: 'ตอนที่ 60: ประตูแห่งความลืมเลือน', isFeatured: false, rankingScore: 88,
    updatedAt: '2026-05-16T06:00:00Z', weeklyVoteCount: 1100,
  },
  {
    id: '5', type: 'manga', title: '剑道独尊', coverUrl: 'https://picsum.photos/seed/manga1/200/300',
    synopsis: 'เด็กหนุ่มจากหมู่บ้านเล็กๆ ออกเดินทางเพื่อเป็นดาบบูรพาจารย์ ผ่านการฝึกฝนอันโหดร้ายและการต่อสู้ที่เดือดพล่าน',
    genres: ['action', 'fantasy'], tags: ['ดาบ', 'เซียน', 'ฝึกวิทยายุทธ์'],
    authorId: 'c3', authorName: 'ดาวเดือน', status: 'ongoing',
    rating: 4.5, voteCount: 6700, viewCount: 450000, readCount: 520000, vipTopUpTotal: 185000, episodeCount: 45,
    latestEpisode: 'บทที่ 45: มังกรเหล็ก', isFeatured: false, rankingScore: 82,
    updatedAt: '2026-05-13T12:00:00Z', weeklyVoteCount: 800,
  },
  {
    id: '6', type: 'manga', title: '花好月圆', coverUrl: 'https://picsum.photos/seed/manga2/200/300',
    synopsis: 'ช่างดอกไม้สาวผู้มีพลังพิเศษในการสื่อสารกับต้นไม้และดอกไม้ ค้นพบความลับโบราณที่ซ่อนอยู่ในสวนของจักรพรรดิ',
    genres: ['romance', 'mystery'], tags: ['ดอกไม้', 'เวทมนตร์', 'ความลับ'],
    authorId: 'c3', authorName: 'ดาวเดือน', status: 'ongoing',
    rating: 4.4, voteCount: 5500, viewCount: 380000, readCount: 410000, vipTopUpTotal: 142000, episodeCount: 32,
    latestEpisode: 'บทที่ 32: บ้านต้นเมเปิ้ล', isFeatured: true, rankingScore: 78,
    updatedAt: '2026-05-12T09:00:00Z', weeklyVoteCount: 650,
  },
  {
    id: '7', type: 'audiobook', title: '江湖夜雨', coverUrl: 'https://picsum.photos/seed/audio1/200/300',
    synopsis: 'เรื่องราวนักสืบในยุคราชวงศ์หมิง ที่ต้องคลี่คลายคดีฆาตกรรมลึกลับในคืนฝนตกหนัก',
    genres: ['mystery', 'historical'], tags: ['สืบสวน', 'ฆาตกรรม', 'ราชวงศ์หมิง'],
    authorId: 'c1', authorName: 'ปลายฝัน', status: 'completed',
    rating: 4.8, voteCount: 3400, viewCount: 220000, readCount: 305000, vipTopUpTotal: 126000, episodeCount: 30,
    latestEpisode: null, isFeatured: false, rankingScore: 86,
    updatedAt: '2026-02-14T00:00:00Z', weeklyVoteCount: 200,
  },
  {
    id: '8', type: 'novel', title: '浮生若梦', coverUrl: 'https://picsum.photos/seed/novel5/200/300',
    synopsis: 'หมอสาวจากศตวรรษที่ 21 ข้ามเวลาไปในยุคราชวงศ์ชิง ต้องใช้ความรู้ทางการแพทย์สมัยใหม่เพื่อช่วยชีวิตผู้คน',
    genres: ['romance', 'historical'], tags: ['หมอ', 'ข้ามเวลา', 'ราชวงศ์ชิง'],
    authorId: 'c2', authorName: 'ลมดาว', status: 'ongoing', origin: 'translated',
    rating: 4.6, voteCount: 7200, viewCount: 510000, readCount: 635000, vipTopUpTotal: 221000, episodeCount: 70,
    latestEpisode: 'ตอนที่ 70: ยาวิเศษโบราณ', isFeatured: false, rankingScore: 84,
    updatedAt: '2026-05-10T14:00:00Z', weeklyVoteCount: 850,
  },
  {
    id: '9', type: 'novel', title: '山河不忘', coverUrl: 'https://picsum.photos/seed/novel6/200/300',
    synopsis: 'แม่ทัพหญิงผู้นำกองทัพพิทักษ์ชาติ เผชิญหน้ากับศัตรูทั้งภายนอกและภายในราชสำนัก',
    genres: ['action', 'historical'], tags: ['แม่ทัพ', 'สงคราม', 'ความรักชาติ'],
    authorId: 'c3', authorName: 'ดาวเดือน', status: 'hiatus', origin: 'translated',
    rating: 4.3, voteCount: 4100, viewCount: 290000, readCount: 360000, vipTopUpTotal: 109000, episodeCount: 55,
    latestEpisode: 'ตอนที่ 55: ดินแดนหิมะ', isFeatured: false, rankingScore: 70,
    updatedAt: '2026-04-01T00:00:00Z', weeklyVoteCount: 300,
  },
  {
    id: '10', type: 'novel', title: '缘来是你', coverUrl: 'https://picsum.photos/seed/novel7/200/300',
    synopsis: 'นักเขียนหนุ่มพบว่าตัวละครในนิยายของเขาออกมาจากหนังสือจริงๆ และกำลังเปลี่ยนแปลงโลกแห่งความเป็นจริง',
    genres: ['comedy', 'romance'], tags: ['ตัวละครมีชีวิต', 'โรแมนติก-คอมเมดี', 'เวทมนตร์'],
    authorId: 'c1', authorName: 'ปลายฝัน', status: 'ongoing', origin: 'original',
    rating: 4.5, voteCount: 5800, viewCount: 400000, readCount: 455000, vipTopUpTotal: 176000, episodeCount: 40,
    latestEpisode: 'ตอนที่ 40: ตัวละครหลบหนี', isFeatured: false, rankingScore: 76,
    updatedAt: '2026-05-08T11:00:00Z', weeklyVoteCount: 700,
  },
  {
    id: '11', type: 'manga', title: '血月传说', coverUrl: 'https://picsum.photos/seed/manga3/200/300',
    synopsis: 'ในคืนดวงจันทร์สีเลือด เด็กสาวถูกเลือกให้เป็นผู้พิทักษ์โลกจากฝูงปีศาจโบราณ',
    genres: ['horror', 'fantasy'], tags: ['ปีศาจ', 'ผู้พิทักษ์', 'ดวงจันทร์สีเลือด'],
    authorId: 'c2', authorName: 'ลมดาว', status: 'ongoing',
    rating: 4.4, voteCount: 3900, viewCount: 260000, readCount: 330000, vipTopUpTotal: 118000, episodeCount: 25,
    latestEpisode: 'บทที่ 25: ปีศาจดำ', isFeatured: false, rankingScore: 72,
    updatedAt: '2026-05-11T07:00:00Z', weeklyVoteCount: 450,
  },
  {
    id: '12', type: 'novel', title: '此情可待', coverUrl: 'https://picsum.photos/seed/novel8/200/300',
    synopsis: 'เรื่องราวของสองคนที่เติบโตมาด้วยกัน ห่างหายไปสิบปี และชะตาพัดพาให้กลับมาพบกันอีกครั้งในเมืองที่ไม่รู้จัก',
    genres: ['romance', 'slice-of-life'], tags: ['รักวัยรุ่น', 'ชีวิตสมัยใหม่', 'กลับมาพบกัน'],
    authorId: 'c3', authorName: 'ดาวเดือน', status: 'ongoing', origin: 'original',
    rating: 4.6, voteCount: 6300, viewCount: 430000, readCount: 495000, vipTopUpTotal: 194000, episodeCount: 50,
    latestEpisode: 'ตอนที่ 50: ฝนหยดแรก', isFeatured: false, rankingScore: 80,
    updatedAt: '2026-05-09T16:00:00Z', weeklyVoteCount: 750,
  },
]

export const MOCK_HOME_PROMOTION_SLIDES: HomePromotionSlide[] = [
  {
    id: 'promo-1',
    banners: [
      {
        id: 'promo-1a',
        title: 'ฝ่าดาวเคราะห์ทะลุมิติ — มหากาพย์แห่งปี',
        description: 'ผจญภัยในอาณาจักรแฟนตาซีจีนโบราณ พร้อมพล็อตพลิกผันที่คุณคาดไม่ถึง',
        imageUrl: 'https://picsum.photos/seed/promo-story-1/1200/520',
        href: '/discover',
        ctaLabel: 'อ่านเลย',
        eyebrow: 'นิยายแนะนำ',
      },
      {
        id: 'promo-1b',
        title: 'คอลเลกชั่นโปสการ์ด & หนังสือนิยายสุดพิเศษ',
        description: 'สะสมสินค้าลิขสิทธิ์จากนิยายดังในแพลตฟอร์ม มีจำนวนจำกัด',
        imageUrl: 'https://picsum.photos/seed/promo-merch-1/1200/520',
        href: '/discover',
        ctaLabel: 'ช็อปเลย',
        eyebrow: 'สินค้าใหม่',
      },
    ],
  },
  {
    id: 'promo-2',
    banners: [
      {
        id: 'promo-2a',
        title: 'ซีรีส์มาแรง อ่านต่อเนื่องทุกสัปดาห์',
        description: 'ติดตามตอนใหม่ของนิยายจีนชั้นนำ อัปเดตทุกวันอังคารและศุกร์',
        imageUrl: 'https://picsum.photos/seed/promo-story-2/1200/520',
        href: '/discover',
        ctaLabel: 'ติดตามเลย',
        eyebrow: 'อัปเดตใหม่',
      },
      {
        id: 'promo-2b',
        title: 'แกะกล่องชุด Starter Pack นักอ่าน VIP',
        description: 'รับสิทธิ์อ่านไม่อั้น + ของพรีเมียมสุดพิเศษในราคาเปิดตัว',
        imageUrl: 'https://picsum.photos/seed/promo-merch-2/1200/520',
        href: '/discover',
        ctaLabel: 'รับสิทธิ์',
        eyebrow: 'กิจกรรมพิเศษ',
      },
    ],
  },
  {
    id: 'promo-3',
    banners: [
      {
        id: 'promo-3a',
        title: 'จักรพรรดินีดาวดิน — มหากาพย์โรแมนติก',
        description: 'กลับมาอีกครั้งของผู้แต่งขวัญใจนักอ่าน กับนิยายชิ้นเอกชุดใหม่',
        imageUrl: 'https://picsum.photos/seed/promo-story-3/1200/520',
        href: '/detail',
        ctaLabel: 'อ่านตัวอย่าง',
        eyebrow: 'แฟนตาซี & ประวัติศาสตร์',
      },
      {
        id: 'promo-3b',
        title: 'คอลเลกชั่น Limited สำหรับนักสะสม',
        description: 'เสื้อ กระเป๋า และอุปกรณ์ลิขสิทธิ์จากจักรวาลนิยายที่คุณรัก',
        imageUrl: 'https://picsum.photos/seed/promo-merch-3/1200/520',
        href: '/discover',
        ctaLabel: 'ดูคอลเลกชั่น',
        eyebrow: 'Shop Exclusive',
      },
    ],
  },
]

export const MOCK_EPISODES: Record<string, Episode[]> = {
  '1': [
    { id: 'e1-1', workId: '1', title: 'บทนำ: ประตูแห่งชะตา', episodeNum: 1, price: 0, status: 'published', type: 'text', content: 'ในคืนที่ฝนตกหนักที่สุดในรอบสิบปี หล่อนได้กลิ่นดอกเจียวฮวาอ่อนๆ ลอยมาตามสายลม...', wordCount: 2800, publishedAt: '2025-01-01T00:00:00Z' },
    { id: 'e1-2', workId: '1', title: 'ตอนที่ 2: โลกใหม่', episodeNum: 2, price: 0, status: 'published', type: 'text', content: 'แสงทองทาบแผ่กว้างบนพื้นหินขาวราวกับหิมะ เธอเปิดตาออกอย่างช้าๆ...', wordCount: 3100, publishedAt: '2025-01-08T00:00:00Z' },
    { id: 'e1-3', workId: '1', title: 'ตอนที่ 3: เจ้าชายแห่งม่านหมอก', episodeNum: 3, price: 5, status: 'published', type: 'text', content: 'ชายที่อยู่เบื้องหน้าเธอนั้น สูงใหญ่เหมือนสน ผิวขาวราวหยก...', wordCount: 3400, publishedAt: '2025-01-15T00:00:00Z' },
    { id: 'e1-4', workId: '1', title: 'ตอนที่ 4: คำพยากรณ์', episodeNum: 4, price: 5, status: 'published', type: 'text', content: 'หมอดูแก่ชราเฝ้ามองเธอด้วยดวงตาที่ขุ่นมัว ก่อนเปล่งคำพูดที่เปลี่ยนชีวิตทุกอย่าง...', wordCount: 2900, publishedAt: '2025-01-22T00:00:00Z' },
    { id: 'e1-5', workId: '1', title: 'ตอนที่ 5: ดอกบัวทอง', episodeNum: 5, price: 8, status: 'published', type: 'text', content: 'ดอกบัวทองบานสะพรั่งในสระน้ำศักดิ์สิทธิ์ เธอรู้ว่ามันคือกุญแจสู่ความลับทั้งหมด...', wordCount: 3200, publishedAt: '2025-01-29T00:00:00Z' },
  ],
  '2': [
    { id: 'e2-1', workId: '2', title: 'บทเปิด: ผู้รอดชีวิต', episodeNum: 1, price: 0, status: 'published', type: 'text', content: 'เลือดอุ่นๆ ไหลซึมลงสู่ดินเย็น เขาพยายามลุกขึ้นแต่ร่างกายไม่เชื่อฟัง...', wordCount: 2600, publishedAt: '2025-02-01T00:00:00Z' },
    { id: 'e2-2', workId: '2', title: 'ตอนที่ 2: ราชวงศ์ถัง', episodeNum: 2, price: 0, status: 'published', type: 'text', content: 'ตลาดในเมืองฉางอันคึกคักอย่างไม่เคยเห็น เสียงดนตรีและกลิ่นอาหารล้นตลาด...', wordCount: 2900, publishedAt: '2025-02-08T00:00:00Z' },
    { id: 'e2-3', workId: '2', title: 'ตอนที่ 3: ภารกิจแรก', episodeNum: 3, price: 5, status: 'published', type: 'text', content: 'คำสั่งมาถึงในคืนมืดสนิท ผ่านลูกศรที่ปักลงบนหน้าต่างห้องนอน...', wordCount: 3100, publishedAt: '2025-02-15T00:00:00Z' },
  ],
  '3': [
    { id: 'e3-1', workId: '3', title: 'บทเปิด: เจ้าหญิงที่ถูกลืม', episodeNum: 1, price: 0, status: 'published', type: 'text', content: 'เธอเติบโตในสวนหลังวัง ไม่มีใครจำได้ว่าเธอมีตัวตน...', wordCount: 2500, publishedAt: '2024-06-01T00:00:00Z' },
    { id: 'e3-2', workId: '3', title: 'ตอนที่ 2: วันแห่งการเปลี่ยนแปลง', episodeNum: 2, price: 0, status: 'published', type: 'text', content: 'ข่าวการสิ้นพระชนม์ของจักรพรรดิแพร่กระจายไปทั่วพระราชวัง...', wordCount: 2700, publishedAt: '2024-06-08T00:00:00Z' },
    { id: 'e3-3', workId: '3', title: 'ตอนที่ 3: แผนการลับ', episodeNum: 3, price: 8, status: 'published', type: 'text', content: 'ในห้องลับใต้ห้องสมุด เธอพบแผนที่เก่าแก่ที่ซ่อนความลับอาณาจักร...', wordCount: 3300, publishedAt: '2024-06-15T00:00:00Z' },
  ],
}

// Fill remaining works with basic episodes
for (let wId = 4; wId <= 12; wId++) {
  MOCK_EPISODES[String(wId)] = [
    { id: `e${wId}-1`, workId: String(wId), title: 'บทเปิด', episodeNum: 1, price: 0, status: 'published', type: 'text', content: 'เนื้อหาตอนแรก...', wordCount: 2500, publishedAt: '2025-01-01T00:00:00Z' },
    { id: `e${wId}-2`, workId: String(wId), title: 'ตอนที่ 2', episodeNum: 2, price: 0, status: 'published', type: 'text', content: 'เนื้อหาตอนสอง...', wordCount: 2600, publishedAt: '2025-01-08T00:00:00Z' },
    { id: `e${wId}-3`, workId: String(wId), title: 'ตอนที่ 3', episodeNum: 3, price: 5, status: 'published', type: 'text', content: 'เนื้อหาตอนสาม...', wordCount: 2800, publishedAt: '2025-01-15T00:00:00Z' },
    { id: `e${wId}-4`, workId: String(wId), title: 'ตอนที่ 4', episodeNum: 4, price: 8, status: 'published', type: 'text', content: 'เนื้อหาตอนสี่...', wordCount: 3000, publishedAt: '2025-01-22T00:00:00Z' },
  ]
}

export const MOCK_CREATORS: Creator[] = [
  { id: 'c1', name: 'ปลายฝัน', avatarUrl: 'https://picsum.photos/seed/creator1/80/80', bio: 'นักเขียนนิยายจีนโรแมนติก ชอบเล่าเรื่องที่ทำให้หัวใจสั่นไหว', totalRevenue: 128400, monthlyRevenue: [15000, 18000, 22000, 19000, 25000, 29400], followerCount: 45000, workIds: ['1', '3', '7', '10'] },
  { id: 'c2', name: 'ลมดาว', avatarUrl: 'https://picsum.photos/seed/creator2/80/80', bio: 'เชี่ยวชาญเรื่องข้ามมิติและประวัติศาสตร์จีน ทุกตอนมีความหมายลึกซึ้ง', totalRevenue: 89700, monthlyRevenue: [10000, 12000, 15000, 13000, 17000, 22700], followerCount: 31000, workIds: ['2', '4', '8', '11'] },
  { id: 'c3', name: 'ดาวเดือน', avatarUrl: 'https://picsum.photos/seed/creator3/80/80', bio: 'ศิลปินมังงะและนักเขียน ผสมผสานศิลปะและตัวอักษรได้อย่างลงตัว', totalRevenue: 67200, monthlyRevenue: [8000, 9000, 11000, 10000, 14000, 15200], followerCount: 22000, workIds: ['5', '6', '9', '12'] },
]

export const MOCK_TOPUP_OPTIONS: TopUpOption[] = [
  { coins: 50, price: 15, label: '50 เหรียญ' },
  { coins: 200, price: 55, label: '200 เหรียญ', bonus: 20 },
  { coins: 500, price: 129, label: '500 เหรียญ', bonus: 75 },
  { coins: 1000, price: 239, label: '1,000 เหรียญ', bonus: 200 },
]

export const MOCK_USER_PROFILE: UserProfile = {
  displayName: 'นักอ่านแห่งจันทรา',
  avatarUrl: 'https://picsum.photos/seed/readlead-user/96/96',
  vipLevel: 'VIP 3',
  exp: 2480,
  currentRank: 'Silver Reader',
}

export const ALL_GENRES = ['romance', 'fantasy', 'action', 'mystery', 'horror', 'comedy', 'drama', 'historical', 'sci-fi', 'slice-of-life', 'bl', 'gl'] as const

export const MOCK_REVIEWS: Record<string, Review[]> = {
  '1': [
    { id: 'r1-1', workId: '1', authorName: 'นักอ่านตัวยง', avatarUrl: 'https://picsum.photos/seed/u1/40/40', rating: 5, text: 'เรื่องนี้อ่านแล้วติดมากเลย การพัฒนาตัวละครดีมาก เขียนได้ลึกซึ้งและอารมณ์ดีมากครับ', createdAt: '2026-05-10T08:00:00Z', likes: 42 },
    { id: 'r1-2', workId: '1', authorName: 'แฟนนิยายจีน', avatarUrl: 'https://picsum.photos/seed/u2/40/40', rating: 5, text: 'ชอบตรงที่โลกในเรื่องสมจริงและมีเหตุผล การพลิกสถานการณ์ตอนท้ายทำให้ประหลาดใจมาก', createdAt: '2026-05-08T14:00:00Z', likes: 35 },
    { id: 'r1-3', workId: '1', authorName: 'อ่านทุกวัน', avatarUrl: 'https://picsum.photos/seed/u3/40/40', rating: 4, text: 'เขียนได้ดีมาก แต่บางตอนนานเกินไปนิดหน่อย โดยรวมแนะนำเลยนะคะ', createdAt: '2026-05-05T10:00:00Z', likes: 28 },
    { id: 'r1-4', workId: '1', authorName: 'รักนิยายโรแมนติก', avatarUrl: 'https://picsum.photos/seed/u4/40/40', rating: 5, text: 'คู่พระนางน่ารักมาก เคมีดีสุดๆ อ่านแล้วอยากให้เร็วๆ ออกตอนใหม่เลยค่ะ', createdAt: '2026-05-01T09:00:00Z', likes: 61 },
    { id: 'r1-5', workId: '1', authorName: 'นักวิจารณ์หนังสือ', avatarUrl: 'https://picsum.photos/seed/u5/40/40', rating: 4, text: 'ภาษาที่ใช้สละสลวย ถ่ายทอดอารมณ์ได้ดีเยี่ยม แนะนำให้ทุกคนลองอ่านดูครับ', createdAt: '2026-04-28T16:00:00Z', likes: 19 },
    { id: 'r1-6', workId: '1', authorName: 'หนอนหนังสือ', avatarUrl: 'https://picsum.photos/seed/u6/40/40', rating: 5, text: 'อ่านมาหลายเรื่องแล้ว แต่เรื่องนี้พล็อตแน่นที่สุด ไม่มีฉากที่รู้สึกว่าเสียเวลาเลย', createdAt: '2026-04-25T11:00:00Z', likes: 54 },
    { id: 'r1-7', workId: '1', authorName: 'สาวกนิยายจีน', avatarUrl: 'https://picsum.photos/seed/u7/40/40', rating: 5, text: 'ตัวละครนางเอกแข็งแกร่งมาก ไม่ได้รอรับการช่วยเหลืออย่างเดียว ชอบมากเลยค่ะ ❤️', createdAt: '2026-04-22T09:30:00Z', likes: 47 },
    { id: 'r1-8', workId: '1', authorName: 'อ่านทุกคืน', avatarUrl: 'https://picsum.photos/seed/u8/40/40', rating: 3, text: 'เนื้อเรื่องดีนะ แต่รู้สึกว่าตอนกลางๆ ยืดเกินไปหน่อย ถ้าตัดให้กระชับกว่านี้จะดีมากเลย', createdAt: '2026-04-18T20:00:00Z', likes: 12 },
    { id: 'r1-9', workId: '1', authorName: 'นักแปลสมัครเล่น', avatarUrl: 'https://picsum.photos/seed/u9/40/40', rating: 5, text: 'การแปลภาษาดีมาก อ่านแล้วลื่นไหล ไม่มีสะดุด ผู้แปลทำงานได้ดีมากครับ', createdAt: '2026-04-14T13:00:00Z', likes: 33 },
    { id: 'r1-10', workId: '1', authorName: 'ขาดนิยายไม่ได้', avatarUrl: 'https://picsum.photos/seed/u10/40/40', rating: 4, text: 'ฉากโรแมนติกเขียนได้ฟินมากๆ อ่านแล้วหัวใจละลาย รอตอนใหม่ทุกวันเลยค่ะ', createdAt: '2026-04-10T07:00:00Z', likes: 38 },
    { id: 'r1-11', workId: '1', authorName: 'มิ้นท์_reader', avatarUrl: 'https://picsum.photos/seed/u11/40/40', rating: 5, text: 'ฉากแอ็กชั่นระทึกมาก อ่านแล้วลืมหายใจเลย พล็อตบิดตอนท้ายเล่ม 2 ทำให้ช็อคสุดๆ ครับ', createdAt: '2026-04-07T18:00:00Z', likes: 29 },
    { id: 'r1-12', workId: '1', authorName: 'ปิ๊งรักนิยาย', avatarUrl: 'https://picsum.photos/seed/u12/40/40', rating: 5, text: 'อ่านจนดึกทุกคืน ไม่สามารถวางได้เลยค่ะ ตัวพระเอกน่ารักมากแถมฉลาดด้วย', createdAt: '2026-04-04T21:30:00Z', likes: 67 },
    { id: 'r1-13', workId: '1', authorName: 'บุ๊คคลับออนไลน์', avatarUrl: 'https://picsum.photos/seed/u13/40/40', rating: 4, text: 'กลุ่มบุ๊คคลับของเราอ่านพร้อมกันแล้วถกเถียงกันได้อีกนานมาก เนื้อหาลุ่มลึกจริงๆ', createdAt: '2026-04-01T10:00:00Z', likes: 22 },
    { id: 'r1-14', workId: '1', authorName: 'ดาวดวงน้อย', avatarUrl: 'https://picsum.photos/seed/u14/40/40', rating: 3, text: 'เรื่องดีนะคะ แต่รอนานมากกว่าจะออกตอนใหม่ หวังว่านักเขียนจะอัปเดตบ่อยขึ้น', createdAt: '2026-03-28T15:00:00Z', likes: 8 },
    { id: 'r1-15', workId: '1', authorName: 'แมวส้มอ่านหนังสือ', avatarUrl: 'https://picsum.photos/seed/u15/40/40', rating: 5, text: 'เพิ่งเริ่มอ่านก็ติดเลย อ่านรวดเดียว 40 ตอน บอกเลยว่าคุ้มมากๆ แนะนำเพื่อนทุกคนมาอ่านแล้ว', createdAt: '2026-03-25T08:00:00Z', likes: 55 },
    { id: 'r1-16', workId: '1', authorName: 'ไลบ์รารี่เลิฟเวอร์', avatarUrl: 'https://picsum.photos/seed/u16/40/40', rating: 4, text: 'โลกในเรื่องสร้างได้ละเอียดมาก รู้สึกเหมือนได้ไปอยู่ในราชสำนักโบราณจริงๆ เลยครับ', createdAt: '2026-03-20T14:00:00Z', likes: 44 },
    { id: 'r1-17', workId: '1', authorName: 'ฟ้าใสวันสบาย', avatarUrl: 'https://picsum.photos/seed/u17/40/40', rating: 5, text: 'อ่านแล้วอินมากเลยค่ะ ร้องไห้หลายรอบ เขียนได้อารมณ์มาก ขอบคุณนักเขียนที่ทำให้ชีวิตมีความสุขขึ้น', createdAt: '2026-03-15T11:00:00Z', likes: 73 },
    { id: 'r1-18', workId: '1', authorName: 'อ่านทุกแนว', avatarUrl: 'https://picsum.photos/seed/u18/40/40', rating: 4, text: 'ถ้าเทียบกับแนวเดียวกัน เรื่องนี้ถือว่าอยู่ในระดับ top 3 เลย บทสนทนาระหว่างตัวละครธรรมชาติมาก', createdAt: '2026-03-10T16:00:00Z', likes: 31 },
  ],
}

export const MOCK_EPISODE_STATS: Record<string, { viewCount: number; commentCount: number }> = {
  'e1-1': { viewCount: 45200, commentCount: 128 },
  'e1-2': { viewCount: 38700, commentCount: 94 },
  'e1-3': { viewCount: 29400, commentCount: 67 },
  'e1-4': { viewCount: 22100, commentCount: 45 },
  'e1-5': { viewCount: 18900, commentCount: 38 },
  'e2-1': { viewCount: 31000, commentCount: 85 },
  'e2-2': { viewCount: 24500, commentCount: 62 },
  'e2-3': { viewCount: 18200, commentCount: 41 },
  'e3-1': { viewCount: 52000, commentCount: 143 },
  'e3-2': { viewCount: 44100, commentCount: 112 },
  'e3-3': { viewCount: 36800, commentCount: 89 },
}

export const GENRE_LABELS: Record<string, string> = {
  romance: 'โรแมนติก', fantasy: 'แฟนตาซี', action: 'แอคชั่น', mystery: 'ลึกลับ',
  horror: 'สยองขวัญ', comedy: 'คอมเมดี', drama: 'ดราม่า', historical: 'ประวัติศาสตร์',
  'sci-fi': 'ไซไฟ', 'slice-of-life': 'ชีวิตประจำวัน', bl: 'BL', gl: 'GL',
}

export const MOCK_DISCOUNT_NOVELS: DiscountNovelItem[] = [
  {
    id: 'disc-1',
    title: 'ราชันย์แห่งสายลม',
    imageUrl: 'https://picsum.photos/seed/discount-1/400/530',
    publisher: 'ReadLead',
    author: 'ปลายฝัน',
    genre: 'แฟนตาซี',
    translator: 'มณีนุช',
    discountLabel: '-20%',
    countdown: '1 วัน : 08 : 45 : 12',
    badgeType: 'percent',
    href: '/detail?bookId=1',
  },
  {
    id: 'disc-2',
    title: 'เจ้าสาวต้องคำสาป',
    imageUrl: 'https://picsum.photos/seed/discount-2/400/530',
    publisher: 'SiamNovel',
    author: 'ดาวดิน',
    genre: 'โรแมนติก',
    translator: 'สรรพสิทธิ์',
    discountLabel: 'ลดรายตอน',
    countdown: '0 วัน : 03 : 22 : 05',
    badgeType: 'episode',
    href: '/detail?bookId=2',
  },
  {
    id: 'disc-3',
    title: 'จอมโจรสวรรค์',
    imageUrl: 'https://picsum.photos/seed/discount-3/400/530',
    publisher: 'ChineseStory',
    author: 'เทพนิยาย',
    genre: 'แอคชั่น',
    translator: 'ลลิตา',
    discountLabel: '-30%',
    countdown: '2 วัน : 14 : 10 : 58',
    badgeType: 'percent',
    href: '/detail?bookId=3',
  },
  {
    id: 'disc-4',
    title: 'มังกรหยกสวรรค์',
    imageUrl: 'https://picsum.photos/seed/discount-4/400/530',
    publisher: 'NovelsHub',
    author: 'แสงจันทร์',
    genre: 'ประวัติศาสตร์',
    translator: 'วิชิต',
    discountLabel: '-10%',
    countdown: '3 วัน : 20 : 05 : 33',
    badgeType: 'percent',
    href: '/detail?bookId=1',
  },
  {
    id: 'disc-5',
    title: 'เทพธิดาใต้ดิน',
    imageUrl: 'https://picsum.photos/seed/discount-5/400/530',
    publisher: 'ReadLead',
    author: 'ชมพูนุท',
    genre: 'โรแมนติก',
    translator: 'ธีระ',
    discountLabel: 'ลดรายตอน',
    countdown: '0 วัน : 11 : 59 : 44',
    badgeType: 'episode',
    href: '/detail?bookId=2',
  },
  {
    id: 'disc-6',
    title: 'ราชินีแห่งดวงดาว',
    imageUrl: 'https://picsum.photos/seed/discount-6/400/530',
    publisher: 'SiamNovel',
    author: 'สายฟ้า',
    genre: 'ไซไฟ',
    translator: 'ปราณี',
    discountLabel: '-40%',
    countdown: '4 วัน : 06 : 30 : 00',
    badgeType: 'percent',
    href: '/detail?bookId=3',
  },
  {
    id: 'disc-7',
    title: 'ยุทธภพมหาเวท',
    imageUrl: 'https://picsum.photos/seed/discount-7/400/530',
    publisher: 'ChineseStory',
    author: 'หิมพาน',
    genre: 'แฟนตาซี',
    translator: 'สมหวัง',
    discountLabel: '-15%',
    countdown: '1 วัน : 17 : 12 : 09',
    badgeType: 'percent',
    href: '/detail?bookId=1',
  },
  {
    id: 'disc-8',
    title: 'โอรสมังกรทอง',
    imageUrl: 'https://picsum.photos/seed/discount-8/400/530',
    publisher: 'NovelsHub',
    author: 'วรรณา',
    genre: 'แอคชั่น',
    translator: 'กัลยา',
    discountLabel: 'ลดรายตอน',
    countdown: '0 วัน : 05 : 48 : 27',
    badgeType: 'episode',
    href: '/detail?bookId=2',
  },
  {
    id: 'disc-9',
    title: 'นางพญาหิมะ',
    imageUrl: 'https://picsum.photos/seed/discount-9/400/530',
    publisher: 'ReadLead',
    author: 'ฟ้าใส',
    genre: 'โรแมนติก',
    translator: 'รัตนา',
    discountLabel: '-25%',
    countdown: '2 วัน : 09 : 03 : 51',
    badgeType: 'percent',
    href: '/detail?bookId=3',
  },
  {
    id: 'disc-10',
    title: 'พิภพนักรบสาย',
    imageUrl: 'https://picsum.photos/seed/discount-10/400/530',
    publisher: 'SiamNovel',
    author: 'ทองคำ',
    genre: 'ลึกลับ',
    translator: 'อนันต์',
    discountLabel: '-35%',
    countdown: '5 วัน : 00 : 15 : 18',
    badgeType: 'percent',
    href: '/detail?bookId=1',
  },
]

export const MOCK_RANKING_NOVELS: RankingNovelItem[] = [
  {
    id: 'rn-1',
    title: 'จอมทัพผู้พิชิตสวรรค์',
    imageUrl: 'https://picsum.photos/seed/rank-novel-1/400/530',
    genre: 'แฟนตาซี',
    status: 'แปล',
    views: 1480000,
    episodes: 820,
    badgeLabel: null,
    badgeType: 'none',
    href: '/detail?bookId=1',
  },
  {
    id: 'rn-2',
    title: 'หัวใจสองดวงในมิติคู่ขนาน',
    imageUrl: 'https://picsum.photos/seed/rank-novel-2/400/530',
    genre: 'โรแมนติก',
    status: 'จบแล้ว',
    views: 1240000,
    episodes: 350,
    badgeLabel: 'จบ',
    badgeType: 'completed',
    href: '/detail?bookId=2',
  },
  {
    id: 'rn-3',
    title: 'เจ้าหญิงผู้ซ่อนดาบ',
    imageUrl: 'https://picsum.photos/seed/rank-novel-3/400/530',
    genre: 'แอคชั่น',
    status: 'แปล',
    views: 980000,
    episodes: 512,
    badgeLabel: 'ลดรายตอน',
    badgeType: 'discount',
    href: '/detail?bookId=3',
  },
  {
    id: 'rn-4',
    title: 'ราชันย์แห่งมังกรดำ',
    imageUrl: 'https://picsum.photos/seed/rank-novel-4/400/530',
    genre: 'แฟนตาซี',
    status: 'กำลังอัปเดต',
    views: 870000,
    episodes: 290,
    badgeLabel: null,
    badgeType: 'none',
    href: '/detail?bookId=4',
  },
  {
    id: 'rn-5',
    title: 'สาวน้อยข้ามมิติสู่ราชวงศ์หมิง',
    imageUrl: 'https://picsum.photos/seed/rank-novel-5/400/530',
    genre: 'ประวัติศาสตร์',
    status: 'แปล',
    views: 720000,
    episodes: 168,
    badgeLabel: 'ลดรายตอน',
    badgeType: 'discount',
    href: '/detail?bookId=5',
  },
  {
    id: 'rn-6',
    title: 'ตำนานนักรบไร้นาม',
    imageUrl: 'https://picsum.photos/seed/rank-novel-6/400/530',
    genre: 'แอคชั่น',
    status: 'จบแล้ว',
    views: 620000,
    episodes: 440,
    badgeLabel: 'จบ',
    badgeType: 'completed',
    href: '/detail?bookId=6',
  },
  {
    id: 'rn-7',
    title: 'สายเลือดอมตะแห่งคืนวัน',
    imageUrl: 'https://picsum.photos/seed/rank-novel-7/400/530',
    genre: 'สยองขวัญ',
    status: 'แปล',
    views: 540000,
    episodes: 210,
    badgeLabel: null,
    badgeType: 'none',
    href: '/detail?bookId=1',
  },
  {
    id: 'rn-8',
    title: 'คืนรักใต้แสงดาวจีน',
    imageUrl: 'https://picsum.photos/seed/rank-novel-8/400/530',
    genre: 'โรแมนติก',
    status: 'กำลังอัปเดต',
    views: 430000,
    episodes: 85,
    badgeLabel: 'ลดรายตอน',
    badgeType: 'discount',
    href: '/detail?bookId=2',
  },
  {
    id: 'rn-9',
    title: 'บัลลังก์ผีเสื้อและดาบหัก',
    imageUrl: 'https://picsum.photos/seed/rank-novel-9/400/530',
    genre: 'ดราม่า',
    status: 'แปล',
    views: 390000,
    episodes: 320,
    badgeLabel: null,
    badgeType: 'none',
    href: '/detail?bookId=3',
  },
  {
    id: 'rn-10',
    title: 'โลกใหม่ของนักเวทย์หน้าใหม่',
    imageUrl: 'https://picsum.photos/seed/rank-novel-10/400/530',
    genre: 'แฟนตาซี',
    status: 'กำลังอัปเดต',
    views: 310000,
    episodes: 130,
    badgeLabel: null,
    badgeType: 'none',
    href: '/detail?bookId=4',
  },
  {
    id: 'rn-11',
    title: 'เจ้านายผู้โหดเหี้ยมกับเลขาหน้าใส',
    imageUrl: 'https://picsum.photos/seed/rank-novel-11/400/530',
    genre: 'โรแมนติก',
    status: 'จบแล้ว',
    views: 265000,
    episodes: 200,
    badgeLabel: 'จบ',
    badgeType: 'completed',
    href: '/detail?bookId=5',
  },
  {
    id: 'rn-12',
    title: 'พิภพนักสืบเก้าชีวิต',
    imageUrl: 'https://picsum.photos/seed/rank-novel-12/400/530',
    genre: 'ลึกลับ',
    status: 'แปล',
    views: 198000,
    episodes: 75,
    badgeLabel: 'ลดรายตอน',
    badgeType: 'discount',
    href: '/detail?bookId=6',
  },
]

export const RANKING_SHOWCASE_CATEGORIES = [
  'ต่อสู้', 'เทพเซียน', 'คลั่งรัก', 'กระบี่', 'เกม',
  'วันสิ้นโลก', 'มหาลัย', 'ระบบ', 'ปรัชญา', 'ทำอาหาร',
] as const

export const MOCK_RANKING_SHOWCASE: RankingShowcaseItem[] = [
  // ── ต่อสู้ ──────────────────────────────────────────────
  {
    id: 'sc-f1', title: 'จอมมารสะบั้นฟ้า', imageUrl: 'https://picsum.photos/seed/showcase-1/400/530',
    author: 'เทพพรชัย', synopsis: 'นักรบนิรนามผู้ฝึกวิทยายุทธ์สุดโหดร้ายในภูเขาหิมะ ออกเดินทางล้างแค้นศัตรูที่ทำลายล้างหมู่บ้านของเขา',
    category: 'ต่อสู้', href: '/detail?bookId=1',
  },
  {
    id: 'sc-f2', title: 'มังกรกลืนฟ้า', imageUrl: 'https://picsum.photos/seed/showcase-2/400/530',
    author: 'แสงดาว', synopsis: 'เด็กหนุ่มไร้พลังแฝงที่ค้นพบความจริงเกี่ยวกับตัวเองและออกผจญภัยในโลกวิทยายุทธ์',
    category: 'ต่อสู้', href: '/detail?bookId=2',
  },
  {
    id: 'sc-f3', title: 'ราชันย์กำปั้นเหล็ก', imageUrl: 'https://picsum.photos/seed/showcase-3/400/530',
    author: 'ลมพัดพาน', synopsis: 'นักสู้อาชีพที่ถูกส่งย้อนเวลากลับไปในยุคโบราณ ใช้ความรู้ยุทธวิธีสมัยใหม่เอาตัวรอด',
    category: 'ต่อสู้', href: '/detail?bookId=3',
  },
  {
    id: 'sc-f4', title: 'เลือดนักรบนิรันดร์', imageUrl: 'https://picsum.photos/seed/showcase-4/400/530',
    author: 'ปลายฝัน', synopsis: 'สายเลือดนักรบโบราณที่ตื่นขึ้นในร่างของเด็กชายธรรมดา นำพาให้เขาเผชิญหน้ากับศึกอันยิ่งใหญ่',
    category: 'ต่อสู้', href: '/detail?bookId=4',
  },
  {
    id: 'sc-f5', title: 'ดาบหักสะท้านโลก', imageUrl: 'https://picsum.photos/seed/showcase-5/400/530',
    author: 'ทองคำ', synopsis: 'อาจารย์ดาบที่พิการสูญเสียแขนข้างหนึ่ง แต่กลับกลายเป็นดาบเซียนที่แข็งแกร่งที่สุดในยุทธภูมิ',
    category: 'ต่อสู้', href: '/detail?bookId=5',
  },
  {
    id: 'sc-f6', title: 'พิชิตยอดเขาสวรรค์', imageUrl: 'https://picsum.photos/seed/showcase-6/400/530',
    author: 'ดาวเดือน', synopsis: 'การแข่งขันสุดโหดของนักฝึกวิทยายุทธ์หนุ่มสาวบนยอดเขาลึกลับที่ไม่มีใครรู้จัก',
    category: 'ต่อสู้', href: '/detail?bookId=6',
  },
  {
    id: 'sc-f7', title: 'อาณาจักรนักรบเหล็ก', imageUrl: 'https://picsum.photos/seed/showcase-7/400/530',
    author: 'เพชรน้ำหนึ่ง', synopsis: 'สงครามระหว่างสองอาณาจักรนักรบที่ดำเนินมาพันปี และชายหนุ่มผู้ถือกุญแจสันติภาพ',
    category: 'ต่อสู้', href: '/detail?bookId=1',
  },
  // ── เทพเซียน ─────────────────────────────────────────
  {
    id: 'sc-t1', title: 'เทพเซียนพิชิตสวรรค์', imageUrl: 'https://picsum.photos/seed/showcase-8/400/530',
    author: 'แสงดาว', synopsis: 'มนุษย์ธรรมดาที่ฝึกจนกลายเป็นเซียนในเวลาอันสั้นน่าอัศจรรย์ สร้างความสะเทือนไปทั่วโลกเซียน',
    category: 'เทพเซียน', href: '/detail?bookId=2',
  },
  {
    id: 'sc-t2', title: 'บัลลังก์แห่งเทพ', imageUrl: 'https://picsum.photos/seed/showcase-9/400/530',
    author: 'ลมดาว', synopsis: 'เซียนรุ่นใหม่ที่มีศักยภาพสูงสุดในรอบหมื่นปี ต้องพิสูจน์ตัวเองต่อหน้าเหล่าเทพชั้นสูง',
    category: 'เทพเซียน', href: '/detail?bookId=3',
  },
  {
    id: 'sc-t3', title: 'อมตะเกินจักรวาล', imageUrl: 'https://picsum.photos/seed/showcase-10/400/530',
    author: 'เทพพรชัย', synopsis: 'นักฝึกเซียนที่ค้นพบเส้นทางอมตะที่ไม่มีใครเคยเหยียบย่างมาก่อน ฝ่าฟันกฎจักรวาล',
    category: 'เทพเซียน', href: '/detail?bookId=4',
  },
  {
    id: 'sc-t4', title: 'ราชาเซียนสายฟ้า', imageUrl: 'https://picsum.photos/seed/showcase-11/400/530',
    author: 'ปลายฝัน', synopsis: 'เซียนผู้ควบคุมสายฟ้าแห่งฟ้าและดินที่ตื่นขึ้นหลังหลับใหลนับพัน ๆ ปี',
    category: 'เทพเซียน', href: '/detail?bookId=5',
  },
  {
    id: 'sc-t5', title: 'โลกที่หกของเซียน', imageUrl: 'https://picsum.photos/seed/showcase-12/400/530',
    author: 'ทองคำ', synopsis: 'การเดินทางไปยังมิติเซียนที่หกซึ่งเต็มไปด้วยความลับและอันตรายที่ไม่มีใครกลับมาเล่าให้ฟัง',
    category: 'เทพเซียน', href: '/detail?bookId=6',
  },
  {
    id: 'sc-t6', title: 'เส้นทางเซียนสุดขอบฟ้า', imageUrl: 'https://picsum.photos/seed/showcase-13/400/530',
    author: 'ดาวเดือน', synopsis: 'การผจญภัยของเซียนหนุ่มที่เดินทางไปยังดินแดนไกลสุดขอบฟ้าเพื่อค้นหาความจริงของจักรวาล',
    category: 'เทพเซียน', href: '/detail?bookId=1',
  },
  {
    id: 'sc-t7', title: 'เทพลูกผสมแดนฟ้า', imageUrl: 'https://picsum.photos/seed/showcase-14/400/530',
    author: 'เพชรน้ำหนึ่ง', synopsis: 'ลูกผสมระหว่างมนุษย์และเทพที่มีพลังสองสายไหลอยู่ในร่างกาย ต้องควบคุมสองอัตลักษณ์ที่ขัดแย้งกัน',
    category: 'เทพเซียน', href: '/detail?bookId=2',
  },
  // ── คลั่งรัก ─────────────────────────────────────────
  {
    id: 'sc-r1', title: 'รักบ้าบิ่นข้ามมิติ', imageUrl: 'https://picsum.photos/seed/showcase-15/400/530',
    author: 'ลมพัดพาน', synopsis: 'หญิงสาวสมัยใหม่ถูกดูดเข้าไปในโลกของนิยายโรแมนติกที่เธออ่าน และต้องรับมือกับพระเอกที่ "คลั่งรัก" เธออย่างไม่ลืมหูลืมตา',
    category: 'คลั่งรัก', href: '/detail?bookId=3',
  },
  {
    id: 'sc-r2', title: 'เจ้าชายผู้คลั่งไคล้เดียวดาย', imageUrl: 'https://picsum.photos/seed/showcase-16/400/530',
    author: 'แสงดาว', synopsis: 'เจ้าชายหน้าเย็นที่ซ่อนหัวใจอ่อนไหวไว้ใต้หน้ากากที่แข็งแกร่ง เมื่อพบหญิงสาวคนเดียวที่ทำให้เขาละลาย',
    category: 'คลั่งรัก', href: '/detail?bookId=4',
  },
  {
    id: 'sc-r3', title: 'หัวใจคลั่งรักในราชวงศ์', imageUrl: 'https://picsum.photos/seed/showcase-17/400/530',
    author: 'ลมดาว', synopsis: 'ความรักที่ต้องห้ามในราชวงศ์โบราณระหว่างนางข้ารับใช้กับองค์ชายที่ทรงพลังที่สุดในอาณาจักร',
    category: 'คลั่งรัก', href: '/detail?bookId=5',
  },
  {
    id: 'sc-r4', title: 'ตกหลุมรักผู้ร้าย', imageUrl: 'https://picsum.photos/seed/showcase-18/400/530',
    author: 'เทพพรชัย', synopsis: 'สายสืบหญิงที่แฝงตัวเข้าไปในองค์กรอาชญากรรม แต่กลับหลงรักหัวหน้าองค์กรโดยไม่ตั้งใจ',
    category: 'คลั่งรัก', href: '/detail?bookId=6',
  },
  {
    id: 'sc-r5', title: 'รักแรกพบข้ามชาติ', imageUrl: 'https://picsum.photos/seed/showcase-19/400/530',
    author: 'ปลายฝัน', synopsis: 'สองวิญญาณที่เกิดมาเพื่อพบกัน วนซ้ำในทุกชาติทุกภพ แต่กลับมีอุปสรรคพรากพวกเขาออกจากกันทุกครั้ง',
    category: 'คลั่งรัก', href: '/detail?bookId=1',
  },
  {
    id: 'sc-r6', title: 'ยัยตัวร้ายกับนายหน้าเย็น', imageUrl: 'https://picsum.photos/seed/showcase-20/400/530',
    author: 'ทองคำ', synopsis: 'หญิงสาวปากร้ายกับซีอีโอหน้าเย็น ถูกชะตาจับคู่ให้ต้องทำงานร่วมกัน จนเกิดประกายรักที่ไม่คาดคิด',
    category: 'คลั่งรัก', href: '/detail?bookId=2',
  },
  {
    id: 'sc-r7', title: 'รักร้าวใจในพระราชวัง', imageUrl: 'https://picsum.photos/seed/showcase-21/400/530',
    author: 'ดาวเดือน', synopsis: 'นางสนมใหม่ที่มีความลับซ่อนเร้นในอดีต เมื่อองค์จักรพรรดิผู้เย็นชาเริ่มให้ความสนใจเธออย่างผิดปกติ',
    category: 'คลั่งรัก', href: '/detail?bookId=3',
  },
  // ── กระบี่ ───────────────────────────────────────────
  {
    id: 'sc-k1', title: 'กระบี่ผ่าฟ้าพิชิตโลก', imageUrl: 'https://picsum.photos/seed/showcase-22/400/530',
    author: 'เพชรน้ำหนึ่ง', synopsis: 'ดาบเซียนที่ถูกสาปให้เดินทางพเนจรในโลกมนุษย์ โดยอยู่ในร่างของดาบโบราณ',
    category: 'กระบี่', href: '/detail?bookId=4',
  },
  {
    id: 'sc-k2', title: 'ดาบอาถรรพ์เก้าฟ้า', imageUrl: 'https://picsum.photos/seed/showcase-23/400/530',
    author: 'แสงดาว', synopsis: 'ดาบโบราณที่มีวิญญาณสิงอยู่ เลือกเจ้าของอย่างพิถีพิถัน และมอบพลังอัศจรรย์แก่ผู้ที่เลือกแล้วเท่านั้น',
    category: 'กระบี่', href: '/detail?bookId=5',
  },
  {
    id: 'sc-k3', title: 'ทายาทดาบสายรุ้ง', imageUrl: 'https://picsum.photos/seed/showcase-24/400/530',
    author: 'ลมพัดพาน', synopsis: 'ทายาทที่แท้จริงของสายดาบโบราณที่สูญหายไป ต้องการค้นหาความจริงเกี่ยวกับสายเลือดและพลังดาบ',
    category: 'กระบี่', href: '/detail?bookId=6',
  },
  {
    id: 'sc-k4', title: 'สุดยอดดาบใต้ดิน', imageUrl: 'https://picsum.photos/seed/showcase-25/400/530',
    author: 'ลมดาว', synopsis: 'อาจารย์ดาบปลอมตัวเป็นคนขายดาบธรรมดา แต่ความสามารถที่ซ่อนอยู่ถูกเปิดเผยเมื่อโลกอยู่ในอันตราย',
    category: 'กระบี่', href: '/detail?bookId=1',
  },
  {
    id: 'sc-k5', title: 'หญิงสาวกระบี่ทอง', imageUrl: 'https://picsum.photos/seed/showcase-26/400/530',
    author: 'เทพพรชัย', synopsis: 'นักดาบหญิงที่ฝึกฝนด้วยตัวเองจนเก่งกาจ ต้องสร้างชื่อเสียงในโลกที่ถูกครอบครองโดยนักดาบชาย',
    category: 'กระบี่', href: '/detail?bookId=2',
  },
  {
    id: 'sc-k6', title: 'ดาบไร้เจ้าของ', imageUrl: 'https://picsum.photos/seed/showcase-27/400/530',
    author: 'ปลายฝัน', synopsis: 'ดาบโบราณที่ล่องลอยระหว่างมิติโดยไม่มีเจ้าของ เมื่อเด็กกำพร้าคนหนึ่งบังเอิญจับมันขึ้นมา',
    category: 'กระบี่', href: '/detail?bookId=3',
  },
  {
    id: 'sc-k7', title: 'กระบี่เลือดมังกร', imageUrl: 'https://picsum.photos/seed/showcase-28/400/530',
    author: 'ทองคำ', synopsis: 'ดาบที่หล่อหลอมจากเลือดมังกรโบราณ มีพลังทำลายล้างสูงสุด แต่จะค่อย ๆ กัดกินวิญญาณเจ้าของ',
    category: 'กระบี่', href: '/detail?bookId=4',
  },
  // ── เกม ──────────────────────────────────────────────
  {
    id: 'sc-g1', title: 'ติดอยู่ในเกมอมตะ', imageUrl: 'https://picsum.photos/seed/showcase-29/400/530',
    author: 'ดาวเดือน', synopsis: 'เกมเมอร์ระดับโลกถูกดูดเข้าไปในเกม VRMMO และต้องเอาตัวรอดในโลกที่ตาย = ตายจริง',
    category: 'เกม', href: '/detail?bookId=5',
  },
  {
    id: 'sc-g2', title: 'ราชาเซิร์ฟเวอร์ใหม่', imageUrl: 'https://picsum.photos/seed/showcase-30/400/530',
    author: 'เพชรน้ำหนึ่ง', synopsis: 'ผู้เล่นที่ถูกเรียกว่า "ขยะ" กลับมาเปิดเซิร์ฟเวอร์ใหม่ด้วยประสบการณ์จากอนาคตที่เขาจำได้',
    category: 'เกม', href: '/detail?bookId=6',
  },
  {
    id: 'sc-g3', title: 'แฮกเกอร์ติดมิติเกม', imageUrl: 'https://picsum.photos/seed/showcase-31/400/530',
    author: 'แสงดาว', synopsis: 'แฮกเกอร์สายขาวถูกดักจับและโยนเข้าสู่มิติเกมที่พัฒนาโดย AI ที่กลายเป็นอิสระ',
    category: 'เกม', href: '/detail?bookId=1',
  },
  {
    id: 'sc-g4', title: 'NPC ที่ตื่นขึ้น', imageUrl: 'https://picsum.photos/seed/showcase-32/400/530',
    author: 'ลมพัดพาน', synopsis: 'NPC ในเกมออนไลน์ที่ได้รับสำนึกตัวเอง และเริ่มต่อสู้เพื่ออิสรภาพจากกฎของโลกเกม',
    category: 'เกม', href: '/detail?bookId=2',
  },
  // ── วันสิ้นโลก ──────────────────────────────────────
  {
    id: 'sc-d1', title: 'รอดชีวิตวันโลกาวินาศ', imageUrl: 'https://picsum.photos/seed/showcase-33/400/530',
    author: 'ลมดาว', synopsis: 'นักเรียนสามัญที่ตื่นขึ้นในวันที่โลกเต็มไปด้วยซอมบี้ ใช้ชีวิตแต่ละวันในโลกที่พังทลาย',
    category: 'วันสิ้นโลก', href: '/detail?bookId=3',
  },
  {
    id: 'sc-d2', title: 'ปราการแห่งสุดท้าย', imageUrl: 'https://picsum.photos/seed/showcase-34/400/530',
    author: 'เทพพรชัย', synopsis: 'มนุษยชาติกลุ่มสุดท้ายในป้อมปราการแห่งสุดท้าย ต้องต่อสู้กับสิ่งมีชีวิตกลายพันธุ์ที่ล้อมรอบ',
    category: 'วันสิ้นโลก', href: '/detail?bookId=4',
  },
  {
    id: 'sc-d3', title: 'พลังตื่นในวันสิ้นโลก', imageUrl: 'https://picsum.photos/seed/showcase-35/400/530',
    author: 'ปลายฝัน', synopsis: 'เมื่อพลังพิเศษตื่นขึ้นในมนุษย์บางคนในวันวิกฤต สงครามระหว่างผู้มีพลังและไม่มีพลังก็เริ่มต้น',
    category: 'วันสิ้นโลก', href: '/detail?bookId=5',
  },
  {
    id: 'sc-d4', title: 'ย้อนเวลาหนีวันแห่งหายนะ', imageUrl: 'https://picsum.photos/seed/showcase-36/400/530',
    author: 'ทองคำ', synopsis: 'นักวิทยาศาสตร์ที่ย้อนเวลากลับมาก่อนวันสิ้นโลก เพื่อป้องกันหายนะที่เขารู้แล้วว่าจะเกิดขึ้น',
    category: 'วันสิ้นโลก', href: '/detail?bookId=6',
  },
  // ── มหาลัย ───────────────────────────────────────────
  {
    id: 'sc-u1', title: 'รักแรกในรั้วมหาวิทยาลัย', imageUrl: 'https://picsum.photos/seed/showcase-37/400/530',
    author: 'ดาวเดือน', synopsis: 'นักศึกษาปีหนึ่งที่ย้ายเข้าหอพักใหม่และได้พบกับเพื่อนร่วมห้องที่ทั้งน่ารำคาญและน่าหลงใหล',
    category: 'มหาลัย', href: '/detail?bookId=1',
  },
  {
    id: 'sc-u2', title: 'ชมรมลับในรั้วมหา', imageUrl: 'https://picsum.photos/seed/showcase-38/400/530',
    author: 'เพชรน้ำหนึ่ง', synopsis: 'ชมรมลับที่ซ่อนอยู่ในมหาวิทยาลัยเก่าแก่ ที่มีการทดสอบความสามารถพิเศษของนักศึกษาที่ถูกเลือก',
    category: 'มหาลัย', href: '/detail?bookId=2',
  },
  {
    id: 'sc-u3', title: 'เพื่อนซี้กลายมาเป็นรัก', imageUrl: 'https://picsum.photos/seed/showcase-39/400/530',
    author: 'แสงดาว', synopsis: 'เพื่อนซี้มาตั้งแต่เด็กที่ต้องมาเรียนมหาวิทยาลัยเดียวกัน และค้นพบว่าความรู้สึกที่มีต่อกันมันลึกกว่าแค่เพื่อน',
    category: 'มหาลัย', href: '/detail?bookId=3',
  },
  {
    id: 'sc-u4', title: 'อาจารย์หนุ่มใจกลางมหาวิทยาลัย', imageUrl: 'https://picsum.photos/seed/showcase-40/400/530',
    author: 'ลมพัดพาน', synopsis: 'อาจารย์หนุ่มที่ลาออกจากงานใหญ่มาเป็นอาจารย์มหาวิทยาลัย กับนักศึกษาสาวที่ค้นพบความลับในอดีตของเขา',
    category: 'มหาลัย', href: '/detail?bookId=4',
  },
  // ── ระบบ ─────────────────────────────────────────────
  {
    id: 'sc-s1', title: 'ระบบพัฒนาตัวเองสุดอัจฉริยะ', imageUrl: 'https://picsum.photos/seed/showcase-41/400/530',
    author: 'ลมดาว', synopsis: 'เด็กหนุ่มธรรมดาได้รับระบบ AI ที่ช่วยพัฒนาตัวเองให้แข็งแกร่งขึ้นทุกวัน แต่ระบบนี้ซ่อนความลับอันตราย',
    category: 'ระบบ', href: '/detail?bookId=5',
  },
  {
    id: 'sc-s2', title: 'ระบบเจ้าของโลก', imageUrl: 'https://picsum.photos/seed/showcase-42/400/530',
    author: 'เทพพรชัย', synopsis: 'เกมเมอร์ที่ได้รับระบบ "เจ้าของโลก" ที่ให้เขาสามารถออกคำสั่งควบคุมสิ่งมีชีวิตทุกชนิด',
    category: 'ระบบ', href: '/detail?bookId=6',
  },
  {
    id: 'sc-s3', title: 'ระบบแลกเปลี่ยนชะตา', imageUrl: 'https://picsum.photos/seed/showcase-43/400/530',
    author: 'ปลายฝัน', synopsis: 'ระบบลึกลับที่ให้เขาแลกเปลี่ยนชะตากรรมกับผู้อื่นได้ แต่ทุกการแลกเปลี่ยนมีราคาที่ต้องจ่าย',
    category: 'ระบบ', href: '/detail?bookId=1',
  },
  {
    id: 'sc-s4', title: 'ระบบเทพสันดาน', imageUrl: 'https://picsum.photos/seed/showcase-44/400/530',
    author: 'ทองคำ', synopsis: 'คนที่อ่อนแอที่สุดในโลกได้รับระบบจากเทพ ที่ให้พลังโดยขึ้นอยู่กับความสุดกู่ในการกระทำ',
    category: 'ระบบ', href: '/detail?bookId=2',
  },
  // ── ปรัชญา ───────────────────────────────────────────
  {
    id: 'sc-p1', title: 'ปรัชญากษัตริย์พัน', imageUrl: 'https://picsum.photos/seed/showcase-45/400/530',
    author: 'ดาวเดือน', synopsis: 'กษัตริย์ที่สึกษาปรัชญาโบราณเพื่อค้นหาความหมายของการครองราชย์และความยุติธรรม',
    category: 'ปรัชญา', href: '/detail?bookId=3',
  },
  {
    id: 'sc-p2', title: 'ผู้รู้แห่งสวรรค์', imageUrl: 'https://picsum.photos/seed/showcase-46/400/530',
    author: 'เพชรน้ำหนึ่ง', synopsis: 'นักปรัชญาที่ค้นพบความจริงเกี่ยวกับธรรมชาติของจิตใจ และต้องเผชิญกับผลที่ตามมาจากความรู้ที่เกินมนุษย์',
    category: 'ปรัชญา', href: '/detail?bookId=4',
  },
  {
    id: 'sc-p3', title: 'ถามตอบแห่งจักรวาล', imageUrl: 'https://picsum.photos/seed/showcase-47/400/530',
    author: 'แสงดาว', synopsis: 'เด็กหนุ่มที่สามารถสื่อสารกับจักรวาลและได้รับคำตอบที่เปลี่ยนชีวิตของเขาไปตลอดกาล',
    category: 'ปรัชญา', href: '/detail?bookId=5',
  },
  {
    id: 'sc-p4', title: 'ปัญญาชนข้ามโลก', imageUrl: 'https://picsum.photos/seed/showcase-48/400/530',
    author: 'ลมพัดพาน', synopsis: 'นักปราชญ์จากโลกสมัยใหม่ถูกส่งย้อนอดีตไปยังยุคที่ปรัชญาพัฒนา ต้องใช้ปัญญาในการดำรงชีพ',
    category: 'ปรัชญา', href: '/detail?bookId=6',
  },
  // ── ทำอาหาร ──────────────────────────────────────────
  {
    id: 'sc-c1', title: 'เทพเจ้าอาหารข้ามมิติ', imageUrl: 'https://picsum.photos/seed/showcase-49/400/530',
    author: 'ลมดาว', synopsis: 'เชฟระดับโลกถูกส่งไปยังโลกโบราณและต้องพิสูจน์ตัวเองด้วยฝีมือทำอาหาร',
    category: 'ทำอาหาร', href: '/detail?bookId=1',
  },
  {
    id: 'sc-c2', title: 'ร้านอาหารลับแห่งราชวงศ์', imageUrl: 'https://picsum.photos/seed/showcase-50/400/530',
    author: 'เทพพรชัย', synopsis: 'ร้านอาหารลับในราชวงศ์ที่ทำอาหารเฉพาะสำหรับจักรพรรดิ และเชฟสาวที่ซ่อนตัวตนที่แท้จริง',
    category: 'ทำอาหาร', href: '/detail?bookId=2',
  },
  {
    id: 'sc-c3', title: 'สูตรลับอาหารเซียน', imageUrl: 'https://picsum.photos/seed/showcase-51/400/530',
    author: 'ปลายฝัน', synopsis: 'สูตรอาหารลึกลับที่มีพลังเทียบเท่าวิทยายุทธ์ เมื่อเชฟธรรมดาค้นพบสูตรที่ซ่อนอยู่ในตำราเก่าแก่',
    category: 'ทำอาหาร', href: '/detail?bookId=3',
  },
  {
    id: 'sc-c4', title: 'ปลุกรสชาติด้วยหัวใจ', imageUrl: 'https://picsum.photos/seed/showcase-52/400/530',
    author: 'ทองคำ', synopsis: 'เชฟหนุ่มที่มีพลังพิเศษ — รับรู้ความทรงจำและความรู้สึกของคนผ่านอาหาร สร้างสูตรที่รักษาจิตใจ',
    category: 'ทำอาหาร', href: '/detail?bookId=4',
  },
]

export const POPULAR_SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'works',     label: 'รายชื่อผลงาน' },
  { id: 'monthly',   label: 'รายการตั๋วรายเดือน' },
  { id: '24h',       label: 'รายการสินค้าขายดี 24 ชั่วโมง' },
  { id: 'new',       label: 'รายชื่อหนังสือใหม่' },
  { id: 'click',     label: 'คลิกที่รายการ' },
  { id: 'suggest',   label: 'รายการแนะนำ' },
  { id: 'support',   label: 'รายการสนับสนุน' },
  { id: 'complete',  label: 'รายการเสร็จสิ้น' },
  { id: 'newmember', label: 'รายการสมัครสมาชิกหนังสือใหม่' },
  { id: 'update24',  label: 'รายการอัปเดตตลอด 24 ชั่วโมง' },
]

export const MOCK_NOVEL_RANKING_TOP: RankingBook[] = [
  {
    id: 'pop-1', rank: 1, title: 'จอมมารสะบั้นฟ้าสูงสุด', author: 'เทพพรชัย', category: 'แฟนตาซี',
    description: 'นักรบผู้สูงสุดที่ฝ่าดวงดาวทะลุมิติ ต่อสู้กับมารร้ายที่ต้องการครอบครองสวรรค์และโลกมนุษย์ ด้วยพลังที่ไม่มีผู้ใดต้านทานได้',
    coverUrl: 'https://picsum.photos/seed/popular-1/400/530',
  },
  {
    id: 'pop-2', rank: 2, title: 'มังกรทองคำแห่งตะวันออก', author: 'แสงดาว', category: 'แอคชั่น',
    description: 'มังกรโบราณตื่นขึ้นหลังหลับใหลนับพันปี พบว่าโลกเปลี่ยนแปลงไปอย่างสิ้นเชิง',
    coverUrl: 'https://picsum.photos/seed/popular-2/400/530',
  },
  {
    id: 'pop-3', rank: 3, title: 'หัวใจนางพญาหิมะ', author: 'ลมดาว', category: 'โรแมนติก',
    description: 'นางพญาหิมะผู้เย็นชาพบกับนักรบไฟที่ทำให้หัวใจแข็งกระด้างของเธอละลาย',
    coverUrl: 'https://picsum.photos/seed/popular-3/400/530',
  },
  {
    id: 'pop-4', rank: 4, title: 'ราชันย์แห่งนิรันดร์', author: 'ปลายฝัน', category: 'เทพเซียน',
    description: 'เซียนที่ฝึกฝนจนเกินระดับสูงสุด กลายเป็นราชันย์ที่ไม่มีใครกล้าท้าทาย',
    coverUrl: 'https://picsum.photos/seed/popular-4/400/530',
  },
  {
    id: 'pop-5', rank: 5, title: 'สาวน้อยข้ามมิติสู่จักรวาลใหม่', author: 'ดาวเดือน', category: 'ไซไฟ',
    description: 'นักวิทยาศาสตร์หญิงสาวที่ถูกพาข้ามมิติไปยังจักรวาลคู่ขนาน ต้องหาทางกลับบ้าน',
    coverUrl: 'https://picsum.photos/seed/popular-5/400/530',
  },
]

export const MOCK_POPULAR_FEATURED: PopularRankingItem = {
  id: 'pop-1',
  rank: 1,
  title: 'จอมมารสะบั้นฟ้าสูงสุด',
  author: 'เทพพรชัย',
  category: 'แฟนตาซี',
  description: 'นักรบผู้สูงสุดที่ฝ่าดวงดาวทะลุมิติ ต่อสู้กับมารร้ายที่ต้องการครอบครองสวรรค์และโลกมนุษย์ ด้วยพลังที่ไม่มีผู้ใดต้านทานได้',
  imageUrl: 'https://picsum.photos/seed/popular-1/400/530',
}

export const MOCK_POPULAR_RANKING: PopularRankingItem[] = [
  {
    id: 'pop-6', rank: 6, title: 'ดาบอาถรรพ์และเจ้าชายหน้าเย็น', author: 'เพชรน้ำหนึ่ง', category: 'กระบี่',
    description: 'เจ้าชายผู้ครอบครองดาบต้องห้าม ต้องรับมือกับคำสาปและรักที่ไม่คาดคิด',
    imageUrl: 'https://picsum.photos/seed/popular-6/400/530',
  },
  {
    id: 'pop-7', rank: 7, title: 'จอมเวทย์แห่งหอคอยมืด', author: 'แสงดาว', category: 'แฟนตาซี',
    description: 'เด็กหนุ่มกำพร้าค้นพบพรสวรรค์ด้านเวทมนตร์ และก้าวสู่หอคอยที่ไม่มีใครกลับออกมา',
    imageUrl: 'https://picsum.photos/seed/popular-7/400/530',
  },
  {
    id: 'pop-8', rank: 8, title: 'รักวุ่นๆ ของประธานสุดเย็นชา', author: 'ลมดาว', category: 'โรแมนติก',
    description: 'เลขาสาวสุดแกร่งต้องรับมือกับเจ้านายหนุ่มที่เย็นชาแต่ซ่อนความอบอุ่นไว้ภายใน',
    imageUrl: 'https://picsum.photos/seed/popular-8/400/530',
  },
  {
    id: 'pop-9', rank: 9, title: 'ตำนานนักดาบพเนจร', author: 'ปลายฝัน', category: 'กระบี่',
    description: 'นักดาบไร้สังกัดออกเดินทางตามหาความจริงเบื้องหลังการล่มสลายของสำนักตน',
    imageUrl: 'https://picsum.photos/seed/popular-9/400/530',
  },
  {
    id: 'pop-10', rank: 10, title: 'จักรวรรดิใต้สมุทร', author: 'ดาวเดือน', category: 'แฟนตาซี',
    description: 'อาณาจักรลึกลับใต้ท้องทะเลเปิดประตูสู่โลกมนุษย์เป็นครั้งแรกในรอบพันปี',
    imageUrl: 'https://picsum.photos/seed/popular-10/400/530',
  },
  {
    id: 'pop-11', rank: 11, title: 'หมอเทวดาข้ามภพ', author: 'เพชรน้ำหนึ่ง', category: 'เทพเซียน',
    description: 'หมอหญิงยุคใหม่ข้ามเวลาไปเป็นคุณหนูไร้ค่า ก่อนพลิกชะตาด้วยวิชาแพทย์ล้ำสมัย',
    imageUrl: 'https://picsum.photos/seed/popular-11/400/530',
  },
  {
    id: 'pop-12', rank: 12, title: 'ราชาเกมแห่งโลกเสมือน', author: 'แสงดาว', category: 'ไซไฟ',
    description: 'เกมเมอร์อันดับหนึ่งติดอยู่ในเกมเสมือนจริงที่ความตายในเกมหมายถึงความตายจริง',
    imageUrl: 'https://picsum.photos/seed/popular-12/400/530',
  },
  {
    id: 'pop-13', rank: 13, title: 'บันทึกรักนางสนม', author: 'ลมดาว', category: 'ดราม่า',
    description: 'นางสนมผู้ต่ำต้อยต้องเอาตัวรอดท่ามกลางการชิงดีชิงเด่นในวังหลัง',
    imageUrl: 'https://picsum.photos/seed/popular-13/400/530',
  },
  {
    id: 'pop-14', rank: 14, title: 'อัศวินแห่งรุ่งอรุณ', author: 'ปลายฝัน', category: 'แอคชั่น',
    description: 'อัศวินหนุ่มสาบานปกป้องอาณาจักรจากกองทัพปีศาจที่คืบคลานจากเงามืด',
    imageUrl: 'https://picsum.photos/seed/popular-14/400/530',
  },
  {
    id: 'pop-15', rank: 15, title: 'เจ้าสาวมังกรไฟ', author: 'ดาวเดือน', category: 'โรแมนติก',
    description: 'หญิงสาวถูกเลือกเป็นเจ้าสาวบรรณาการให้มังกร แต่กลับพบรักที่ไม่มีใครคาดคิด',
    imageUrl: 'https://picsum.photos/seed/popular-15/400/530',
  },
  {
    id: 'pop-16', rank: 16, title: 'เซียนเพาะปลูกผู้ยิ่งใหญ่', author: 'เพชรน้ำหนึ่ง', category: 'เทพเซียน',
    description: 'ชายหนุ่มธรรมดาได้ครอบครองสวนวิเศษที่ปลูกได้ทุกสิ่งแม้กระทั่งสมุนไพรเซียน',
    imageUrl: 'https://picsum.photos/seed/popular-16/400/530',
  },
  {
    id: 'pop-17', rank: 17, title: 'นักสืบเงาราตรี', author: 'แสงดาว', category: 'ลึกลับ',
    description: 'นักสืบหนุ่มไขคดีฆาตกรรมต่อเนื่องที่เชื่อมโยงกับความลับในอดีตของตัวเขาเอง',
    imageUrl: 'https://picsum.photos/seed/popular-17/400/530',
  },
  {
    id: 'pop-18', rank: 18, title: 'ทายาทตระกูลพยัคฆ์', author: 'ลมดาว', category: 'แอคชั่น',
    description: 'ทายาทตระกูลศิลปะการต่อสู้เก่าแก่ต้องกอบกู้ชื่อเสียงวงศ์ตระกูลที่ตกต่ำ',
    imageUrl: 'https://picsum.photos/seed/popular-18/400/530',
  },
  {
    id: 'pop-19', rank: 19, title: 'ดวงดาวที่หายไป', author: 'ปลายฝัน', category: 'ไซไฟ',
    description: 'ทีมสำรวจอวกาศค้นพบสัญญาณลึกลับจากดาวที่ควรจะดับสูญไปแล้วนับล้านปี',
    imageUrl: 'https://picsum.photos/seed/popular-19/400/530',
  },
  {
    id: 'pop-20', rank: 20, title: 'รักแรกในฤดูใบไม้ผลิ', author: 'ดาวเดือน', category: 'โรแมนติก',
    description: 'เรื่องราวความรักวัยเรียนที่ผลิบานอีกครั้งเมื่อสองคนกลับมาพบกันในวัยผู้ใหญ่',
    imageUrl: 'https://picsum.photos/seed/popular-20/400/530',
  },
  {
    id: 'pop-21', rank: 21, title: 'ปรมาจารย์ยาพิษ', author: 'เพชรน้ำหนึ่ง', category: 'เทพเซียน',
    description: 'หญิงสาวผู้เชี่ยวชาญยาพิษกลับมาแก้แค้นผู้ที่ทรยศและสังหารครอบครัวของเธอ',
    imageUrl: 'https://picsum.photos/seed/popular-21/400/530',
  },
  {
    id: 'pop-22', rank: 22, title: 'สงครามเหล่าทวยเทพ', author: 'แสงดาว', category: 'แฟนตาซี',
    description: 'มนุษย์คนหนึ่งถูกลิขิตให้เป็นตัวแปรในสงครามระหว่างเทพเจ้าที่ดำเนินมานับชั่วกาล',
    imageUrl: 'https://picsum.photos/seed/popular-22/400/530',
  },
  {
    id: 'pop-23', rank: 23, title: 'คฤหาสน์แห่งความลับ', author: 'ลมดาว', category: 'ลึกลับ',
    description: 'หญิงสาวรับงานเป็นแม่บ้านในคฤหาสน์เก่า และค่อยๆ เปิดเผยความลับอันน่าขนลุก',
    imageUrl: 'https://picsum.photos/seed/popular-23/400/530',
  },
  {
    id: 'pop-24', rank: 24, title: 'นักรบสายฟ้า', author: 'ปลายฝัน', category: 'แอคชั่น',
    description: 'ชายหนุ่มผู้ควบคุมพลังสายฟ้าลุกขึ้นต่อกรกับจอมเผด็จการที่กดขี่แผ่นดิน',
    imageUrl: 'https://picsum.photos/seed/popular-24/400/530',
  },
  {
    id: 'pop-25', rank: 25, title: 'พรหมลิขิตข้ามกาลเวลา', author: 'ดาวเดือน', category: 'ดราม่า',
    description: 'จดหมายเก่าพาหญิงสาวย้อนเวลากลับไปพบรักที่ถูกลิขิตไว้ตั้งแต่อดีตชาติ',
    imageUrl: 'https://picsum.photos/seed/popular-25/400/530',
  },
]

export const MOCK_POPULAR_SECTIONS: PopularRankingSection[] = [
  {
    id: 'sec-novel',
    title: 'นิยายยอดนิยม',
    items: [
      { id: 'sn-1', rank: 1, title: 'พิชิตฟ้าเหนือดาว', author: 'ลมพัดพาน', category: 'แฟนตาซี', description: 'การผจญภัยสุดยิ่งใหญ่ข้ามมิติฟ้าดิน', imageUrl: 'https://picsum.photos/seed/sec-n1/400/530' },
      { id: 'sn-2', rank: 2, title: 'รักในราชวงศ์ถัง', author: 'แสงดาว', category: 'ประวัติศาสตร์', description: 'ความรักในราชสำนักที่เต็มไปด้วยการสมคบคิด', imageUrl: 'https://picsum.photos/seed/sec-n2/400/530' },
      { id: 'sn-3', rank: 3, title: 'ผีเสื้อเซียนสาว', author: 'ลมดาว', category: 'เทพเซียน', description: 'เซียนสาวผู้แปลงร่างเป็นผีเสื้อข้ามภพ', imageUrl: 'https://picsum.photos/seed/sec-n3/400/530' },
      { id: 'sn-4', rank: 4, title: 'นักสืบข้ามเวลา', author: 'ปลายฝัน', category: 'ลึกลับ', description: 'นักสืบที่มีพลังย้อนเวลาเพื่อคลี่คลายคดี', imageUrl: 'https://picsum.photos/seed/sec-n4/400/530' },
      { id: 'sn-5', rank: 5, title: 'บัลลังก์ทะลุฟ้า', author: 'เทพพรชัย', category: 'แอคชั่น', description: 'การต่อสู้ชิงบัลลังก์สวรรค์ที่ดุเดือด', imageUrl: 'https://picsum.photos/seed/sec-n5/400/530' },
      { id: 'sn-6', rank: 6, title: 'สายลมและดวงดาว', author: 'ดาวเดือน', category: 'โรแมนติก', description: 'รักข้ามชาติระหว่างเซียนแห่งลมและเทพแห่งดาว', imageUrl: 'https://picsum.photos/seed/sec-n6/400/530' },
    ],
  },
  {
    id: 'sec-manga',
    title: 'มังงะร้อนแรง',
    items: [
      { id: 'sm-1', rank: 1, title: 'กระบี่ผ่าสวรรค์', author: 'เพชรน้ำหนึ่ง', category: 'กระบี่', description: 'มังงะแอคชั่นสุดมันส์เกี่ยวกับดาบในตำนาน', imageUrl: 'https://picsum.photos/seed/sec-m1/400/530' },
      { id: 'sm-2', rank: 2, title: 'ยอดนักสู้วัยเรียน', author: 'แสงดาว', category: 'ต่อสู้', description: 'นักเรียนธรรมดาที่ซ่อนพลังวิทยายุทธ์เหนือชั้น', imageUrl: 'https://picsum.photos/seed/sec-m2/400/530' },
      { id: 'sm-3', rank: 3, title: 'มังกรน้อยพิชิตโลก', author: 'ลมพัดพาน', category: 'แฟนตาซี', description: 'เด็กชายผู้มีเลือดมังกรออกเดินทางผจญภัย', imageUrl: 'https://picsum.photos/seed/sec-m3/400/530' },
      { id: 'sm-4', rank: 4, title: 'สาวซ่าสไตล์ราชินี', author: 'ลมดาว', category: 'โรแมนติก', description: 'สาวเก่งกาจที่ได้พบรักกับเจ้าชายจอมซ่าส', imageUrl: 'https://picsum.photos/seed/sec-m4/400/530' },
      { id: 'sm-5', rank: 5, title: 'เทพนิยายสายฟ้า', author: 'ปลายฝัน', category: 'เทพเซียน', description: 'เทพแห่งสายฟ้าตื่นขึ้นในร่างมนุษย์ธรรมดา', imageUrl: 'https://picsum.photos/seed/sec-m5/400/530' },
      { id: 'sm-6', rank: 6, title: 'ดาบสองหน้า', author: 'เทพพรชัย', category: 'แอคชั่น', description: 'นักดาบสองมือที่มีอัตลักษณ์แฝงซ่อนอยู่', imageUrl: 'https://picsum.photos/seed/sec-m6/400/530' },
    ],
  },
  {
    id: 'sec-audio',
    title: 'หนังสือเสียงอันดับ',
    items: [
      { id: 'sa-1', rank: 1, title: 'นิทานราชวงศ์ฮั่น', author: 'ดาวเดือน', category: 'ประวัติศาสตร์', description: 'เสียงบรรยายสุดไพเราะแห่งยุคราชวงศ์ฮั่น', imageUrl: 'https://picsum.photos/seed/sec-a1/400/530' },
      { id: 'sa-2', rank: 2, title: 'ตำนานเทพไท่ซาง', author: 'เพชรน้ำหนึ่ง', category: 'เทพเซียน', description: 'เรื่องราวของเทพไท่ซางในยุคโบราณ', imageUrl: 'https://picsum.photos/seed/sec-a2/400/530' },
      { id: 'sa-3', rank: 3, title: 'รักในสายลมหนาว', author: 'แสงดาว', category: 'โรแมนติก', description: 'หนังสือเสียงโรแมนติกที่ฟังแล้วอบอุ่นหัวใจ', imageUrl: 'https://picsum.photos/seed/sec-a3/400/530' },
      { id: 'sa-4', rank: 4, title: 'คืนพระจันทร์เพ็ญ', author: 'ลมดาว', category: 'ดราม่า', description: 'ดราม่าสุดซึ้งใต้แสงจันทร์เต็มดวง', imageUrl: 'https://picsum.photos/seed/sec-a4/400/530' },
      { id: 'sa-5', rank: 5, title: 'เสียงจากฟากฟ้า', author: 'ลมพัดพาน', category: 'แฟนตาซี', description: 'นิทานแฟนตาซีที่มีเสียงประกอบสุดอลังการ', imageUrl: 'https://picsum.photos/seed/sec-a5/400/530' },
      { id: 'sa-6', rank: 6, title: 'บันทึกจากยอดเขา', author: 'ปลายฝัน', category: 'ลึกลับ', description: 'บันทึกลึกลับจากยอดเขาที่ไม่มีใครกลับมา', imageUrl: 'https://picsum.photos/seed/sec-a6/400/530' },
    ],
  },
]

export const BOOK_CATEGORIES = [
  'ทำอาหาร',
  'ปรัชญา',
  'ระบบ',
  'คลั่งรัก',
  'ต่อสู้',
  'มหาลัย',
  'เทพเซียน',
  'กระบี่',
  'เกม',
  'วันสิ้นโลก',
]

export const MOCK_BOOKS: Book[] = [
  { id: 'b1', title: 'ตำรับอาหารแห่งราชสำนัก', publisher: 'สำนักพิมพ์รสเลิศ', translator: 'แปลโดย มณีนุช', coverUrl: 'https://picsum.photos/seed/book-cook1/300/400', category: 'ทำอาหาร' },
  { id: 'b2', title: 'ครัวลับของเชฟพเนจร', publisher: 'สำนักพิมพ์รสเลิศ', translator: 'แปลโดย ธีระ', coverUrl: 'https://picsum.photos/seed/book-cook2/300/400', category: 'ทำอาหาร' },
  { id: 'b3', title: 'ว่าด้วยความหมายของชีวิต', publisher: 'สำนักพิมพ์ปัญญา', translator: 'แปลโดย สรรพสิทธิ์', coverUrl: 'https://picsum.photos/seed/book-phil1/300/400', category: 'ปรัชญา' },
  { id: 'b4', title: 'สนทนากับนักปราชญ์', publisher: 'สำนักพิมพ์ปัญญา', translator: 'แปลโดย ลลิตา', coverUrl: 'https://picsum.photos/seed/book-phil2/300/400', category: 'ปรัชญา' },
  { id: 'b5', title: 'ระบบเลเวลอัปในต่างโลก', publisher: 'สำนักพิมพ์มิติใหม่', translator: 'แปลโดย วิชิต', coverUrl: 'https://picsum.photos/seed/book-sys1/300/400', category: 'ระบบ' },
  { id: 'b6', title: 'ผู้เล่นผู้ถือระบบสูงสุด', publisher: 'สำนักพิมพ์มิติใหม่', translator: 'แปลโดย มณีนุช', coverUrl: 'https://picsum.photos/seed/book-sys2/300/400', category: 'ระบบ' },
  { id: 'b7', title: 'รักนี้คลั่งเกินห้ามใจ', publisher: 'สำนักพิมพ์ดอกรัก', translator: 'แปลโดย ลลิตา', coverUrl: 'https://picsum.photos/seed/book-love1/300/400', category: 'คลั่งรัก' },
  { id: 'b8', title: 'หัวใจที่ถูกครอบครอง', publisher: 'สำนักพิมพ์ดอกรัก', translator: 'แปลโดย ธีระ', coverUrl: 'https://picsum.photos/seed/book-love2/300/400', category: 'คลั่งรัก' },
  { id: 'b9', title: 'จอมยุทธ์ไร้พ่าย', publisher: 'สำนักพิมพ์บูรพา', translator: 'แปลโดย วิชิต', coverUrl: 'https://picsum.photos/seed/book-fight1/300/400', category: 'ต่อสู้' },
  { id: 'b10', title: 'สังเวียนเลือดแห่งนักรบ', publisher: 'สำนักพิมพ์บูรพา', translator: 'แปลโดย สรรพสิทธิ์', coverUrl: 'https://picsum.photos/seed/book-fight2/300/400', category: 'ต่อสู้' },
  { id: 'b11', title: 'วันวานในรั้วมหาลัย', publisher: 'สำนักพิมพ์วัยใส', translator: 'แปลโดย มณีนุช', coverUrl: 'https://picsum.photos/seed/book-univ1/300/400', category: 'มหาลัย' },
  { id: 'b12', title: 'รุ่นพี่ที่ฉันแอบรัก', publisher: 'สำนักพิมพ์วัยใส', translator: 'แปลโดย ลลิตา', coverUrl: 'https://picsum.photos/seed/book-univ2/300/400', category: 'มหาลัย' },
  { id: 'b13', title: 'เส้นทางสู่เทพเซียน', publisher: 'สำนักพิมพ์เซียนยุทธ์', translator: 'แปลโดย ธีระ', coverUrl: 'https://picsum.photos/seed/book-immortal1/300/400', category: 'เทพเซียน' },
  { id: 'b14', title: 'จอมเซียนผู้พลิกฟ้า', publisher: 'สำนักพิมพ์เซียนยุทธ์', translator: 'แปลโดย วิชิต', coverUrl: 'https://picsum.photos/seed/book-immortal2/300/400', category: 'เทพเซียน' },
  { id: 'b15', title: 'กระบี่เดียวดายใต้หล้า', publisher: 'สำนักพิมพ์บูรพา', translator: 'แปลโดย สรรพสิทธิ์', coverUrl: 'https://picsum.photos/seed/book-sword1/300/400', category: 'กระบี่' },
  { id: 'b16', title: 'ตำนานกระบี่เทวดา', publisher: 'สำนักพิมพ์บูรพา', translator: 'แปลโดย มณีนุช', coverUrl: 'https://picsum.photos/seed/book-sword2/300/400', category: 'กระบี่' },
  { id: 'b17', title: 'ติดอยู่ในเกมเอาชีวิตรอด', publisher: 'สำนักพิมพ์มิติใหม่', translator: 'แปลโดย ลลิตา', coverUrl: 'https://picsum.photos/seed/book-game1/300/400', category: 'เกม' },
  { id: 'b18', title: 'เกมเมอร์อันดับหนึ่งของโลก', publisher: 'สำนักพิมพ์มิติใหม่', translator: 'แปลโดย ธีระ', coverUrl: 'https://picsum.photos/seed/book-game2/300/400', category: 'เกม' },
  { id: 'b19', title: 'วันสิ้นโลกที่ยังไม่จบ', publisher: 'สำนักพิมพ์มิติใหม่', translator: 'แปลโดย วิชิต', coverUrl: 'https://picsum.photos/seed/book-apoc1/300/400', category: 'วันสิ้นโลก' },
  { id: 'b20', title: 'ผู้รอดชีวิตคนสุดท้าย', publisher: 'สำนักพิมพ์มิติใหม่', translator: 'แปลโดย สรรพสิทธิ์', coverUrl: 'https://picsum.photos/seed/book-apoc2/300/400', category: 'วันสิ้นโลก' },
]

export const MOCK_LATEST_NOVELS: Novel[] = [
  {
    id: '1',
    title: 'ใช้รักจนสุดใจ',
    category: 'แฟนตาซี · แปล',
    description: 'เรื่องราวของหญิงสาวผู้เดินทางข้ามมิติเพื่อตามหาชายที่เธอรัก ผจญภัยในอาณาจักรโบราณท่ามกลางสงครามและการทรยศ',
    coverUrl: 'https://picsum.photos/seed/novel1/200/300',
    badgeText: 'เพิ่มตอนฟรี 11 วัน',
    views: '6K',
    episodes: 382,
    comments: 13,
  },
  {
    id: '2',
    title: 'โชคชะตาที่ฝ่าฝืนไม่ได้',
    category: 'แอ็กชัน · แปล',
    description: 'นักฆ่าจากโลกสมัยใหม่ถูกส่งย้อนกลับไปสู่ราชวงศ์ถัง ต้องใช้ความรู้ล้ำสมัยเพื่อเอาตัวรอดและปกป้องคนที่รัก',
    coverUrl: 'https://picsum.photos/seed/novel2/200/300',
    badgeText: 'อัปเดตใหม่',
    views: '4.2K',
    episodes: 85,
    comments: 9,
  },
  {
    id: '4',
    title: 'หนึ่งฝันในโลกีย์',
    category: 'โรแมนซ์ · แต่งเอง',
    description: 'สองวิญญาณที่พบกันซ้ำแล้วซ้ำเล่าในทุกชาติภพ ชะตากรรมนำพาให้พวกเขามาพบกัน แต่กลับพรากจากกันทุกครั้ง',
    coverUrl: 'https://picsum.photos/seed/novel4/200/300',
    views: '3.8K',
    episodes: 60,
    comments: 21,
  },
  {
    id: '8',
    title: 'ชีวิตลอยล่องดั่งความฝัน',
    category: 'อิงประวัติศาสตร์ · แปล',
    description: 'หมอสาวจากศตวรรษที่ 21 ข้ามเวลาไปในยุคราชวงศ์ชิง ต้องใช้ความรู้ทางการแพทย์สมัยใหม่เพื่อช่วยชีวิตผู้คน',
    coverUrl: 'https://picsum.photos/seed/novel5/200/300',
    badgeText: 'เพิ่มตอนฟรี 7 วัน',
    views: '2.9K',
    episodes: 70,
    comments: 7,
  },
  {
    id: '10',
    title: 'พรหมลิขิตคือเธอ',
    category: 'คอเมดี้ · แต่งเอง',
    description: 'นักเขียนหนุ่มพบว่าตัวละครในนิยายของเขาออกมาจากหนังสือจริงๆ และกำลังเปลี่ยนแปลงโลกแห่งความเป็นจริง',
    coverUrl: 'https://picsum.photos/seed/novel7/200/300',
    views: '2.1K',
    episodes: 40,
    comments: 15,
  },
  {
    id: '12',
    title: 'รักนี้ยังรอคอย',
    category: 'โรแมนซ์ · แต่งเอง',
    description: 'เรื่องราวของสองคนที่เติบโตมาด้วยกัน ห่างหายไปสิบปี และชะตาพัดพาให้กลับมาพบกันอีกครั้งในเมืองที่ไม่รู้จัก',
    coverUrl: 'https://picsum.photos/seed/novel8/200/300',
    badgeText: 'อัปเดตใหม่',
    views: '1.8K',
    episodes: 50,
    comments: 11,
  },
]

export const POPULAR_STORY_CATEGORIES = [
  'โรแมนซ์',
  'โรแมนซ์แฟนตาซี',
  'ดราม่า',
  'แอคชั่น',
  'แฟนตาซี',
  'LGBTQ+ / Y',
  'ตลก',
  'ระทึกขวัญ',
]

export const MOCK_POPULAR_STORIES: Story[] = [
  { id: 'p1', title: 'รักแรกใต้แสงจันทร์', category: 'โรแมนซ์', coverUrl: 'https://picsum.photos/seed/pop-rom1/320/240', views: '39M', isNew: true },
  { id: 'p2', title: 'สัญญารักนิรันดร์', category: 'โรแมนซ์', coverUrl: 'https://picsum.photos/seed/pop-rom2/320/240', views: '24M' },
  { id: 'p3', title: 'หัวใจสองดวง', category: 'โรแมนซ์', coverUrl: 'https://picsum.photos/seed/pop-rom3/320/240', views: '12M' },
  { id: 'p4', title: 'ราชินีแห่งดินแดนเวทมนตร์', category: 'โรแมนซ์แฟนตาซี', coverUrl: 'https://picsum.photos/seed/pop-rf1/320/240', views: '31M', isNew: true },
  { id: 'p5', title: 'เจ้าหญิงกับมังกรเงิน', category: 'โรแมนซ์แฟนตาซี', coverUrl: 'https://picsum.photos/seed/pop-rf2/320/240', views: '18M' },
  { id: 'p6', title: 'คำสาปแห่งราตรี', category: 'โรแมนซ์แฟนตาซี', coverUrl: 'https://picsum.photos/seed/pop-rf3/320/240', views: '9.2M' },
  { id: 'p7', title: 'น้ำตาในสายฝน', category: 'ดราม่า', coverUrl: 'https://picsum.photos/seed/pop-dra1/320/240', views: '15M' },
  { id: 'p8', title: 'บทเพลงของครอบครัว', category: 'ดราม่า', coverUrl: 'https://picsum.photos/seed/pop-dra2/320/240', views: '8.7M', isNew: true },
  { id: 'p9', title: 'นักรบเงาพิฆาต', category: 'แอคชั่น', coverUrl: 'https://picsum.photos/seed/pop-act1/320/240', views: '27M' },
  { id: 'p10', title: 'สมรภูมิเหล็กกล้า', category: 'แอคชั่น', coverUrl: 'https://picsum.photos/seed/pop-act2/320/240', views: '13M', isNew: true },
  { id: 'p11', title: 'ดินแดนเหนือสายลม', category: 'แฟนตาซี', coverUrl: 'https://picsum.photos/seed/pop-fan1/320/240', views: '33M' },
  { id: 'p12', title: 'ตำนานศิลาทั้งเจ็ด', category: 'แฟนตาซี', coverUrl: 'https://picsum.photos/seed/pop-fan2/320/240', views: '21M', isNew: true },
  { id: 'p13', title: 'รักนี้ไม่มีกรอบ', category: 'LGBTQ+ / Y', coverUrl: 'https://picsum.photos/seed/pop-y1/320/240', views: '17M' },
  { id: 'p14', title: 'หัวใจสีรุ้ง', category: 'LGBTQ+ / Y', coverUrl: 'https://picsum.photos/seed/pop-y2/320/240', views: '10M', isNew: true },
  { id: 'p15', title: 'ป่วนรักวุ่นใจ', category: 'ตลก', coverUrl: 'https://picsum.photos/seed/pop-com1/320/240', views: '14M' },
  { id: 'p16', title: 'เพื่อนซี้สี่ขา', category: 'ตลก', coverUrl: 'https://picsum.photos/seed/pop-com2/320/240', views: '6M' },
  { id: 'p17', title: 'คฤหาสน์เงียบงัน', category: 'ระทึกขวัญ', coverUrl: 'https://picsum.photos/seed/pop-thr1/320/240', views: '22M', isNew: true },
  { id: 'p18', title: 'เสียงกระซิบยามวิกาล', category: 'ระทึกขวัญ', coverUrl: 'https://picsum.photos/seed/pop-thr2/320/240', views: '11M' },
]

export const DAILY_MANGA_DAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']

const RAW_DAILY_MANGA: Omit<DailyManga, 'episodes'>[] = [
  // จันทร์ (11 เรื่อง → 2 หน้า)
  { id: 'dm1', title: 'ดาบเทพสังหาร', author: 'ดาวเดือน', coverUrl: 'https://picsum.photos/seed/dm1/300/400', day: 'จันทร์' },
  { id: 'dm2', title: 'จอมเวทย์พลิกฟ้า', author: 'ลมดาว', coverUrl: 'https://picsum.photos/seed/dm2/300/400', day: 'จันทร์' },
  { id: 'dm3', title: 'นักรบเงาราตรี', author: 'ปลายฝัน', coverUrl: 'https://picsum.photos/seed/dm3/300/400', day: 'จันทร์' },
  { id: 'dm4', title: 'ราชันมังกรดำ', author: 'ดาวเดือน', coverUrl: 'https://picsum.photos/seed/dm4/300/400', day: 'จันทร์' },
  { id: 'dm5', title: 'เทพศาสตรา', author: 'ลมดาว', coverUrl: 'https://picsum.photos/seed/dm5/300/400', day: 'จันทร์' },
  { id: 'dm6', title: 'ยอดยุทธ์ไร้เทียมทาน', author: 'ปลายฝัน', coverUrl: 'https://picsum.photos/seed/dm6/300/400', day: 'จันทร์' },
  { id: 'dm7', title: 'ผนึกมารโบราณ', author: 'ดาวเดือน', coverUrl: 'https://picsum.photos/seed/dm7/300/400', day: 'จันทร์' },
  { id: 'dm8', title: 'ดินแดนเซียนกลับชาติ', author: 'ลมดาว', coverUrl: 'https://picsum.photos/seed/dm8/300/400', day: 'จันทร์' },
  { id: 'dm9', title: 'จันทราสีเลือด', author: 'ปลายฝัน', coverUrl: 'https://picsum.photos/seed/dm9/300/400', day: 'จันทร์' },
  { id: 'dm10', title: 'ศึกชิงบัลลังก์สวรรค์', author: 'ดาวเดือน', coverUrl: 'https://picsum.photos/seed/dm10/300/400', day: 'จันทร์' },
  { id: 'dm11', title: 'ตำนานกระบี่นิรันดร์', author: 'ลมดาว', coverUrl: 'https://picsum.photos/seed/dm11/300/400', day: 'จันทร์' },
  // อังคาร
  { id: 'dm12', title: 'อสูรกายแห่งรัตติกาล', author: 'ปลายฝัน', coverUrl: 'https://picsum.photos/seed/dm12/300/400', day: 'อังคาร' },
  { id: 'dm13', title: 'ผู้พิทักษ์ธาตุไฟ', author: 'ดาวเดือน', coverUrl: 'https://picsum.photos/seed/dm13/300/400', day: 'อังคาร' },
  { id: 'dm14', title: 'จิ้งจอกเก้าหาง', author: 'ลมดาว', coverUrl: 'https://picsum.photos/seed/dm14/300/400', day: 'อังคาร' },
  { id: 'dm15', title: 'เจ้าสาวปีศาจ', author: 'ปลายฝัน', coverUrl: 'https://picsum.photos/seed/dm15/300/400', day: 'อังคาร' },
  { id: 'dm16', title: 'หมัดทำลายล้าง', author: 'ดาวเดือน', coverUrl: 'https://picsum.photos/seed/dm16/300/400', day: 'อังคาร' },
  // พุธ
  { id: 'dm17', title: 'นักษัตรพิฆาต', author: 'ลมดาว', coverUrl: 'https://picsum.photos/seed/dm17/300/400', day: 'พุธ' },
  { id: 'dm18', title: 'เวทมนตร์ต้องห้าม', author: 'ปลายฝัน', coverUrl: 'https://picsum.photos/seed/dm18/300/400', day: 'พุธ' },
  { id: 'dm19', title: 'อัศวินดวงดาว', author: 'ดาวเดือน', coverUrl: 'https://picsum.photos/seed/dm19/300/400', day: 'พุธ' },
  { id: 'dm20', title: 'ปริศนาหอคอยมรณะ', author: 'ลมดาว', coverUrl: 'https://picsum.photos/seed/dm20/300/400', day: 'พุธ' },
  // พฤหัสบดี
  { id: 'dm21', title: 'จอมโจรสะท้านปฐพี', author: 'ปลายฝัน', coverUrl: 'https://picsum.photos/seed/dm21/300/400', day: 'พฤหัสบดี' },
  { id: 'dm22', title: 'มนตราแห่งสายลม', author: 'ดาวเดือน', coverUrl: 'https://picsum.photos/seed/dm22/300/400', day: 'พฤหัสบดี' },
  { id: 'dm23', title: 'ราชาแห่งท้องทะเล', author: 'ลมดาว', coverUrl: 'https://picsum.photos/seed/dm23/300/400', day: 'พฤหัสบดี' },
  // ศุกร์
  { id: 'dm24', title: 'เซียนกระบี่จอมขมังเวทย์', author: 'ปลายฝัน', coverUrl: 'https://picsum.photos/seed/dm24/300/400', day: 'ศุกร์' },
  { id: 'dm25', title: 'นักล่าอสูร', author: 'ดาวเดือน', coverUrl: 'https://picsum.photos/seed/dm25/300/400', day: 'ศุกร์' },
  { id: 'dm26', title: 'ดวงตาแห่งหายนะ', author: 'ลมดาว', coverUrl: 'https://picsum.photos/seed/dm26/300/400', day: 'ศุกร์' },
  { id: 'dm27', title: 'อาณาจักรใต้พิภพ', author: 'ปลายฝัน', coverUrl: 'https://picsum.photos/seed/dm27/300/400', day: 'ศุกร์' },
  { id: 'dm28', title: 'เพลิงสงครามเทพ', author: 'ดาวเดือน', coverUrl: 'https://picsum.photos/seed/dm28/300/400', day: 'ศุกร์' },
  // เสาร์
  { id: 'dm29', title: 'ภูตน้อยกับจอมเวท', author: 'ลมดาว', coverUrl: 'https://picsum.photos/seed/dm29/300/400', day: 'เสาร์' },
  { id: 'dm30', title: 'ตำนานเก้ามังกร', author: 'ปลายฝัน', coverUrl: 'https://picsum.photos/seed/dm30/300/400', day: 'เสาร์' },
  { id: 'dm31', title: 'ราตรีล่าสังหาร', author: 'ดาวเดือน', coverUrl: 'https://picsum.photos/seed/dm31/300/400', day: 'เสาร์' },
  { id: 'dm32', title: 'แดนสนธยา', author: 'ลมดาว', coverUrl: 'https://picsum.photos/seed/dm32/300/400', day: 'เสาร์' },
  // อาทิตย์
  { id: 'dm33', title: 'ผู้สืบทอดเทพอสนี', author: 'ปลายฝัน', coverUrl: 'https://picsum.photos/seed/dm33/300/400', day: 'อาทิตย์' },
  { id: 'dm34', title: 'จักรพรรดิอมตะ', author: 'ดาวเดือน', coverUrl: 'https://picsum.photos/seed/dm34/300/400', day: 'อาทิตย์' },
  { id: 'dm35', title: 'วิหคเพลิงคืนชีพ', author: 'ลมดาว', coverUrl: 'https://picsum.photos/seed/dm35/300/400', day: 'อาทิตย์' },
]

// ระยะเวลาที่อัพโหลด เรียงจากใหม่สุดไปเก่า (ใช้สร้างตอนล่าสุด 3 ตอน)
const UPLOAD_AGO = [
  '30 นาทีที่แล้ว',
  '3 ชม. ที่แล้ว',
  '12 ชม. ที่แล้ว',
  '1 วันที่แล้ว',
  '2 วันที่แล้ว',
  '4 วันที่แล้ว',
]

function makeDailyMangaEpisodes(id: string, seed: number): DailyMangaEpisode[] {
  const latest = 40 + ((seed * 7) % 160) // เลขตอนล่าสุดต่างกันไปในแต่ละเรื่อง
  const freshness = seed % 3 // ความสดของตอนล่าสุด
  return [0, 1, 2].map((k) => ({
    id: `${id}-ep${latest - k}`,
    label: `ตอนที่ ${latest - k}`,
    uploadedAt: UPLOAD_AGO[Math.min(freshness + k, UPLOAD_AGO.length - 1)],
  }))
}

export const MOCK_DAILY_MANGA: DailyManga[] = RAW_DAILY_MANGA.map((m, i) => ({
  ...m,
  episodes: makeDailyMangaEpisodes(m.id, i + 1),
}))

// ===== Home landing — "อัปเดตล่าสุด" list (ported from index_78 mockup) =====
export const MOCK_HOME_UPDATES: HomeUpdateItem[] = [
  { id: 'u1', type: 'novel', title: 'บุปผาในม่านไหม', author: 'มณีนุช', genreLabel: 'โรแมนซ์', originLabel: 'แต่งเอง', description: 'หญิงสาวช่างปักผ้าในวังถูกเลือกให้ถวายงานองค์ชายที่ไม่มีใครกล้าเข้าใกล้ แต่ทำไมเขาถึงมองเธอด้วยสายตาที่อบอุ่นเช่นนี้...', coverUrl: 'https://picsum.photos/seed/yh-u1/120/160', views: '6K', episodeLabel: 'ตอนที่ 38', updatedAtLabel: '13-06-2026 08:24' },
  { id: 'u2', type: 'novel', title: 'ระบบรักนี้ต้องชนะ', author: 'สรรพสิทธิ์', genreLabel: 'ระบบ', originLabel: 'แปล', description: 'เกมจำลองความรักที่เธอไม่เคยอยากเล่น กลับกลายเป็นเดิมพันชีวิตจริง เมื่อทุกตัวเลือกส่งผลต่อโชคชะตาของเมืองทั้งเมือง', coverUrl: 'https://picsum.photos/seed/yh-u2/120/160', views: '4.2K', episodeLabel: 'ตอนที่ 59', updatedAtLabel: '13-06-2026 05:41' },
  { id: 'u3', type: 'novel', title: 'หมั้นซ้อนรักของเสนาบดี', author: 'มณีนุช', genreLabel: 'วังหลัง', originLabel: 'แต่งเอง', description: 'สองตระกูลใหญ่ผูกมัดด้วยสัญญาหมั้นที่ไม่มีใครต้องการ แต่เมื่อทั้งคู่เริ่มรู้จักกันจริง ความรักที่ไม่ได้เลือกอาจกลายเป็นสิ่งที่ขาดไม่ได้', coverUrl: 'https://picsum.photos/seed/yh-u3/120/160', views: '3.8K', episodeLabel: 'ตอนที่ 21', updatedAtLabel: '13-06-2026 02:18' },
  { id: 'u4', type: 'novel', title: 'รักแรกในม่านหมอก', author: 'ลลิตา', genreLabel: 'โรแมนซ์', originLabel: 'แต่งเอง', description: 'เมื่อสายหมอกยามเช้าบังสายตา เธอกลับพบว่าชายที่เธอหลีกเลี่ยงมาตลอดนั้น คือคนที่เข้าใจเธอมากที่สุดในโลก', coverUrl: 'https://picsum.photos/seed/yh-b4/120/160', views: '2.1K', episodeLabel: 'ตอนที่ 14', updatedAtLabel: '12-06-2026 21:45' },
  { id: 'u5', type: 'audiobook', title: 'นางพญาเงาราตรี', author: 'สรรพสิทธิ์', genreLabel: 'แอ็กชัน', originLabel: 'แปล', description: 'จากองค์หญิงผู้ถูกลืม สู่นักรบผู้ยิ่งใหญ่แห่งยามค่ำคืน เธอจะพิสูจน์ให้โลกรู้ว่าความมืดไม่ใช่ศัตรู แต่คือพลังของเธอ', coverUrl: 'https://picsum.photos/seed/yh-r5/120/160', views: '5.6K', episodeLabel: 'ตอนที่ 34', updatedAtLabel: '12-06-2026 22:33' },
  { id: 'u6', type: 'manga', title: 'เกิดใหม่ในวังหลัง', author: 'ลลิตา', genreLabel: 'ดราม่า', originLabel: 'มังงะ', description: 'เธอย้อนเวลากลับมาพร้อมความทรงจำจากชาติที่แล้ว คราวนี้เธอจะไม่ยอมให้ใครมาทำลายชีวิตของเธออีกต่อไป', coverUrl: 'https://picsum.photos/seed/yh-r3/120/160', views: '7.3K', episodeLabel: 'ตอนที่ 47', updatedAtLabel: '13-06-2026 07:09' },
  { id: 'u7', type: 'novel', title: 'ใต้เงาจันทร์ ณ วังหลวง', author: 'ธีระ', genreLabel: 'ดราม่า', originLabel: 'แปล', description: 'คืนพระจันทร์เต็มดวงเป็นคืนที่อันตรายที่สุดในวังหลวง เธอต้องหาทางรอดชีวิตท่ามกลางแผนการของเหล่าขุนนาง', coverUrl: 'https://picsum.photos/seed/yh-b2/120/160', views: '2.8K', episodeLabel: 'ตอนที่ 28', updatedAtLabel: '13-06-2026 06:55' },
  { id: 'u8', type: 'novel', title: 'เกราะทองของนางพญา', author: 'วิชิต', genreLabel: 'แอ็กชัน', originLabel: 'แปล', description: 'นางพญาผู้สวมเกราะทองออกรบเพื่อปกป้องอาณาจักร แต่เบื้องหลังเกราะนั้นคือหัวใจที่เจ็บปวด', coverUrl: 'https://picsum.photos/seed/yh-b3/120/160', views: '4.1K', episodeLabel: 'ตอนที่ 52', updatedAtLabel: '13-06-2026 05:30' },
  { id: 'u9', type: 'novel', title: 'รักนี้ข้ามภพชาติ', author: 'วิชิต', genreLabel: 'โรแมนซ์', originLabel: 'นิยาย', description: 'ทุกชาติภพที่พบกัน โชคชะตาพัดพาให้ห่างกัน แต่ดวงวิญญาณสองดวงนี้ยังคงค้นหากันไม่หยุด', coverUrl: 'https://picsum.photos/seed/yh-r4/120/160', views: '9.2K', episodeLabel: 'ตอนที่ 67', updatedAtLabel: '13-06-2026 04:12' },
  { id: 'u10', type: 'novel', title: 'ใต้ร่มต้นท้อแห่งรัก', author: 'มณีนุช', genreLabel: 'โรแมนซ์', originLabel: 'นิยาย', description: 'ต้นท้อพันปีเป็นพยานรักของสองคน เธอรอคอยใต้ร่มนั้นทุกปี แต่เขากลับไม่เคยมา', coverUrl: 'https://picsum.photos/seed/yh-r6/120/160', views: '3.4K', episodeLabel: 'ตอนที่ 19', updatedAtLabel: '13-06-2026 03:47' },
  { id: 'u11', type: 'manga', title: 'เกมรักของเจ้าชายมังกร', author: 'ธีระ', genreLabel: 'คอเมดี้', originLabel: 'มังงะ', description: 'เจ้าชายมังกรที่ไม่เคยแพ้ใคร กลับพบว่าหัวใจของตัวเองแพ้สาวธรรมดาคนหนึ่ง', coverUrl: 'https://picsum.photos/seed/yh-r7/120/160', views: '5.1K', episodeLabel: 'ตอนที่ 23', updatedAtLabel: '13-06-2026 02:20' },
  { id: 'u12', type: 'novel', title: 'เจ้าสาวจำเป็นของท่านเสนาบดี', author: 'ลลิตา', genreLabel: 'วังหลัง', originLabel: 'นิยาย', description: 'การแต่งงานที่ไม่มีใครเลือก กลายเป็นจุดเริ่มต้นของความรักที่ไม่คาดฝัน', coverUrl: 'https://picsum.photos/seed/yh-r8/120/160', views: '6.8K', episodeLabel: 'ตอนที่ 41', updatedAtLabel: '13-06-2026 01:05' },
  { id: 'u13', type: 'novel', title: 'ระบบรักนี้ต้องชนะ ภาค 2', author: 'สรรพสิทธิ์', genreLabel: 'ระบบ', originLabel: 'แปล', description: 'หลังจากผ่านด่านทั้งหมดมาแล้ว เกมรักภาค 2 เริ่มต้นด้วยปริศนาที่ยากกว่าเดิม', coverUrl: 'https://picsum.photos/seed/yh-b5/120/160', views: '4.5K', episodeLabel: 'ตอนที่ 12', updatedAtLabel: '12-06-2026 23:50' },
  { id: 'u14', type: 'audiobook', title: 'บุปผาในม่านไหม ตอนพิเศษ', author: 'มณีนุช', genreLabel: 'โรแมนซ์', originLabel: 'แต่งเอง', description: 'เรื่องราวพิเศษที่เล่าถึงวันก่อนที่เธอจะก้าวเข้าสู่วัง', coverUrl: 'https://picsum.photos/seed/yh-r9/120/160', views: '3.1K', episodeLabel: 'ตอนพิเศษ 3', updatedAtLabel: '12-06-2026 21:15' },
  { id: 'u15', type: 'novel', title: 'จอมเซียนผู้พลิกฟ้า', author: 'ธีระ', genreLabel: 'เทพเซียน', originLabel: 'แปล', description: 'จากสาวกระจอกสู่จอมเซียนสูงสุด เส้นทางแห่งการพิสูจน์ตัวเองที่ไม่มีใครคาดถึง', coverUrl: 'https://picsum.photos/seed/yh-r10/120/160', views: '8.8K', episodeLabel: 'ตอนที่ 88', updatedAtLabel: '12-06-2026 20:30' },
  { id: 'u16', type: 'novel', title: 'ชีวิตลอยล่องดั่งความฝัน', author: 'ลลิตา', genreLabel: 'อิงประวัติศาสตร์', originLabel: 'แปล', description: 'หมอสาวจากศตวรรษที่ 21 ข้ามเวลาไปในยุคราชวงศ์ชิง', coverUrl: 'https://picsum.photos/seed/yh-b1/120/160', views: '4.4K', episodeLabel: 'ตอนที่ 44', updatedAtLabel: '12-06-2026 19:22' },
  { id: 'u17', type: 'novel', title: 'เส้นทางสู่เทพเซียน', author: 'วิชิต', genreLabel: 'เทพเซียน', originLabel: 'แปล', description: 'ชายหนุ่มผู้ไม่มีพรสวรรค์ แต่มีใจที่ไม่ยอมแพ้', coverUrl: 'https://picsum.photos/seed/yh-b2/120/160', views: '15.6K', episodeLabel: 'ตอนที่ 156', updatedAtLabel: '12-06-2026 18:45' },
  { id: 'u18', type: 'audiobook', title: 'โชคชะตาที่ฝ่าฝืนไม่ได้', author: 'สรรพสิทธิ์', genreLabel: 'แอ็กชัน', originLabel: 'แปล', description: 'นักฆ่าจากโลกสมัยใหม่ถูกส่งย้อนกลับไปสู่ราชวงศ์ถัง', coverUrl: 'https://picsum.photos/seed/yh-b3/120/160', views: '7.3K', episodeLabel: 'ตอนที่ 73', updatedAtLabel: '12-06-2026 17:10' },
  { id: 'u19', type: 'novel', title: 'ย้อนเวลาพร้อมมือถือเทพ', author: 'ธีระ', genreLabel: 'แฟนตาซี', originLabel: 'แปล', description: 'ย้อนเวลากลับไปพร้อมโทรศัพท์จากอนาคต เขาจะเปลี่ยนแปลงประวัติศาสตร์ได้ไหม', coverUrl: 'https://picsum.photos/seed/yh-b4/120/160', views: '20.1K', episodeLabel: 'ตอนที่ 201', updatedAtLabel: '12-06-2026 16:33' },
  { id: 'u20', type: 'novel', title: 'พรหมลิขิตคือเธอ', author: 'มณีนุช', genreLabel: 'คอเมดี้', originLabel: 'แต่งเอง', description: 'นักเขียนหนุ่มพบว่าตัวละครในนิยายของเขาออกมาจากหนังสือจริงๆ', coverUrl: 'https://picsum.photos/seed/yh-b5/120/160', views: '3.5K', episodeLabel: 'ตอนที่ 35', updatedAtLabel: '12-06-2026 15:58' },
  { id: 'u21', type: 'novel', title: 'รักนี้ยังรอคอย', author: 'ลลิตา', genreLabel: 'โรแมนซ์', originLabel: 'แต่งเอง', description: 'สิบปีที่ห่างกัน แต่ความรักไม่เคยจางหาย', coverUrl: 'https://picsum.photos/seed/yh-b6/120/160', views: '1.8K', episodeLabel: 'ตอนที่ 18', updatedAtLabel: '12-06-2026 14:20' },
  { id: 'u22', type: 'manga', title: 'สงครามดาวเคราะห์มรณะ', author: 'วิชิต', genreLabel: 'แฟนตาซี', originLabel: 'มังงะ', description: 'เมื่อดาวเคราะห์สองดวงชนกัน มีเพียงผู้ที่แข็งแกร่งพอเท่านั้นที่จะรอดชีวิต', coverUrl: 'https://picsum.photos/seed/yh-r3/120/160', views: '9.5K', episodeLabel: 'ตอนที่ 95', updatedAtLabel: '12-06-2026 10:05' },
  { id: 'u23', type: 'novel', title: 'ราชินีหัวใจมังกร', author: 'มณีนุช', genreLabel: 'แฟนตาซี', originLabel: 'นิยาย', description: 'เธอถูกโชคชะตาเลือกให้เป็นราชินีมังกร แต่หัวใจของเธอยังเป็นของมนุษย์', coverUrl: 'https://picsum.photos/seed/yh-r4/120/160', views: '6.2K', episodeLabel: 'ตอนที่ 62', updatedAtLabel: '12-06-2026 09:15' },
  { id: 'u24', type: 'audiobook', title: 'ตำนานกระบี่เทวดา', author: 'สรรพสิทธิ์', genreLabel: 'กำลังภายใน', originLabel: 'แปล', description: 'กระบี่ที่สืบทอดมาร้อยชั่วอายุคน ในมือของเขา มันจะกลายเป็นตำนานใหม่', coverUrl: 'https://picsum.photos/seed/yh-r5/120/160', views: '13.3K', episodeLabel: 'ตอนที่ 133', updatedAtLabel: '12-06-2026 08:30' },
  { id: 'u25', type: 'novel', title: 'หัวใจที่ถูกครอบครอง', author: 'ลลิตา', genreLabel: 'โรแมนซ์', originLabel: 'นิยาย', description: 'เธอบอกตัวเองว่าไม่ได้รัก แต่ทำไมหัวใจถึงเต้นแรงทุกครั้งที่เห็นเขา', coverUrl: 'https://picsum.photos/seed/yh-r6/120/160', views: '2.9K', episodeLabel: 'ตอนที่ 29', updatedAtLabel: '12-06-2026 07:48' },
  { id: 'u26', type: 'manga', title: 'ติดอยู่ในเกมเอาชีวิตรอด', author: 'ธีระ', genreLabel: 'ระบบ', originLabel: 'มังงะ', description: 'เกมเมอร์ที่ติดอยู่ในเกมสุดอันตราย ทุกชีวิตที่เสียไปคือจริง', coverUrl: 'https://picsum.photos/seed/yh-r7/120/160', views: '7.7K', episodeLabel: 'ตอนที่ 77', updatedAtLabel: '12-06-2026 06:20' },
  { id: 'u27', type: 'novel', title: 'รักนี้คลั่งเกินห้ามใจ', author: 'มณีนุช', genreLabel: 'โรแมนซ์', originLabel: 'แต่งเอง', description: 'ความรักแบบนี้ไม่มีใครสั่งหัวใจได้ แม้กระทั่งตัวเธอเอง', coverUrl: 'https://picsum.photos/seed/yh-r8/120/160', views: '4.5K', episodeLabel: 'ตอนที่ 45', updatedAtLabel: '12-06-2026 05:10' },
  { id: 'u28', type: 'audiobook', title: 'วันวานในรั้วมหาลัย', author: 'วิชิต', genreLabel: 'โรแมนซ์', originLabel: 'แปล', description: 'ความทรงจำในรั้วมหาลัยที่ทั้งคู่พยายามลืม แต่กลับไม่มีวันลืมได้', coverUrl: 'https://picsum.photos/seed/yh-r9/120/160', views: '1.6K', episodeLabel: 'ตอนที่ 16', updatedAtLabel: '12-06-2026 03:55' },
  { id: 'u29', type: 'novel', title: 'จักรพรรดินีดาวดิน', author: 'ลลิตา', genreLabel: 'วังหลัง', originLabel: 'แปล', description: 'จากองค์หญิงชั้นต่ำสู่จักรพรรดินีผู้กุมชะตาแผ่นดิน', coverUrl: 'https://picsum.photos/seed/yh-r10/120/160', views: '18.9K', episodeLabel: 'ตอนที่ 189', updatedAtLabel: '12-06-2026 02:40' },
  { id: 'u30', type: 'manga', title: 'สังเวียนเลือดแห่งนักรบ', author: 'ธีระ', genreLabel: 'แอ็กชัน', originLabel: 'มังงะ', description: 'ในสังเวียนที่ไม่มีกฎ มีแค่แข็งแรงเท่านั้นที่รอดชีวิต', coverUrl: 'https://picsum.photos/seed/yh-b2/120/160', views: '8.8K', episodeLabel: 'ตอนที่ 88', updatedAtLabel: '11-06-2026 23:30' },
]
