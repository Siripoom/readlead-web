'use client'

import { createContext, startTransition, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { FirebaseError } from 'firebase/app'
import {
  FirebaseClientConfigurationError,
  getAppleFirebaseIdToken,
  getFacebookFirebaseIdToken,
  getGoogleFirebaseIdToken,
  signOutFirebaseClient,
} from '@/lib/firebase-client'
import type { Role } from '@/lib/types'

export interface AuthUser {
  id: string
  name: string
  email: string
  userType: 'user' | 'creator'
  authProviders: Array<'google' | 'facebook' | 'apple'>
}

export interface AuthActionResult {
  ok: boolean
  error?: string
  fields?: Record<string, string[]>
  cancelled?: boolean
}

interface RoleContextValue {
  role: Role
  user: AuthUser | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthActionResult>
  register: (name: string, email: string, password: string) => Promise<AuthActionResult>
  continueWithGoogle: (mode?: 'sign-in' | 'connect') => Promise<AuthActionResult>
  continueWithFacebook: (mode?: 'sign-in' | 'connect') => Promise<AuthActionResult>
  continueWithApple: (
    mode?: 'sign-in' | 'connect',
    privateRelayConsent?: boolean,
  ) => Promise<AuthActionResult>
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
  continueWithGoogle: async () => ({ ok: false }),
  continueWithFacebook: async () => ({ ok: false }),
  continueWithApple: async () => ({ ok: false }),
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

  const continueWithGoogle = useCallback(async (
    mode: 'sign-in' | 'connect' = 'sign-in',
  ): Promise<AuthActionResult> => {
    try {
      const idToken = await getGoogleFirebaseIdToken({ linkToCurrentUser: mode === 'connect' })
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      const data = await parseAuthResponse(response)
      if (!response.ok || !data.user) {
        await signOutFirebaseClient().catch(() => {})
        return { ok: false, error: data.error ?? 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองใหม่' }
      }
      setUser(data.user)
      setIsLoading(false)
      return { ok: true }
    } catch (error) {
      if (error instanceof FirebaseClientConfigurationError) {
        return { ok: false, error: 'การตั้งค่า Firebase ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ' }
      }
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
          return { ok: false, cancelled: true }
        }
        if (error.code === 'auth/popup-blocked') {
          return { ok: false, error: 'เบราว์เซอร์บล็อกหน้าต่าง Google กรุณาอนุญาต popup แล้วลองใหม่' }
        }
        if (error.code === 'auth/account-exists-with-different-credential' || error.code === 'auth/credential-already-in-use') {
          return {
            ok: false,
            error: 'อีเมลนี้ใช้วิธีเข้าสู่ระบบอื่นอยู่ กรุณาเข้าสู่ระบบด้วยวิธีเดิม แล้วเชื่อม Google จากหน้าโปรไฟล์',
          }
        }
        if (error.code === 'auth/unauthorized-domain') {
          return { ok: false, error: 'โดเมนนี้ยังไม่ได้รับอนุญาตให้เข้าสู่ระบบด้วย Google' }
        }
        if (error.code === 'auth/operation-not-allowed') {
          return { ok: false, error: 'ยังไม่ได้เปิดใช้งาน Google provider ใน Firebase' }
        }
        if (error.code === 'auth/network-request-failed') {
          return { ok: false, error: 'เชื่อมต่อ Google ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่' }
        }
      }
      return { ok: false, error: 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองใหม่' }
    }
  }, [])

  const continueWithFacebook = useCallback(async (
    mode: 'sign-in' | 'connect' = 'sign-in',
  ): Promise<AuthActionResult> => {
    try {
      const idToken = await getFacebookFirebaseIdToken({ linkToCurrentUser: mode === 'connect' })
      const response = await fetch('/api/auth/facebook', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      const data = await parseAuthResponse(response)
      if (!response.ok || !data.user) {
        await signOutFirebaseClient().catch(() => {})
        return { ok: false, error: data.error ?? 'เข้าสู่ระบบด้วย Facebook ไม่สำเร็จ กรุณาลองใหม่' }
      }
      setUser(data.user)
      setIsLoading(false)
      return { ok: true }
    } catch (error) {
      if (error instanceof FirebaseClientConfigurationError) {
        return { ok: false, error: 'การตั้งค่า Firebase ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ' }
      }
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
          return { ok: false, cancelled: true }
        }
        if (error.code === 'auth/popup-blocked') {
          return { ok: false, error: 'เบราว์เซอร์บล็อกหน้าต่าง Facebook กรุณาอนุญาต popup แล้วลองใหม่' }
        }
        if (error.code === 'auth/account-exists-with-different-credential' || error.code === 'auth/credential-already-in-use') {
          return {
            ok: false,
            error: 'อีเมลนี้ใช้วิธีเข้าสู่ระบบอื่นอยู่ กรุณาเข้าสู่ระบบด้วยวิธีเดิม แล้วเชื่อม Facebook จากหน้าโปรไฟล์',
          }
        }
        if (error.code === 'auth/unauthorized-domain') {
          return { ok: false, error: 'โดเมนนี้ยังไม่ได้รับอนุญาตให้เข้าสู่ระบบด้วย Facebook' }
        }
        if (error.code === 'auth/operation-not-allowed') {
          return { ok: false, error: 'ยังไม่ได้เปิดใช้งาน Facebook provider ใน Firebase' }
        }
        if (error.code === 'auth/network-request-failed') {
          return { ok: false, error: 'เชื่อมต่อ Facebook ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่' }
        }
      }
      return { ok: false, error: 'เข้าสู่ระบบด้วย Facebook ไม่สำเร็จ กรุณาลองใหม่' }
    }
  }, [])

  const continueWithApple = useCallback(async (
    mode: 'sign-in' | 'connect' = 'sign-in',
    privateRelayConsent = false,
  ): Promise<AuthActionResult> => {
    try {
      const idToken = await getAppleFirebaseIdToken({ linkToCurrentUser: mode === 'connect' })
      const response = await fetch('/api/auth/apple', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ idToken, privateRelayConsent }),
      })
      const data = await parseAuthResponse(response)
      if (!response.ok || !data.user) {
        await signOutFirebaseClient().catch(() => {})
        return { ok: false, error: data.error ?? 'เข้าสู่ระบบด้วย Apple ไม่สำเร็จ กรุณาลองใหม่' }
      }
      setUser(data.user)
      setIsLoading(false)
      return { ok: true }
    } catch (error) {
      if (error instanceof FirebaseClientConfigurationError) {
        return { ok: false, error: 'การตั้งค่า Firebase ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ' }
      }
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
          return { ok: false, cancelled: true }
        }
        if (error.code === 'auth/popup-blocked') {
          return { ok: false, error: 'เบราว์เซอร์บล็อกหน้าต่าง Apple กรุณาอนุญาต popup แล้วลองใหม่' }
        }
        if (error.code === 'auth/account-exists-with-different-credential' || error.code === 'auth/credential-already-in-use') {
          return {
            ok: false,
            error: 'อีเมลนี้ใช้วิธีเข้าสู่ระบบอื่นอยู่ กรุณาเข้าสู่ระบบด้วยวิธีเดิม แล้วเชื่อม Apple จากหน้าโปรไฟล์',
          }
        }
        if (error.code === 'auth/unauthorized-domain') {
          return { ok: false, error: 'โดเมนนี้ยังไม่ได้รับอนุญาตให้เข้าสู่ระบบด้วย Apple' }
        }
        if (error.code === 'auth/operation-not-allowed') {
          return { ok: false, error: 'ยังตั้งค่า Apple provider ใน Firebase ไม่สมบูรณ์' }
        }
        if (error.code === 'auth/network-request-failed') {
          return { ok: false, error: 'เชื่อมต่อ Apple ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่' }
        }
      }
      return { ok: false, error: 'เข้าสู่ระบบด้วย Apple ไม่สำเร็จ กรุณาลองใหม่' }
    }
  }, [])

  const logout = useCallback(async (): Promise<AuthActionResult> => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      const data = await parseAuthResponse(response)
      await signOutFirebaseClient().catch(() => {})
      if (!response.ok) return { ok: false, error: data.error ?? 'ออกจากระบบไม่สำเร็จ กรุณาลองใหม่' }
      setUser(null)
      return { ok: true }
    } catch {
      await signOutFirebaseClient().catch(() => {})
      return { ok: false, error: 'เชื่อมต่อระบบสมาชิกไม่สำเร็จ กรุณาลองใหม่' }
    }
  }, [])

  const role: Role = user?.userType ?? 'guest'

  return (
    <RoleContext.Provider
      value={{
        role,
        user,
        isLoggedIn: user !== null,
        isLoading,
        login,
        register,
        continueWithGoogle,
        continueWithFacebook,
        continueWithApple,
        logout,
        refreshSession,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
