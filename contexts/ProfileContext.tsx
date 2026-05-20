'use client'

import { createContext, startTransition, useContext, useEffect, useState, type ReactNode } from 'react'
import { MOCK_USER_PROFILE } from '@/lib/mock-data'
import type { UserProfile } from '@/lib/types'

interface ProfileContextValue {
  profile: UserProfile
  setDisplayName: (name: string) => void
}

const STORAGE_KEY = 'rl_profile'

const ProfileContext = createContext<ProfileContextValue>({
  profile: MOCK_USER_PROFILE,
  setDisplayName: () => {},
})

function persistProfile(next: UserProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(MOCK_USER_PROFILE)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      persistProfile(MOCK_USER_PROFILE)
      return
    }

    try {
      const parsed = JSON.parse(stored) as Partial<UserProfile>
      startTransition(() => {
        setProfile({ ...MOCK_USER_PROFILE, ...parsed })
      })
    } catch {
      persistProfile(MOCK_USER_PROFILE)
    }
  }, [])

  const setDisplayName = (name: string) => {
    const trimmedName = name.trim()
    const nextProfile = {
      ...profile,
      displayName: trimmedName || MOCK_USER_PROFILE.displayName,
    }

    setProfile(nextProfile)
    persistProfile(nextProfile)
  }

  return (
    <ProfileContext.Provider value={{ profile, setDisplayName }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
