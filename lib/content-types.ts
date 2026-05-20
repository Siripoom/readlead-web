import type { ContentType } from '@/lib/types'

export const HOME_CONTENT_TYPES: ContentType[] = ['novel', 'manga', 'audiobook']

export const DEFAULT_HOME_CONTENT_TYPE: ContentType = 'novel'

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  novel: 'นิยาย',
  audiobook: 'นิยายเสียง',
  manga: 'มังงะ',
}

export const HOME_CONTENT_SECTION_TITLES: Record<ContentType, { title: string; chineseTitle: string }> = {
  novel: { title: 'นิยายยอดนิยม', chineseTitle: '热门小说' },
  audiobook: { title: 'นิยายเสียงแนะนำ', chineseTitle: '有声书推荐' },
  manga: { title: 'มังงะแนะนำ', chineseTitle: '推荐漫画' },
}

export function parseHomeContentType(
  value: string | string[] | null | undefined,
): ContentType {
  const candidate = Array.isArray(value) ? value[0] : value
  return HOME_CONTENT_TYPES.includes(candidate as ContentType)
    ? (candidate as ContentType)
    : DEFAULT_HOME_CONTENT_TYPE
}
