'use client'

import type { AuthUser } from '@/contexts/RoleContext'
import { MOCK_CREATORS, MOCK_EPISODES, MOCK_USER_PROFILE, MOCK_WORKS } from '@/lib/mock-data'
import type {
  OwnerDashboardData,
  ProfileActivity,
  ProfileRecord,
  ProfileRepository,
  PublicProfileData,
} from '@/lib/profile-types'
import type { PurchaseRecord, UserProfile } from '@/lib/types'

const FOLLOW_KEY = 'rl_profile_follows_v2'

const READER_DEMO: ProfileRecord = {
  id: 'reader-demo',
  displayName: 'นักอ่านใต้แสงจันทร์',
  handle: 'moonlight.reader',
  avatarUrl: 'https://picsum.photos/seed/reader-demo/160/160',
  coverGradient: 'linear-gradient(115deg, #8f2f3b 0%, #cc4452 58%, #f7ece0 130%)',
  bio: 'นักอ่าน ReadLead ที่ชอบนิยายโรแมนติก แฟนตาซี และเรื่องราวอบอุ่นหัวใจ',
  kind: 'reader',
  level: 5,
  exp: 12840,
  currentLevelExp: 2840,
  nextLevelExp: 5000,
  rankLabel: 'นักอ่านตัวยง',
  followerCount: 235,
  followingCount: 128,
  publicShelfIds: ['1', '3', '6', '9', '12'],
  workIds: [],
}

const DEFAULT_ACTIVITIES: ProfileActivity[] = [
  {
    id: 'activity-review-1',
    kind: 'review',
    workId: '1',
    workTitle: '用情至深',
    body: 'เล่าเรื่องได้ลื่นไหล ตัวละครมีเสน่ห์ และจังหวะพลิกเรื่องทำให้อยากอ่านต่อมาก',
    rating: 5,
    createdAt: '2026-07-12T10:00:00.000Z',
  },
  {
    id: 'activity-comment-1',
    kind: 'comment',
    workId: '3',
    workTitle: '锦绣江山',
    body: 'ตอนล่าสุดสนุกมาก รอติดตามแผนของนางเอกในตอนต่อไปค่ะ',
    createdAt: '2026-07-10T14:30:00.000Z',
  },
]

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function followBox(): Record<string, string[]> {
  return safeParse(localStorage.getItem(FOLLOW_KEY), {})
}

function localFollowerDelta(targetId: string) {
  return Object.values(followBox()).filter((ids) => ids.includes(targetId)).length
}

function creatorProfile(userId: string): ProfileRecord | null {
  const creator = MOCK_CREATORS.find((item) => item.id === userId)
  if (!creator) return null
  return {
    id: creator.id,
    displayName: creator.name,
    handle: creator.id,
    avatarUrl: creator.avatarUrl,
    coverGradient: 'linear-gradient(115deg, #783740 0%, #cc4452 58%, #f6dfd2 130%)',
    bio: creator.bio,
    kind: 'creator',
    level: 8,
    exp: 32400,
    currentLevelExp: 2400,
    nextLevelExp: 8000,
    rankLabel: creator.followerCount >= 40000 ? 'นักเขียนระดับทอง' : 'นักเขียน 5 ดาว',
    followerCount: creator.followerCount,
    followingCount: 36,
    publicShelfIds: [],
    workIds: creator.workIds,
  }
}

function derivedAuthorProfile(userId: string): ProfileRecord | null {
  if (!userId.startsWith('author:')) return null
  let name = userId.slice('author:'.length)
  try { name = decodeURIComponent(name) } catch {}
  if (!name.trim()) return null
  const creator = MOCK_CREATORS.find((item) => item.name === name)
  const workIds = MOCK_WORKS.filter((work) => work.authorName === name).map((work) => work.id)
  return {
    id: userId,
    displayName: name,
    handle: `author.${Math.abs(Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0))}`,
    avatarUrl: creator?.avatarUrl ?? `https://picsum.photos/seed/author-profile-${workIds[0] ?? 'readlead'}/160/160`,
    coverGradient: 'linear-gradient(115deg, #783740 0%, #cc4452 58%, #f6dfd2 130%)',
    bio: creator?.bio ?? 'นักเขียนบน ReadLead',
    kind: 'creator',
    level: 5,
    exp: 12800,
    currentLevelExp: 2800,
    nextLevelExp: 5000,
    rankLabel: 'นักเขียน ReadLead',
    followerCount: creator?.followerCount ?? 1200,
    followingCount: 18,
    publicShelfIds: [],
    workIds: creator?.workIds ?? workIds,
  }
}

