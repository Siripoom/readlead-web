'use client'

import type { OwnerDashboardData, ProfileSection } from '@/lib/profile-types'
import type { Role } from '@/lib/types'
import { OwnerHome } from '@/components/profile/sections/OwnerHome'
import { OwnerAccount, OwnerActivity } from '@/components/profile/sections/OwnerAccountActivity'
import { OwnerWriterApplication } from '@/components/profile/sections/OwnerWriterApplication'
import { OwnerCreator, OwnerWallet } from '@/components/profile/sections/OwnerCreatorWallet'
import { OwnerHelp, OwnerReport } from '@/components/profile/sections/OwnerHelpReport'

export default function OwnerSections({
  userId,
  role,
  data,
  section,
  onDataChange,
}: {
  userId: string
  role: Role
  data: OwnerDashboardData
  section: ProfileSection
  onDataChange: () => void
}) {
  switch (section) {
    case 'account':
      return <OwnerAccount key={`${data.profile.displayName}:${data.profile.handle}:${data.profile.avatarUrl}:${data.profile.bio}`} onDataChange={onDataChange} />
    case 'activity':
      return <OwnerActivity userId={userId} activities={data.activities} onDataChange={onDataChange} />
    case 'writer-application':
      return <OwnerWriterApplication />
    case 'creator':
      return <OwnerCreator role={role} userId={userId} />
    case 'wallet':
      return <OwnerWallet />
    case 'help':
      return <OwnerHelp />
    case 'report':
      return <OwnerReport />
    default:
      return <OwnerHome data={data} />
  }
}
