'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
  CircleHelp,
  FilePenLine,
  Headphones,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  PenSquare,
  Settings,
  WalletCards,
} from 'lucide-react'
import { useRole } from '@/contexts/RoleContext'
import { PROFILE_SECTIONS, type OwnerDashboardData, type ProfileSection } from '@/lib/profile-types'
import type { Role } from '@/lib/types'
import OwnerSections from '@/components/profile/OwnerSections'
import styles from './profile.module.css'

const SECTION_ICONS = {
  home: LayoutDashboard,
  account: Settings,
  activity: MessageSquareText,
  'writer-application': FilePenLine,
  creator: PenSquare,
  wallet: WalletCards,
  help: CircleHelp,
  report: Headphones,
} satisfies Record<ProfileSection, typeof LayoutDashboard>

export default function OwnerProfileShell({
  userId,
  role,
  data,
  activeSection,
  onDataChange,
}: {
  userId: string
  role: Role
  data: OwnerDashboardData
  activeSection: ProfileSection
  onDataChange: () => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { logout } = useRole()

  const navigate = (section: ProfileSection) => {
    router.push(section === 'home' ? pathname : `${pathname}?tab=${section}`, { scroll: false })
  }

  const signOut = async () => {
    const result = await logout()
    if (result.ok) router.push('/')
  }

  return (
    <div className={styles.accountPage}>
      <div className={styles.accountGrid}>
        <aside className={styles.sidebar} aria-label="เมนูบัญชี">
          {PROFILE_SECTIONS.map((section, index) => {
            const Icon = SECTION_ICONS[section.id]
            return (
              <div key={section.id}>
                {(index === 3 || index === 5) && <div className={styles.sideDivider} />}
                <button
                  type="button"
                  onClick={() => navigate(section.id)}
                  className={`${styles.sideButton} ${activeSection === section.id ? styles.sideButtonActive : ''}`}
                  aria-current={activeSection === section.id ? 'page' : undefined}
                >
                  <Icon /> {section.label}
                </button>
              </div>
            )
          })}
          <div className={styles.sideDivider} />
          <button type="button" onClick={signOut} className={styles.sideButton} style={{ color: '#c03645' }}>
            <LogOut /> ออกจากระบบ
          </button>
        </aside>

        <div className={styles.main}>
          <label className="sr-only" htmlFor="owner-profile-section">เลือกเมนูบัญชี</label>
          <select
            id="owner-profile-section"
            className={styles.mobileSelect}
            value={activeSection}
            onChange={(event) => navigate(event.target.value as ProfileSection)}
          >
            {PROFILE_SECTIONS.map((section) => <option key={section.id} value={section.id}>{section.label}</option>)}
          </select>
          <OwnerSections
            userId={userId}
            role={role}
            data={data}
            section={activeSection}
            onDataChange={onDataChange}
          />
        </div>
      </div>
    </div>
  )
}
