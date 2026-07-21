'use client'

import { useRouter } from 'next/navigation'
import { Coins } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRole } from '@/contexts/RoleContext'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TopUpModal({ open, onOpenChange }: Props) {
  const router = useRouter()
  const { user } = useRole()

  function openWallet() {
    onOpenChange(false)
    router.push(user ? `/profile/${encodeURIComponent(user.id)}?tab=wallet` : '/login')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary"><Coins className="h-5 w-5" />เติมเหรียญ</DialogTitle>
        </DialogHeader>
        <p className="py-3 text-sm leading-6 text-muted-foreground">เลือกแพ็กเกจและอัปโหลดหลักฐานการชำระเงินได้ที่หน้ากระเป๋าเงิน</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
          <Button onClick={openWallet} className="bg-primary text-primary-foreground">ไปที่กระเป๋าเงิน</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
