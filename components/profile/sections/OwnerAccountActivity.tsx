'use client'

import { useState } from 'react'
import { ShieldCheck, Trash2 } from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { localProfileRepository } from '@/lib/profile-repository'
import type { ProfileActivity } from '@/lib/profile-types'
import styles from '../profile.module.css'

export function OwnerAccount({ onDataChange }: { onDataChange: () => void }) {
  const { profile, updateProfile } = useProfile()
  const [displayName, setDisplayName] = useState(profile.displayName)
  const [handle, setHandle] = useState(profile.handle ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl)
  const [saved, setSaved] = useState(false)

  const save = (event: React.FormEvent) => {
    event.preventDefault()
    const nextHandle = handle.trim().replace(/^@/, '').replace(/\s+/g, '.')
    const safeAvatar = avatarUrl.startsWith('https://picsum.photos/') || avatarUrl.startsWith('/')
      ? avatarUrl
      : profile.avatarUrl
    updateProfile({
      displayName: displayName.trim() || profile.displayName,
      handle: nextHandle || profile.handle,
      bio: bio.trim(),
      avatarUrl: safeAvatar,
    })
    setSaved(true)
    onDataChange()
  }

  return (
    <div className={styles.stack}>
      <header>
        <h1 className={styles.sectionTitle}>ศูนย์บัญชี</h1>
        <p className={styles.sectionDesc}>จัดการข้อมูลส่วนตัว ความปลอดภัย และการตั้งค่าบัญชี</p>
      </header>

      <form onSubmit={save} className={`${styles.card} ${styles.sectionCard}`}>
        <div className={styles.sectionHeader}>
          <div><h2 className={styles.sectionTitle}>ข้อมูลโปรไฟล์</h2><p className={styles.sectionDesc}>ข้อมูลส่วนนี้จะแสดงบนโปรไฟล์สาธารณะ</p></div>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="profile-display-name">ชื่อที่แสดง</label>
            <input id="profile-display-name" className={styles.input} value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={60} required />
          </div>
          <div className={styles.field}>
            <label htmlFor="profile-handle">ชื่อผู้ใช้</label>
            <input id="profile-handle" className={styles.input} value={handle} onChange={(event) => setHandle(event.target.value)} maxLength={40} required />
          </div>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label htmlFor="profile-avatar">URL รูปโปรไฟล์</label>
            <input id="profile-avatar" className={styles.input} value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} />
            <span className={styles.sectionDesc}>โหมดตัวอย่างรองรับรูปใน `/public` และ `picsum.photos`; ระบบอัปโหลดจริงจะเชื่อมผ่าน API ภายหลัง</span>
          </div>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label htmlFor="profile-bio">แนะนำตัว</label>
            <textarea id="profile-bio" className={styles.textarea} value={bio} onChange={(event) => setBio(event.target.value)} maxLength={500} />
          </div>
        </div>
        {saved && <p className={`${styles.successNote} mt-4`} role="status">บันทึกข้อมูลโปรไฟล์ในอุปกรณ์นี้แล้ว</p>}
        <div className={styles.buttonRow}><button type="submit" className={styles.primaryButton}>บันทึกการเปลี่ยนแปลง</button></div>
      </form>

      <section className={`${styles.card} ${styles.sectionCard}`}>
        <div className={styles.sectionHeader}>
          <div><h2 className={styles.sectionTitle}>ความปลอดภัยและบัญชีที่เชื่อมต่อ</h2><p className={styles.sectionDesc}>รหัสผ่านและผู้ให้บริการเข้าสู่ระบบต้องจัดการผ่านเซิร์ฟเวอร์สมาชิก</p></div>
          <ShieldCheck color="#cc4452" />
        </div>
        <div className={styles.infoNote}>การเปลี่ยนรหัสผ่าน, ยืนยันอีเมล และยกเลิกการเชื่อมต่อ Google/Facebook/Apple ยังไม่เปิดใช้ เพราะ backend ปัจจุบันไม่มี endpoint เหล่านี้</div>
      </section>

      <section className={`${styles.card} ${styles.sectionCard}`}>
        <div className={styles.sectionHeader}>
          <div><h2 className={styles.sectionTitle} style={{ color: '#c03645' }}>ลบบัญชี</h2><p className={styles.sectionDesc}>การดำเนินการนี้ไม่สามารถย้อนกลับได้</p></div>
          <Trash2 color="#c03645" />
        </div>
        <div className={styles.dangerNote}>ปุ่มลบบัญชีถูกปิดไว้จนกว่าจะมี API ที่ยืนยันตัวตนซ้ำและรองรับการลบข้อมูลอย่างปลอดภัย</div>
        <div className={styles.buttonRow}><button type="button" className={styles.secondaryButton} disabled aria-disabled="true">ลบบัญชีถาวร</button></div>
      </section>
    </div>
  )
}

export function OwnerActivity({
  userId,
  activities,
  onDataChange,
}: {
  userId: string
  activities: ProfileActivity[]
  onDataChange: () => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  const remove = (id: string) => {
    localProfileRepository.saveActivities(userId, activities.filter((item) => item.id !== id))
    onDataChange()
  }

  const startEdit = (activity: ProfileActivity) => {
    setEditingId(activity.id)
    setDraft(activity.body)
  }

  const saveEdit = () => {
    if (!editingId || !draft.trim()) return
    localProfileRepository.saveActivities(
      userId,
      activities.map((item) => item.id === editingId ? { ...item, body: draft.trim() } : item),
    )
    setEditingId(null)
    setDraft('')
    onDataChange()
  }

  return (
    <div className={styles.stack}>
      <header><h1 className={styles.sectionTitle}>คอมเมนต์ & รีวิวของฉัน</h1><p className={styles.sectionDesc}>จัดการข้อความที่เผยแพร่บน ReadLead</p></header>
      <section className={`${styles.card} ${styles.sectionCard}`}>
        {activities.length ? (
          <div className={styles.activityList}>
            {activities.map((activity) => (
              <article key={activity.id} className={styles.activity}>
                <div className={styles.activityTop}>
                  <div>
                    <b>{activity.workTitle}</b>
                    <div className={styles.activityMeta}>
                      {activity.kind === 'review' ? `รีวิว ${'★'.repeat(activity.rating ?? 0)}` : 'ความคิดเห็น'} · {new Date(activity.createdAt).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                  <div className={styles.activityActions}>
                    <button type="button" className={styles.textButton} onClick={() => startEdit(activity)}>แก้ไข</button>
                    <button type="button" className={styles.textButton} onClick={() => remove(activity.id)}>ลบ</button>
                  </div>
                </div>
                {editingId === activity.id ? (
                  <div className="mt-3">
                    <textarea className={styles.textarea} value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="แก้ไขข้อความ" />
                    <div className={styles.buttonRow}>
                      <button type="button" className={styles.secondaryButton} onClick={() => setEditingId(null)}>ยกเลิก</button>
                      <button type="button" className={styles.primaryButton} onClick={saveEdit}>บันทึก</button>
                    </div>
                  </div>
                ) : <p className={styles.activityBody}>{activity.body}</p>}
              </article>
            ))}
          </div>
        ) : <div className={styles.empty}>ยังไม่มีคอมเมนต์หรือรีวิว</div>}
      </section>
    </div>
  )
}
