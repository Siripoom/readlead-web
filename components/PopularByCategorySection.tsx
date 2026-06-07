'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Story {
  id: string
  title: string
  category: string
  coverUrl: string
  views: string
  isNew?: boolean
}

interface Props {
  title?: string
  viewAllHref?: string
  categories: string[]
  stories: Story[]
}

export function PopularByCategorySection({
  title = 'เรื่องฮิตตามหมวดหมู่',
  viewAllHref = '/discover',
  categories,
  stories,
}: Props) {
  const [active, setActive] = useState(categories[0])

  const visibleStories = stories.filter((s) => s.category === active)

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <Link
          href={viewAllHref}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ดูทั้งหมด
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-colors',
              active === cat
                ? 'bg-black text-white'
                : 'bg-[#f5f5f5] text-foreground hover:bg-[#ebebeb]',
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Story cards — horizontal scroll */}
      {visibleStories.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
          {visibleStories.map((story) => (
            <Link
              key={story.id}
              href={`/detail?bookId=${story.id}`}
              className="group w-[240px] shrink-0"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-sm">
                <Image
                  src={story.coverUrl}
                  alt={story.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="240px"
                />
                {story.isNew && (
                  <span className="absolute left-2 top-2 rounded-md bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
                    เรื่องใหม่
                  </span>
                )}
              </div>
              <h3 className="mt-2 line-clamp-1 font-bold text-foreground">
                {story.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                เข้าชม {story.views} ครั้ง
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
          ยังไม่มีเรื่องในหมวดนี้
        </div>
      )}
    </section>
  )
}
