import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import type { Work } from '@/lib/types'
import { GENRE_LABELS } from '@/lib/mock-data'

interface Props {
  work: Work
  compact?: boolean
}

export function BookCard({ work, compact = false }: Props) {
  return (
    <Link href={`/detail?bookId=${work.id}`} className="group block">
      <div className="relative overflow-hidden rounded-md border border-border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className={`relative ${compact ? 'h-40 w-28' : 'aspect-[2/3] w-full'} overflow-hidden`}>
          <Image
            src={work.coverUrl}
            alt={work.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes={compact ? '112px' : '(max-width: 768px) 50vw, 200px'}
          />
          {work.isFeatured && (
            <div className="absolute left-0 top-0 bg-primary px-2 py-0.5 text-[10px] font-bold text-white">精选</div>
          )}
        </div>
        {!compact && (
          <div className="p-2">
            <h3 className="truncate text-sm font-semibold leading-tight">{work.title}</h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{work.authorName}</p>
            <div className="mt-1.5 flex items-center justify-between">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{GENRE_LABELS[work.genres[0]] ?? work.genres[0]}</Badge>
              <span className="flex items-center gap-0.5 text-[10px] text-accent-foreground font-semibold">
                <Star className="h-2.5 w-2.5 fill-current" />{work.rating}
              </span>
            </div>
          </div>
        )}
      </div>
      {compact && (
        <p className="mt-1 truncate text-xs font-medium">{work.title}</p>
      )}
    </Link>
  )
}
