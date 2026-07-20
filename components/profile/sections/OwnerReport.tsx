'use client'

import { useCallback, useEffect, useRef, useState, type DragEvent, type FormEvent } from 'react'
import { AlertTriangle, ChevronRight, Clock3, ImagePlus, Plus, Send, Upload, X } from 'lucide-react'
import {
  PROFILE_REPORT_STATUS_LABELS,
  PROFILE_REPORT_TYPE_LABELS,
  type ProfileReportDetail,
  type ProfileReportStatus,
  type ProfileReportSummary,
  type ProfileReportType,
} from '@/lib/profile-reports'
import styles from '../profile.module.css'

type SelectedImage = { id: string; file: File; previewUrl: string }
type HistoryFilter = 'all' | ProfileReportStatus
type Notice = { kind: 'success' | 'error'; text: string } | null

const MAX_FILES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024
const HISTORY_FILTERS: Array<{ id: HistoryFilter; label: string }> = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'resolved', label: 'แก้ไขแล้ว' },
  { id: 'reply', label: 'ตอบกลับ' },
  { id: 'pending', label: 'รอดำเนินการ' },
]

async function responseError(response: Response, fallback: string) {
  try {
    const data = await response.json() as { error?: string }
    return data.error || fallback
  } catch {
    return fallback
  }
}

