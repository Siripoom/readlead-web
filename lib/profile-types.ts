import type { ContentType, PurchaseRecord, Work } from '@/lib/types'

export type ProfileSection =
  | 'home'
  | 'account'
  | 'activity'
  | 'writer-application'
  | 'creator'
  | 'wallet'
  | 'help'
  | 'report'

export const PROFILE_SECTIONS: ReadonlyArray<{ id: ProfileSection; label: string }> = [
  { id: 'home', label: 'หน้าแรก' },
  { id: 'account', label: 'ศูนย์บัญชี' },
  { id: 'activity', label: 'คอมเมนต์ & รีวิวของฉัน' },
  { id: 'writer-application', label: 'สมัครนักเขียน' },
  { id: 'creator', label: 'แดชบอร์ดนักเขียน' },
  { id: 'wallet', label: 'กระเป๋าเงิน' },
  { id: 'help', label: 'คู่มือผู้ใช้' },
  { id: 'report', label: 'แจ้งปัญหา' },
]

export function isProfileSection(value: string | null): value is ProfileSection {
  return PROFILE_SECTIONS.some((section) => section.id === value)
}

export interface ProfileRecord {
  id: string
  displayName: string
  handle: string
  avatarUrl: string
  coverGradient: string
  bio: string
  kind: 'reader' | 'creator'
  level: number
  exp: number
  currentLevelExp: number
  nextLevelExp: number
  rankLabel: string
  followerCount: number
  followingCount: number
  publicShelfIds: string[]
  workIds: string[]
}

export interface VoteAllowance {
  used: number
  total: number
  resetLabel: string
}

export interface ProfileActivity {
  id: string
  kind: 'comment' | 'review'
  workId: string
  workTitle: string
  body: string
  rating?: number
  createdAt: string
}

export interface OwnerDashboardData {
  profile: ProfileRecord
  dailyVote: VoteAllowance
  monthlyVote: VoteAllowance
  shelf: Work[]
  activities: ProfileActivity[]
}

export interface PublicProfileData {
  profile: ProfileRecord
  works: Work[]
  shelf: Work[]
  isFollowing: boolean
}

export interface ProfileRepository {
  getOwnerDashboard(userId: string): OwnerDashboardData
  getPublicProfile(userId: string, viewerId?: string): PublicProfileData | null
  getActivities(userId: string): ProfileActivity[]
  saveActivities(userId: string, activities: ProfileActivity[]): void
  toggleFollow(viewerId: string, targetId: string): boolean
  isFollowing(viewerId: string, targetId: string): boolean
  getShelf(userId: string): Work[]
  getPurchaseHistory(userId: string): PurchaseRecord[]
}

export type PublicProfileFilter = 'all' | ContentType
