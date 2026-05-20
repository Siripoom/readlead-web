'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Coins, Plus } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import TopUpModal from '@/components/modals/TopUpModal'

export default function WalletCard() {
  const { balance } = useWallet()
  const [topUpOpen, setTopUpOpen] = useState(false)

  return (
    <>
      <Card className="border-gold/30 bg-gradient-to-br from-primary/5 to-accent/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-primary">
            <Coins className="h-5 w-5" />
            กระเป๋าเหรียญ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-4xl font-bold text-foreground flex items-baseline gap-2">
            {balance.toLocaleString()}
            <span className="text-base font-normal text-muted-foreground">เหรียญ</span>
          </div>
          <Button
            onClick={() => setTopUpOpen(true)}
            className="w-full bg-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-1" />
            เติมเหรียญ
          </Button>
        </CardContent>
      </Card>

      <TopUpModal open={topUpOpen} onOpenChange={setTopUpOpen} />
    </>
  )
}
