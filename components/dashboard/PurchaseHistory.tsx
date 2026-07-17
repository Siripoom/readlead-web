'use client'

import { useState } from 'react'
import { Coins } from 'lucide-react'
import { useRole } from '@/contexts/RoleContext'
import { localProfileRepository } from '@/lib/profile-repository'
import type { PurchaseRecord } from '@/lib/types'

export default function PurchaseHistory() {
  const { user } = useRole()
  const [purchases] = useState<PurchaseRecord[]>(() => user ? localProfileRepository.getPurchaseHistory(user.id) : [])

  if (purchases.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">ยังไม่มีประวัติการซื้อ</p>
  }

  return (
    <div className="space-y-2">
      {purchases.map((purchase) => (
        <div key={purchase.episodeId} className="flex items-start justify-between gap-3 rounded-lg border p-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{purchase.episodeTitle}</p>
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
