'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BookCard } from '@/components/shared/BookCard'
import type { Work } from '@/lib/types'

export interface WriterProfile {
  id: string
  name: string
  avatarUrl: string
  badgeLabel?: string
  tagline?: string
  bio?: string
  worksCount: number
  totalViews: string
  followers: string
  totalEpisodes: string
  joinedAt?: string
  latestUpdatedAt?: string
  isFollowing?: boolean
}

type FilterTab = 'all' | 'novel' | 'manga' | 'audiobook' | 'ongoing' | 'completed'
type SortOption = 'latest' | 'popular' | 'views'

const TAB_LABELS: Record<FilterTab, string> = {
  all: 'ทั้งหมด',
  novel: 'นิยาย',
  manga: 'มังงะ',
  audiobook: 'Audiobook',
  ongoing: 'กำลังอัปเดต',
  completed: 'จบแล้ว',
}

const TAB_PREDICATES: Record<FilterTab, (w: Work) => boolean> = {
  all: () => true,
  novel: w => w.type === 'novel',
  manga: w => w.type === 'manga',
  audiobook: w => w.type === 'audiobook',
  ongoing: w => w.status === 'ongoing',
  completed: w => w.status === 'completed',
}

interface Props {
  writer: WriterProfile
  works: Work[]
}

export default function PublicWriterProfilePage({ writer, works }: Props) {
  const [isFollowing, setIsFollowing] = useState(writer.isFollowing ?? false)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [sort, setSort] = useState<SortOption>('latest')
  const [bioExpanded, setBioExpanded] = useState(false)
  const [bioIsClamped, setBioIsClamped] = useState(false)
  const bioRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = bioRef.current
    if (el) setBioIsClamped(el.scrollHeight > el.clientHeight)
  }, [writer.bio])

  const filteredWorks = useMemo(() => {
    const filtered = works.filter(TAB_PREDICATES[activeTab])
    return [...filtered].sort((a, b) => {
      if (sort === 'latest') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      if (sort === 'popular') return b.rankingScore - a.rankingScore
      return b.viewCount - a.viewCount
    })
  }, [works, activeTab, sort])

  return (
    <div className="space-y-6">
      {/* Section 1: Profile Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-24 bg-linear-to-r from-gray-200 to-gray-300" />

        <div className="px-6 pb-6">
          <div className="-mt-12 mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
              <Image
                src={writer.avatarUrl}
                alt={writer.name}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{writer.name}</h1>
            {writer.badgeLabel && (
              <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full px-3 py-0.5">
                {writer.badgeLabel}
              </span>
            )}
          </div>

          {writer.tagline && (
            <p className="mt-1 text-sm text-gray-500">{writer.tagline}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsFollowing(f => !f)}
              className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
                isFollowing
                  ? 'bg-red-500 text-white border border-red-500 hover:bg-red-600'
                  : 'border border-red-500 text-red-500 hover:bg-red-50'
              }`}
            >
              {isFollowing ? 'กำลังติดตาม' : 'ติดตาม'}
            </button>
            <button
              type="button"
              disabled
              className="rounded-full px-5 py-1.5 text-sm font-medium border border-gray-300 text-gray-400 cursor-not-allowed"
            >
              ส่งข้อความ
            </button>
          </div>

          <div className="mt-5 flex divide-x divide-gray-200 text-center">
            <div className="flex-1 px-3">
              <p className="text-base font-bold text-gray-900">{writer.worksCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">จำนวนผลงาน</p>
            </div>
            <div className="flex-1 px-3">
              <p className="text-base font-bold text-gray-900">{writer.totalViews}</p>
              <p className="text-xs text-gray-500 mt-0.5">ยอดอ่านรวม</p>
            </div>
            <div className="flex-1 px-3">
              <p className="text-base font-bold text-gray-900">{writer.followers}</p>
              <p className="text-xs text-gray-500 mt-0.5">ผู้ติดตาม</p>
            </div>
            <div className="flex-1 px-3">
              <p className="text-base font-bold text-gray-900">{writer.totalEpisodes}</p>
              <p className="text-xs text-gray-500 mt-0.5">ตอนรวม</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Bio */}
      {writer.bio && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-3">เกี่ยวกับนักเขียน</h2>
          <p
            ref={bioRef}
            className={`text-sm text-gray-700 leading-7 ${bioExpanded ? '' : 'line-clamp-3'}`}
          >
            {writer.bio}
          </p>
          {bioIsClamped && (
            <button
              type="button"
              onClick={() => setBioExpanded(e => !e)}
              className="mt-2 text-sm text-red-500 hover:text-red-600 font-medium transition-colors flex items-center gap-1"
            >
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${bioExpanded ? 'rotate-180' : ''}`} />
              {bioExpanded ? 'ย่อลง' : 'อ่านเพิ่มเติม'}
            </button>
          )}
        </div>
      )}

      {/* Section 3+4: Works + Grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            ผลงานของนักเขียน
            <span className="ml-2 text-sm font-normal text-gray-400">({writer.worksCount} เรื่อง)</span>
          </h2>

          <Select value={sort} onValueChange={v => setSort(v as SortOption)}>
            <SelectTrigger className="w-36 shrink-0 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">ล่าสุด</SelectItem>
              <SelectItem value="popular">ยอดนิยม</SelectItem>
              <SelectItem value="views">ยอดอ่านสูงสุด</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
          {(Object.keys(TAB_LABELS) as FilterTab[]).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-red-500 text-white'
                  : 'border border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {filteredWorks.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredWorks.map(w => (
              <BookCard key={w.id} work={w} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📚</p>
            <p className="font-medium">ไม่พบผลงานที่ตรงกัน</p>
          </div>
        )}
      </div>
    </div>
  )
}
