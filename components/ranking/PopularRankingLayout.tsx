'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SidebarItem, PopularRankingItem } from '@/lib/types'

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

// ── Ranking list rows ─────────────────────────────────────────────────────────

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

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  sidebarTitle?: string
  sidebarItems: SidebarItem[]
  activeSidebarId: string
  rankingItems: PopularRankingItem[]
  itemsPerPage?: number
  onSidebarChange?: (id: string) => void
  onItemClick?: (item: PopularRankingItem) => void
}

export function PopularRankingLayout({
  sidebarTitle = 'รายการความนิยม',
  sidebarItems,
  activeSidebarId,
  rankingItems,
  itemsPerPage = 8,
  onSidebarChange,
  onItemClick,
}: Props) {
  const [page, setPage] = useState(1)

  // เปลี่ยนหมวด sidebar แล้วกลับไปหน้า 1 (ปรับ state ตอน render ตามแนวทาง React)
  const [prevSidebarId, setPrevSidebarId] = useState(activeSidebarId)
  if (prevSidebarId !== activeSidebarId) {
    setPrevSidebarId(activeSidebarId)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(rankingItems.length / itemsPerPage))
  const paginatedItems = rankingItems.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  )

  const handleSidebar = (id: string) => onSidebarChange?.(id)

  const content = (
    <main className="min-w-0 flex-1 space-y-8">
      {/* Ranking list */}
      <div className="grid grid-cols-1 content-start gap-1 sm:grid-cols-2">
        {paginatedItems.map(item => (
          <RankItem key={item.id} item={item} onItemClick={onItemClick} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex h-9 items-center gap-1 rounded-md border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-foreground transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            ก่อนหน้า
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={cn(
                'h-9 w-9 rounded-md border text-sm font-semibold transition-colors',
                p === page
                  ? 'border-black bg-black text-white'
                  : 'border-[#e5e5e5] bg-white text-foreground hover:bg-[#f5f5f5]',
              )}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex h-9 items-center gap-1 rounded-md border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-foreground transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ถัดไป
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
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
