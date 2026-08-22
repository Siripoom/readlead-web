import type { CmsBanner } from '@/lib/cms-catalog'
import type { HomeCmsCatalog } from '@/lib/home-catalog'
import type { HomeBookStripItem } from '@/lib/home-landing-data'
import type { Genre } from '@/lib/types'

export type HomeMobileContent = Pick<
  HomeCmsCatalog,
  'side' | 'editorsChoice' | 'promoSlots' | 'recommendColumns' | 'curatedPicks'
>

type MockBookInput = {
  slug: string
  title: string
  author: string
  genreLabel: string
  originLabel: string
  genreKeys: Genre[]
  contentType: NonNullable<HomeBookStripItem['contentType']>
  cover: number
  gradient: string
}

const COVER_URLS = [
  '/home/mock-cover-moon.svg',
  '/home/mock-cover-city.svg',
  '/home/mock-cover-flower.svg',
  '/home/mock-cover-sky.svg',
] as const

function makeBook(input: MockBookInput): HomeBookStripItem {
  const id = `mock-mobile-${input.slug}`
  return {
    id,
    detailId: id,
    title: input.title,
    author: input.author,
    genreLabel: input.genreLabel,
    originLabel: input.originLabel,
    genreKeys: input.genreKeys,
    mediaType: input.contentType === 'audiobook' ? 'audio' : 'read',
    views: '12.8K',
    chapters: '24',
    coverUrl: COVER_URLS[input.cover % COVER_URLS.length],
    contentType: input.contentType,
    href: `/discover?type=${input.contentType}`,
    isMock: true,
    gradient: input.gradient,
  }
}

const MOCK_NOVELS = [
  makeBook({ slug: 'novel-moon', title: 'พันธะรักใต้แสงจันทร์', author: 'พิมพ์ดาว', genreLabel: 'โรแมนซ์', originLabel: 'ไทย', genreKeys: ['romance', 'fantasy'], contentType: 'novel', cover: 0, gradient: 'linear-gradient(155deg,#7d688f,#251d39)' }),
  makeBook({ slug: 'novel-sword', title: 'จอมยุทธ์เหนือชะตา', author: 'อักษรเงา', genreLabel: 'แฟนตาซี', originLabel: 'ไทย', genreKeys: ['fantasy', 'action'], contentType: 'novel', cover: 1, gradient: 'linear-gradient(155deg,#526f84,#1a2a38)' }),
  makeBook({ slug: 'novel-flower', title: 'บุปผาซ่อนคม', author: 'มณีริน', genreLabel: 'ย้อนยุค', originLabel: 'แปล', genreKeys: ['historical', 'drama'], contentType: 'novel', cover: 2, gradient: 'linear-gradient(155deg,#a96678,#472638)' }),
  makeBook({ slug: 'novel-stars', title: 'เมื่อดวงดาวเรียกหา', author: 'นภัสสร', genreLabel: 'ไซไฟ', originLabel: 'ไทย', genreKeys: ['sci-fi', 'romance'], contentType: 'novel', cover: 3, gradient: 'linear-gradient(155deg,#596ea0,#20294f)' }),
  makeBook({ slug: 'novel-detective', title: 'คดีลับในคืนฝนพรำ', author: 'ราตรีดำ', genreLabel: 'สืบสวน', originLabel: 'ไทย', genreKeys: ['mystery', 'drama'], contentType: 'novel', cover: 1, gradient: 'linear-gradient(155deg,#4d5968,#171e27)' }),
  makeBook({ slug: 'novel-cafe', title: 'คาเฟ่นี้มีรัก', author: 'ฟองนม', genreLabel: 'ฟีลกู๊ด', originLabel: 'ไทย', genreKeys: ['slice-of-life', 'comedy'], contentType: 'novel', cover: 2, gradient: 'linear-gradient(155deg,#bd8e7c,#5c3e38)' }),
  makeBook({ slug: 'novel-prince', title: 'ท่านอ๋องโปรดใจเย็น', author: 'เมฆา', genreLabel: 'โรแมนซ์', originLabel: 'แปล', genreKeys: ['romance', 'historical'], contentType: 'novel', cover: 0, gradient: 'linear-gradient(155deg,#8f7089,#3e283b)' }),
  makeBook({ slug: 'novel-witch', title: 'แม่มดฝึกหัดกับวันสิ้นโลก', author: 'ลูน่า', genreLabel: 'แฟนตาซี', originLabel: 'ไทย', genreKeys: ['fantasy', 'comedy'], contentType: 'novel', cover: 3, gradient: 'linear-gradient(155deg,#6d79a5,#292c51)' }),
]

