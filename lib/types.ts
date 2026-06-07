export type Role = 'guest' | 'user' | 'creator' | 'admin'
export type ContentType = 'novel' | 'manga' | 'audiobook'
export type EpisodeType = 'text' | 'image' | 'audio'
export type WorkSubmissionStatus = 'draft' | 'pending_review' | 'approved' | 'rejected'
export type Genre =
  | 'romance' | 'fantasy' | 'action' | 'mystery' | 'horror'
  | 'comedy' | 'drama' | 'historical' | 'sci-fi' | 'slice-of-life' | 'bl' | 'gl'
export type WorkStatus = 'ongoing' | 'completed' | 'hiatus'
export type EpisodeStatus = 'draft' | 'scheduled' | 'published'
export type PaymentMethod = 'credit-card' | 'promptpay' | 'truemoney' | 'paypal' | 'bank-transfer'
export type PromotionScope = 'work' | 'episode'
export type DiscountType = 'free' | 'percent'

export interface Promotion {
  id: string
  workId: string
  episodeId?: string
  label: string
  scope: PromotionScope
  discountType: DiscountType
  discountValue?: number
  startDate: string
  endDate: string
}

export interface Work {
  id: string
  type: ContentType
  title: string
  titleEn?: string
  titleZh?: string
  coverUrl: string
  submissionStatus?: WorkSubmissionStatus
  synopsis: string
  genres: Genre[]
  tags: string[]
  authorId: string
  authorName: string
  status: WorkStatus
  origin?: 'original' | 'translated'
  rating: number
  voteCount: number
  viewCount: number
  readCount: number
  vipTopUpTotal: number
  episodeCount: number
  latestEpisode: string | null
  isFeatured: boolean
  rankingScore: number
  updatedAt: string
  weeklyVoteCount: number
}

export interface HomePromotionBanner {
  id: string
  title: string
  description: string
  imageUrl: string
  href: string
  ctaLabel?: string
  eyebrow?: string
}

export interface HomePromotionSlide {
  id: string
  banners: HomePromotionBanner[]
}

export interface Episode {
  id: string
  workId: string
  title: string
  episodeNum: number
  price: number
  status: EpisodeStatus
  type: EpisodeType
  content: string
  wordCount: number
  publishedAt: string | null
  mediaUrl?: string
}

export interface Creator {
  id: string
  name: string
  avatarUrl: string
  bio: string
  totalRevenue: number
  monthlyRevenue: number[]
  followerCount: number
  workIds: string[]
}

export interface UserProfile {
  displayName: string
  avatarUrl: string
  vipLevel: string
  exp: number
  currentRank: string
}

export interface PurchaseRecord {
  episodeId: string
  workId: string
  workTitle: string
  episodeTitle: string
  coinsSpent: number
  purchasedAt: string
}

export interface TopUpOption {
  coins: number
  price: number
  label: string
  bonus?: number
}

export interface Review {
  id: string
  workId: string
  authorName: string
  avatarUrl: string
  rating: number
  text: string
  createdAt: string
  likes: number
}

export interface DiscountNovelItem {
  id: string
  title: string
  imageUrl: string
  publisher: string
  author: string
  genre: string
  translator: string
  discountLabel: string
  countdown: string
  badgeType: 'percent' | 'episode'
  href: string
}

export interface RankingNovelItem {
  id: string
  title: string
  imageUrl: string
  genre: string
  status: string
  views: number
  episodes: number
  badgeLabel: string | null
  badgeType: 'discount' | 'completed' | 'none'
  href: string
}

export interface RankingShowcaseItem {
  id: string
  title: string
  imageUrl: string
  author: string
  synopsis: string
  category: string
  href: string
}

export interface SidebarItem {
  id: string
  label: string
}

export interface PopularRankingItem {
  id: string
  rank: number
  title: string
  author: string
  category: string
  description: string
  imageUrl: string
}

export interface PopularRankingSection {
  id: string
  title: string
  items: PopularRankingItem[]
}
