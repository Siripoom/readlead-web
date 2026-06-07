import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface RankingBook {
  id: string
  rank: number
  title: string
  author: string
  category: string
  description: string
  coverUrl: string
}

interface Props {
  title?: string
  books: RankingBook[]
}

function RankMedal({ rank, className }: { rank: number; className?: string }) {
  return (
    <span
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm font-black shadow',
        rank === 1 ? 'bg-amber-400 text-white' :
        rank === 2 ? 'bg-slate-300 text-white' :
        rank === 3 ? 'bg-orange-400 text-white' :
        'bg-muted text-muted-foreground',
        className,
      )}
    >
      {rank}
    </span>
  )
}

export function NovelRankingSection({ title, books }: Props) {
  if (books.length === 0) return null

  const sorted = [...books].sort((a, b) => a.rank - b.rank)
  const featured = sorted.find((b) => b.rank === 1) ?? sorted[0]
  const rest = sorted.filter((b) => b !== featured)

  return (
    <section className="space-y-4">
      {title && <h2 className="text-2xl font-bold text-foreground">{title}</h2>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Featured rank 1 */}
        <Link
          href={`/detail?bookId=${featured.id}`}
          className="group rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-md lg:col-span-1"
        >
          <div className="relative mx-auto max-w-[260px]">
            {/* stacked cover effect */}
            <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-xl bg-muted/50" />
            <div className="relative aspect-3/4 overflow-hidden rounded-xl shadow-md">
              <Image
                src={featured.coverUrl}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 320px"
                priority
              />
              <RankMedal rank={1} className="absolute left-3 top-3 h-8 w-8 text-base" />
            </div>
          </div>

          <div className="mt-5 space-y-1.5 text-center">
            <h3 className="line-clamp-2 text-xl font-black leading-tight text-foreground">
              {featured.title}
            </h3>
            <p className="text-sm text-muted-foreground">{featured.author}</p>
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {featured.description}
            </p>
          </div>
        </Link>

        {/* Ranks 2+ */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          {rest.map((book) => (
            <Link
              key={book.id}
              href={`/detail?bookId=${book.id}`}
              className="group flex gap-3 rounded-xl p-2 transition-colors hover:bg-muted/30"
            >
              <RankMedal rank={book.rank} />

              <div className="relative h-[150px] w-[110px] shrink-0 overflow-hidden rounded-lg shadow-sm">
                <Image
                  src={book.coverUrl}
                  alt={book.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  sizes="110px"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-1 py-0.5">
                <h4 className="line-clamp-1 font-bold text-foreground">{book.title}</h4>
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {book.description}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {book.author} · {book.category}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
