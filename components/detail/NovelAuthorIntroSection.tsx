'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export interface AuthorInfo {
  id?: string
  name: string
  avatarUrl: string
  badgeLabel?: string
  worksCount: string
  followers: string
  updatedDays: string
  signature?: string
  buttonLabel?: string
}

export interface NovelIntroInfo {
  title: string
  category?: string
  totalWords?: string
  totalEpisodes?: string
  views?: string
  content: string[]
}

interface Props {
  author: AuthorInfo
  intro: NovelIntroInfo
}

export default function NovelAuthorIntroSection({ author, intro }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [following, setFollowing] = useState(false)

  const visibleContent = expanded ? intro.content : intro.content.slice(0, 2)
  const hasMore = intro.content.length > 2

  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-12 bg-white">
      {/* Author Card */}
      <div className="shrink-0 md:w-[280px] rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white">
        <div className="h-14 bg-gray-100" />

        <div className="flex flex-col items-center -mt-10 pb-6 px-6">
          {author.id ? (
            <Link href={`/writer?writerId=${author.id}`} className="group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md group-hover:opacity-90 transition-opacity">
                <Image
                  src={author.avatarUrl}
                  alt={author.name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
            </Link>
          ) : (
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md">
              <Image
                src={author.avatarUrl}
                alt={author.name}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {author.id ? (
            <Link href={`/writer?writerId=${author.id}`}>
              <h3 className="mt-3 text-base font-bold text-gray-900 hover:text-red-500 transition-colors">{author.name}</h3>
            </Link>
          ) : (
            <h3 className="mt-3 text-base font-bold text-gray-900">{author.name}</h3>
          )}

          {author.badgeLabel && (
            <span className="mt-1.5 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full px-3 py-0.5">
              {author.badgeLabel}
            </span>
          )}

          <div className="mt-4 w-full flex divide-x divide-gray-200 text-center">
            <div className="flex-1 px-2">
              <p className="text-sm font-bold text-gray-900">{author.worksCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">ผลงาน</p>
            </div>
            <div className="flex-1 px-2">
              <p className="text-sm font-bold text-gray-900">{author.followers}</p>
              <p className="text-xs text-gray-500 mt-0.5">ผู้ติดตาม</p>
            </div>
            <div className="flex-1 px-2">
              <p className="text-sm font-bold text-gray-900">{author.updatedDays}</p>
              <p className="text-xs text-gray-500 mt-0.5">วันที่อัปเดต</p>
            </div>
          </div>

          {author.signature && (
            <p className="mt-4 text-xs text-gray-500 text-center leading-5 italic border-t border-gray-100 pt-4 w-full">
              {author.signature}
            </p>
          )}

          <button
            onClick={() => setFollowing(f => !f)}
            className={`mt-5 w-full border text-sm font-medium rounded-full py-2 transition-colors ${
              following
                ? 'bg-red-500 border-red-500 text-white'
                : 'border-red-500 text-red-500 hover:bg-red-50'
            }`}
          >
            {following ? 'ติดตามแล้ว' : (author.buttonLabel ?? 'ติดตาม')}
          </button>
        </div>
      </div>

      {/* Intro Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 whitespace-nowrap">{intro.title}</h2>
          <div className="flex-1 border-t-2 border-dashed border-gray-200" />
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 mb-5">
          {intro.category && (
            <span>ประเภท: <span className="text-gray-700 font-medium">{intro.category}</span></span>
          )}
          {intro.totalEpisodes && (
            <span>จำนวนตอน: <span className="text-gray-700 font-medium">{intro.totalEpisodes}</span></span>
          )}
          {intro.totalWords && (
            <span>จำนวนคำ: <span className="text-gray-700 font-medium">{intro.totalWords}</span></span>
          )}
          {intro.views && (
            <span>ยอดอ่าน: <span className="text-gray-700 font-medium">{intro.views}</span></span>
          )}
        </div>

        <div className="space-y-4">
          {visibleContent.map((para, i) => (
            <p key={i} className="text-gray-700 leading-8 text-sm md:text-base">
              {para}
            </p>
          ))}
        </div>

        {hasMore && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-4 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            {expanded ? '▲ ย่อลง' : '▼ อ่านเพิ่มเติม'}
          </button>
        )}
      </div>
    </div>
  )
}
