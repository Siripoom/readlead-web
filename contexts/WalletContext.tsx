'use client'

import { createContext, startTransition, useContext, useEffect, useState, type ReactNode } from 'react'
import { useRole } from '@/contexts/RoleContext'
import { walletStorageKey } from '@/lib/profile-repository'

interface WalletContextValue {
  balance: number
  spend: (n: number) => boolean
  topUp: (n: number) => void
}

const WalletContext = createContext<WalletContextValue>({
  balance: 0,
  spend: () => false,
  topUp: () => {},
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0)
  const { user } = useRole()

  useEffect(() => {
    if (!user) {
      startTransition(() => setBalance(0))
      return
    }
    const key = walletStorageKey(user.id)
    const stored = localStorage.getItem(key) ?? localStorage.getItem('rl_wallet')
    const next = stored !== null && Number.isFinite(Number(stored)) ? Number(stored) : 100
    localStorage.setItem(key, String(next))
    startTransition(() => setBalance(next))
  }, [user])

  const spend = (n: number): boolean => {
    if (!user || balance < n) return false
    const next = balance - n
    setBalance(next)
    localStorage.setItem(walletStorageKey(user.id), String(next))
    return true
  }

  const topUp = (n: number) => {
    if (!user) return
    const next = balance + n
    setBalance(next)
    localStorage.setItem(walletStorageKey(user.id), String(next))
  }

  return (
    <WalletContext.Provider value={{ balance, spend, topUp }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
