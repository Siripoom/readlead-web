'use client'

import { createContext, startTransition, useContext, useEffect, useState, type ReactNode } from 'react'
import { useRole } from '@/contexts/RoleContext'
import { MOCK_USER_PROFILE } from '@/lib/mock-data'
import { profileStorageKey, readStoredUserProfile } from '@/lib/profile-repository'
import type { UserProfile } from '@/lib/types'

interface ProfileContextValue {
  profile: UserProfile
  setDisplayName: (name: string) => void
  updateProfile: (patch: Partial<UserProfile>) => void
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: MOCK_USER_PROFILE,
  setDisplayName: () => {},
  updateProfile: () => {},
})

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(MOCK_USER_PROFILE)
  const { user } = useRole()

  useEffect(() => {
    if (!user) {
      startTransition(() => setProfile(MOCK_USER_PROFILE))
      return
    }
    startTransition(() => setProfile(readStoredUserProfile(user)))
  }, [user])

  const updateProfile = (patch: Partial<UserProfile>) => {
    if (!user) return
    setProfile((current) => {
      const next = { ...current, ...patch }
      localStorage.setItem(profileStorageKey(user.id), JSON.stringify(next))
      return next
    })
  }

  const setDisplayName = (name: string) => {
    const trimmedName = name.trim()
    updateProfile({ displayName: trimmedName || MOCK_USER_PROFILE.displayName })
  }

  return (
    <ProfileContext.Provider value={{ profile, setDisplayName, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
