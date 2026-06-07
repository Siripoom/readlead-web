import Image from 'next/image'
import Link from 'next/link'
import { Eye, List, MessageSquare, ChevronRight } from 'lucide-react'

export interface Novel {
  id: string
  title: string
  category: string
  description: string
  coverUrl: string
  badgeText?: string
  views: string
  episodes: number
  comments: number
}

interface Props {
  title?: string
  viewMoreHref?: string
  novels: Novel[]
}

export function LatestNovelUpdatesSection({
  title = 'นิยายอัปเดตล่าสุด',
  viewMoreHref = '/discover',
  novels,
}: Props) {
  if (novels.length === 0) return null

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <Link
          href={viewMoreHref}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ดูเพิ่มเติม
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Novel list */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {novels.map((novel) => (
          <Link
            key={novel.id}
            href={`/detail?bookId=${novel.id}`}
            className="group flex gap-4"
          >
            <div className="relative h-[150px] w-[112px] shrink-0 overflow-hidden rounded-xl shadow-sm sm:h-[190px] sm:w-[140px]">
              <Image
                src={novel.coverUrl}
                alt={novel.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="140px"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5">
              {novel.badgeText && (
                <span className="inline-block w-fit rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-600">
                  {novel.badgeText}
                </span>
              )}

              <h3 className="line-clamp-1 text-lg font-bold text-foreground">
                {novel.title}
              </h3>

              <p className="text-sm text-muted-foreground">{novel.category}</p>

              <p className="line-clamp-2 text-sm text-muted-foreground">
                {novel.description}
              </p>

              <div className="mt-auto flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {novel.views}
                </span>
                <span className="inline-flex items-center gap-1">
                  <List className="h-3.5 w-3.5" />
                  {novel.episodes}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {novel.comments}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
