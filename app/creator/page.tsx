'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import RouteGuard from '@/components/layout/RouteGuard'
import { useRole } from '@/contexts/RoleContext'

function CreatorRedirect() {
  const router = useRouter()
  const { user } = useRole()

  useEffect(() => {
    if (user) router.replace(`/profile/${user.id}?tab=creator`)
  }, [router, user])

  return (
    <main className="flex min-h-[65vh] items-center justify-center text-sm text-muted-foreground" aria-busy="true">
      กำลังเปิดแดชบอร์ดนักเขียน…
    </main>
  )
}

export default function CreatorPage() {
  return (
    <RouteGuard allowedRoles={['creator', 'admin']}>
      <CreatorRedirect />
    </RouteGuard>
  )
}