const MOCK_MANGA = [
  makeBook({ slug: 'manga-tower', title: 'หอคอยแห่งผู้กล้า', author: 'Studio R', genreLabel: 'แอ็กชัน', originLabel: 'มังฮวา', genreKeys: ['action', 'fantasy'], contentType: 'manga', cover: 1, gradient: 'linear-gradient(155deg,#486b7c,#172d39)' }),
  makeBook({ slug: 'manga-chef', title: 'เชฟจอมเวท', author: 'Mori', genreLabel: 'คอเมดี้', originLabel: 'มังงะ', genreKeys: ['comedy', 'fantasy'], contentType: 'manga', cover: 2, gradient: 'linear-gradient(155deg,#a16f58,#4b3028)' }),
  makeBook({ slug: 'manga-contract', title: 'สัญญารักฉบับวุ่นวาย', author: 'Hana', genreLabel: 'โรแมนซ์', originLabel: 'เว็บตูน', genreKeys: ['romance', 'comedy'], contentType: 'manga', cover: 0, gradient: 'linear-gradient(155deg,#ad6d8b,#4e2840)' }),
  makeBook({ slug: 'manga-ghost', title: 'ชมรมล่าผีหลังเลิกเรียน', author: 'Kuro', genreLabel: 'สยองขวัญ', originLabel: 'มังงะ', genreKeys: ['horror', 'mystery'], contentType: 'manga', cover: 3, gradient: 'linear-gradient(155deg,#4f526b,#181925)' }),
  makeBook({ slug: 'manga-reset', title: 'รีเซ็ตชีวิตพิชิตเกม', author: 'M Studio', genreLabel: 'แฟนตาซี', originLabel: 'มังฮวา', genreKeys: ['fantasy', 'action'], contentType: 'manga', cover: 1, gradient: 'linear-gradient(155deg,#557c72,#1e3832)' }),
  makeBook({ slug: 'manga-summer', title: 'ฤดูร้อนของเราสองคน', author: 'Aoi', genreLabel: 'ชีวิตประจำวัน', originLabel: 'มังงะ', genreKeys: ['slice-of-life', 'romance'], contentType: 'manga', cover: 2, gradient: 'linear-gradient(155deg,#6ca0a1,#2d5557)' }),
  makeBook({ slug: 'manga-idol', title: 'ไอดอลจำเป็น', author: 'Peach', genreLabel: 'ดราม่า', originLabel: 'เว็บตูน', genreKeys: ['drama', 'comedy'], contentType: 'manga', cover: 0, gradient: 'linear-gradient(155deg,#9c6e9f,#452848)' }),
  makeBook({ slug: 'manga-dragon', title: 'เจ้ามังกรตัวน้อย', author: 'Mina', genreLabel: 'แฟนตาซี', originLabel: 'มังงะ', genreKeys: ['fantasy', 'slice-of-life'], contentType: 'manga', cover: 3, gradient: 'linear-gradient(155deg,#596f96,#222d49)' }),
]

const MOCK_AUDIO = [
  makeBook({ slug: 'audio-forest', title: 'เสียงเรียกจากพงไพร', author: 'นักเล่าแห่งลม', genreLabel: 'แฟนตาซี', originLabel: 'พากย์', genreKeys: ['fantasy', 'mystery'], contentType: 'audiobook', cover: 3, gradient: 'linear-gradient(155deg,#47766a,#18352f)' }),
  makeBook({ slug: 'audio-love', title: 'บันทึกรักจากวันวาน', author: 'มะลิ', genreLabel: 'โรแมนซ์', originLabel: 'พากย์', genreKeys: ['romance', 'drama'], contentType: 'audiobook', cover: 2, gradient: 'linear-gradient(155deg,#a56b76,#462630)' }),
  makeBook({ slug: 'audio-space', title: 'สถานีสุดท้ายกลางจักรวาล', author: 'Orion', genreLabel: 'ไซไฟ', originLabel: 'เอไอ', genreKeys: ['sci-fi', 'action'], contentType: 'audiobook', cover: 1, gradient: 'linear-gradient(155deg,#50698f,#1c2942)' }),
  makeBook({ slug: 'audio-case', title: 'แฟ้มคดีหมายเลขศูนย์', author: 'เสียงเงา', genreLabel: 'สืบสวน', originLabel: 'พากย์', genreKeys: ['mystery', 'horror'], contentType: 'audiobook', cover: 0, gradient: 'linear-gradient(155deg,#56526a,#201d2c)' }),
  makeBook({ slug: 'audio-palace', title: 'เล่ห์รักในวังหลวง', author: 'ดาราราย', genreLabel: 'ย้อนยุค', originLabel: 'พากย์', genreKeys: ['historical', 'romance'], contentType: 'audiobook', cover: 2, gradient: 'linear-gradient(155deg,#987557,#432e21)' }),
  makeBook({ slug: 'audio-home', title: 'บ้านเล็กริมทะเล', author: 'ละอองคลื่น', genreLabel: 'ฟีลกู๊ด', originLabel: 'พากย์', genreKeys: ['slice-of-life', 'drama'], contentType: 'audiobook', cover: 3, gradient: 'linear-gradient(155deg,#56868f,#21464d)' }),
  makeBook({ slug: 'audio-comedy', title: 'ภารกิจป่วนของคุณชาย', author: 'ยิ้มหวาน', genreLabel: 'คอเมดี้', originLabel: 'เอไอ', genreKeys: ['comedy', 'romance'], contentType: 'audiobook', cover: 0, gradient: 'linear-gradient(155deg,#9c7194,#432b42)' }),
  makeBook({ slug: 'audio-warrior', title: 'ตำนานนักรบเพลิง', author: 'อัคนี', genreLabel: 'แอ็กชัน', originLabel: 'พากย์', genreKeys: ['action', 'fantasy'], contentType: 'audiobook', cover: 1, gradient: 'linear-gradient(155deg,#9a5f4d,#40231c)' }),
]

