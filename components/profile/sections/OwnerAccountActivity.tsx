'use client'

import { startTransition, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Bell, Check, Link2, ShieldCheck, TriangleAlert, Trash2, UserRound } from 'lucide-react'
import { AppleIcon, FacebookIcon, GoogleIcon } from '@/components/icons/SocialProviderIcons'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
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
  type ActivityTab = 'review' | 'comment'
  type ActivityFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'normal' | 'revoked'
  type ActivityResponse = {
    id: string
    kind: ActivityTab
    rating?: number
    body: string
    status?: ProfileActivity['status']
    rawStatus?: string
    replyCount?: number
    likes?: number
    replies?: ProfileActivity['replies']
    exp?: ProfileActivity['exp']
    createdAt: string
    updatedAt?: string
    work: { id: string; title: string }
  }

  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [activities, setActivities] = useState<ProfileActivity[]>(initialActivities)
  const [tab, setTab] = useState<ActivityTab>('review')
  const [filter, setFilter] = useState<ActivityFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/member/activity', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('LOAD_FAILED')
        return response.json() as Promise<{ activities?: ActivityResponse[] }>
      })
      .then((data) => setActivities((data.activities ?? []).map((item) => ({
        id: item.id,
        kind: item.kind,
        workId: item.work.id,
        workTitle: item.work.title,
        body: item.body,
        rating: item.rating,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        status: item.status,
        rawStatus: item.rawStatus,
        replyCount: item.replyCount ?? item.replies?.length ?? 0,
        likes: item.likes ?? 0,
        replies: item.replies ?? [],
        exp: item.exp ?? null,
      }))))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setLoadError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [])

  const remove = async (activity: ProfileActivity) => {
    setBusy(true)
    setActionError('')
    const response = await fetch('/api/interactions/activity', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: activity.id, kind: activity.kind }) })
    if (response.ok) {
      setActivities((current) => current.filter((item) => item.id !== activity.id))
      setSelectedId(null)
      setConfirmingDelete(false)
      onDataChange()
    } else {
      setActionError('ลบรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    }
    setBusy(false)
  }

  const startEdit = (activity: ProfileActivity) => {
    setEditingId(activity.id)
    setDraft(activity.body)
    setConfirmingDelete(false)
    setActionError('')
  }

  const saveEdit = async () => {
    if (!editingId || !draft.trim()) return
    const activity = activities.find((item) => item.id === editingId)
    if (!activity) return
    setBusy(true)
    setActionError('')
    const response = await fetch('/api/interactions/activity', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: activity.id, kind: activity.kind, body: draft.trim() }) })
    if (response.ok) {
      setActivities((current) => current.map((item) => item.id === editingId ? { ...item, body: draft.trim() } : item))
      setEditingId(null)
      setDraft('')
      onDataChange()
    } else {
      setActionError('บันทึกการแก้ไขไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    }
    setBusy(false)
  }

  const filters: Array<{ id: ActivityFilter; label: string }> = tab === 'review'
    ? [{ id: 'all', label: 'ทั้งหมด' }, { id: 'pending', label: 'รอตรวจสอบ' }, { id: 'approved', label: 'อนุมัติแล้ว' }, { id: 'rejected', label: 'ไม่อนุมัติ' }]
    : [{ id: 'all', label: 'ทั้งหมด' }, { id: 'normal', label: 'ปกติ' }, { id: 'revoked', label: 'ถูกริบ EXP' }]
  const rows = useMemo(() => activities.filter((activity) => {
    if (activity.kind !== tab) return false
    const status = activity.status ?? (activity.kind === 'review' ? 'approved' : 'normal')
    return filter === 'all' || status === filter
  }), [activities, filter, tab])
  const selected = activities.find((activity) => activity.id === selectedId) ?? null
  const canManageSelected = Boolean(selected && (!selected.rawStatus || selected.rawStatus === 'published'))

  const changeTab = (next: ActivityTab) => {
    setTab(next)
    setFilter('all')
  }

  const closeDetail = () => {
    setSelectedId(null)
    setEditingId(null)
    setDraft('')
    setConfirmingDelete(false)
    setActionError('')
  }

  return (
    <div className={styles.myPostsPage}>
      <div className={styles.myPostsNote}>
        <TriangleAlert aria-hidden="true" />
        <p><b>รีวิว</b>ต้องผ่านการตรวจสอบจากเจ้าหน้าที่ก่อนจึงได้รับ EXP ส่วน<b>คอมเมนต์</b>ได้รับ EXP ทันที แต่อาจถูกตรวจสอบย้อนหลัง หากพบว่าเป็นสแปมหรือเนื้อหาไม่เหมาะสม EXP จะถูกริบคืนและอาจมีบทลงโทษ <a href="?tab=help" target="_blank" rel="noreferrer">ดูกติกาและบทลงโทษทั้งหมด</a></p>
      </div>

      <section className={styles.myPostsBoard}>
        <div className={styles.myPostsHead}>
          <button type="button" className={`${styles.myPostsTab} ${tab === 'review' ? styles.myPostsTabActive : ''}`} onClick={() => changeTab('review')}>รีวิวของฉัน</button>
          <button type="button" className={`${styles.myPostsTab} ${tab === 'comment' ? styles.myPostsTabActive : ''}`} onClick={() => changeTab('comment')}>คอมเมนต์ของฉัน</button>
          <span>{tab === 'review' ? 'รวมรีวิวที่คุณเขียนและสถานะการได้รับ EXP' : 'รวมคอมเมนต์ที่คุณเขียนและสถานะการได้รับ EXP'}</span>
        </div>

        <div className={styles.myPostsFilters} aria-label="กรองสถานะ">
          {filters.map((item, index) => (
            <span key={item.id} className={styles.myPostsFilterItem}>
              {index > 0 && <i aria-hidden="true">·</i>}
              <button type="button" className={filter === item.id ? styles.myPostsFilterActive : ''} onClick={() => setFilter(item.id)}>{item.label}</button>
            </span>
          ))}
        </div>

        {loadError && <div className={styles.myPostsError} role="alert">โหลดข้อมูลล่าสุดไม่สำเร็จ กำลังแสดงข้อมูลที่มีอยู่</div>}
        {loading && !activities.length ? <div className={styles.myPostsEmpty}>กำลังโหลดรายการ…</div> : rows.length ? (
          <div className={styles.myPostsTableWrap}>
            <table className={styles.myPostsTable}>
              <colgroup><col /><col className={styles.myPostsNumberColumn} /><col className={styles.myPostsNumberColumn} /><col className={styles.myPostsDateColumn} /><col className={styles.myPostsStatusColumn} /><col className={styles.myPostsExpColumn} /></colgroup>
              <thead><tr><th>{tab === 'review' ? 'รีวิว' : 'คอมเมนต์'}</th><th className={styles.myPostsNumber}>ตอบกลับ</th><th className={styles.myPostsNumber}>ถูกใจ</th><th>วันที่</th><th>สถานะ</th><th className={styles.myPostsExpHeading}>EXP</th></tr></thead>
              <tbody>{rows.map((activity) => (
                <tr key={activity.id} tabIndex={0} onClick={() => setSelectedId(activity.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedId(activity.id) } }}>
                  <td className={styles.myPostsMain} data-label={tab === 'review' ? 'รีวิว' : 'คอมเมนต์'}><div><b>{activity.workTitle}</b>{activity.kind === 'review' && activity.rating ? <span>★ {activity.rating}</span> : null}</div><p>{activity.body}</p></td>
                  <td className={styles.myPostsNumber} data-label="ตอบกลับ">{activity.replyCount ?? activity.replies?.length ?? 0}</td>
                  <td className={styles.myPostsNumber} data-label="ถูกใจ">{activity.likes ?? 0}</td>
                  <td className={styles.myPostsDate} data-label="วันที่">{formatActivityDate(activity.createdAt)}</td>
                  <td data-label="สถานะ"><ActivityStatus activity={activity} /></td>
                  <td className={styles.myPostsExpValue} data-label="EXP"><ActivityExp activity={activity} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <div className={styles.myPostsEmpty}>ยังไม่มีรายการในหมวดนี้</div>}
      </section>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) closeDetail() }}>
        {selected && <DialogContent className={styles.activityDialog} overlayClassName={styles.activityDialogOverlay}>
          <div className={styles.activityDialogHead}>
            <DialogTitle>{selected.workTitle}</DialogTitle>
            <DialogDescription>{selected.kind === 'review' ? 'รีวิว' : 'คอมเมนต์'} · {formatActivityDate(selected.createdAt)}</DialogDescription>
          </div>
          <div className={styles.activityDialogBody}>
            <div className={styles.activityDialogStatus}><ActivityStatus activity={selected} /><ActivityExp activity={selected} /></div>
            {selected.exp?.reason && ['rejected', 'revoked'].includes(selected.status ?? '') && <div className={styles.activityRejection}><TriangleAlert /><div><b>{selected.status === 'revoked' ? 'ถูกริบ EXP' : 'ไม่อนุมัติ'}</b><span>{selected.exp.reason}</span></div></div>}
            {editingId === selected.id ? <textarea className={styles.activityEditTextarea} value={draft} onChange={(event) => setDraft(event.target.value)} aria-label="แก้ไขข้อความ" maxLength={3000} /> : <p className={styles.activityDialogText}>{selected.body}</p>}

            <div className={styles.activityRepliesTitle}>การตอบกลับ ({selected.replyCount ?? selected.replies?.length ?? 0})</div>
            {selected.replies?.length ? <div className={styles.activityReplies}>{selected.replies.map((reply) => <div key={reply.id} className={styles.activityReply}><span className={`${styles.activityReplyAvatar} ${reply.user.isStaff ? styles.activityReplyStaff : ''}`}>{reply.user.isStaff ? 'ทีม' : reply.user.name.charAt(0)}</span><div><div className={styles.activityReplyName}><b>{reply.user.name}</b>{reply.user.isStaff && <em>เจ้าหน้าที่</em>}<time>{formatActivityDate(reply.createdAt)}</time></div><p>{reply.body}</p></div></div>)}</div> : <div className={styles.activityNoReplies}>ยังไม่มีการตอบกลับ</div>}

            {actionError && <p className={styles.activityActionError} role="alert">{actionError}</p>}
            {canManageSelected && <div className={styles.activityDialogActions}>
              {editingId === selected.id ? <><button type="button" className={styles.activitySecondaryAction} disabled={busy} onClick={() => { setEditingId(null); setDraft(''); setActionError('') }}>ยกเลิก</button><button type="button" className={styles.activityPrimaryAction} disabled={busy || !draft.trim()} onClick={() => void saveEdit()}>{busy ? 'กำลังบันทึก…' : 'บันทึก'}</button></> : confirmingDelete ? <><span>ยืนยันลบรายการนี้?</span><button type="button" className={styles.activitySecondaryAction} disabled={busy} onClick={() => setConfirmingDelete(false)}>ยกเลิก</button><button type="button" className={styles.activityDangerAction} disabled={busy} onClick={() => void remove(selected)}>{busy ? 'กำลังลบ…' : 'ยืนยันลบ'}</button></> : <><button type="button" className={styles.activityDangerText} onClick={() => setConfirmingDelete(true)}>ลบ</button><button type="button" className={styles.activityPrimaryAction} onClick={() => startEdit(selected)}>แก้ไข</button></>}
            </div>}
          </div>
        </DialogContent>}
      </Dialog>
    </div>
  )
}

