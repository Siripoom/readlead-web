'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SidebarItem, PopularRankingItem, PopularRankingSection } from '@/lib/types'

// ── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  title: string
  items: SidebarItem[]
  activeId: string
  onSelect: (id: string) => void
}

function Sidebar({ title, items, activeId, onSelect }: SidebarProps) {
  return (
    <aside className="sticky top-20 shrink-0 space-y-0.5 lg:w-[270px]">
      <div className="mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5 text-rose-500" />
        <span className="text-lg font-bold text-foreground">{title}</span>
      </div>
      {items.map(item => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={cn(
            'w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
            activeId === item.id
              ? 'border-l-2 border-rose-500 bg-rose-50 font-semibold text-rose-700'
              : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
          )}
        >
          {item.label}
        </button>
      ))}
    </aside>
  )
}

function SidebarTabs({ items, activeId, onSelect }: Omit<SidebarProps, 'title'>) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
      {items.map(item => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={cn(
            'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
            activeId === item.id
              ? 'border-foreground bg-foreground text-background'
              : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

// ── Featured card ─────────────────────────────────────────────────────────────

function FeaturedCard({ item, onItemClick }: { item: PopularRankingItem; onItemClick?: (item: PopularRankingItem) => void }) {
  return (
    <Link
      href={`/detail?bookId=${item.id}`}
      onClick={() => onItemClick?.(item)}
      className="group block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md lg:w-[250px] lg:shrink-0"
    >
      <div className="relative aspect-3/4 overflow-hidden">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 1024px) 100vw, 250px"
          priority
        />
        <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-black text-white shadow">
          อันดับ 1
        </span>
      </div>
      <div className="space-y-1.5 p-4">
        <p className="line-clamp-2 text-xl font-black leading-tight text-foreground">{item.title}</p>
        <p className="text-sm text-muted-foreground">{item.author}</p>
        <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
      </div>
    </Link>
  )
}

// ── Ranking grid (ranks 2–6) ──────────────────────────────────────────────────

function RankBadgeOverlay({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        'absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white shadow',
        rank === 2 ? 'bg-slate-400' :
        rank === 3 ? 'bg-orange-500' :
        'bg-black/60',
      )}
    >
      {rank}
    </span>
  )
}

function RankItem({ item, onItemClick }: { item: PopularRankingItem; onItemClick?: (item: PopularRankingItem) => void }) {
  return (
    <Link
      href={`/detail?bookId=${item.id}`}
      onClick={() => onItemClick?.(item)}
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
        <RankBadgeOverlay rank={item.rank} />
      </div>
      <div className="min-w-0 flex-1 space-y-1 py-0.5">
        <p className="line-clamp-2 text-sm font-bold leading-5 text-foreground">{item.title}</p>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {item.author} · {item.category}
        </p>
      </div>
    </Link>
  )
}

// ── Bottom sections ───────────────────────────────────────────────────────────

function MiniRankItem({ item, onItemClick }: { item: PopularRankingItem; onItemClick?: (item: PopularRankingItem) => void }) {
  return (
    <Link
      href={`/detail?bookId=${item.id}`}
      onClick={() => onItemClick?.(item)}
      className="group flex gap-2 rounded-lg px-1 py-2 transition-colors hover:bg-muted/20 border-b border-border/40 last:border-b-0"
    >
      <div className="relative aspect-3/4 w-12 shrink-0 overflow-hidden rounded-lg shadow-sm">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          sizes="48px"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5 py-0.5">
        <p className="line-clamp-1 text-sm font-medium text-foreground">{item.title}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
        <p className="truncate text-[10px] text-muted-foreground">{item.author} · {item.category}</p>
      </div>
    </Link>
  )
}

function BottomSections({ sections, onItemClick }: { sections: PopularRankingSection[]; onItemClick?: (item: PopularRankingItem) => void }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sections.map(section => (
        <div key={section.id} className="space-y-0">
          <h3 className="mb-3 text-base font-bold text-foreground">{section.title}</h3>
          <div>
            {section.items.map(item => (
              <MiniRankItem key={item.id} item={item} onItemClick={onItemClick} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  sidebarTitle?: string
  sidebarItems: SidebarItem[]
  activeSidebarId: string
  featuredItem: PopularRankingItem
  rankingItems: PopularRankingItem[]
  bottomSections: PopularRankingSection[]
  onSidebarChange?: (id: string) => void
  onItemClick?: (item: PopularRankingItem) => void
}

export function PopularRankingLayout({
  sidebarTitle = 'รายการความนิยม',
  sidebarItems,
  activeSidebarId,
  featuredItem,
  rankingItems,
  bottomSections,
  onSidebarChange,
  onItemClick,
}: Props) {
  const handleSidebar = (id: string) => onSidebarChange?.(id)

  const content = (
    <main className="min-w-0 flex-1 space-y-8">
      {/* Showcase: featured + ranking grid */}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <FeaturedCard item={featuredItem} onItemClick={onItemClick} />
        <div className="grid flex-1 grid-cols-1 content-start gap-1 sm:grid-cols-2">
          {rankingItems.map(item => (
            <RankItem key={item.id} item={item} onItemClick={onItemClick} />
          ))}
        </div>
      </div>

      {/* Bottom sections */}
      <BottomSections sections={bottomSections} onItemClick={onItemClick} />
    </main>
  )

  return (
    <>
      {/* Mobile: horizontal tabs */}
      <div className="mb-4 lg:hidden">
        <SidebarTabs items={sidebarItems} activeId={activeSidebarId} onSelect={handleSidebar} />
      </div>

      {/* Desktop: side-by-side */}
      <div className="hidden lg:flex lg:gap-8">
        <Sidebar
          title={sidebarTitle}
          items={sidebarItems}
          activeId={activeSidebarId}
          onSelect={handleSidebar}
        />
        {content}
      </div>

      {/* Mobile content */}
      <div className="lg:hidden">{content}</div>
    </>
  )
}
