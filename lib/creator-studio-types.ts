export type CreatorWorkType = 'novel' | 'manga' | 'audiobook'
export type CreatorWorkStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected' | 'deletion_pending' | 'archived'

export interface CreatorWorkCapabilities {
  canSubmitReview: boolean
  canCreateDraftEpisode: boolean
  canPublishEpisode: boolean
}

export interface CreatorWorkModeration {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  reason: string | null
  submittedAt: string
  reviewedAt: string | null
}
export type CreatorMetric = 'coins' | 'views' | 'shelf' | 'dailyVotes' | 'monthlyVotes' | 'reviews' | 'comments' | 'revenue'

export interface CreatorDashboardWork {
  id: string
  type: CreatorWorkType
  origin: 'original' | 'translated'
  status: CreatorWorkStatus
  title: string
  category: string
  rating: string
  tagline: string
  seriesStatus: string
  rejectionReason: string | null
  approvedAt: string | null
  publishedAt: string | null
  updatedAt: string
  views: number
  coins: number
  shelfCount: number
  dailyVotes: number
  monthlyVotes: number
  reviewCount: number
  commentCount: number
  moderation: CreatorWorkModeration | null
  capabilities: CreatorWorkCapabilities
  _count: { episodes: number }
}

export interface CreatorDashboardData {
  profile: { id: string; displayName: string; email: string; works: number; followers: number; episodes: number }
  income: { todaySatang: number; monthSatang: number; yearSatang: number }
  balance: { availableSatang: number; pendingSatang: number; nextPayoutAt: string }
  overview: { coins: number; views: number; shelf: number; dailyVotes: number; monthlyVotes: number; reviews: number; comments: number }
  chart: Array<{ date: string; value: number }>
  worksPage: { items: CreatorDashboardWork[]; total: number; page: number; pageSize: number }
}

export interface CreatorEpisodeRecord {
  id: string
  episodeNumber: number
  title: string
  type: 'text' | 'image' | 'audio'
  status: 'draft' | 'scheduled' | 'published' | 'hidden'
  priceCoins: number
  content: string | null
  scheduledAt: string | null
  publishedAt: string | null
  durationSeconds: number | null
}

export interface CreatorWorkDetail extends CreatorDashboardWork {
  creationMethod: string
  synopsis: string
  tags: string[]
  originalAuthor: string | null
  translatorName: string | null
  originalLanguage: string | null
  originalTitle: string | null
  episodes: CreatorEpisodeRecord[]
  reviews: Array<{ id: string; rating: number; body: string; createdAt: string; user: { name: string } }>
  comments: Array<{ id: string; body: string; createdAt: string; user: { name: string }; replies: Array<{ id: string; body: string; createdAt: string; user: { name: string } }> }>
}
