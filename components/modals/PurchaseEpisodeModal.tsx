'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Coins, Lock } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { useRole } from '@/contexts/RoleContext'
import type { Episode } from '@/lib/types'

interface Props {
  episode: Episode | null
  workTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onPurchased: (episodeId: string) => void
}

export default function PurchaseEpisodeModal({ episode, workTitle, open, onOpenChange, onPurchased }: Props) {
  const { balance, spend } = useWallet()
  const { isLoggedIn } = useRole()
  const [error, setError] = useState('')

  if (!episode) return null

  const canAfford = balance >= episode.price

  function handlePurchase() {
    if (!episode) return
    if (!isLoggedIn) { setError('กรุณาเข้าสู่ระบบก่อน'); return }
    if (!canAfford) { setError('เหรียญไม่เพียงพอ กรุณาเติมเหรียญ'); return }
    const ok = spend(episode.price)
    if (ok) {
      onPurchased(episode.id)
      onOpenChange(false)
      setError('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Lock className="h-5 w-5" />
            ปลดล็อกตอนนี้
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">{workTitle}</p>
          <p className="font-medium">{episode.title}</p>

          <div className="rounded-lg border border-gold/30 bg-accent/30 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ราคา</span>
              <span className="flex items-center gap-1 font-semibold text-primary">
                <Coins className="h-4 w-4" />{episode.price} เหรียญ
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ยอดเหรียญของคุณ</span>
              <span className={`flex items-center gap-1 font-semibold ${canAfford ? 'text-foreground' : 'text-destructive'}`}>
                <Coins className="h-4 w-4" />{balance} เหรียญ
              </span>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
          <Button onClick={handlePurchase} disabled={!canAfford} className="bg-primary text-primary-foreground">
            <Coins className="h-4 w-4 mr-1" />
            ซื้อ {episode.price} เหรียญ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
