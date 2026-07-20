'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useRole } from '@/contexts/RoleContext'
import styles from './CreatorStudio.module.css'

export function CreatorStudioShell({ children, backHref, backLabel = 'แดชบอร์ดนักเขียน' }: { children: ReactNode; backHref?: string; backLabel?: string }) {
  const { user } = useRole()
  const dashboardHref = user ? `/profile/${user.id}?tab=creator` : '/creator'
  return <main className={styles.studio}><div className={styles.container}><Link className={styles.breadcrumb} href={backHref ?? dashboardHref}><ChevronLeft size={16} />{backLabel}</Link>{children}</div></main>
}

export { styles as creatorStudioStyles }
