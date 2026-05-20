'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Coins, CreditCard, Check } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { MOCK_TOPUP_OPTIONS } from '@/lib/mock-data'
import type { PaymentMethod } from '@/lib/types'
import { cn } from '@/lib/utils'

const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'credit-card', label: 'บัตรเครดิต/เดบิต' },
  { id: 'promptpay', label: 'พร้อมเพย์' },
  { id: 'truemoney', label: 'TrueMoney Wallet' },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TopUpModal({ open, onOpenChange }: Props) {
  const { topUp } = useWallet()
  const [selectedCoins, setSelectedCoins] = useState(200)
  const [method, setMethod] = useState<PaymentMethod>('promptpay')
  const [success, setSuccess] = useState(false)

  const selected = MOCK_TOPUP_OPTIONS.find(o => o.coins === selectedCoins) ?? MOCK_TOPUP_OPTIONS[1]

  function handleTopUp() {
    topUp(selected.coins + (selected.bonus ?? 0))
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      onOpenChange(false)
    }, 2000)
  }

  function handleOpenChange(o: boolean) {
    if (!o) setSuccess(false)
    onOpenChange(o)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Coins className="h-5 w-5" />
            เติมเหรียญ
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="py-10 text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <p className="font-semibold text-primary text-lg">เติมเหรียญสำเร็จ!</p>
            <p className="text-sm text-muted-foreground">
              คุณได้รับ {selected.coins + (selected.bonus ?? 0)} เหรียญ
            </p>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <div>
              <p className="text-sm font-medium mb-2">เลือกแพ็กเกจ</p>
              <div className="grid grid-cols-2 gap-2">
                {MOCK_TOPUP_OPTIONS.map(opt => (
                  <button
                    key={opt.coins}
                    onClick={() => setSelectedCoins(opt.coins)}
                    className={cn(
                      'relative rounded-lg border p-4 text-left transition-colors',
                      selectedCoins === opt.coins
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    )}
                  >
                    {opt.bonus && (
                      <span className="absolute top-2 right-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                        +{opt.bonus}
                      </span>
                    )}
                    <div className="flex items-center gap-1 font-bold text-primary">
                      <Coins className="h-4 w-4" />{opt.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">฿{opt.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">ช่องทางชำระเงิน</p>
              <div className="space-y-2">
                {PAYMENT_METHODS.map(pm => (
                  <button
                    key={pm.id}
                    onClick={() => setMethod(pm.id)}
                    className={cn(
                      'flex items-center gap-3 w-full rounded-lg border p-3 text-sm transition-colors',
                      method === pm.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                    )}
                  >
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    {pm.label}
                    {method === pm.id && <Check className="h-4 w-4 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border p-3 text-sm flex justify-between">
              <span className="text-muted-foreground">ยอดรวม</span>
              <span className="font-semibold">฿{selected.price}</span>
            </div>
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>ยกเลิก</Button>
            <Button onClick={handleTopUp} className="bg-primary text-primary-foreground">
              ชำระเงิน ฿{selected.price}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