function banner({
  slug,
  badge,
  title,
  text,
  action,
  href,
  background,
  foreground = '#ffffff',
  buttonColor = '#5f2b81',
  compact = false,
}: {
  slug: string
  badge?: string
  title: string
  text?: string
  action?: string
  href: string
  background: string
  foreground?: string
  buttonColor?: string
  compact?: boolean
}): CmsBanner {
  const id = `mock-mobile-${slug}`
  return {
    id,
    title,
    isMock: true,
    linkUrl: href,
    background,
    focal: { x: 50, y: 50, zoom: 100 },
    elements: [
      ...(badge ? [{
        id: `${id}-badge`,
        type: 'badge' as const,
        text: badge,
        x: compact ? 7 : 6,
        y: compact ? 9 : 10,
        scale: 1,
        color: foreground,
        backgroundColor: 'rgba(255,255,255,.2)',
        bold: true,
      }] : []),
      {
        id: `${id}-title`,
        type: 'title',
        text: title,
        x: compact ? 7 : 6,
        y: badge ? (compact ? 34 : 35) : (compact ? 16 : 22),
        scale: compact ? 1.04 : 1.08,
        color: foreground,
        bold: true,
        shadow: true,
      },
      ...(text ? [{
        id: `${id}-text`,
        type: 'text' as const,
        text,
        x: compact ? 7 : 6,
        y: compact ? 58 : 61,
        scale: 1,
        color: foreground,
        shadow: true,
      }] : []),
      ...(action ? [{
        id: `${id}-button`,
        type: 'button' as const,
        text: action,
        x: compact ? 7 : 6,
        y: compact ? 72 : 75,
        scale: 1,
        color: buttonColor,
        backgroundColor: '#ffffff',
        bold: true,
        link: href,
        width: compact ? 38 : 27,
        height: compact ? 20 : 17,
      }] : []),
    ],
  }
}

function pick(item: HomeBookStripItem, slug: string): HomeBookStripItem {
  const id = `mock-mobile-pick-${slug}`
  return { ...item, id, detailId: id, isMock: true }
}

