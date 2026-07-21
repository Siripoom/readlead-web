'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { BookOpen, FileImage, Headphones, ImageIcon, LoaderCircle, Save, Upload, X } from 'lucide-react'
import { ALL_GENRES, GENRE_LABELS } from '@/lib/mock-data'
import type { CreatorWorkDetail, CreatorWorkType } from '@/lib/creator-studio-types'
import { CreatorStudioShell, creatorStudioStyles as styles } from './CreatorStudioShell'
import CreatorCover from './CreatorCover'

const labels: Record<CreatorWorkType, string> = { novel: 'นิยาย', manga: 'เว็บตูน', audiobook: 'หนังสือเสียง' }
const icons = { novel: BookOpen, manga: ImageIcon, audiobook: Headphones }
const tagSuggestions = ['โรแมนติก', 'แฟนตาซี', 'ดราม่า', 'คอมเมดี้', 'ต่างโลก', 'สืบสวน', 'แอ็กชัน', 'อบอุ่นหัวใจ']

type WorkFormState = {
  origin: 'original' | 'translated'; title: string; category: string; rating: string; creationMethod: string
  tagline: string; synopsis: string; tags: string[]; seriesStatus: string; originalTitle: string
  originalAuthor: string; translatorName: string; originalLanguage: string
  narrationType: 'human' | 'ai'
}

function initialState(work?: CreatorWorkDetail): WorkFormState {
  return { origin: work?.origin ?? 'original', title: work?.title ?? '', category: work?.category ?? '', rating: work?.rating ?? 'general', creationMethod: work?.creationMethod ?? 'self_written', tagline: work?.tagline ?? '', synopsis: work?.synopsis ?? '', tags: work?.tags ?? [], seriesStatus: work?.seriesStatus ?? 'ongoing', originalTitle: work?.originalTitle ?? '', originalAuthor: work?.originalAuthor ?? '', translatorName: work?.translatorName ?? '', originalLanguage: work?.originalLanguage ?? '', narrationType: work?.narrationType ?? 'human' }
}

async function errorText(response: Response, fallback: string) {
  const data = await response.json().catch(() => ({})) as { error?: string }
  return data.error || fallback
}

