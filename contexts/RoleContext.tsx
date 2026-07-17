'use client'

import { createContext, startTransition, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Role } from '@/lib/types'

export interface AuthUser {
  id: string
  name: string
  email: string
  userType: 'user' | 'creator'
}

export interface AuthActionResult {
  ok: boolean
  error?: string
  fields?: Record<string, string[]>
}

interface RoleContextValue {
  role: Role
  user: AuthUser | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthActionResult>
  register: (name: string, email: string, password: string) => Promise<AuthActionResult>
  logout: () => Promise<AuthActionResult>
  refreshSession: () => Promise<void>
}

const RoleContext = createContext<RoleContextValue>({
  role: 'guest',
  user: null,
  isLoggedIn: false,
  isLoading: true,
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  logout: async () => ({ ok: false }),
  refreshSession: async () => {},
})

async function parseAuthResponse(response: Response) {
  return await response.json().catch(() => ({})) as {
    ok?: boolean
    user?: AuthUser | null
    error?: string
    fields?: Record<string, string[]>
  }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store' })
      const data = await parseAuthResponse(response)
      setUser(response.ok ? data.user ?? null : null)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    startTransition(() => {
      void refreshSession()
    })
  }, [refreshSession])

  const submitAuth = useCallback(async (action: 'login' | 'register', body: Record<string, string>) => {
    try {
      const response = await fetch(`/api/auth/${action}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await parseAuthResponse(response)
      if (!response.ok || !data.user) {
        return { ok: false, error: data.error ?? 'ดำเนินการไม่สำเร็จ กรุณาลองใหม่', fields: data.fields }
      }
      setUser(data.user)
      setIsLoading(false)
      return { ok: true }
    } catch {
      return { ok: false, error: 'เชื่อมต่อระบบสมาชิกไม่สำเร็จ กรุณาลองใหม่' }
    }
  }, [])

  const login = useCallback(
    (email: string, password: string) => submitAuth('login', { email, password }),
    [submitAuth],
  )
  const register = useCallback(
    (name: string, email: string, password: string) => submitAuth('register', { name, email, password }),
    [submitAuth],
  )
  const logout = useCallback(async (): Promise<AuthActionResult> => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      const data = await parseAuthResponse(response)
      if (!response.ok) return { ok: false, error: data.error ?? 'ออกจากระบบไม่สำเร็จ กรุณาลองใหม่' }
      setUser(null)
      return { ok: true }
    } catch {
      return { ok: false, error: 'เชื่อมต่อระบบสมาชิกไม่สำเร็จ กรุณาลองใหม่' }
    }
  }, [])

  const role: Role = user?.userType ?? 'guest'

  return (
    <RoleContext.Provider
      value={{ role, user, isLoggedIn: user !== null, isLoading, login, register, logout, refreshSession }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
