import { Coins } from 'lucide-react'
import type { PurchaseRecord } from '@/lib/types'

const MOCK_PURCHASES: PurchaseRecord[] = [
  { episodeId: 'e1-3', workId: '1', workTitle: '用情至深', episodeTitle: 'ตอนที่ 3: เจ้าชายแห่งม่านหมอก', coinsSpent: 5, purchasedAt: '2026-05-10T14:00:00Z' },
  { episodeId: 'e1-4', workId: '1', workTitle: '用情至深', episodeTitle: 'ตอนที่ 4: คำพยากรณ์', coinsSpent: 5, purchasedAt: '2026-05-11T09:30:00Z' },
  { episodeId: 'e3-3', workId: '3', workTitle: '锦绣江山', episodeTitle: 'ตอนที่ 3: แผนการลับ', coinsSpent: 8, purchasedAt: '2026-05-14T20:00:00Z' },
]

export default function PurchaseHistory() {
  if (MOCK_PURCHASES.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">ยังไม่มีประวัติการซื้อ</p>
  }

  return (
    <div className="space-y-2">
      {MOCK_PURCHASES.map((p, idx) => (
        <div key={idx} className="flex items-start justify-between p-3 rounded-lg border gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{p.episodeTitle}</p>
            <p className="text-xs text-muted-foreground truncate">{p.workTitle}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(p.purchasedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-primary shrink-0">
            <Coins className="h-4 w-4" />
            {p.coinsSpent}
          </div>
        </div>
      ))}
    </div>
  )
}
