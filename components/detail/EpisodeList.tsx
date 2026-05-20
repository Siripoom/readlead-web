'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Lock, Unlock, Coins, BookOpen, Eye, MessageSquare, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRole } from '@/contexts/RoleContext'
import PurchaseEpisodeModal from '@/components/modals/PurchaseEpisodeModal'
import type { Episode } from '@/lib/types'
import { useRouter } from 'next/navigation'

interface Props {
  episodes: Episode[]
  workId: string
  workTitle: string
  episodeStats?: Record<string, { viewCount: number; commentCount: number }>
}

const PAGE_SIZE = 20

function fmt(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

export default function EpisodeList({ episodes, workId, workTitle, episodeStats = {} }: Props) {
  const { isLoggedIn } = useRole()
  const router = useRouter()
  const [purchased, setPurchased] = useState<Set<string>>(new Set())
  const [modalEp, setModalEp] = useState<Episode | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(episodes.length / PAGE_SIZE)
  const pageEpisodes = episodes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function isUnlocked(ep: Episode) {
    return ep.price === 0 || purchased.has(ep.id)
  }

  function handleEpClick(ep: Episode) {
    if (ep.price === 0) {
      if (!isLoggedIn) { router.push('/login'); return }
      router.push(`/reader?bookId=${workId}&episodeId=${ep.id}`)
      return
    }
    if (purchased.has(ep.id)) {
      router.push(`/reader?bookId=${workId}&episodeId=${ep.id}`)
      return
    }
    if (!isLoggedIn) { router.push('/login'); return }
    setModalEp(ep)
  }

  return (
    <div className="space-y-1">
      <div
        className="flex items-center justify-between cursor-pointer select-none mb-3"
        onClick={() => setCollapsed(v => !v)}
      >
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          สารบัญ ({episodes.length} ตอน)
        </h2>
        {collapsed
          ? <ChevronDown className="h-5 w-5 text-muted-foreground" />
          : <ChevronUp className="h-5 w-5 text-muted-foreground" />
        }
      </div>

      {!collapsed && (
        <>
          <div className="rounded-lg border overflow-hidden">
            {pageEpisodes.map((ep, idx) => {
              const unlocked = isUnlocked(ep)
              const stats = episodeStats[ep.id]
              return (
                <div
                  key={ep.id}
                  onClick={() => handleEpClick(ep)}
                  className={`
                    flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                    ${idx % 2 === 0 ? 'bg-card' : 'bg-muted/30'}
                    hover:bg-accent/20
                  `}
                >
                  <span className="text-sm font-medium text-muted-foreground w-8 shrink-0">
                    {ep.episodeNum}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {ep.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground">{ep.wordCount.toLocaleString()} คำ</span>
                      {stats && (
                        <>
                          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <Eye className="h-3 w-3" />{fmt(stats.viewCount)}
                          </span>
                          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <MessageSquare className="h-3 w-3" />{stats.commentCount}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {ep.price === 0 ? (
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">ฟรี</Badge>
                    ) : purchased.has(ep.id) ? (
                      <Badge className="bg-primary/10 text-primary border-0 text-xs">ซื้อแล้ว</Badge>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Coins className="h-3.5 w-3.5" />{ep.price}
                      </span>
                    )}
                    {unlocked
                      ? <Unlock className="h-4 w-4 text-green-600" />
                      : <Lock className="h-4 w-4 text-muted-foreground" />
                    }
                  </div>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 text-sm">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                ก่อนหน้า
              </button>
              <span className="text-muted-foreground">
                หน้า {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ถัดไป
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      <PurchaseEpisodeModal
        episode={modalEp}
        workTitle={workTitle}
        open={modalEp !== null}
        onOpenChange={open => { if (!open) setModalEp(null) }}
        onPurchased={id => setPurchased(prev => new Set([...prev, id]))}
      />
    </div>
  )
}
