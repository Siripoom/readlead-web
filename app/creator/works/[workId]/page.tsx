import { notFound } from 'next/navigation'
import RouteGuard from '@/components/layout/RouteGuard'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MOCK_WORKS, MOCK_EPISODES, GENRE_LABELS } from '@/lib/mock-data'
import { Plus, Edit, Eye, BookOpen, Coins, Tag } from 'lucide-react'
import { ChevronLeft } from 'lucide-react'

interface Props {
  params: Promise<{ workId: string }>
}

const STATUS_LABELS: Record<string, string> = { ongoing: 'กำลังดำเนิน', completed: 'จบแล้ว', hiatus: 'หยุดพัก' }

export default async function CreatorWorkDetailPage({ params }: Props) {
  const { workId } = await params
  const work = MOCK_WORKS.find(w => w.id === workId)
  if (!work) notFound()

  const episodes = MOCK_EPISODES[workId] ?? []

  return (
    <RouteGuard allowedRoles={['creator', 'admin']}>
      <main className="container mx-auto px-4 py-8">
        <Link href="/creator" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4" />
          Creator Studio
        </Link>

        <div className="flex items-start gap-6 mb-8">
          <div className="relative w-24 h-32 rounded-lg overflow-hidden shrink-0">
            <Image src={work.coverUrl} alt={work.title} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">{work.title}</h1>
                <div className="flex flex-wrap gap-1 mt-2">
                  {work.genres.map(g => <Badge key={g} variant="outline" className="text-xs">{GENRE_LABELS[g]}</Badge>)}
                  <Badge className="text-xs">{STATUS_LABELS[work.status]}</Badge>
                </div>
              </div>
              <Link href={`/creator/works/${workId}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  แก้ไข
                </Button>
              </Link>
            </div>
            <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{(work.viewCount / 1000).toFixed(0)}K</span>
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{work.episodeCount} ตอน</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">รายการตอน</h2>
          <div className="flex gap-2">
            <Link href={`/creator/works/${workId}/promotions`}>
              <Button variant="outline" size="sm">
                <Tag className="h-4 w-4 mr-1" />
                โปรโมชั่น
              </Button>
            </Link>
            <Link href={`/creator/works/${workId}/episodes/new`}>
              <Button className="bg-primary text-primary-foreground" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                เพิ่มตอนใหม่
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          {episodes.map((ep, idx) => (
            <div key={ep.id} className={`flex items-center gap-3 px-4 py-3 ${idx % 2 === 0 ? 'bg-card' : 'bg-muted/30'}`}>
              <span className="text-sm text-muted-foreground w-6 shrink-0">{ep.episodeNum}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{ep.title}</p>
                <p className="text-xs text-muted-foreground">{ep.wordCount.toLocaleString()} คำ</p>
              </div>
              {ep.price > 0 ? (
                <span className="flex items-center gap-1 text-xs text-primary"><Coins className="h-3 w-3" />{ep.price}</span>
              ) : (
                <Badge className="bg-green-100 text-green-700 border-0 text-xs">ฟรี</Badge>
              )}
              <Link href={`/creator/works/${workId}/episodes/${ep.id}/edit`}>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">แก้ไข</Button>
              </Link>
            </div>
          ))}
          {episodes.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีตอน</div>
          )}
        </div>
      </main>
    </RouteGuard>
  )
}
