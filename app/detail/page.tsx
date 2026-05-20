import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import ContentHeader from '@/components/detail/ContentHeader'
import EpisodeList from '@/components/detail/EpisodeList'
import VoteSection from '@/components/detail/VoteSection'
import ReviewSection from '@/components/detail/ReviewSection'
import RelatedWorks from '@/components/detail/RelatedWorks'
import OrnamentalDivider from '@/components/shared/OrnamentalDivider'
import { MOCK_WORKS, MOCK_EPISODES, MOCK_REVIEWS, MOCK_EPISODE_STATS } from '@/lib/mock-data'

interface Props {
  searchParams: Promise<{ bookId?: string }>
}

export default async function DetailPage({ searchParams }: Props) {
  const { bookId } = await searchParams
  const work = MOCK_WORKS.find(w => w.id === bookId)
  if (!work) notFound()

  const episodes = MOCK_EPISODES[work.id] ?? []
  const reviews = MOCK_REVIEWS[work.id] ?? []
  const relatedWorks = MOCK_WORKS
    .filter(w => w.id !== work.id && w.genres.some(g => work.genres.includes(g)))
    .slice(0, 6)

  return (
    <main className="min-h-screen">
      <div className="bg-muted/40 border-b">
        <div className="container mx-auto px-8 md:px-16 py-2 text-sm text-muted-foreground flex items-center gap-1">
          <Link href="/" className="hover:text-primary">หน้าแรก</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/discover" className="hover:text-primary">ค้นหา</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate">{work.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-8 md:px-16 py-8 space-y-8">
        <ContentHeader work={work} />
        <OrnamentalDivider />
        <VoteSection work={work} />
        <OrnamentalDivider />
        <ReviewSection workId={work.id} initialReviews={reviews} />
        <OrnamentalDivider />
        <EpisodeList
          episodes={episodes}
          workId={work.id}
          workTitle={work.title}
          episodeStats={MOCK_EPISODE_STATS}
        />
        <OrnamentalDivider />
        <RelatedWorks works={relatedWorks} />
      </div>
    </main>
  )
}
