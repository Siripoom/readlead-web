import Link from 'next/link'
import Image from 'next/image'
import { MOCK_WORKS } from '@/lib/mock-data'
import { BookOpen } from 'lucide-react'

const BOOKMARKED_IDS = ['1', '3', '6']

export default function BookmarkList() {
  const works = MOCK_WORKS.filter(w => BOOKMARKED_IDS.includes(w.id))

  if (works.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">ยังไม่มีบุ๊คมาร์ค</p>
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
            <p className="font-medium truncate text-sm">{work.title}</p>
            <p className="text-xs text-muted-foreground">{work.authorName}</p>
            {work.latestEpisode && (
              <p className="text-xs text-primary truncate flex items-center gap-1 mt-0.5">
                <BookOpen className="h-3 w-3" />{work.latestEpisode}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
