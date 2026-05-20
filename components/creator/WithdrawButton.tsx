'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Banknote, Check } from 'lucide-react'

interface Props {
  totalRevenue: number
}

export default function WithdrawButton({ totalRevenue }: Props) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [success, setSuccess] = useState(false)

  function handleWithdraw() {
    setSuccess(true)
    setTimeout(() => { setSuccess(false); setOpen(false); setAmount('') }, 2000)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="border-primary/30 text-primary hover:bg-primary/5">
        <Banknote className="h-4 w-4 mr-1" />
        ถอนเงิน
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Banknote className="h-5 w-5" />
              ถอนเงิน
            </DialogTitle>
          </DialogHeader>

          {success ? (
            <div className="py-8 text-center space-y-2">
              <Check className="h-12 w-12 text-green-600 mx-auto" />
              <p className="font-semibold">ส่งคำขอถอนเงินสำเร็จ!</p>
              <p className="text-sm text-muted-foreground">จะโอนภายใน 3-5 วันทำการ</p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ยอดคงเหลือ</span>
                  <span className="font-semibold text-green-600">฿{totalRevenue.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">จำนวนที่ต้องการถอน (฿)</label>
                <Input
                  type="number"
                  placeholder="ระบุจำนวนเงิน"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
            </div>
          )}

          {!success && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
              <Button onClick={handleWithdraw} disabled={!amount || Number(amount) <= 0} className="bg-primary text-primary-foreground">
                ยืนยันถอนเงิน
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
