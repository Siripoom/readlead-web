'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Banknote } from 'lucide-react'

interface Props {
  totalRevenue: number
}

export default function WithdrawButton({ totalRevenue }: Props) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [notice, setNotice] = useState('')

  function handleWithdraw() {
    setNotice('ตรวจสอบจำนวนเงินแล้ว แต่ยังไม่ได้ส่งคำขอ เนื่องจากระบบถอนเงินยังไม่มี API')
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
              {notice && <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800" role="status">{notice}</p>}
            </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setNotice('') }}>ยกเลิก</Button>
            <Button onClick={handleWithdraw} disabled={!amount || Number(amount) <= 0} className="bg-primary text-primary-foreground">
              ตรวจสอบคำขอ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
