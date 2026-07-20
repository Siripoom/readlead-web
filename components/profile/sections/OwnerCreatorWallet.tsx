import { LockKeyhole } from 'lucide-react'
import CreatorDashboard from '@/components/creator/CreatorDashboard'
import BookmarkList from '@/components/dashboard/BookmarkList'
import FollowedStories from '@/components/dashboard/FollowedStories'
import PurchaseHistory from '@/components/dashboard/PurchaseHistory'
import WalletCard from '@/components/dashboard/WalletCard'
import type { Role } from '@/lib/types'
import styles from '../profile.module.css'

export function OwnerCreator({ role }: { role: Role; userId: string }) {
  if (role !== 'creator' && role !== 'admin') {
    return (
      <section className={`${styles.card} ${styles.creatorLocked}`}>
        <LockKeyhole />
        <h1 className={styles.sectionTitle}>แดชบอร์ดสำหรับนักเขียน</h1>
        <p className={styles.sectionDesc}>บัญชีนี้ยังไม่มีสิทธิ์นักเขียน กรุณาส่งแบบฟอร์มในเมนู “สมัครนักเขียน” ก่อน</p>
      </section>
    )
  }

  return <CreatorDashboard />
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
