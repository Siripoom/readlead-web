import type { Work, Episode, Creator, TopUpOption, Review, UserProfile, HomePromotionSlide, DiscountNovelItem, RankingNovelItem, RankingShowcaseItem, SidebarItem, PopularRankingItem, PopularRankingSection } from './types'

export const MOCK_WORKS: Work[] = [
  {
    id: '1', type: 'novel', title: '用情至深', coverUrl: 'https://picsum.photos/seed/novel1/200/300',
    synopsis: 'เรื่องราวของหญิงสาวผู้เดินทางข้ามมิติเพื่อตามหาชายที่เธอรัก ผจญภัยในอาณาจักรโบราณท่ามกลางสงครามและการทรยศ',
    genres: ['romance', 'fantasy'], tags: ['穿越', 'ชีวิตหลังความตาย', 'ราชวงศ์'],
    authorId: 'c1', authorName: 'ปลายฝัน', status: 'ongoing',
    rating: 4.8, voteCount: 12400, viewCount: 890000, readCount: 1140000, vipTopUpTotal: 485000, episodeCount: 120,
    latestEpisode: 'ตอนที่ 120: คืนแห่งดวงจันทร์แดง', isFeatured: true, rankingScore: 98,
    updatedAt: '2026-05-15T10:00:00Z',
  },
  {
    id: '2', type: 'novel', title: '天命难违', coverUrl: 'https://picsum.photos/seed/novel2/200/300',
    synopsis: 'นักฆ่าจากโลกสมัยใหม่ถูกส่งย้อนกลับไปสู่ราชวงศ์ถัง ต้องใช้ความรู้ล้ำสมัยเพื่อเอาตัวรอดและปกป้องคนที่รัก',
    genres: ['action', 'historical'], tags: ['ย้อนอดีต', 'นักฆ่า', 'ราชสำนัก'],
    authorId: 'c2', authorName: 'ลมดาว', status: 'ongoing',
    rating: 4.6, voteCount: 8900, viewCount: 650000, readCount: 790000, vipTopUpTotal: 342000, episodeCount: 85,
    latestEpisode: 'ตอนที่ 85: ดาบที่ซ่อนอยู่', isFeatured: true, rankingScore: 92,
    updatedAt: '2026-05-14T08:00:00Z',
  },
  {
    id: '3', type: 'novel', title: '锦绣江山', coverUrl: 'https://picsum.photos/seed/novel3/200/300',
    synopsis: 'เจ้าหญิงผู้ถูกลืมลุกขึ้นมากอบกู้อาณาจักรด้วยสติปัญญาและความกล้าหาญ เผชิญหน้ากับการสมคบคิดในราชสำนัก',
    genres: ['drama', 'historical'], tags: ['เจ้าหญิง', 'การเมือง', 'อำนาจ'],
    authorId: 'c1', authorName: 'ปลายฝัน', status: 'completed',
    rating: 4.9, voteCount: 21000, viewCount: 1200000, readCount: 1480000, vipTopUpTotal: 562000, episodeCount: 200,
    latestEpisode: null, isFeatured: true, rankingScore: 99,
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: '4', type: 'novel', title: '红尘一梦', coverUrl: 'https://picsum.photos/seed/novel4/200/300',
    synopsis: 'สองวิญญาณที่พบกันซ้ำแล้วซ้ำเล่าในทุกชาติภพ ชะตากรรมนำพาให้พวกเขามาพบกัน แต่กลับพรากจากกันทุกครั้ง',
    genres: ['romance', 'fantasy'], tags: ['ชาติภพ', 'รักชั่วนิรันดร์', 'โลกวิญญาณ'],
    authorId: 'c2', authorName: 'ลมดาว', status: 'ongoing',
    rating: 4.7, voteCount: 9800, viewCount: 720000, readCount: 865000, vipTopUpTotal: 298000, episodeCount: 60,
    latestEpisode: 'ตอนที่ 60: ประตูแห่งความลืมเลือน', isFeatured: false, rankingScore: 88,
    updatedAt: '2026-05-16T06:00:00Z',
  },
  {
    id: '5', type: 'manga', title: '剑道独尊', coverUrl: 'https://picsum.photos/seed/manga1/200/300',
    synopsis: 'เด็กหนุ่มจากหมู่บ้านเล็กๆ ออกเดินทางเพื่อเป็นดาบบูรพาจารย์ ผ่านการฝึกฝนอันโหดร้ายและการต่อสู้ที่เดือดพล่าน',
    genres: ['action', 'fantasy'], tags: ['ดาบ', 'เซียน', 'ฝึกวิทยายุทธ์'],
    authorId: 'c3', authorName: 'ดาวเดือน', status: 'ongoing',
    rating: 4.5, voteCount: 6700, viewCount: 450000, readCount: 520000, vipTopUpTotal: 185000, episodeCount: 45,
    latestEpisode: 'บทที่ 45: มังกรเหล็ก', isFeatured: false, rankingScore: 82,
    updatedAt: '2026-05-13T12:00:00Z',
  },
  {
    id: '6', type: 'manga', title: '花好月圆', coverUrl: 'https://picsum.photos/seed/manga2/200/300',
    synopsis: 'ช่างดอกไม้สาวผู้มีพลังพิเศษในการสื่อสารกับต้นไม้และดอกไม้ ค้นพบความลับโบราณที่ซ่อนอยู่ในสวนของจักรพรรดิ',
    genres: ['romance', 'mystery'], tags: ['ดอกไม้', 'เวทมนตร์', 'ความลับ'],
    authorId: 'c3', authorName: 'ดาวเดือน', status: 'ongoing',
    rating: 4.4, voteCount: 5500, viewCount: 380000, readCount: 410000, vipTopUpTotal: 142000, episodeCount: 32,
    latestEpisode: 'บทที่ 32: บ้านต้นเมเปิ้ล', isFeatured: true, rankingScore: 78,
    updatedAt: '2026-05-12T09:00:00Z',
  },
  {
    id: '7', type: 'audiobook', title: '江湖夜雨', coverUrl: 'https://picsum.photos/seed/audio1/200/300',
    synopsis: 'เรื่องราวนักสืบในยุคราชวงศ์หมิง ที่ต้องคลี่คลายคดีฆาตกรรมลึกลับในคืนฝนตกหนัก',
    genres: ['mystery', 'historical'], tags: ['สืบสวน', 'ฆาตกรรม', 'ราชวงศ์หมิง'],
    authorId: 'c1', authorName: 'ปลายฝัน', status: 'completed',
    rating: 4.8, voteCount: 3400, viewCount: 220000, readCount: 305000, vipTopUpTotal: 126000, episodeCount: 30,
    latestEpisode: null, isFeatured: false, rankingScore: 86,
    updatedAt: '2026-02-14T00:00:00Z',
  },
  {
    id: '8', type: 'novel', title: '浮生若梦', coverUrl: 'https://picsum.photos/seed/novel5/200/300',
    synopsis: 'หมอสาวจากศตวรรษที่ 21 ข้ามเวลาไปในยุคราชวงศ์ชิง ต้องใช้ความรู้ทางการแพทย์สมัยใหม่เพื่อช่วยชีวิตผู้คน',
    genres: ['romance', 'historical'], tags: ['หมอ', 'ข้ามเวลา', 'ราชวงศ์ชิง'],
    authorId: 'c2', authorName: 'ลมดาว', status: 'ongoing',
    rating: 4.6, voteCount: 7200, viewCount: 510000, readCount: 635000, vipTopUpTotal: 221000, episodeCount: 70,
    latestEpisode: 'ตอนที่ 70: ยาวิเศษโบราณ', isFeatured: false, rankingScore: 84,
    updatedAt: '2026-05-10T14:00:00Z',
  },
  {
    id: '9', type: 'novel', title: '山河不忘', coverUrl: 'https://picsum.photos/seed/novel6/200/300',
    synopsis: 'แม่ทัพหญิงผู้นำกองทัพพิทักษ์ชาติ เผชิญหน้ากับศัตรูทั้งภายนอกและภายในราชสำนัก',
    genres: ['action', 'historical'], tags: ['แม่ทัพ', 'สงคราม', 'ความรักชาติ'],
    authorId: 'c3', authorName: 'ดาวเดือน', status: 'hiatus',
    rating: 4.3, voteCount: 4100, viewCount: 290000, readCount: 360000, vipTopUpTotal: 109000, episodeCount: 55,
    latestEpisode: 'ตอนที่ 55: ดินแดนหิมะ', isFeatured: false, rankingScore: 70,
    updatedAt: '2026-04-01T00:00:00Z',
  },
  {
    id: '10', type: 'novel', title: '缘来是你', coverUrl: 'https://picsum.photos/seed/novel7/200/300',
    synopsis: 'นักเขียนหนุ่มพบว่าตัวละครในนิยายของเขาออกมาจากหนังสือจริงๆ และกำลังเปลี่ยนแปลงโลกแห่งความเป็นจริง',
    genres: ['comedy', 'romance'], tags: ['ตัวละครมีชีวิต', 'โรแมนติก-คอมเมดี', 'เวทมนตร์'],
    authorId: 'c1', authorName: 'ปลายฝัน', status: 'ongoing',
    rating: 4.5, voteCount: 5800, viewCount: 400000, readCount: 455000, vipTopUpTotal: 176000, episodeCount: 40,
    latestEpisode: 'ตอนที่ 40: ตัวละครหลบหนี', isFeatured: false, rankingScore: 76,
    updatedAt: '2026-05-08T11:00:00Z',
  },
  {
    id: '11', type: 'manga', title: '血月传说', coverUrl: 'https://picsum.photos/seed/manga3/200/300',
    synopsis: 'ในคืนดวงจันทร์สีเลือด เด็กสาวถูกเลือกให้เป็นผู้พิทักษ์โลกจากฝูงปีศาจโบราณ',
    genres: ['horror', 'fantasy'], tags: ['ปีศาจ', 'ผู้พิทักษ์', 'ดวงจันทร์สีเลือด'],
    authorId: 'c2', authorName: 'ลมดาว', status: 'ongoing',
    rating: 4.4, voteCount: 3900, viewCount: 260000, readCount: 330000, vipTopUpTotal: 118000, episodeCount: 25,
    latestEpisode: 'บทที่ 25: ปีศาจดำ', isFeatured: false, rankingScore: 72,
    updatedAt: '2026-05-11T07:00:00Z',
  },
  {
    id: '12', type: 'novel', title: '此情可待', coverUrl: 'https://picsum.photos/seed/novel8/200/300',
    synopsis: 'เรื่องราวของสองคนที่เติบโตมาด้วยกัน ห่างหายไปสิบปี และชะตาพัดพาให้กลับมาพบกันอีกครั้งในเมืองที่ไม่รู้จัก',
    genres: ['romance', 'slice-of-life'], tags: ['รักวัยรุ่น', 'ชีวิตสมัยใหม่', 'กลับมาพบกัน'],
    authorId: 'c3', authorName: 'ดาวเดือน', status: 'ongoing',
    rating: 4.6, voteCount: 6300, viewCount: 430000, readCount: 495000, vipTopUpTotal: 194000, episodeCount: 50,
    latestEpisode: 'ตอนที่ 50: ฝนหยดแรก', isFeatured: false, rankingScore: 80,
    updatedAt: '2026-05-09T16:00:00Z',
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
    id: 'pop-2', rank: 2, title: 'มังกรทองคำแห่งตะวันออก', author: 'แสงดาว', category: 'แอคชั่น',
    description: 'มังกรโบราณตื่นขึ้นหลังหลับใหลนับพันปี พบว่าโลกเปลี่ยนแปลงไปอย่างสิ้นเชิง',
    imageUrl: 'https://picsum.photos/seed/popular-2/400/530',
  },
  {
    id: 'pop-3', rank: 3, title: 'หัวใจนางพญาหิมะ', author: 'ลมดาว', category: 'โรแมนติก',
    description: 'นางพญาหิมะผู้เย็นชาพบกับนักรบไฟที่ทำให้หัวใจแข็งกระด้างของเธอละลาย',
    imageUrl: 'https://picsum.photos/seed/popular-3/400/530',
  },
  {
    id: 'pop-4', rank: 4, title: 'ราชันย์แห่งนิรันดร์', author: 'ปลายฝัน', category: 'เทพเซียน',
    description: 'เซียนที่ฝึกฝนจนเกินระดับสูงสุด กลายเป็นราชันย์ที่ไม่มีใครกล้าท้าทาย',
    imageUrl: 'https://picsum.photos/seed/popular-4/400/530',
  },
  {
    id: 'pop-5', rank: 5, title: 'สาวน้อยข้ามมิติสู่จักรวาลใหม่', author: 'ดาวเดือน', category: 'ไซไฟ',
    description: 'นักวิทยาศาสตร์หญิงสาวที่ถูกพาข้ามมิติไปยังจักรวาลคู่ขนาน ต้องหาทางกลับบ้าน',
    imageUrl: 'https://picsum.photos/seed/popular-5/400/530',
  },
  {
    id: 'pop-6', rank: 6, title: 'ดาบอาถรรพ์และเจ้าชายหน้าเย็น', author: 'เพชรน้ำหนึ่ง', category: 'กระบี่',
    description: 'เจ้าชายผู้ครอบครองดาบต้องห้าม ต้องรับมือกับคำสาปและรักที่ไม่คาดคิด',
    imageUrl: 'https://picsum.photos/seed/popular-6/400/530',
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
