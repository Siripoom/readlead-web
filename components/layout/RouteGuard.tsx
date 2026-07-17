'use client'
import { useRole } from '@/contexts/RoleContext'
import type { Role } from '@/lib/types'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Props {
  allowedRoles: Role[]
  children: ReactNode
}

export function RouteGuard({ allowedRoles, children }: Props) {
  const { role, isLoading } = useRole()
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground" aria-busy="true">
        กำลังตรวจสอบสิทธิ์...
      </div>
    )
  }
  if (!allowedRoles.includes(role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="text-6xl">🔒</div>
        <h2 className="text-2xl font-bold text-primary">ไม่มีสิทธิ์เข้าถึง</h2>
        <p className="text-muted-foreground">คุณต้องเข้าสู่ระบบหรือมีสิทธิ์ที่เหมาะสมเพื่อดูหน้านี้</p>
        <Link href="/"><Button>กลับหน้าหลัก</Button></Link>
      </div>
    )
  }
  return <>{children}</>
}

export default RouteGuard