export function profileStorageKey(userId: string) {
  return `rl_profile_v2:${userId}`
}

export function walletStorageKey(userId: string) {
  return `rl_wallet_v2:${userId}`
}

export function purchaseStorageKey(userId: string) {
  return `rl_purchases_v2:${userId}`
}

export function shelfStorageKey(userId: string) {
  return `rl_profile_shelf_v2:${userId}`
}

export function readStoredUserProfile(user: AuthUser): UserProfile {
  const key = profileStorageKey(user.id)
  const stored = safeParse<Partial<UserProfile>>(localStorage.getItem(key), {})
  const migrated = Object.keys(stored).length
    ? stored
    : safeParse<Partial<UserProfile>>(localStorage.getItem('rl_profile'), {})
  const next: UserProfile = {
    ...MOCK_USER_PROFILE,
    ...migrated,
    displayName: migrated.displayName?.trim() || user.name,
    handle: migrated.handle?.trim() || user.email.split('@')[0],
    bio: migrated.bio ?? (user.userType === 'creator' ? 'นักเขียนบน ReadLead' : 'นักอ่าน ReadLead'),
    coverGradient: migrated.coverGradient ?? READER_DEMO.coverGradient,
  }
  localStorage.setItem(key, JSON.stringify(next))
  localStorage.setItem(`rl_profile_kind_v2:${user.id}`, user.userType === 'creator' ? 'creator' : 'reader')
  return next
}

function getShelfIds(userId: string): string[] {
  const key = shelfStorageKey(userId)
  const existing = safeParse<string[]>(localStorage.getItem(key), [])
  if (existing.length) return existing
  const legacy = safeParse<string[]>(localStorage.getItem('rl_ranking_shelf'), [])
  const seeded = legacy.length ? legacy : ['1', '3', '6']
  localStorage.setItem(key, JSON.stringify(seeded))
  return seeded
}

function ownerRecord(userId: string): ProfileRecord {
  const stored = safeParse<Partial<UserProfile>>(localStorage.getItem(profileStorageKey(userId)), {})
  const creator = creatorProfile(userId)
  const exp = stored.exp ?? creator?.exp ?? MOCK_USER_PROFILE.exp
  const following = followBox()[userId]?.length ?? creator?.followingCount ?? 0
  return {
    id: userId,
    displayName: stored.displayName ?? creator?.displayName ?? MOCK_USER_PROFILE.displayName,
    handle: stored.handle ?? creator?.handle ?? `reader-${userId.slice(0, 8)}`,
    avatarUrl: stored.avatarUrl ?? creator?.avatarUrl ?? MOCK_USER_PROFILE.avatarUrl,
    coverGradient: stored.coverGradient ?? creator?.coverGradient ?? READER_DEMO.coverGradient,
    bio: stored.bio ?? creator?.bio ?? 'นักอ่าน ReadLead',
    kind: creator || localStorage.getItem(`rl_profile_kind_v2:${userId}`) === 'creator' ? 'creator' : 'reader',
    level: creator?.level ?? Math.max(1, Math.floor(exp / 5000) + 1),
    exp,
    currentLevelExp: exp % 5000,
    nextLevelExp: 5000,
    rankLabel: stored.currentRank ?? creator?.rankLabel ?? 'นักอ่านฝึกหัด',
    followerCount: (creator?.followerCount ?? 235) + localFollowerDelta(userId),
    followingCount: following,
    publicShelfIds: getShelfIds(userId),
    workIds: creator?.workIds ?? [],
  }
}

function activityKey(userId: string) {
  return `rl_profile_activities_v2:${userId}`
}

function resolvePublicRecord(userId: string): ProfileRecord | null {
  if (userId === READER_DEMO.id) return READER_DEMO
  const creator = creatorProfile(userId) ?? derivedAuthorProfile(userId)
  if (creator) return creator
  if (localStorage.getItem(profileStorageKey(userId))) return ownerRecord(userId)
  return null
}

