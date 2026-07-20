'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Coins, CreditCard, Check } from 'lucide-react'
import { useWallet, type WalletTopUpMethod } from '@/contexts/WalletContext'
import { cn } from '@/lib/utils'

const PAYMENT_METHODS: { id: WalletTopUpMethod; label: string }[] = [
  { id: 'promptpay', label: 'พร้อมเพย์' },
  { id: 'credit-card', label: 'บัตรเครดิต/เดบิต' },
  { id: 'truemoney', label: 'TrueMoney Wallet' },
  { id: 'counter-service', label: 'เคาน์เตอร์เซอร์วิส' },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TopUpModal({ open, onOpenChange }: Props) {
  const { topUp, topUpEnabled, packages, loading } = useWallet()
  const [selectedId, setSelectedId] = useState('300')
  const [method, setMethod] = useState<WalletTopUpMethod>('promptpay')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const selected = packages.find((option) => option.id === selectedId) ?? packages[0]

  async function handleTopUp() {
    if (!selected) return
    setBusy(true); setError('')
    const ok = await topUp(selected.id, method)
    setBusy(false)
    if (!ok) { setError('ระบบเติมเหรียญจำลองปิดอยู่ หรือไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'); return }
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
              คุณได้รับ {((selected?.coins ?? 0) + (selected?.bonus ?? 0)).toLocaleString('th-TH')} เหรียญ
            </p>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <div>
              <p className="text-sm font-medium mb-2">เลือกแพ็กเกจ</p>
              <div className="grid grid-cols-2 gap-2">
                {packages.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedId(opt.id)}
                    className={cn(
                      'relative rounded-lg border p-4 text-left transition-colors',
                      selected?.id === opt.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    )}
                  >
                    {opt.bonus > 0 && (
                      <span className="absolute top-2 right-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                        +{opt.bonus}
                      </span>
                    )}
                    <div className="flex items-center gap-1 font-bold text-primary">
                      <Coins className="h-4 w-4" />{opt.coins.toLocaleString('th-TH')} เหรียญ
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
              <span className="font-semibold">฿{selected?.price.toLocaleString('th-TH') ?? '—'}</span>
            </div>
            {!topUpEnabled && !loading && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">ระบบเติมเหรียญยังไม่เปิดใช้งานใน environment นี้</p>}
          </div>
        )}

        {error && !success && <p className="text-sm text-destructive" role="alert">{error}</p>}

        {!success && (
          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>ยกเลิก</Button>
            <Button onClick={() => void handleTopUp()} disabled={busy || loading || !topUpEnabled || !selected} className="bg-primary text-primary-foreground">
              {busy ? 'กำลังดำเนินการ…' : `ชำระเงิน ฿${selected?.price.toLocaleString('th-TH') ?? '—'}`}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
