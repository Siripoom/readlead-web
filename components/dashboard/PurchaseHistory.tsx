'use client'

import { useEffect, useState } from 'react'
import { Coins } from 'lucide-react'
import { useRole } from '@/contexts/RoleContext'
import type { PurchaseHistoryRecord } from '@/lib/types'

export default function PurchaseHistory() {
  const { user } = useRole()
  const [purchases, setPurchases] = useState<PurchaseHistoryRecord[]>([])
  const [loading, setLoading] = useState(Boolean(user))

  useEffect(() => {
    const controller = new AbortController()
    if (user) fetch('/api/member/activity', { cache: 'no-store', signal: controller.signal }).then((response) => response.ok ? response.json() : { purchases: [] }).then((data: { purchases?: Array<{ id: string; kind?: 'episode' | 'feature'; feature?: 'text_to_speech'; coinsSpent: number; purchasedAt: string; work: { id: string; title: string }; episode: { id: string; title: string } | null }> }) => {
      setPurchases((data.purchases ?? []).flatMap((item): PurchaseHistoryRecord[] => item.kind === 'feature' && item.feature === 'text_to_speech' ? [{ id: item.id, kind: 'feature', feature: item.feature, workId: item.work.id, workTitle: item.work.title, coinsSpent: item.coinsSpent, purchasedAt: item.purchasedAt }] : item.episode ? [{ id: item.id, kind: 'episode', episodeId: item.episode.id, workId: item.work.id, workTitle: item.work.title, episodeTitle: item.episode.title, coinsSpent: item.coinsSpent, purchasedAt: item.purchasedAt }] : []))
      setLoading(false)
    }).catch(() => setLoading(false))
    else queueMicrotask(() => setLoading(false))
    return () => controller.abort()
  }, [user])

  if (loading) return <p className="py-6 text-center text-sm text-muted-foreground">กำลังโหลดประวัติการซื้อ…</p>

  if (purchases.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">ยังไม่มีประวัติการซื้อ</p>
  }

  return (
    <div className="space-y-2">
      {purchases.map((purchase) => (
        <div key={purchase.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{purchase.kind === 'feature' ? 'อ่านออกเสียงทุกตอน' : purchase.episodeTitle}</p>
            <p className="truncate text-xs text-muted-foreground">{purchase.workTitle}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {new Date(purchase.purchasedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
            <Coins className="h-4 w-4" />{purchase.coinsSpent}
          </div>
        </div>
      ))}
    </div>
  )
}
