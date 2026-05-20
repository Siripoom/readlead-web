import { BookOpen } from 'lucide-react'
import { BookCard } from '@/components/shared/BookCard'
import type { Work } from '@/lib/types'

interface Props {
  works: Work[]
}

export default function RelatedWorks({ works }: Props) {
  if (works.length === 0) return null

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        นิยายที่เกี่ยวข้อง
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {works.map(work => (
          <BookCard key={work.id} work={work} />
        ))}
      </div>
    </div>
  )
}
