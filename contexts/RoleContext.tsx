'use client'
import { createContext, startTransition, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Role } from '@/lib/types'

interface RoleContextValue {
  role: Role
  setRole: (r: Role) => void
  isLoggedIn: boolean
}

const RoleContext = createContext<RoleContextValue>({
  role: 'guest',
  setRole: () => {},
  isLoggedIn: false,
})

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>('guest')

  useEffect(() => {
    const stored = localStorage.getItem('rl_role') as Role | null
    if (stored) {
      startTransition(() => {
        setRoleState(stored)
      })
    }
  }, [])

  const setRole = (r: Role) => {
    setRoleState(r)
    localStorage.setItem('rl_role', r)
  }

  return (
    <RoleContext.Provider value={{ role, setRole, isLoggedIn: role !== 'guest' }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
