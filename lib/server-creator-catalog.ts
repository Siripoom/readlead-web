import type { DetailCatalogItem, DetailEpisode, DetailReview } from '@/lib/detail-catalog'
import type { Genre, WorkStatus } from '@/lib/types'

export interface PublicCreatorWork {
  id: string; type: 'novel' | 'manga' | 'audiobook'; origin: 'original' | 'translated'; title: string; category: string; rating: string; tagline: string; synopsis: string; tags: string[]; seriesStatus: string; publishedAt: string | null; updatedAt: string; views: number; coins: number; shelfCount: number; dailyVotes: number; monthlyVotes: number; reviewCount: number; commentCount: number
  creator: { id: string; name: string; writerApplication: { penName: string } | null; creatorProfile: { followers: number } | null }
  episodes: Array<{ id: string; episodeNumber: number; title: string; type: 'text' | 'image' | 'audio'; priceCoins: number; publishedAt: string | null; durationSeconds: number | null }>
  reviews: Array<{ id: string; userId: string; rating: number; body: string; recommended: boolean; spoiler: boolean; likes: number; dislikes: number; createdAt: string; updatedAt: string; user: { id: string; name: string }; replies: Array<{ id: string; userId: string; body: string; createdAt: string; updatedAt: string; user: { id: string; name: string } }> }>
  comments: Array<{ id: string; body: string; createdAt: string; user: { id: string; name: string }; replies: Array<{ id: string; body: string; createdAt: string; user: { id: string; name: string } }> }>
}

const genres = new Set<Genre>(['romance', 'fantasy', 'action', 'mystery', 'horror', 'comedy', 'drama', 'historical', 'sci-fi', 'slice-of-life', 'bl', 'gl'])
const gradients = ['linear-gradient(155deg,#7255a7,#241b3a)', 'linear-gradient(155deg,#9a5f73,#39212b)', 'linear-gradient(155deg,#477c78,#193934)']

export function mapPublicCreatorWork(raw: PublicCreatorWork): { work: DetailCatalogItem; episodes: DetailEpisode[]; reviews: DetailReview[] } {
  const genre = genres.has(raw.category as Genre) ? raw.category as Genre : 'fantasy'
  const status: WorkStatus = ['completed', 'hiatus'].includes(raw.seriesStatus) ? raw.seriesStatus as WorkStatus : 'ongoing'
  const authorName = raw.creator.writerApplication?.penName || raw.creator.name
  const averageRating = raw.reviews.length ? raw.reviews.reduce((sum, review) => sum + review.rating, 0) / raw.reviews.length : 0
  const work: DetailCatalogItem = {
    id: raw.id, detailId: raw.id, type: raw.type, title: raw.title, coverUrl: '', coverGradient: gradients[raw.id.charCodeAt(0) % gradients.length], synopsis: raw.synopsis || raw.tagline,
    genres: [genre], tags: raw.tags, authorId: raw.creator.id, authorName, status, origin: raw.origin, originLabel: raw.origin === 'translated' ? 'แปล' : 'ไทย', genreLabel: raw.category,
    rating: averageRating, voteCount: raw.dailyVotes, viewCount: raw.views, readCount: raw.views, vipTopUpTotal: raw.coins, episodeCount: raw.episodes.length,
    latestEpisode: raw.episodes.at(-1)?.title ?? null, isFeatured: false, rankingScore: raw.views + raw.dailyVotes, updatedAt: raw.updatedAt, weeklyVoteCount: raw.monthlyVotes,
    narrationType: raw.type === 'audiobook' ? 'human' : undefined,
  }
  const episodes: DetailEpisode[] = raw.episodes.map((episode) => ({ id: episode.id, workId: raw.id, title: episode.title, episodeNum: episode.episodeNumber, price: episode.priceCoins, status: 'published', type: episode.type, content: '', wordCount: 0, publishedAt: episode.publishedAt, mediaUrl: episode.durationSeconds === null ? undefined : String(episode.durationSeconds) }))
  const reviews: DetailReview[] = raw.reviews.map((review) => ({
    id: review.id,
    detailId: raw.id,
    userId: review.userId,
    authorName: review.user.name,
    rating: review.rating,
    body: review.body,
    recommended: review.recommended,
    spoiler: review.spoiler,
    likes: review.likes,
    dislikes: review.dislikes,
    viewerReaction: null,
    replies: review.replies.map((reply) => ({ id: reply.id, userId: reply.userId, authorName: reply.user.name, body: reply.body, createdAt: reply.createdAt, updatedAt: +new Date(reply.updatedAt) > +new Date(reply.createdAt) + 1000 ? reply.updatedAt : undefined })),
    createdAt: review.createdAt,
    updatedAt: +new Date(review.updatedAt) > +new Date(review.createdAt) + 1000 ? review.updatedAt : undefined,
  }))
  return { work, episodes, reviews }
}
