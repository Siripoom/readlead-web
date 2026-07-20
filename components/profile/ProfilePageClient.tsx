'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { useSearchParams } from 'next/navigation'
import { useProfile } from '@/contexts/ProfileContext'
import { useRole } from '@/contexts/RoleContext'
import { localProfileRepository } from '@/lib/profile-repository'
import { isProfileSection, type PublicProfileData } from '@/lib/profile-types'
import type { Genre, Work } from '@/lib/types'
import OwnerProfileShell from '@/components/profile/OwnerProfileShell'
import PublicProfile from '@/components/profile/PublicProfile'

export default function ProfilePageClient({ userId }: { userId: string }) {
  const searchParams = useSearchParams()
  const { user, role, isLoading } = useRole()
  const { profile } = useProfile()
  const [revision, setRevision] = useState(0)
  const [serverPublic, setServerPublic] = useState<PublicProfileData | null | undefined>(undefined)
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const tabParam = searchParams.get('tab')
  const activeSection = isProfileSection(tabParam) ? tabParam : 'home'
  const isOwner = user?.id === userId

  useEffect(() => {
    if (isOwner) return
    const controller = new AbortController()
    fetch(`/api/catalog/creators/${encodeURIComponent(userId)}`, { cache: 'no-store', signal: controller.signal }).then(async (response) => response.ok ? response.json() : null).then((result: { creator: { id: string; name: string; joinedAt: string; creatorProfile: { followers: number } | null; writerApplication: { penName: string } | null; _count: { followedCreators: number; followers: number }; creatorWorks: Array<{ id: string; type: Work['type']; title: string; category: string; tagline: string; synopsis: string; tags: string[]; origin: 'original' | 'translated'; seriesStatus: string; views: number; dailyVotes: number; monthlyVotes: number; reviewCount: number; updatedAt: string; _count: { episodes: number } }> } } | null) => {
      if (!result) { setServerPublic(null); return }
      const creator = result.creator
      const works: Work[] = creator.creatorWorks.map((work, index) => ({ id: work.id, type: work.type, title: work.title, coverUrl: `https://picsum.photos/seed/creator-${encodeURIComponent(work.id)}/400/600`, synopsis: work.synopsis || work.tagline, genres: [(['romance', 'fantasy', 'action', 'mystery', 'horror', 'comedy', 'drama', 'historical', 'sci-fi', 'slice-of-life', 'bl', 'gl'].includes(work.category) ? work.category : 'fantasy') as Genre], tags: work.tags, authorId: creator.id, authorName: creator.writerApplication?.penName || creator.name, status: work.seriesStatus === 'completed' ? 'completed' : work.seriesStatus === 'hiatus' ? 'hiatus' : 'ongoing', origin: work.origin, rating: 0, voteCount: work.dailyVotes, viewCount: work.views, readCount: work.views, vipTopUpTotal: 0, episodeCount: work._count.episodes, latestEpisode: work._count.episodes ? `ตอนที่ ${work._count.episodes}` : null, isFeatured: index < 2, rankingScore: work.dailyVotes + work.monthlyVotes, updatedAt: work.updatedAt, weeklyVoteCount: work.monthlyVotes }))
      setServerPublic({ profile: { id: creator.id, displayName: creator.writerApplication?.penName || creator.name, handle: creator.id.slice(0, 16), avatarUrl: `https://picsum.photos/seed/profile-${encodeURIComponent(creator.id)}/240/240`, coverGradient: 'linear-gradient(135deg,#7255a7,#e3a3b5)', bio: 'นักเขียนบน ReadLead', kind: 'creator', level: 1, exp: 0, currentLevelExp: 0, nextLevelExp: 100, rankLabel: 'นักเขียน', followerCount: creator.creatorProfile?.followers ?? creator._count.followers, followingCount: creator._count.followedCreators, publicShelfIds: [], workIds: works.map((work) => work.id) }, works, shelf: [], isFollowing: false })
    }).catch(() => { if (!controller.signal.aborted) setServerPublic(null) })
    return () => controller.abort()
  }, [isOwner, userId])

  void profile
  void revision
  const data = !hydrated || isLoading
    ? null
    : isOwner
      ? localProfileRepository.getOwnerDashboard(userId)
      : serverPublic === undefined ? null : serverPublic

  if (!hydrated || isLoading || (isOwner && !data) || (!isOwner && serverPublic === undefined)) {
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
        serverBacked
        onDataChange={() => setRevision((value) => value + 1)}
      />
    )
  }

  return null
}
