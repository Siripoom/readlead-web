'use client'
import { ProfileProvider } from '@/contexts/ProfileContext'
import { RoleProvider } from '@/contexts/RoleContext'
import { WalletProvider } from '@/contexts/WalletContext'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <RoleProvider>
      <ProfileProvider>
        <WalletProvider>{children}</WalletProvider>
      </ProfileProvider>
    </RoleProvider>
  )
}
