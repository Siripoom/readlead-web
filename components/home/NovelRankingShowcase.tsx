'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RankingShowcaseItem } from '@/lib/types'

interface FeaturedCardProps {
  item: RankingShowcaseItem
}

function FeaturedCard({ item }: FeaturedCardProps) {
  return (
    <Link
      href={item.href}
      className="group block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-3/4 overflow-hidden">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 1024px) 100vw, 280px"
          priority
        />
        <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-black text-white shadow">
          อันดับ 1
        </span>
      </div>
      <div className="space-y-1.5 p-4">
        <p className="line-clamp-2 text-lg font-black leading-tight text-foreground">{item.title}</p>
        <p className="text-sm text-muted-foreground">{item.author}</p>
        <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">{item.synopsis}</p>
      </div>
    </Link>
  )
}

interface ShowcaseRowProps {
  item: RankingShowcaseItem
}

function ShowcaseRow({ item }: ShowcaseRowProps) {
  return (
    <Link
      href={item.href}
      className="group flex gap-3 rounded-xl p-2 transition-colors hover:bg-muted/30"
    >
      <div className="relative aspect-3/4 w-[72px] shrink-0 overflow-hidden rounded-xl shadow-sm">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          sizes="72px"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-1 py-0.5">
        <p className="line-clamp-2 text-sm font-bold leading-5 text-foreground">{item.title}</p>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.synopsis}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {item.author} · {item.category}
        </p>
      </div>
    </Link>
  )
}

interface Props {
  title?: string
  categories: readonly string[]
  items: RankingShowcaseItem[]
  onCategoryChange?: (category: string) => void
  viewAllHref?: string
}

export function NovelRankingShowcase({
  title = 'จัดอันดับนิยายยอดนิยม',
  categories,
  items,
  onCategoryChange,
  viewAllHref = '/ranking',
}: Props) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0] ?? '')

  const filtered = items.filter(item => item.category === activeCategory)
  const featured = filtered[0] ?? null
  const gridItems = filtered.slice(1, 7)

  function handleCategory(cat: string) {
    setActiveCategory(cat)
    onCategoryChange?.(cat)
  }

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ดูทั้งหมด
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategory(cat)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
              activeCategory === cat
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main layout */}
      {featured ? (
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
          {/* Featured card — ~30% on desktop */}
          <div className="w-full lg:w-[270px] lg:shrink-0">
            <FeaturedCard item={featured} />
          </div>

          {/* Grid items — fills remaining space */}
          <div className="grid flex-1 grid-cols-1 content-start gap-1 sm:grid-cols-2">
            {gridItems.map(item => (
              <ShowcaseRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
          ยังไม่มีนิยายในหมวดนี้
        </div>
      )}
    </section>
  )
}