export const localProfileRepository: ProfileRepository = {
  getOwnerDashboard(userId): OwnerDashboardData {
    return {
      profile: ownerRecord(userId),
      dailyVote: { used: 3, total: 5, resetLabel: 'รีเซ็ตทุกวัน' },
      monthlyVote: { used: 23, total: 30, resetLabel: 'รีเซ็ตทุกเดือน' },
      shelf: this.getShelf(userId),
      activities: this.getActivities(userId),
    }
  },

  getPublicProfile(userId, viewerId): PublicProfileData | null {
    const profile = resolvePublicRecord(userId)
    if (!profile) return null
    const isLocalProfile = Boolean(localStorage.getItem(profileStorageKey(userId)))
    return {
      profile: isLocalProfile ? profile : { ...profile, followerCount: profile.followerCount + localFollowerDelta(userId) },
      works: MOCK_WORKS.filter((work) => profile.workIds.includes(work.id)),
      shelf: MOCK_WORKS.filter((work) => profile.publicShelfIds.includes(work.id)),
      isFollowing: viewerId ? this.isFollowing(viewerId, userId) : false,
    }
  },

  getActivities(userId) {
    const key = activityKey(userId)
    const existing = safeParse<ProfileActivity[]>(localStorage.getItem(key), [])
    if (existing.length) return existing
    localStorage.setItem(key, JSON.stringify(DEFAULT_ACTIVITIES))
    return DEFAULT_ACTIVITIES
  },

  saveActivities(userId, activities) {
    localStorage.setItem(activityKey(userId), JSON.stringify(activities))
  },

  toggleFollow(viewerId, targetId) {
    const box = followBox()
    const current = new Set(box[viewerId] ?? [])
    if (current.has(targetId)) current.delete(targetId)
    else current.add(targetId)
    box[viewerId] = [...current]
    localStorage.setItem(FOLLOW_KEY, JSON.stringify(box))
    return current.has(targetId)
  },

  isFollowing(viewerId, targetId) {
    return followBox()[viewerId]?.includes(targetId) ?? false
  },

  getShelf(userId) {
    const ids = getShelfIds(userId)
    return MOCK_WORKS.filter((work) => ids.includes(work.id))
  },

  getPurchaseHistory(userId) {
    const historyKey = `rl_purchase_history_v2:${userId}`
    const existing = safeParse<PurchaseRecord[]>(localStorage.getItem(historyKey), [])
    if (existing.length) return existing
    const episodeIds = safeParse<string[]>(localStorage.getItem(purchaseStorageKey(userId)) ?? localStorage.getItem('rl_purchases'), [])
    const migrated = episodeIds.flatMap((episodeId, index) => {
      const episode = Object.values(MOCK_EPISODES).flat().find((item) => item.id === episodeId)
      const work = episode ? MOCK_WORKS.find((item) => item.id === episode.workId) : undefined
      if (!episode || !work) return []
      return [{
        episodeId,
        workId: work.id,
        workTitle: work.title,
        episodeTitle: episode.title,
        coinsSpent: episode.price,
        purchasedAt: new Date(Date.now() - index * 86400000).toISOString(),
      } satisfies PurchaseRecord]
    })
    localStorage.setItem(historyKey, JSON.stringify(migrated))
    return migrated
  },
}

export function recordEpisodePurchase(
  userId: string,
  episodeId: string,
  details?: Pick<PurchaseRecord, 'workId' | 'workTitle' | 'episodeTitle' | 'coinsSpent'>,
) {
  const idsKey = purchaseStorageKey(userId)
  const ids = new Set(safeParse<string[]>(localStorage.getItem(idsKey) ?? localStorage.getItem('rl_purchases'), []))
  ids.add(episodeId)
  localStorage.setItem(idsKey, JSON.stringify([...ids]))
  const historyKey = `rl_purchase_history_v2:${userId}`
  const history = safeParse<PurchaseRecord[]>(localStorage.getItem(historyKey), [])
  if (history.some((item) => item.episodeId === episodeId)) return
  const episode = details ? undefined : Object.values(MOCK_EPISODES).flat().find((item) => item.id === episodeId)
  const work = episode ? MOCK_WORKS.find((item) => item.id === episode.workId) : undefined
  if (!details && (!episode || !work)) return
  history.unshift({
    episodeId,
    workId: details?.workId ?? work!.id,
    workTitle: details?.workTitle ?? work!.title,
    episodeTitle: details?.episodeTitle ?? episode!.title,
    coinsSpent: details?.coinsSpent ?? episode!.price,
    purchasedAt: new Date().toISOString(),
  })
  localStorage.setItem(historyKey, JSON.stringify(history))
}

export function buildSessionProfile(user: AuthUser): ProfileRecord {
  const stored = readStoredUserProfile(user)
  return {
    ...ownerRecord(user.id),
    displayName: stored.displayName,
    handle: stored.handle ?? user.email.split('@')[0],
    avatarUrl: stored.avatarUrl,
    bio: stored.bio ?? 'นักอ่าน ReadLead',
    coverGradient: stored.coverGradient ?? READER_DEMO.coverGradient,
    kind: user.userType === 'creator' ? 'creator' : 'reader',
  }
}
