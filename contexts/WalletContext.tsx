'use client'
import { createContext, startTransition, useContext, useState, useEffect, type ReactNode } from 'react'

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

  useEffect(() => {
    const stored = localStorage.getItem('rl_wallet')
    startTransition(() => {
      setBalance(stored !== null ? Number(stored) : 100)
    })
  }, [])

  const spend = (n: number): boolean => {
    if (balance < n) return false
    const next = balance - n
    setBalance(next)
    localStorage.setItem('rl_wallet', String(next))
    return true
  }

  const topUp = (n: number) => {
    const next = balance + n
    setBalance(next)
    localStorage.setItem('rl_wallet', String(next))
  }

  return (
    <WalletContext.Provider value={{ balance, spend, topUp }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
