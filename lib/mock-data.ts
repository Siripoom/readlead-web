import type { Work, Episode, Creator, TopUpOption, Review, UserProfile, HomePromotionSlide } from './types'

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
        title: 'แคมเปญเปิดบ้านนิยายจีน',
        description: 'ปล่อยพื้นที่โปรโมตนิยายใหม่พร้อมส่วนลด VIP สำหรับนักอ่านหน้าแรก',
        imageUrl: 'https://picsum.photos/seed/home-promo-1/1200/520',
        href: '/?type=novel',
        ctaLabel: 'ดูแคมเปญ',
        eyebrow: 'Promotion',
      },
      {
        id: 'promo-1b',
        title: 'มังงะมาแรงประจำสัปดาห์',
        description: 'รวมผลงานภาพเด่น อัปเดตไว และพื้นที่ซื้อโปรโมตสำหรับครีเอเตอร์',
        imageUrl: 'https://picsum.photos/seed/home-promo-2/1200/520',
        href: '/?type=manga',
        ctaLabel: 'ดูมังงะ',
        eyebrow: 'Featured Ads',
      },
    ],
  },
  {
    id: 'promo-2',
    banners: [
      {
        id: 'promo-2a',
        title: 'นิยายเสียงฟังต่อเนื่อง',
        description: 'พื้นที่แนะนำซีรีส์เสียงและกิจกรรมเปิดตัวตอนใหม่ตลอดทั้งเดือน',
        imageUrl: 'https://picsum.photos/seed/home-promo-3/1200/520',
        href: '/?type=audiobook',
        ctaLabel: 'ฟังตอนนี้',
        eyebrow: 'Audio Spotlight',
      },
      {
        id: 'promo-2b',
        title: 'โซนลงโฆษณาผลงาน VIP',
        description: 'ดันยอดเติม VIP และการมองเห็นบนหน้าแรกด้วยโปรโมชันแบนเนอร์สองแถว',
        imageUrl: 'https://picsum.photos/seed/home-promo-4/1200/520',
        href: '/creator',
        ctaLabel: 'ดูพื้นที่โปรโมต',
        eyebrow: 'Creator Ads',
      },
    ],
  },
  {
    id: 'promo-3',
    banners: [
      {
        id: 'promo-3a',
        title: 'อ่านฟรีตอนเปิดเรื่อง',
        description: 'รวมเรื่องที่เปิดให้อ่านฟรี เพื่อดึงผู้ใช้ใหม่เข้าสู่เนื้อหาหลัก',
        imageUrl: 'https://picsum.photos/seed/home-promo-5/1200/520',
        href: '/?type=novel',
        ctaLabel: 'สำรวจทั้งหมด',
        eyebrow: 'Reader Boost',
      },
      {
        id: 'promo-3b',
        title: 'จัดอันดับยอดนิยมแบบเรียลไทม์',
        description: 'โชว์อันดับตามยอดอ่าน ยอดดู และความนิยมสูงสุดในหน้าเดียว',
        imageUrl: 'https://picsum.photos/seed/home-promo-6/1200/520',
        href: '/?type=manga',
        ctaLabel: 'ดูอันดับ',
        eyebrow: 'Top Ranking',
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
