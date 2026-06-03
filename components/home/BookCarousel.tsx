import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { formatMetaNumber, formatPrimaryStat, type RankingStatVariant } from '@/components/home/RankingList'
import type { Work } from '@/lib/types'

interface Props {
  title: string
  chineseTitle?: string
  statLabel: string
  statVariant: RankingStatVariant
  works: Work[]
  actionHref?: string
}

export function BookCarousel({ title, chineseTitle, statLabel, statVariant, works, actionHref = '/discover' }: Props) {
  if (works.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-3">
          <h2 className="text-2xl font-bold leading-tight text-foreground">{title}</h2>
          {chineseTitle && <span className="text-sm font-serif text-muted-foreground">{chineseTitle}</span>}
        </div>

        <Link
          href={actionHref}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ดูเพิ่มเติม
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
        {works.map(work => (
          <Link
            key={work.id}
            href={`/detail?bookId=${work.id}`}
            className="group w-32 flex-none snap-start md:w-36"
          >
            <div className="relative aspect-2/3 overflow-hidden rounded-xl">
              <Image
                src={work.coverUrl}
                alt={work.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                sizes="144px"
              />
            </div>
            <p className="mt-2 line-clamp-2 text-xs font-bold leading-4 text-foreground">{work.title}</p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{work.authorName}</p>
            <p className="mt-0.5 text-[11px] font-bold text-foreground">
              {statLabel} {formatPrimaryStat(work, statVariant)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
