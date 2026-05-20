import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { MOCK_WORKS } from '@/lib/mock-data'

const FOLLOWED_IDS = ['1', '2', '5', '12']
const STATUS_LABELS: Record<string, string> = { ongoing: 'กำลังดำเนิน', completed: 'จบแล้ว', hiatus: 'หยุดพัก' }

export default function FollowedStories() {
  const works = MOCK_WORKS.filter(w => FOLLOWED_IDS.includes(w.id))

  if (works.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">ยังไม่มีเรื่องที่ติดตาม</p>
  }

  return (
    <div className="space-y-3">
      {works.map(work => (
        <Link
          key={work.id}
          href={`/detail?bookId=${work.id}`}
          className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/40 hover:bg-accent/10 transition-colors"
        >
          <div className="relative w-10 h-14 rounded overflow-hidden shrink-0">
            <Image src={work.coverUrl} alt={work.title} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm truncate">{work.title}</p>
              <Badge variant="outline" className="text-xs shrink-0">{STATUS_LABELS[work.status]}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{work.authorName}</p>
            {work.latestEpisode && (
              <p className="text-xs text-primary truncate mt-0.5">ใหม่: {work.latestEpisode}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