function formatDate(value: string, withTime = false) {
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return 'ไม่ระบุวันที่'
  return new Intl.DateTimeFormat('th-TH', withTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

export function OwnerReport() {
  const previewUrls = useRef(new Set<string>())
  const [subject, setSubject] = useState('')
  const [type, setType] = useState<ProfileReportType>('account_security')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<SelectedImage[]>([])
  const [notice, setNotice] = useState<Notice>(null)
  const [submitting, setSubmitting] = useState(false)
  const [items, setItems] = useState<ProfileReportSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')
  const [filter, setFilter] = useState<HistoryFilter>('all')
  const [selected, setSelected] = useState<ProfileReportSummary | null>(null)
  const [detail, setDetail] = useState<ProfileReportDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [reply, setReply] = useState('')
  const [replyFiles, setReplyFiles] = useState<SelectedImage[]>([])
  const [replying, setReplying] = useState(false)
  const [replyError, setReplyError] = useState('')

  const revokeFiles = useCallback((images: SelectedImage[]) => {
    images.forEach((image) => {
      URL.revokeObjectURL(image.previewUrl)
      previewUrls.current.delete(image.previewUrl)
    })
  }, [])

  const closeDetail = useCallback(() => {
    revokeFiles(replyFiles)
    setReplyFiles([])
    setReply('')
    setReplyError('')
    setSelected(null)
    setDetail(null)
  }, [replyFiles, revokeFiles])

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url))
    previewUrls.current.clear()
  }, [])

  const loadReports = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setHistoryError('')
    try {
      const response = await fetch('/api/member/reports', { cache: 'no-store', signal })
      if (!response.ok) throw new Error(await responseError(response, 'โหลดประวัติการแจ้งปัญหาไม่สำเร็จ'))
      const data = await response.json() as { items: ProfileReportSummary[] }
      setItems(data.items)
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setHistoryError(error instanceof Error ? error.message : 'โหลดประวัติการแจ้งปัญหาไม่สำเร็จ')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    queueMicrotask(() => { if (!controller.signal.aborted) void loadReports(controller.signal) })
    return () => controller.abort()
  }, [loadReports])

  useEffect(() => {
    if (!selected) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') closeDetail() }
    document.addEventListener('keydown', closeOnEscape)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [closeDetail, selected])

  function appendFiles(incoming: File[], target: 'form' | 'reply') {
    const current = target === 'form' ? files : replyFiles
    const setter = target === 'form' ? setFiles : setReplyFiles
    const accepted: SelectedImage[] = []
    let error = ''
    for (const file of incoming) {
      if (current.length + accepted.length >= MAX_FILES) { error = `แนบรูปได้สูงสุด ${MAX_FILES} รูป`; break }
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') { error = 'รองรับเฉพาะไฟล์ JPG และ PNG'; continue }
      if (!file.size || file.size > MAX_FILE_SIZE) { error = 'รูปแต่ละไฟล์ต้องมีขนาดไม่เกิน 5MB'; continue }
      const previewUrl = URL.createObjectURL(file)
      previewUrls.current.add(previewUrl)
      accepted.push({ id: crypto.randomUUID(), file, previewUrl })
    }
    if (accepted.length) setter([...current, ...accepted])
    if (target === 'form') setNotice(error ? { kind: 'error', text: error } : null)
    else setReplyError(error)
  }

  function removeFile(id: string, target: 'form' | 'reply') {
    const setter = target === 'form' ? setFiles : setReplyFiles
    setter((current) => {
      const removed = current.find((item) => item.id === id)
      if (removed) revokeFiles([removed])
      return current.filter((item) => item.id !== id)
    })
  }

  function clearForm() {
    setSubject('')
    setType('account_security')
    setMessage('')
    revokeFiles(files)
    setFiles([])
    setNotice(null)
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setNotice(null)
    const form = new FormData()
    form.set('subject', subject)
    form.set('type', type)
    form.set('message', message)
    files.forEach((item) => form.append('attachments', item.file))
    try {
      const response = await fetch('/api/member/reports', { method: 'POST', body: form })
      if (!response.ok) throw new Error(await responseError(response, 'ส่งเรื่องไม่สำเร็จ กรุณาลองใหม่'))
      clearForm()
      setNotice({ kind: 'success', text: 'ส่งเรื่องถึงทีมงานแล้ว ติดตามสถานะได้ที่ประวัติด้านล่าง' })
      await loadReports()
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'ส่งเรื่องไม่สำเร็จ กรุณาลองใหม่' })
    } finally {
      setSubmitting(false)
    }
  }

  async function openDetail(item: ProfileReportSummary) {
    setSelected(item)
    setDetail(null)
    setDetailError('')
    setDetailLoading(true)
    try {
      const response = await fetch(`/api/member/reports/${encodeURIComponent(item.id)}`, { cache: 'no-store' })
      if (!response.ok) throw new Error(await responseError(response, 'โหลดรายละเอียดไม่สำเร็จ'))
      setDetail((await response.json() as { report: ProfileReportDetail }).report)
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : 'โหลดรายละเอียดไม่สำเร็จ')
    } finally {
      setDetailLoading(false)
    }
  }

  async function submitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!detail || replying || (!reply.trim() && !replyFiles.length)) return
    setReplying(true)
    setReplyError('')
    const form = new FormData()
    form.set('message', reply)
    replyFiles.forEach((item) => form.append('attachments', item.file))
    try {
      const response = await fetch(`/api/member/reports/${encodeURIComponent(detail.id)}`, { method: 'POST', body: form })
      if (!response.ok) throw new Error(await responseError(response, 'ส่งข้อความไม่สำเร็จ กรุณาลองใหม่'))
      const next = (await response.json() as { report: ProfileReportDetail }).report
      setDetail(next)
      setSelected(next)
      revokeFiles(replyFiles)
      setReplyFiles([])
      setReply('')
      await loadReports()
    } catch (error) {
      setReplyError(error instanceof Error ? error.message : 'ส่งข้อความไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setReplying(false)
    }
  }

  const counts: Record<HistoryFilter, number> = {
    all: items.length,
    resolved: items.filter((item) => item.status === 'resolved').length,
    reply: items.filter((item) => item.status === 'reply').length,
    pending: items.filter((item) => item.status === 'pending').length,
  }
  const visibleItems = filter === 'all' ? items : items.filter((item) => item.status === filter)

  return (
    <div className={styles.reportPage}>
      <header className={styles.reportPageHeader}><h1>แจ้งปัญหา</h1><p>พบปัญหาการใช้งาน? แจ้งทีมงานได้ที่นี่ เราจะรีบดำเนินการให้เร็วที่สุด</p></header>

      <form className={`${styles.card} ${styles.reportSection}`} onSubmit={submitReport}>
        <SectionHeading icon={<AlertTriangle />} title="ติดต่อทีมงาน" description="กรอกรายละเอียดให้ครบถ้วนเพื่อให้ทีมงานช่วยเหลือได้รวดเร็วขึ้น" />
        <div className={styles.reportFormRow}>
          <label className={styles.reportField}><span>หัวข้อปัญหา <em>*</em></span><input value={subject} onChange={(event) => setSubject(event.target.value)} minLength={5} maxLength={120} placeholder="เช่น เติมเงินแล้วเหรียญไม่เข้าบัญชี" required /></label>
          <label className={styles.reportField}><span>ประเภทปัญหา</span><select value={type} onChange={(event) => setType(event.target.value as ProfileReportType)}>{Object.entries(PROFILE_REPORT_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        </div>
        <label className={styles.reportField}><span>รายละเอียด <em>*</em></span><textarea value={message} onChange={(event) => setMessage(event.target.value)} minLength={10} maxLength={1000} placeholder="อธิบายปัญหาที่พบ ขั้นตอนที่ทำ และสิ่งที่เกิดขึ้น..." required /><small><i>ยิ่งละเอียด ยิ่งช่วยให้แก้ปัญหาได้เร็วขึ้น</i><i>{message.length} / 1000</i></small></label>
        <div className={styles.reportField}><span>แนบรูปภาพ <i>(ไม่บังคับ · สูงสุด 5 รูป)</i></span><ImageDropzone files={files} onFiles={(next) => appendFiles(next, 'form')} onRemove={(id) => removeFile(id, 'form')} /></div>
        {notice && <p className={`${styles.reportNotice} ${notice.kind === 'success' ? styles.reportNoticeSuccess : styles.reportNoticeError}`} role="status">{notice.text}</p>}
        <div className={styles.reportFormButtons}><button type="button" className={styles.reportGhostButton} onClick={clearForm} disabled={submitting}>ล้างฟอร์ม</button><button type="submit" className={styles.reportPrimaryButton} disabled={submitting}><Send />{submitting ? 'กำลังส่ง...' : 'ส่งเรื่อง'}</button></div>
      </form>

      <section className={`${styles.card} ${styles.reportSection}`}>
        <SectionHeading icon={<Clock3 />} title="ประวัติการแจ้งปัญหา" description="ติดตามสถานะเรื่องที่คุณแจ้งไว้" />
        <div className={styles.reportTabs} role="tablist" aria-label="กรองประวัติการแจ้งปัญหา">{HISTORY_FILTERS.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={filter === tab.id} className={filter === tab.id ? styles.reportTabActive : ''} onClick={() => setFilter(tab.id)}>{tab.label}<span>{counts[tab.id]}</span></button>)}</div>
        <div className={styles.reportList}>
          {loading ? Array.from({ length: 3 }, (_, index) => <div key={index} className={styles.reportRowSkeleton} />)
            : historyError ? <div className={styles.reportEmpty}><p>{historyError}</p><button type="button" onClick={() => void loadReports()}>ลองใหม่</button></div>
              : visibleItems.length ? visibleItems.map((item) => <button key={item.id} type="button" className={styles.reportRow} onClick={() => void openDetail(item)}><span className={styles.reportRowIcon}><ImagePlus /></span><span className={styles.reportRowMain}><b>{item.subject}</b><small><em>{item.reference}</em><i>·</i><span>{PROFILE_REPORT_TYPE_LABELS[item.type]}</span><i>·</i><span>{formatDate(item.createdAt)}</span></small></span><span className={`${styles.reportStatus} ${styles[`reportStatus${item.status[0].toUpperCase()}${item.status.slice(1)}` as keyof typeof styles]}`}>{PROFILE_REPORT_STATUS_LABELS[item.status]}</span><ChevronRight className={styles.reportRowArrow} /></button>)
                : <div className={styles.reportEmpty}>ยังไม่มีรายการในสถานะนี้</div>}
        </div>
      </section>

      {selected && <ReportDialog summary={selected} detail={detail} loading={detailLoading} error={detailError} reply={reply} replyFiles={replyFiles} replying={replying} replyError={replyError} onClose={closeDetail} onRetry={() => void openDetail(selected)} onReplyChange={setReply} onReplyFiles={(next) => appendFiles(next, 'reply')} onRemoveReplyFile={(id) => removeFile(id, 'reply')} onSubmitReply={submitReply} />}
    </div>
  )
}

