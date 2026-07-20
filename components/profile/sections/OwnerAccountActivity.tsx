'use client'

import { startTransition, useEffect, useState } from 'react'
import Image from 'next/image'
import { Bell, Check, Link2, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { AppleIcon, FacebookIcon, GoogleIcon } from '@/components/icons/SocialProviderIcons'
import { useProfile } from '@/contexts/ProfileContext'
import { useRole } from '@/contexts/RoleContext'
import type { ProfileActivity } from '@/lib/profile-types'
import styles from '../profile.module.css'

export function OwnerAccount({ onDataChange }: { onDataChange: () => void }) {
  const { profile, updateProfile } = useProfile()
  const { user } = useRole()
  const [displayName, setDisplayName] = useState(profile.displayName)
  const [handle, setHandle] = useState(profile.handle ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl)
  const [saved, setSaved] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [workNotifications, setWorkNotifications] = useState(true)
  const [promotionNotifications, setPromotionNotifications] = useState(false)

  useEffect(() => {
    if (!user) return
    try {
      const stored = JSON.parse(localStorage.getItem(`rl_account_notifications:${user.id}`) ?? 'null') as { work?: boolean; promotions?: boolean } | null
      if (stored) {
        startTransition(() => {
          setWorkNotifications(stored.work !== false)
          setPromotionNotifications(stored.promotions === true)
        })
      }
    } catch { /* Keep the defaults when local preferences are malformed. */ }
  }, [user])

  const setNotification = (kind: 'work' | 'promotions', value: boolean) => {
    const next = {
      work: kind === 'work' ? value : workNotifications,
      promotions: kind === 'promotions' ? value : promotionNotifications,
    }
    setWorkNotifications(next.work)
    setPromotionNotifications(next.promotions)
    if (user) localStorage.setItem(`rl_account_notifications:${user.id}`, JSON.stringify(next))
  }

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
    setEditingProfile(false)
    onDataChange()
  }

  return (
    <div className={`${styles.stack} ${styles.accountSettingsPage}`}>
      <header className={styles.accountPageHeader}>
        <h1>ศูนย์บัญชี</h1>
        <p>จัดการข้อมูลส่วนตัว ความปลอดภัย และการตั้งค่าบัญชีของคุณ</p>
      </header>

      <div className={styles.accountSettings}>
        <section className={`${styles.card} ${styles.settingsGroup}`}>
          <SettingsHeading icon={<UserRound />} iconClass={styles.profileIcon} title="ข้อมูลโปรไฟล์" description="จัดการชื่อผู้ใช้ อีเมล และข้อมูลโปรไฟล์สาธารณะ" />
          <SettingRow label="ชื่อที่แสดง" description="ชื่อที่ผู้อ่านคนอื่นจะมองเห็น"><span>{profile.displayName}</span><button type="button" className={styles.settingButton} onClick={() => { setSaved(false); setEditingProfile(true) }}>เปลี่ยน</button></SettingRow>
          <SettingRow label="ชื่อผู้ใช้" description="ที่อยู่โปรไฟล์และชื่ออ้างอิงของคุณ"><span>@{profile.handle}</span><button type="button" className={styles.settingButton} onClick={() => { setSaved(false); setEditingProfile(true) }}>เปลี่ยน</button></SettingRow>
          <SettingRow label="อีเมล" description="ใช้สำหรับเข้าสู่ระบบและรับการแจ้งเตือน"><span>{user?.email ?? '—'}</span><span className={styles.verifiedBadge}><Check />ยืนยันแล้ว</span><button type="button" className={styles.settingButton} disabled title="ระบบสมาชิกยังไม่รองรับการเปลี่ยนอีเมล">เปลี่ยน</button></SettingRow>
          <SettingRow label="รูปโปรไฟล์และคำแนะนำตัว" description={profile.bio || 'ยังไม่ได้เพิ่มคำแนะนำตัว'}><Image src={profile.avatarUrl} alt="" width={42} height={42} className={styles.accountAvatar}/><button type="button" className={styles.settingButton} onClick={() => { setSaved(false); setEditingProfile(true) }}>แก้ไข</button></SettingRow>

          {editingProfile && <form onSubmit={save} className={styles.profileEditor}>
            <div className={styles.formGrid}>
              <div className={styles.field}><label htmlFor="profile-display-name">ชื่อที่แสดง</label><input id="profile-display-name" className={styles.input} value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={60} required /></div>
              <div className={styles.field}><label htmlFor="profile-handle">ชื่อผู้ใช้</label><input id="profile-handle" className={styles.input} value={handle} onChange={(event) => setHandle(event.target.value)} maxLength={40} required /></div>
              <div className={`${styles.field} ${styles.fieldFull}`}><label htmlFor="profile-avatar">URL รูปโปรไฟล์</label><input id="profile-avatar" className={styles.input} value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} /><span className={styles.fieldHint}>รองรับรูปใน `/public` และ `picsum.photos`</span></div>
              <div className={`${styles.field} ${styles.fieldFull}`}><label htmlFor="profile-bio">แนะนำตัว</label><textarea id="profile-bio" className={styles.textarea} value={bio} onChange={(event) => setBio(event.target.value)} maxLength={500} /></div>
            </div>
            <div className={styles.editorActions}><button type="button" className={styles.editorCancel} onClick={() => setEditingProfile(false)}>ยกเลิก</button><button type="submit" className={styles.editorSave}>บันทึก</button></div>
          </form>}
          {saved && <p className={styles.accountSuccess} role="status">บันทึกข้อมูลโปรไฟล์แล้ว</p>}
        </section>

        <section className={`${styles.card} ${styles.settingsGroup}`}>
          <SettingsHeading icon={<ShieldCheck />} iconClass={styles.securityIcon} title="ความปลอดภัย" description="รหัสผ่านและการยืนยันตัวตน" />
          <SettingRow label="รหัสผ่าน" description="จัดการผ่านระบบสมาชิก ReadLead"><button type="button" className={styles.settingButton} disabled title="backend ยังไม่มี endpoint สำหรับเปลี่ยนรหัสผ่าน">เปลี่ยนรหัสผ่าน</button></SettingRow>
        </section>

        <section className={`${styles.card} ${styles.settingsGroup}`}>
          <SettingsHeading icon={<Bell />} iconClass={styles.notificationIcon} title="การแจ้งเตือน" description="เลือกสิ่งที่อยากให้แจ้งเตือน" />
          <SettingRow label="อัปเดตผลงาน" description="แจ้งเตือนเมื่อเรื่องที่ติดตามมีตอนใหม่"><button type="button" role="switch" aria-checked={workNotifications} aria-label="แจ้งเตือนอัปเดตผลงาน" className={`${styles.accountToggle} ${workNotifications ? styles.accountToggleOn : ''}`} onClick={() => setNotification('work', !workNotifications)}><span /></button></SettingRow>
          <SettingRow label="โปรโมชั่นและกิจกรรม" description="ดีลพิเศษ เหรียญฟรี และอีเวนต์"><button type="button" role="switch" aria-checked={promotionNotifications} aria-label="แจ้งเตือนโปรโมชั่นและกิจกรรม" className={`${styles.accountToggle} ${promotionNotifications ? styles.accountToggleOn : ''}`} onClick={() => setNotification('promotions', !promotionNotifications)}><span /></button></SettingRow>
        </section>

        <section className={`${styles.card} ${styles.settingsGroup}`}>
          <SettingsHeading icon={<Link2 />} iconClass={styles.connectedIcon} title="บัญชีที่เชื่อมต่อ" description="เข้าสู่ระบบได้เร็วขึ้นด้วยบัญชีโซเชียล" />
          <ProviderRow icon={<GoogleIcon />} iconClass={styles.googleProvider} name="Google" />
          <ProviderRow icon={<FacebookIcon />} iconClass={styles.facebookProvider} name="Facebook" />
          <ProviderRow icon={<AppleIcon />} iconClass={styles.appleProvider} name="Apple" />
        </section>

        <section className={`${styles.card} ${styles.settingsGroup} ${styles.dangerGroup}`}>
          <SettingsHeading icon={<Trash2 />} iconClass={styles.dangerIcon} title="ลบบัญชี" description="การดำเนินการนี้ไม่สามารถย้อนกลับได้" />
          <div className={styles.deleteText}><p>เมื่อลบบัญชีแล้ว ข้อมูลทั้งหมดจะถูกลบอย่างถาวรและไม่สามารถกู้คืนได้</p></div>
          <button type="button" className={styles.deleteButton} disabled title="รอ API ยืนยันตัวตนซ้ำและลบบัญชีอย่างปลอดภัย"><Trash2 />ลบบัญชีถาวร</button>
        </section>
      </div>
    </div>
  )
}

