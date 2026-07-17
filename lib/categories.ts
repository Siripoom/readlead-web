export const CATEGORY_MENU_ITEMS = [
  'ทุกหมวดหมู่',
  'โรแมนติก',
  'แฟนตาซี',
  'แอคชั่น',
  'ลึกลับ',
  'สยองขวัญ',
  'คอมเมดี',
  'ดราม่า',
  'ประวัติศาสตร์',
  'ไซไฟ',
  'ชีวิตประจำวัน',
  'BL',
  'GL',
] as const

const GENRE_MAP: Record<string, string> = {
  โรแมนติก: 'romance',
  แฟนตาซี: 'fantasy',
  แอคชั่น: 'action',
  ลึกลับ: 'mystery',
  สยองขวัญ: 'horror',
  คอมเมดี: 'comedy',
  ดราม่า: 'drama',
  ประวัติศาสตร์: 'historical',
  ไซไฟ: 'sci-fi',
  ชีวิตประจำวัน: 'slice-of-life',
  BL: 'bl',
  GL: 'gl',
}

export function getCategoryHref(category: string, basePath = '/'): string {
  if (category === 'ทุกหมวดหมู่') return basePath
  const genre = GENRE_MAP[category] ?? category
  return `${basePath}?genre=${genre}`
}
