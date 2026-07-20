'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useRole } from '@/contexts/RoleContext'

interface WalletContextValue {
  balance: number
  spend: (n: number) => boolean
  topUp: (n: number) => Promise<boolean>
}

const WalletContext = createContext<WalletContextValue>({
  balance: 0,
  spend: () => false,
  topUp: async () => false,
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0)
  const { user } = useRole()

  useEffect(() => {
    const controller = new AbortController()
    if (user) fetch('/api/member/activity', { cache: 'no-store', signal: controller.signal }).then((response) => response.ok ? response.json() : { coinBalance: 0 }).then((data: { coinBalance?: number }) => setBalance(data.coinBalance ?? 0)).catch(() => undefined)
    else queueMicrotask(() => setBalance(0))
    return () => controller.abort()
  }, [user])

  const spend = (n: number): boolean => {
    if (!user || balance < n) return false
    const next = balance - n
    setBalance(next)
    return true
  }

  const topUp = async (n: number) => {
    if (!user) return false
    const response = await fetch('/api/interactions/simulate-topup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: n, idempotencyKey: `demo-topup:${user.id}:${crypto.randomUUID()}` }) })
    if (!response.ok) return false
    const data = await response.json() as { balance: number }
    setBalance(data.balance)
    return true
  }

  return (
    <WalletContext.Provider value={{ balance, spend, topUp }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
