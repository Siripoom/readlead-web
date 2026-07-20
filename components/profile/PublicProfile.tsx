'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Share2 } from 'lucide-react'
import { BookCard } from '@/components/shared/BookCard'
import { localProfileRepository } from '@/lib/profile-repository'
import type { PublicProfileData, PublicProfileFilter } from '@/lib/profile-types'
import styles from './profile.module.css'

const FILTER_LABELS: Record<PublicProfileFilter, string> = {
  all: 'หน้าแรก',
  novel: 'นิยาย',
  manga: 'เว็บตูน',
  audiobook: 'หนังสือเสียง',
}

export default function PublicProfile({
  data,
  viewerId,
  onDataChange,
  serverBacked = false,
}: {
  data: PublicProfileData
  viewerId?: string
  onDataChange: () => void
  serverBacked?: boolean
}) {
  const router = useRouter()
  const [filter, setFilter] = useState<PublicProfileFilter>('all')
  const [notice, setNotice] = useState('')
  const [following, setFollowing] = useState(data.isFollowing)
  const items = data.profile.kind === 'creator' ? data.works : data.shelf
  const availableFilters = useMemo(
    () => (['all', ...new Set(items.map((item) => item.type))] as PublicProfileFilter[]),
    [items],
  )
  const shown = filter === 'all' ? items : items.filter((item) => item.type === filter)

  const toggleFollow = () => {
    if (!viewerId) {
      router.push(`/login?next=${encodeURIComponent(`/profile/${data.profile.id}`)}`)
      return
    }
    if (serverBacked && data.profile.kind === 'creator') {
      void fetch('/api/interactions/follow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ creatorId: data.profile.id }) }).then(async (response) => { const result = await response.json().catch(() => ({})) as { active?: boolean; error?: string }; if (response.ok) setFollowing(Boolean(result.active)); else setNotice(result.error || 'ติดตามไม่สำเร็จ') })
      return
    }
    setFollowing(localProfileRepository.toggleFollow(viewerId, data.profile.id))
    onDataChange()
  }

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setNotice('คัดลอกลิงก์โปรไฟล์แล้ว')
    } catch {
      setNotice('ไม่สามารถคัดลอกลิงก์อัตโนมัติได้ กรุณาคัดลอกจากแถบที่อยู่')
    }
  }

  return (
    <div className={styles.publicPage}>
      <div className={styles.publicWrap}>
        <div className={styles.cover} style={{ background: data.profile.coverGradient }} />
        <div className={styles.publicHead}>
          <Image
            src={data.profile.avatarUrl}
            alt={data.profile.displayName}
            width={112}
            height={112}
            className={styles.publicAvatar}
          />
          <div className={styles.publicIdentity}>
            <h1>{data.profile.displayName}</h1>
            <div className={styles.handle}>@{data.profile.handle}</div>
            <p className={styles.publicBio}>{data.profile.bio}</p>
          </div>
          <div className={styles.publicActions}>
            <button
              type="button"
              onClick={toggleFollow}
              className={`${styles.primaryButton} ${following ? styles.primaryButtonFollowing : ''}`}
              aria-pressed={following}
            >
              {following ? '✓ กำลังติดตาม' : 'ติดตาม'}
            </button>
            <button type="button" onClick={share} className={styles.iconButton} aria-label="คัดลอกลิงก์โปรไฟล์">
              <Share2 size={17} />
            </button>
          </div>
        </div>

        <div className={styles.publicStats}>
          <div><b>{items.length.toLocaleString('th-TH')}</b><span>เรื่อง</span></div>
          <div><b>{data.profile.followerCount.toLocaleString('th-TH')}</b><span>ผู้ติดตาม</span></div>
          <div><b>{data.profile.followingCount.toLocaleString('th-TH')}</b><span>กำลังติดตาม</span></div>
        </div>
        {notice && <p className={`${styles.notice} px-[34px]`} role="status">{notice}</p>}

        <div className={styles.publicTabs} role="tablist" aria-label="ประเภทเนื้อหาในโปรไฟล์">
          {availableFilters.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={filter === item}
              onClick={() => setFilter(item)}
              className={`${styles.publicTab} ${filter === item ? styles.publicTabActive : ''}`}
            >
              {FILTER_LABELS[item]}
            </button>
          ))}
        </div>

        <section className={styles.publicContent}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                {data.profile.kind === 'creator' ? 'ผลงานทั้งหมด' : 'ชั้นหนังสือ'} ({shown.length})
              </h2>
              <p className={styles.sectionDesc}>
                {data.profile.kind === 'creator' ? 'ผลงานที่เผยแพร่บน ReadLead' : 'รายการอ่านที่เจ้าของโปรไฟล์เปิดเป็นสาธารณะ'}
              </p>
            </div>
          </div>
          {shown.length ? (
            <div className={styles.bookGrid}>
              {shown.map((work) => <BookCard key={work.id} work={work} />)}
            </div>
          ) : (
            <div className={styles.empty}>ยังไม่มีรายการในหมวดนี้</div>
          )}
        </section>
      </div>
    </div>
  )
}
