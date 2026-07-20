'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useRole } from '@/contexts/RoleContext'
import type { PaymentMethod, WalletPackage, WalletTransaction } from '@/lib/types'

export type WalletTopUpMethod = Extract<PaymentMethod, 'credit-card' | 'promptpay' | 'truemoney' | 'counter-service'>

type WalletSnapshot = {
  balance: number
  topUpEnabled: boolean
  packages: WalletPackage[]
  transactions: WalletTransaction[]
}

interface WalletContextValue {
  balance: number
  topUpEnabled: boolean
  packages: WalletPackage[]
  transactions: WalletTransaction[]
  loading: boolean
  error: boolean
  spend: (n: number) => boolean
  topUp: (packageId: string, paymentMethod: WalletTopUpMethod) => Promise<boolean>
  refresh: () => Promise<void>
}

const WalletContext = createContext<WalletContextValue>({
  balance: 0,
  topUpEnabled: false,
  packages: [],
  transactions: [],
  loading: false,
  error: false,
  spend: () => false,
  topUp: async () => false,
  refresh: async () => undefined,
})

async function requestWallet(signal?: AbortSignal) {
  const response = await fetch('/api/member/wallet', { cache: 'no-store', signal })
  if (!response.ok) throw new Error('WALLET_LOAD_FAILED')
  return response.json() as Promise<WalletSnapshot>
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0)
  const [topUpEnabled, setTopUpEnabled] = useState(false)
  const [packages, setPackages] = useState<WalletPackage[]>([])
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { user } = useRole()

  const applySnapshot = useCallback((snapshot: WalletSnapshot) => {
    setBalance(snapshot.balance)
    setTopUpEnabled(snapshot.topUpEnabled)
    setPackages(snapshot.packages)
    setTransactions(snapshot.transactions)
    setError(false)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    if (user) requestWallet(controller.signal).then(applySnapshot).catch((reason: unknown) => {
      if (!(reason instanceof DOMException && reason.name === 'AbortError')) setError(true)
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    else queueMicrotask(() => {
      setBalance(0)
      setTopUpEnabled(false)
      setPackages([])
      setTransactions([])
      setError(false)
      setLoading(false)
    })
    return () => controller.abort()
  }, [applySnapshot, user])

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      applySnapshot(await requestWallet())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [applySnapshot, user])

  const spend = (n: number): boolean => {
    if (!user || balance < n) return false
    const next = balance - n
    setBalance(next)
    return true
  }

  const topUp = async (packageId: string, paymentMethod: WalletTopUpMethod) => {
    if (!user) return false
    try {
      const response = await fetch('/api/interactions/simulate-topup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packageId, paymentMethod, idempotencyKey: `demo-topup:${user.id}:${crypto.randomUUID()}` }) })
      if (!response.ok) return false
      const data = await response.json() as { balance: number }
      setBalance(data.balance)
      await refresh()
      return true
    } catch {
      return false
    }
  }

  return (
    <WalletContext.Provider value={{ balance, topUpEnabled, packages, transactions, loading, error, spend, topUp, refresh }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