function SectionHeading({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return <div className={styles.reportSectionHeading}><h2>{icon}{title}</h2><p>{description}</p></div>
}

function ImageDropzone({ files, onFiles, onRemove, compact = false }: { files: SelectedImage[]; onFiles: (files: File[]) => void; onRemove: (id: string) => void; compact?: boolean }) {
  const drop = (event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); onFiles(Array.from(event.dataTransfer.files)) }
  return <><label className={`${styles.reportDropzone} ${compact ? styles.reportDropzoneCompact : ''}`} onDragOver={(event) => event.preventDefault()} onDrop={drop}><input type="file" accept="image/jpeg,image/png" multiple onChange={(event) => { onFiles(Array.from(event.target.files ?? [])); event.target.value = '' }} /><Upload /><b>{compact ? 'แนบรูปเพิ่มเติม' : <>ลากรูปมาวาง หรือ <u>คลิกเพื่อเลือก</u></>}</b>{!compact && <p>รองรับ JPG, PNG ขนาดไม่เกิน 5MB ต่อรูป</p>}</label>{!!files.length && <div className={styles.reportThumbnails}>{files.map((item) => <span key={item.id} className={styles.reportThumbnail} style={{ backgroundImage: `url(${JSON.stringify(item.previewUrl)})` }}><button type="button" onClick={() => onRemove(item.id)} aria-label={`ลบ ${item.file.name}`}><X /></button></span>)}</div>}</>
}

