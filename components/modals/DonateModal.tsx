'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Coins, Heart } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { cn } from '@/lib/utils'
import styles from './DonateModal.module.css'

const DONATE_OPTIONS = [10, 30, 50, 100, 200, 500]

interface Props {
  appearance?: 'default' | 'detail'
  authorName: string
  detailId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (amount: number, message: string) => void
}

export default function DonateModal({ appearance = 'default', authorName, detailId, open, onOpenChange, onSuccess }: Props) {
  const { balance, spend } = useWallet()
  const detail = appearance === 'detail'
  const options = detail ? [1, 25, 50, 100, 300, 1000, 3000, 7500, 15000] : DONATE_OPTIONS
  const [selected, setSelected] = useState(50)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function handleDonate() {
    if (balance < selected) { setError('เหรียญไม่เพียงพอ'); return }
    const completed = spend(selected)
    if (!completed) { setError('ไม่สามารถหักเหรียญได้'); return }
    if (detailId) {
      const key = 'rl_detail_support_v1'
      try {
        const stored = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown[]
        localStorage.setItem(key, JSON.stringify([...stored, {
          id: crypto.randomUUID(), detailId, kind: 'tip', amount: selected,
          message: message.trim(), createdAt: new Date().toISOString(),
        }]))
      } catch {
        localStorage.setItem(key, JSON.stringify([]))
      }
    }
    onSuccess?.(selected, message.trim())
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
      <DialogContent className={detail ? styles.detailDialog : 'sm:max-w-sm'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Heart className="h-5 w-5 fill-primary" />
            {detail ? 'สนับสนุนผลงาน' : 'บริจาคให้นักเขียน'}
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
              {detail ? 'ร่วมสนับสนุนผลงานของ ' : 'บริจาคให้ '}<span className="font-medium text-foreground">{authorName}</span>
            </p>

            <div className={cn("grid grid-cols-3 gap-2", detail && styles.packs)}>
              {options.map(amt => (
                <button
                  key={amt}
                  aria-pressed={selected === amt}
                  onClick={() => setSelected(amt)}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-lg border p-3 text-sm font-medium transition-colors',
                    selected === amt
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50 hover:bg-accent/30'
                  )}
                >
                  <Coins className="h-4 w-4 mb-1" />
                  {amt.toLocaleString()} {detail && <small>เหรียญ</small>}
                </button>
              ))}
            </div>

            <div className="flex justify-between text-sm rounded-lg border p-3">
              <span className="text-muted-foreground">ยอดเหรียญของคุณ</span>
              <span className="flex items-center gap-1 font-semibold">
                <Coins className="h-4 w-4" />{balance}
              </span>
            </div>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={detail ? 200 : 160}
              rows={3}
              placeholder="เขียนข้อความเชียร์นักเขียน (ไม่บังคับ)"
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />

            {detail && <p className="text-right text-xs text-muted-foreground">{message.length}/200</p>}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        {!success && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>ยกเลิก</Button>
            <Button onClick={handleDonate} disabled={balance < selected} className="bg-primary text-primary-foreground">
              <Heart className="h-4 w-4 mr-1" />
              {detail ? 'สนับสนุน' : 'บริจาค'} {selected.toLocaleString()} เหรียญ
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
