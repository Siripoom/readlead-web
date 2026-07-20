export type ReaderTheme = 'light' | 'sepia' | 'dark'

export interface ReaderSettings {
  theme: ReaderTheme
  fontSize: number
  continuous: boolean
}

export interface ReaderProgress {
  workId: string
  episodeId: string
  scrollRatio: number
  updatedAt: string
}

export interface ReaderReply {
  id: string
  userId: string
  authorName: string
  avatarUrl?: string
  isAuthor: boolean
  text: string
  createdAt: string
  likes: string[]
  replyToName?: string
}

export interface ReaderComment {
  id: string
  userId: string
  authorName: string
  avatarUrl?: string
  isAuthor: boolean
  text: string
  createdAt: string
  likes: string[]
  replies: ReaderReply[]
}

export type ReaderReportReason =
  | 'คำหยาบคาย / ไม่สุภาพ'
  | 'สแปม / โฆษณา'
  | 'เนื้อหาไม่เหมาะสม'
  | 'คุกคาม / ก่อกวน'
  | 'สปอยล์เนื้อหา'
  | 'อื่น ๆ'

export interface ReaderReport {
  id: string
  reporterId: string
  workId: string
  episodeId: string
  commentId: string
  reason: ReaderReportReason
  status: 'local-pending'
  createdAt: string
}

export interface ReaderCommentMap {
  [slotId: string]: ReaderComment[]
}

export interface ReaderRepository {
  getSettings(scopeId: string): ReaderSettings
  saveSettings(scopeId: string, settings: ReaderSettings): void
  getProgress(scopeId: string, workId: string): ReaderProgress | null
  saveProgress(scopeId: string, progress: ReaderProgress): void
  getEpisodeComments(workId: string, episodeId: string): ReaderCommentMap
  saveEpisodeComments(workId: string, episodeId: string, comments: ReaderCommentMap): void
  saveReport(report: ReaderReport): void
}

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  theme: 'light',
  fontSize: 16,
  continuous: false,
}

const SETTINGS_PREFIX = 'rl_reader_settings_v2:'
const PROGRESS_PREFIX = 'rl_reader_progress_v2:'
const COMMENTS_KEY = 'rl_reader_comments_v2'
const REPORTS_KEY = 'rl_reader_reports_v2'

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function commentsKey(workId: string, episodeId: string) {
  return `${workId}:${episodeId}`
}

function normalizeSettings(value: Partial<ReaderSettings>): ReaderSettings {
  const theme: ReaderTheme = value.theme === 'sepia' || value.theme === 'dark' ? value.theme : 'light'
  const rawFontSize = Number(value.fontSize)
  return {
    theme,
    fontSize: Number.isFinite(rawFontSize) ? Math.min(24, Math.max(14, rawFontSize)) : 16,
    continuous: Boolean(value.continuous),
  }
}

export const localReaderRepository: ReaderRepository = {
  getSettings(scopeId) {
    if (typeof window === 'undefined') return DEFAULT_READER_SETTINGS
    return normalizeSettings(safeParse<Partial<ReaderSettings>>(
      localStorage.getItem(`${SETTINGS_PREFIX}${scopeId}`),
      DEFAULT_READER_SETTINGS,
    ))
  },

  saveSettings(scopeId, settings) {
    if (typeof window === 'undefined') return
    localStorage.setItem(`${SETTINGS_PREFIX}${scopeId}`, JSON.stringify(normalizeSettings(settings)))
  },

  getProgress(scopeId, workId) {
    if (typeof window === 'undefined') return null
    const progress = safeParse<Record<string, ReaderProgress>>(
      localStorage.getItem(`${PROGRESS_PREFIX}${scopeId}`),
      {},
    )[workId]
    return progress ?? null
  },

  saveProgress(scopeId, progress) {
    if (typeof window === 'undefined') return
    const key = `${PROGRESS_PREFIX}${scopeId}`
    const records = safeParse<Record<string, ReaderProgress>>(localStorage.getItem(key), {})
    records[progress.workId] = {
      ...progress,
      scrollRatio: Math.min(1, Math.max(0, progress.scrollRatio)),
    }
    localStorage.setItem(key, JSON.stringify(records))
  },

  getEpisodeComments(workId, episodeId) {
    if (typeof window === 'undefined') return {}
    const records = safeParse<Record<string, ReaderCommentMap>>(localStorage.getItem(COMMENTS_KEY), {})
    return records[commentsKey(workId, episodeId)] ?? {}
  },

  saveEpisodeComments(workId, episodeId, comments) {
    if (typeof window === 'undefined') return
    const records = safeParse<Record<string, ReaderCommentMap>>(localStorage.getItem(COMMENTS_KEY), {})
    records[commentsKey(workId, episodeId)] = comments
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(records))
  },

  saveReport(report) {
    if (typeof window === 'undefined') return
    const reports = safeParse<ReaderReport[]>(localStorage.getItem(REPORTS_KEY), [])
    reports.unshift(report)
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
  },
}