function ReportDialog({ summary, detail, loading, error, reply, replyFiles, replying, replyError, onClose, onRetry, onReplyChange, onReplyFiles, onRemoveReplyFile, onSubmitReply }: { summary: ProfileReportSummary; detail: ProfileReportDetail | null; loading: boolean; error: string; reply: string; replyFiles: SelectedImage[]; replying: boolean; replyError: string; onClose: () => void; onRetry: () => void; onReplyChange: (value: string) => void; onReplyFiles: (files: File[]) => void; onRemoveReplyFile: (id: string) => void; onSubmitReply: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className={styles.reportModalOverlay} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className={styles.reportModal} role="dialog" aria-modal="true" aria-labelledby="report-detail-title"><button type="button" className={styles.reportModalClose} onClick={onClose} aria-label="ปิด"><X /></button><header><h2 id="report-detail-title">{summary.subject}</h2><p><em>{summary.reference}</em><i>·</i><span>{PROFILE_REPORT_TYPE_LABELS[summary.type]}</span><i>·</i><span>{formatDate(summary.createdAt)}</span><b className={`${styles.reportStatus} ${styles[`reportStatus${summary.status[0].toUpperCase()}${summary.status.slice(1)}` as keyof typeof styles]}`}>{PROFILE_REPORT_STATUS_LABELS[summary.status]}</b></p></header>
    {loading ? <div className={styles.reportModalState}>กำลังโหลดรายละเอียด...</div> : error ? <div className={styles.reportModalState}><p>{error}</p><button type="button" onClick={onRetry}>ลองใหม่</button></div> : detail && <><div className={styles.reportThread}>{detail.messages.map((item) => <article key={item.id} className={item.senderType === 'admin' ? styles.reportMessageStaff : styles.reportMessageMember}><b>{item.senderType === 'admin' ? 'เจ้าหน้าที่ ReadLead' : 'คุณ'}</b>{item.message && <p>{item.message}</p>}{!!item.attachments.length && <div className={styles.reportMessageImages}>{item.attachments.map((attachment) => <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer" aria-label={`เปิดรูป ${attachment.name}`} style={{ backgroundImage: `url(${JSON.stringify(attachment.url)})` }} />)}</div>}<time>{formatDate(item.createdAt, true)}</time></article>)}</div><div className={styles.reportReplyArea}>{detail.status === 'resolved' ? <p className={styles.reportWait}>คำขอได้รับการแก้ไขแล้ว</p> : detail.canReply ? <form onSubmit={onSubmitReply}>{!!replyFiles.length && <div className={styles.reportReplyPreviews}>{replyFiles.map((item) => <span key={item.id} style={{ backgroundImage: `url(${JSON.stringify(item.previewUrl)})` }}><button type="button" onClick={() => onRemoveReplyFile(item.id)} aria-label={`ลบ ${item.file.name}`}><X /></button></span>)}</div>}<div className={styles.reportReplyRow}><label className={styles.reportReplyAdd} title="แนบรูป"><input type="file" accept="image/jpeg,image/png" multiple onChange={(event) => { onReplyFiles(Array.from(event.target.files ?? [])); event.target.value = '' }} /><Plus /></label><input value={reply} maxLength={1000} onChange={(event) => onReplyChange(event.target.value)} placeholder="พิมพ์ข้อความ..." aria-label="ข้อความตอบกลับ" /><button type="submit" disabled={replying || (!reply.trim() && !replyFiles.length)} aria-label="ส่งข้อความ"><Send /></button></div>{replyError && <p className={styles.reportReplyError} role="alert">{replyError}</p>}</form> : <p className={styles.reportWait}>รอเจ้าหน้าที่ตอบกลับภายใน 24 ชม.</p>}</div></>}
  </div></div>
}