export default function CreatorWorkForm({ type, work }: { type: CreatorWorkType; work?: CreatorWorkDetail }) {
  const router = useRouter()
  const Icon = icons[type]
  const coverRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState(() => initialState(work))
  const [tagDraft, setTagDraft] = useState('')
  const [cover, setCover] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [draftId, setDraftId] = useState<string | null>(work?.id ?? null)
  const [coverUploaded, setCoverUploaded] = useState(false)
  const editing = Boolean(work)
  const coreLocked = work?.status === 'approved' || work?.status === 'published'
  const allLocked = work?.status === 'pending_review' || work?.status === 'archived' || work?.status === 'deletion_pending'
  const backHref = editing ? `/creator/works/${work!.id}` : '/creator/works/new'

  useEffect(() => () => { if (coverPreview) URL.revokeObjectURL(coverPreview) }, [coverPreview])
  function patch<K extends keyof WorkFormState>(key: K, value: WorkFormState[K]) { setForm((current) => ({ ...current, [key]: value })) }
  function chooseCover(file?: File) {
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setError('')
    if (!file) { setCover(null); setCoverPreview(''); setCoverUploaded(false); return }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setError('ปกรองรับ JPEG, PNG หรือ WebP ขนาดไม่เกิน 5 MB'); return }
    setCover(file); setCoverPreview(URL.createObjectURL(file)); setCoverUploaded(false)
  }
  function addTag(raw = tagDraft) {
    const value = raw.trim().replace(/^#/, '')
    if (!value || form.tags.includes(value) || form.tags.length >= 10) return
    patch('tags', [...form.tags, value]); setTagDraft('')
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      if (form.tags.length > 10) throw new Error('เพิ่มแท็กได้ไม่เกิน 10 แท็ก')
      const editablePayload = coreLocked
        ? { tagline: form.tagline, synopsis: form.synopsis, tags: form.tags, seriesStatus: form.seriesStatus }
        : { title: form.title, category: form.category, rating: form.rating, creationMethod: form.creationMethod, tagline: form.tagline, synopsis: form.synopsis, tags: form.tags, seriesStatus: form.seriesStatus, ...(type === 'audiobook' ? { narrationType: form.narrationType } : {}), ...(form.origin === 'translated' ? { originalTitle: form.originalTitle, originalAuthor: form.originalAuthor, translatorName: form.translatorName, originalLanguage: form.originalLanguage } : {}) }
      const createPayload = { type, origin: form.origin, ...editablePayload }
      let workId = draftId
      if (!workId) {
        const response = await fetch('/api/creator/works', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(createPayload) })
        if (!response.ok) throw new Error(await errorText(response, 'สร้างผลงานไม่สำเร็จ'))
        const data = await response.json() as { work: { id: string } }; workId = data.work.id; setDraftId(workId)
      } else {
        const response = await fetch(`/api/creator/works/${workId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editablePayload) })
        if (!response.ok) throw new Error(await errorText(response, 'บันทึกผลงานไม่สำเร็จ'))
      }
      if (cover && !coverUploaded) {
        const data = new FormData(); data.set('file', cover)
        const upload = await fetch(`/api/creator/works/${workId}/cover`, { method: 'POST', body: data })
        if (!upload.ok) throw new Error(`บันทึกข้อมูลแล้ว แต่อัปโหลดปกไม่สำเร็จ: ${await errorText(upload, 'กรุณาลองใหม่')}`)
        setCoverUploaded(true)
      }
      if (!editing) {
        const review = await fetch(`/api/creator/works/${workId}/submit-review`, { method: 'POST' })
        if (!review.ok) throw new Error(`บันทึกฉบับร่างแล้ว แต่${await errorText(review, 'ส่งตรวจไม่สำเร็จ')}`)
      }
      router.push(`/creator/works/${workId}`); router.refresh()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'บันทึกผลงานไม่สำเร็จ') }
    finally { setBusy(false) }
  }

  const methodOptions = form.origin === 'translated'
    ? [['self_translated', 'แปลด้วยตนเอง'], ['ai_assisted_translation', 'AI ช่วยแปล'], ['ai_translation', 'แปลด้วย AI']]
    : [['self_written', type === 'novel' ? 'เขียนด้วยตนเอง' : 'สร้างด้วยตนเอง'], ['ai_assisted', 'AI ช่วยสร้าง'], ['ai_generated', 'สร้างด้วย AI']]

  return <CreatorStudioShell backHref={backHref} backLabel={editing ? 'หน้าจัดการผลงาน' : 'เลือกประเภทผลงาน'}>
    <div className={styles.pageHead}><div className={styles.headTitle}><div className={styles.headIcon}><Icon size={28} /></div><div><h1>{editing ? `แก้ไข${labels[type]}` : `สร้าง${labels[type]}ใหม่`}</h1><p>{editing ? `จัดการข้อมูลของ “${work?.title}”` : 'กรอกข้อมูลให้ครบ ระบบจะบันทึกและส่งให้ผู้ดูแลตรวจสอบ'}</p></div></div></div>
    {coreLocked && <div className={styles.warning}>ผลงานที่อนุมัติแล้วแก้ไขได้เฉพาะคำโปรย เรื่องย่อ แท็ก และสถานะเรื่อง</div>}
    {allLocked && <div className={styles.warning}>ข้อมูลถูกล็อกระหว่างการตรวจสอบหรือดำเนินคำขอ</div>}
    <form onSubmit={submit} className={styles.grid} style={{ marginTop: 16 }}>
      <aside className={styles.card}><h2>ภาพปก</h2><p className={styles.help}>อัตราส่วนแนะนำ 2:3</p><button disabled={Boolean(coreLocked || allLocked)} type="button" className={styles.cover} onClick={() => coverRef.current?.click()}>{coverPreview ? <Image src={coverPreview} fill unoptimized alt="ตัวอย่างภาพปก" /> : work ? <CreatorCover workId={work.id} type={work.type} title={work.title} className={styles.coverArtwork} iconSize={34} /> : <span className={styles.coverHint}><FileImage size={34} /><b>อัปโหลดภาพปก</b><span>JPEG, PNG, WebP<br />ไม่เกิน 5 MB</span></span>}</button><input hidden ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseCover(event.target.files?.[0])} />{cover && <div className={styles.fileChip}><span>{cover.name}</span><button type="button" onClick={() => chooseCover()} aria-label="ลบภาพปก"><X size={14} /></button></div>}<div className={styles.note}>ใช้ภาพแนวตั้งที่เห็นชื่อเรื่องชัดเจน และหลีกเลี่ยงข้อมูลติดต่อหรือลิงก์ภายนอกบนภาพ</div></aside>
      <div>
        <section className={styles.card}><span className={styles.eyebrow}>ข้อมูลลิขสิทธิ์</span><h2>ผลงานนี้เป็นของใคร</h2><div className={styles.segments} style={{ marginTop: 14 }}>{([['original','ผลงานต้นฉบับ','คุณเป็นเจ้าของลิขสิทธิ์'],['translated','ผลงานแปล','มีสิทธิ์เผยแพร่คำแปล']] as const).map(([value,label,desc]) => <button disabled={Boolean(draftId) || allLocked} key={value} type="button" onClick={() => { patch('origin', value); patch('creationMethod', value === 'original' ? 'self_written' : 'self_translated') }} className={`${styles.segment} ${form.origin === value ? styles.segmentActive : ''}`}><b>{label}</b><span>{desc}</span></button>)}</div></section>
        <section className={styles.card}><span className={styles.eyebrow}>ข้อมูลผลงาน</span><h2>รายละเอียดสำหรับนักอ่าน</h2><div className={styles.fields} style={{ marginTop: 16 }}>
          <label className={`${styles.field} ${styles.full}`}><span>ชื่อเรื่อง *</span><input required maxLength={200} disabled={coreLocked || allLocked} value={form.title} onChange={(e) => patch('title', e.target.value)} /></label>
          <label className={styles.field}><span>หมวดหมู่ *</span><select required disabled={coreLocked || allLocked} value={form.category} onChange={(e) => patch('category', e.target.value)}><option value="">เลือกหมวดหมู่</option>{ALL_GENRES.map((genre) => <option value={genre} key={genre}>{GENRE_LABELS[genre]}</option>)}</select></label>
          <label className={styles.field}><span>เรตเนื้อหา</span><select disabled={coreLocked || allLocked} value={form.rating} onChange={(e) => patch('rating', e.target.value)}><option value="general">ทั่วไป</option><option value="13+">13+</option><option value="15+">15+</option><option value="18+">18+</option></select></label>
          <label className={styles.field}><span>วิธีสร้างผลงาน</span><select disabled={coreLocked || allLocked} value={form.creationMethod} onChange={(e) => patch('creationMethod', e.target.value)}>{methodOptions.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className={styles.field}><span>สถานะเรื่อง</span><select disabled={allLocked} value={form.seriesStatus} onChange={(e) => patch('seriesStatus', e.target.value)}><option value="ongoing">กำลังดำเนินเรื่อง</option><option value="completed">จบแล้ว</option><option value="hiatus">พักการอัปเดต</option></select></label>
          {type === 'audiobook' && <label className={styles.field}><span>ชนิดเสียง *</span><select required disabled={coreLocked || allLocked} value={form.narrationType} onChange={(e) => patch('narrationType', e.target.value as WorkFormState['narrationType'])}><option value="human">เสียงพากย์</option><option value="ai">เสียง AI</option></select></label>}
          <label className={`${styles.field} ${styles.full}`}><span>คำโปรย</span><input maxLength={200} disabled={allLocked} value={form.tagline} onChange={(e) => patch('tagline', e.target.value)} placeholder="ประโยคสั้น ๆ ที่ทำให้นักอ่านสนใจ" /><small className={styles.count}>{form.tagline.length}/200</small></label>
          <label className={`${styles.field} ${styles.full}`}><span>เรื่องย่อ</span><textarea disabled={allLocked} value={form.synopsis} onChange={(e) => patch('synopsis', e.target.value)} placeholder="เล่าเรื่องราว ตัวละคร และจุดเด่นของผลงาน" /><small className={styles.help}>เรื่องย่อเก็บเป็นข้อความธรรมดาเพื่อรองรับทุกหน้าที่แสดงผลงาน</small></label>
          <div className={`${styles.field} ${styles.full}`}><span>แท็ก ({form.tags.length}/10)</span><div className={styles.tagBox}>{form.tags.map((tag) => <span key={tag} className={styles.tag}>#{tag}<button disabled={allLocked} type="button" onClick={() => patch('tags', form.tags.filter((item) => item !== tag))}><X size={12} /></button></span>)}<input disabled={allLocked || form.tags.length >= 10} value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }} onBlur={() => addTag()} placeholder="พิมพ์แล้วกด Enter" /></div><div className={styles.suggestions}>{tagSuggestions.filter((tag) => !form.tags.includes(tag)).slice(0, 6).map((tag) => <button disabled={allLocked || form.tags.length >= 10} type="button" key={tag} onClick={() => addTag(tag)}>+ {tag}</button>)}</div></div>
        </div></section>
        {form.origin === 'translated' && <section className={`${styles.card} ${styles.translated}`}><span className={styles.eyebrow}>ข้อมูลต้นฉบับ</span><h2>สิทธิ์และข้อมูลผู้แปล</h2><div className={styles.fields} style={{ marginTop: 16 }}><label className={styles.field}><span>ชื่อต้นฉบับ *</span><input required disabled={coreLocked || allLocked} value={form.originalTitle} onChange={(e) => patch('originalTitle', e.target.value)} /></label><label className={styles.field}><span>ภาษาต้นฉบับ *</span><input required disabled={coreLocked || allLocked} value={form.originalLanguage} onChange={(e) => patch('originalLanguage', e.target.value)} /></label><label className={styles.field}><span>ชื่อผู้แต่ง *</span><input required disabled={coreLocked || allLocked} value={form.originalAuthor} onChange={(e) => patch('originalAuthor', e.target.value)} /></label><label className={styles.field}><span>ชื่อผู้แปล *</span><input required disabled={coreLocked || allLocked} value={form.translatorName} onChange={(e) => patch('translatorName', e.target.value)} /></label></div></section>}
        {error && <div role="alert" className={styles.alert} style={{ marginTop: 16 }}>{error}{draftId && !editing && <div style={{ marginTop: 4 }}>ฉบับร่างถูกสร้างแล้ว กดส่งอีกครั้งเพื่อทำต่อโดยไม่สร้างเรื่องซ้ำ</div>}</div>}
        <div className={styles.actions}><Link href={backHref} className={styles.secondary}>ยกเลิก</Link><button className={styles.primary} disabled={busy || allLocked}>{busy ? <LoaderCircle className={styles.spin} size={16} /> : editing ? <Save size={16} /> : <Upload size={16} />}{busy ? 'กำลังบันทึก…' : editing ? 'บันทึกการเปลี่ยนแปลง' : draftId ? 'ลองส่งตรวจอีกครั้ง' : 'บันทึกและส่งตรวจ'}</button></div>
      </div>
    </form>
  </CreatorStudioShell>
}