function SettingsHeading({ icon, iconClass, title, description }: { icon: React.ReactNode; iconClass: string; title: string; description: string }) {
  return <div className={styles.settingsGroupHeader}><span className={`${styles.settingsIcon} ${iconClass}`}>{icon}</span><div><h2>{title}</h2><p>{description}</p></div></div>
}

function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return <div className={styles.settingRow}><div className={styles.settingLabel}><b>{label}</b><span>{description}</span></div><div className={styles.settingValue}>{children}</div></div>
}

function ProviderRow({ icon, iconClass, name }: { icon: React.ReactNode; iconClass: string; name: string }) {
  return <div className={styles.settingRow}><div className={styles.provider}><span className={`${styles.providerIcon} ${iconClass}`}>{icon}</span><div><b>{name}</b><span>ยังไม่เชื่อมต่อ</span></div></div><div className={styles.settingValue}><span className={styles.notConnected}>ยังไม่เชื่อมต่อ</span><button type="button" className={`${styles.settingButton} ${styles.ghostSettingButton}`} disabled title={`ระบบเชื่อมต่อ ${name} ยังไม่เปิดใช้งาน`}>เชื่อมต่อ</button></div></div>
}

export function OwnerActivity({
  activities: initialActivities,
  onDataChange,
}: {
  userId: string
  activities: ProfileActivity[]
  onDataChange: () => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [activities, setActivities] = useState<ProfileActivity[]>(initialActivities)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/member/activity', { cache: 'no-store', signal: controller.signal }).then((response) => response.ok ? response.json() : { activities: [] }).then((data: { activities?: Array<{ id: string; kind: 'review' | 'comment'; rating?: number; body: string; createdAt: string; work: { id: string; title: string } }> }) => setActivities((data.activities ?? []).map((item) => ({ id: item.id, kind: item.kind, workId: item.work.id, workTitle: item.work.title, body: item.body, rating: item.rating, createdAt: item.createdAt })))).catch(() => undefined)
    return () => controller.abort()
  }, [])

  const remove = async (activity: ProfileActivity) => {
    const response = await fetch('/api/interactions/activity', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: activity.id, kind: activity.kind }) })
    if (response.ok) { setActivities((current) => current.filter((item) => item.id !== activity.id)); onDataChange() }
  }

  const startEdit = (activity: ProfileActivity) => {
    setEditingId(activity.id)
    setDraft(activity.body)
  }

  const saveEdit = async () => {
    if (!editingId || !draft.trim()) return
    const activity = activities.find((item) => item.id === editingId)
    if (!activity) return
    const response = await fetch('/api/interactions/activity', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: activity.id, kind: activity.kind, body: draft.trim() }) })
    if (!response.ok) return
    setActivities((current) => current.map((item) => item.id === editingId ? { ...item, body: draft.trim() } : item))
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
                    <button type="button" className={styles.textButton} onClick={() => void remove(activity)}>ลบ</button>
                  </div>
                </div>
                {editingId === activity.id ? (
                  <div className="mt-3">
                    <textarea className={styles.textarea} value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="แก้ไขข้อความ" />
                    <div className={styles.buttonRow}>
                      <button type="button" className={styles.secondaryButton} onClick={() => setEditingId(null)}>ยกเลิก</button>
                      <button type="button" className={styles.primaryButton} onClick={() => void saveEdit()}>บันทึก</button>
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
