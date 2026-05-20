'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Coins, Heart } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { cn } from '@/lib/utils'

const DONATE_OPTIONS = [10, 30, 50, 100, 200, 500]

interface Props {
  authorName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DonateModal({ authorName, open, onOpenChange }: Props) {
  const { balance, spend } = useWallet()
  const [selected, setSelected] = useState(50)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleDonate() {
    if (balance < selected) { setError('เหรียญไม่เพียงพอ'); return }
    spend(selected)
    setSuccess(true)
    setError('')
    setTimeout(() => {
      setSuccess(false)
      onOpenChange(false)
    }, 1500)
  }

  function handleOpenChange(o: boolean) {
    if (!o) { setSuccess(false); setError('') }
    onOpenChange(o)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Heart className="h-5 w-5 fill-primary" />
            บริจาคให้นักเขียน
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <Heart className="h-12 w-12 fill-primary text-primary mx-auto animate-bounce" />
            <p className="font-semibold text-primary">ขอบคุณสำหรับการสนับสนุน!</p>
            <p className="text-sm text-muted-foreground">บริจาค {selected} เหรียญ ให้ {authorName}</p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              บริจาคให้ <span className="font-medium text-foreground">{authorName}</span>
            </p>

            <div className="grid grid-cols-3 gap-2">
              {DONATE_OPTIONS.map(amt => (
                <button
                  key={amt}
                  onClick={() => setSelected(amt)}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-lg border p-3 text-sm font-medium transition-colors',
                    selected === amt
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50 hover:bg-accent/30'
                  )}
                >
                  <Coins className="h-4 w-4 mb-1" />
                  {amt}
                </button>
              ))}
            </div>

            <div className="flex justify-between text-sm rounded-lg border p-3">
              <span className="text-muted-foreground">ยอดเหรียญของคุณ</span>
              <span className="flex items-center gap-1 font-semibold">
                <Coins className="h-4 w-4" />{balance}
              </span>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        {!success && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>ยกเลิก</Button>
            <Button onClick={handleDonate} disabled={balance < selected} className="bg-primary text-primary-foreground">
              <Heart className="h-4 w-4 mr-1" />
              บริจาค {selected} เหรียญ
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
