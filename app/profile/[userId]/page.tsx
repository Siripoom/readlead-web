import { Suspense } from 'react'
import ProfilePageClient from '@/components/profile/ProfilePageClient'

export default async function ProfilePage({ params }: PageProps<'/profile/[userId]'>) {
  const { userId } = await params
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfilePageClient userId={userId} />
    </Suspense>
  )
}

function ProfileLoading() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-6xl items-center justify-center px-4" aria-busy="true">
      <div className="space-y-3 text-center">
        <div className="mx-auto size-12 animate-pulse rounded-full bg-[#f5dfe3]" />
        <p className="text-sm text-[#8b91a0]">กำลังโหลดโปรไฟล์...</p>
      </div>
    </div>
  )
}
