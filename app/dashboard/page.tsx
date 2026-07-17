'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'

export default function LegacyDashboardRedirect() {
  const router = useRouter()
  const { user, isLoading } = useRole()

  useEffect(() => {
    if (isLoading) return
    router.replace(user ? `/profile/${encodeURIComponent(user.id)}` : '/login?next=%2Fdashboard')
  }, [isLoading, router, user])

  return (
    <div className="flex min-h-[65vh] items-center justify-center text-sm text-muted-foreground" aria-busy="true">
      กำลังเปิดหน้าบัญชีของคุณ...
    </div>
  )
}
