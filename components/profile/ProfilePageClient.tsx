'use client'

import { useState, useSyncExternalStore } from 'react'
import { useSearchParams } from 'next/navigation'
import { useProfile } from '@/contexts/ProfileContext'
import { useRole } from '@/contexts/RoleContext'
import { localProfileRepository } from '@/lib/profile-repository'
import { isProfileSection } from '@/lib/profile-types'
import OwnerProfileShell from '@/components/profile/OwnerProfileShell'
import PublicProfile from '@/components/profile/PublicProfile'

export default function ProfilePageClient({ userId }: { userId: string }) {
  const searchParams = useSearchParams()
  const { user, role, isLoading } = useRole()
  const { profile } = useProfile()
  const [revision, setRevision] = useState(0)
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const tabParam = searchParams.get('tab')
  const activeSection = isProfileSection(tabParam) ? tabParam : 'home'
  const isOwner = user?.id === userId

  void profile
  void revision
  const data = !hydrated || isLoading
    ? null
    : isOwner
      ? localProfileRepository.getOwnerDashboard(userId)
      : localProfileRepository.getPublicProfile(userId, user?.id)

  if (!hydrated || isLoading || (isOwner && !data)) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center text-sm text-[#8b91a0]" aria-busy="true">
        กำลังตรวจสอบโปรไฟล์และสิทธิ์การเข้าถึง...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-5xl" aria-hidden="true">📖</div>
        <h1 className="text-2xl font-bold text-[#23252f]">ไม่พบโปรไฟล์นี้</h1>
        <p className="text-sm leading-6 text-[#8b91a0]">บัญชีอาจไม่มีอยู่ หรือยังไม่ได้เปิดใช้โปรไฟล์สาธารณะ</p>
      </div>
    )
  }

  if (isOwner && 'dailyVote' in data) {
    return (
      <OwnerProfileShell
        userId={userId}
        role={role}
        data={data}
        activeSection={activeSection}
        onDataChange={() => setRevision((value) => value + 1)}
      />
    )
  }

  if ('works' in data) {
    return (
      <PublicProfile
        data={data}
        viewerId={user?.id}
        onDataChange={() => setRevision((value) => value + 1)}
      />
    )
  }

  return null
}
