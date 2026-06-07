import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import PublicWriterProfilePage from '@/components/writer/PublicWriterProfilePage'
import type { WriterProfile } from '@/components/writer/PublicWriterProfilePage'
import { MOCK_CREATORS, MOCK_WORKS } from '@/lib/mock-data'
import type { Work } from '@/lib/types'

interface Props {
  searchParams: Promise<{ writerId?: string }>
}

function fmtNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(2) + ' ล้าน'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

export default async function WriterPage({ searchParams }: Props) {
  const { writerId } = await searchParams
  const creator = MOCK_CREATORS.find(c => c.id === writerId)
  if (!creator) notFound()

  const works: Work[] = creator.workIds
    .map(id => MOCK_WORKS.find(w => w.id === id))
    .filter((w): w is Work => w !== undefined)

  const totalViews = works.reduce((sum, w) => sum + w.viewCount, 0)
  const totalEpisodes = works.reduce((sum, w) => sum + w.episodeCount, 0)
  const latestUpdatedAt = works.length > 0
    ? works.reduce((latest, w) =>
        new Date(w.updatedAt) > new Date(latest) ? w.updatedAt : latest,
        works[0].updatedAt
      )
    : undefined

  const writer: WriterProfile = {
    id: creator.id,
    name: creator.name,
    avatarUrl: creator.avatarUrl,
    badgeLabel: creator.followerCount >= 40000 ? 'นักเขียนระดับทอง' : 'นักเขียน 5 ดาว',
    bio: creator.bio,
    worksCount: works.length,
    totalViews: fmtNum(totalViews),
    followers: fmtNum(creator.followerCount),
    totalEpisodes: fmtNum(totalEpisodes),
    latestUpdatedAt,
  }

  return (
    <main className="min-h-screen">
      <div className="bg-muted/40 border-b">
        <div className="container mx-auto px-8 md:px-16 py-2 text-sm text-muted-foreground flex items-center gap-1">
          <Link href="/" className="hover:text-primary">หน้าแรก</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/discover" className="hover:text-primary">ค้นหา</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground truncate">{creator.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-8 md:px-16 py-8">
        <PublicWriterProfilePage writer={writer} works={works} />
      </div>
    </main>
  )
}