export const HOME_MOBILE_MOCK: HomeMobileContent = {
  side: [
    banner({ slug: 'side-ranking', badge: 'กิจกรรมประจำเดือน', title: 'เรื่องโปรดของคุณ\nกำลังรอคะแนน', text: 'ร่วมโหวตและพาเรื่องโปรดขึ้นอันดับ', action: 'โหวตเลย', href: '/ranking', background: 'radial-gradient(circle at 84% 30%,rgba(255,255,255,.38) 0 9%,transparent 10%),linear-gradient(120deg,#6342a2 0%,#9c63c4 55%,#ef9eb7 100%)' }),
    banner({ slug: 'side-discover', badge: 'อ่านได้ทุกวัน', title: 'เปิดโลกเรื่องใหม่\nในแบบที่คุณชอบ', text: 'นิยาย เว็บตูน และหนังสือเสียง', action: 'ค้นพบเลย', href: '/discover', background: 'radial-gradient(circle at 82% 40%,rgba(255,255,255,.25) 0 16%,transparent 17%),linear-gradient(120deg,#1e5584 0%,#438cb3 54%,#78c8c0 100%)' }),
  ],
  recommendColumns: {
    novel: MOCK_NOVELS,
    manga: MOCK_MANGA,
    audio: MOCK_AUDIO,
  },
  editorsChoice: [
    banner({ slug: 'editors-new-world', badge: "EDITOR'S CHOICE", title: 'โลกใบใหม่ที่อยากชวนคุณเข้าไปอ่าน', text: 'รวมเรื่องเด่น คัดสรรพิเศษประจำสัปดาห์', action: 'ดูเรื่องคัดสรร', href: '/discover', background: 'radial-gradient(circle at 84% 38%,rgba(255,255,255,.28) 0 14%,transparent 15%),linear-gradient(118deg,#28214d 0%,#684e91 52%,#d27f9b 100%)' }),
    banner({ slug: 'editors-audio', badge: 'แนะนำโดยบรรณาธิการ', title: 'เรื่องดีที่ควรฟังสักครั้ง', text: 'เพลิดเพลินกับเสียงเล่าคุณภาพ', action: 'เริ่มฟัง', href: '/discover?type=audiobook', background: 'radial-gradient(circle at 80% 30%,rgba(255,255,255,.22) 0 12%,transparent 13%),linear-gradient(118deg,#153e54 0%,#277c83 52%,#73bca6 100%)' }),
  ],
  promoSlots: [
    [banner({ slug: 'promo-novel', badge: 'นิยายฮิต', title: 'อ่านฟรี\nตอนพิเศษ', action: 'อ่านเลย', href: '/discover?type=novel', background: 'linear-gradient(135deg,#ff8fa5,#cc4452)', buttonColor: '#a8273c', compact: true })],
    [banner({ slug: 'promo-manga', badge: 'เว็บตูนมาใหม่', title: 'สนุกทุกตอน\nภาพสวยเต็มจอ', action: 'ดูเลย', href: '/discover?type=manga', background: 'linear-gradient(135deg,#5787dd,#3449a7)', buttonColor: '#263e91', compact: true })],
    [banner({ slug: 'promo-audio', badge: 'ฟังเพลิน', title: 'หนังสือเสียง\nคัดมาให้แล้ว', action: 'เริ่มฟัง', href: '/discover?type=audiobook', background: 'linear-gradient(135deg,#ffaf55,#e66b38)', buttonColor: '#b54e22', compact: true })],
    [banner({ slug: 'promo-ranking', badge: 'อันดับประจำเดือน', title: 'โหวตเรื่องโปรด\nให้ขึ้นที่หนึ่ง', action: 'ร่วมโหวต', href: '/ranking', background: 'linear-gradient(135deg,#9a73ce,#6240a0)', buttonColor: '#57378e', compact: true })],
  ],
  curatedPicks: {
    top: [
      pick(MOCK_NOVELS[0], 'top-1'),
      pick(MOCK_MANGA[2], 'top-2'),
      pick(MOCK_AUDIO[0], 'top-3'),
      pick(MOCK_NOVELS[3], 'top-4'),
      pick(MOCK_MANGA[5], 'top-5'),
      pick(MOCK_AUDIO[4], 'top-6'),
    ],
    bottom: [
      pick(MOCK_MANGA[0], 'bottom-1'),
      pick(MOCK_NOVELS[4], 'bottom-2'),
      pick(MOCK_AUDIO[2], 'bottom-3'),
      pick(MOCK_NOVELS[5], 'bottom-4'),
      pick(MOCK_MANGA[7], 'bottom-5'),
      pick(MOCK_AUDIO[6], 'bottom-6'),
    ],
  },
}

function resolveList<T>(cmsItems: T[], mockItems: T[]) {
  return cmsItems.length > 0 ? cmsItems : mockItems
}

/** Resolve only the content rendered by the mobile-only homepage sections. */
export function resolveHomeMobileContent(cms: HomeCmsCatalog): HomeMobileContent {
  return {
    side: resolveList(cms.side, HOME_MOBILE_MOCK.side),
    editorsChoice: resolveList(cms.editorsChoice, HOME_MOBILE_MOCK.editorsChoice),
    recommendColumns: {
      novel: resolveList(cms.recommendColumns.novel, HOME_MOBILE_MOCK.recommendColumns.novel),
      manga: resolveList(cms.recommendColumns.manga, HOME_MOBILE_MOCK.recommendColumns.manga),
      audio: resolveList(cms.recommendColumns.audio, HOME_MOBILE_MOCK.recommendColumns.audio),
    },
    promoSlots: HOME_MOBILE_MOCK.promoSlots.map((mockSlot, index) => (
      resolveList(cms.promoSlots[index] ?? [], mockSlot)
    )),
    curatedPicks: {
      top: resolveList(cms.curatedPicks.top, HOME_MOBILE_MOCK.curatedPicks.top),
      bottom: resolveList(cms.curatedPicks.bottom, HOME_MOBILE_MOCK.curatedPicks.bottom),
    },
  }
}
