import Link from 'next/link'
import Image from 'next/image'
import { LockKeyhole, Plus } from 'lucide-react'
import CreatorStudioHome from '@/components/creator/CreatorStudioHome'
import BookmarkList from '@/components/dashboard/BookmarkList'
import FollowedStories from '@/components/dashboard/FollowedStories'
import PurchaseHistory from '@/components/dashboard/PurchaseHistory'
import WalletCard from '@/components/dashboard/WalletCard'
import { MOCK_CREATORS, MOCK_WORKS } from '@/lib/mock-data'
import type { Role } from '@/lib/types'
import styles from '../profile.module.css'

export function OwnerCreator({ role, userId }: { role: Role; userId: string }) {
  if (role !== 'creator' && role !== 'admin') {
    return (
      <section className={`${styles.card} ${styles.creatorLocked}`}>
        <LockKeyhole />
        <h1 className={styles.sectionTitle}>แดชบอร์ดสำหรับนักเขียน</h1>
        <p className={styles.sectionDesc}>บัญชีนี้ยังไม่มีสิทธิ์นักเขียน กรุณาส่งแบบฟอร์มในเมนู “สมัครนักเขียน” ก่อน</p>
      </section>
    )
  }

  const creator = MOCK_CREATORS.find((item) => item.id === userId) ?? MOCK_CREATORS[0]
  const works = MOCK_WORKS.filter((work) => creator.workIds.includes(work.id))

  return (
    <div className={styles.stack}>
      <div className={styles.sectionHeader}>
        <div><h1 className={styles.sectionTitle}>แดชบอร์ดนักเขียน</h1><p className={styles.sectionDesc}>ภาพรวมผลงาน ผู้ติดตาม และรายได้</p></div>
        <Link href="/creator/works/new" className={styles.primaryButton}><Plus size={15} className="mr-1 inline" /> เพิ่มผลงาน</Link>
      </div>
      <section className={`${styles.card} ${styles.sectionCard}`}><CreatorStudioHome creator={creator} /></section>
      <section className={`${styles.card} ${styles.sectionCard}`}>
        <div className={styles.sectionHeader}><div><h2 className={styles.sectionTitle}>ผลงานทั้งหมด</h2><p className={styles.sectionDesc}>เลือกผลงานเพื่อเปิดหน้าจัดการรายละเอียดและตอน</p></div></div>
        {works.length ? <div className="space-y-3">{works.map((work) => (
          <Link key={work.id} href={`/creator/works/${work.id}`} className="flex items-center gap-4 rounded-xl border p-3 transition-colors hover:border-[#cc4452] hover:bg-[#fff8f9]">
            <Image src={work.coverUrl} alt={work.title} width={48} height={64} className="h-16 w-12 rounded-md object-cover" />
            <span className="min-w-0 flex-1"><b className="block truncate text-sm">{work.title}</b><span className="text-xs text-[#8b91a0]">{work.episodeCount} ตอน · {work.viewCount.toLocaleString('th-TH')} ครั้ง</span></span>
            <span className="text-xs font-semibold text-[#cc4452]">จัดการ →</span>
          </Link>
        ))}</div> : <div className={styles.empty}>ยังไม่มีผลงาน</div>}
      </section>
    </div>
  )
}

export function OwnerWallet() {
  return (
    <div className={styles.stack}>
      <header><h1 className={styles.sectionTitle}>กระเป๋าเงินและห้องสมุด</h1><p className={styles.sectionDesc}>จัดการเหรียญ รายการซื้อ และเนื้อหาที่บันทึกไว้</p></header>
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <WalletCard />
        <section className={`${styles.card} ${styles.sectionCard}`}>
          <div className={styles.sectionHeader}><div><h2 className={styles.sectionTitle}>ประวัติการซื้อ</h2><p className={styles.sectionDesc}>รายการตอนที่ซื้อด้วยเหรียญ ReadLead</p></div></div>
          <PurchaseHistory />
        </section>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className={`${styles.card} ${styles.sectionCard}`}>
          <div className={styles.sectionHeader}><div><h2 className={styles.sectionTitle}>บุ๊คมาร์ค</h2><p className={styles.sectionDesc}>รายการที่บันทึกไว้อ่านต่อ</p></div></div>
          <BookmarkList />
        </section>
        <section className={`${styles.card} ${styles.sectionCard}`}>
          <div className={styles.sectionHeader}><div><h2 className={styles.sectionTitle}>เรื่องที่ติดตาม</h2><p className={styles.sectionDesc}>ติดตามการอัปเดตตอนใหม่</p></div></div>
          <FollowedStories />
        </section>
      </div>
    </div>
  )
}