function formatActivityDate(value: string) {
  return new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' })
}

function ActivityStatus({ activity }: { activity: ProfileActivity }) {
  const status = activity.status ?? (activity.kind === 'review' ? 'approved' : 'normal')
  const labels: Record<NonNullable<ProfileActivity['status']>, string> = {
    pending: 'รอตรวจสอบ', approved: 'อนุมัติแล้ว', rejected: 'ไม่อนุมัติ', normal: activity.exp?.status === 'granted' ? 'ได้รับ EXP แล้ว' : 'ปกติ', revoked: 'ถูกริบ EXP',
  }
  return <span className={`${styles.activityStatus} ${styles[`activityStatus_${status}`]}`}>{labels[status]}</span>
}

function ActivityExp({ activity }: { activity: ProfileActivity }) {
  if (!activity.exp) return <span className={`${styles.activityExp} ${styles.activityExpMuted}`}>ไม่มีข้อมูล EXP</span>
  if (activity.exp.status === 'pending') return <span className={`${styles.activityExp} ${styles.activityExpMuted}`}>รออนุมัติ</span>
  if (activity.exp.status === 'rejected') return <span className={`${styles.activityExp} ${styles.activityExpMuted}`}>ไม่ได้รับ EXP</span>
  if (activity.exp.status === 'revoked') return <span className={`${styles.activityExp} ${styles.activityExpMinus}`}>−{Math.abs(activity.exp.amount).toLocaleString('th-TH')} EXP</span>
  return <span className={`${styles.activityExp} ${styles.activityExpPlus}`}>+{activity.exp.amount.toLocaleString('th-TH')} EXP</span>
}
