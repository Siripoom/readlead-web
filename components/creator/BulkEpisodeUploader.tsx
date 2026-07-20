'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, FileAudio, FileText, LoaderCircle, Trash2, Upload } from 'lucide-react'
import mammoth from 'mammoth'
import type { CreatorWorkDetail } from '@/lib/creator-studio-types'
import { plainTextToEpisodeHtml, sanitizeEpisodeHtml } from '@/lib/creator-rich-text'
import { CreatorStudioShell, creatorStudioStyles as styles } from './CreatorStudioShell'

type Draft = { id: string; title: string; content: string; file?: File; previewUrl?: string; status: 'draft' | 'published' | 'scheduled'; scheduledAt: string; paid: boolean; price: number; warning?: string }
async function apiError(response: Response, fallback: string) { const data = await response.json().catch(() => ({})) as { error?: string }; return data.error || fallback }
const stripExt = (name: string) => name.replace(/\.[^/.]+$/, '')

function splitChapters(text: string, fallbackTitle: string): Array<{ title: string; content: string }> {
  const lines = text.replace(/\r/g, '').split('\n')
  const chapters: Array<{ title: string; lines: string[] }> = []
  const heading = /^\s*((?:บท|ตอน)ที่\s*[0-9๐-๙]+)(?:\s*[:：.\-–]?\s*(.*))?$/
  const hasHeadings = lines.some((line) => heading.test(line))
  let current: { title: string; lines: string[] } | null = null
  for (const line of lines) {
    const match = line.match(heading)
    if (match) { if (current) chapters.push(current); current = { title: `${match[1]}${match[2] ? ` ${match[2].trim()}` : ''}`, lines: [] } }
    else if (current) current.lines.push(line)
    else if (!hasHeadings && line.trim()) { current = { title: fallbackTitle, lines: [line] } }
  }
  if (current) chapters.push(current)
  return (chapters.length ? chapters : [{ title: fallbackTitle, lines }]).map((item) => ({ title: item.title, content: item.lines.join('\n').trim() }))
}

export default function BulkEpisodeUploader({ work }: { work: CreatorWorkDetail }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const urlsRef = useRef<string[]>([])
  const isAudio = work.type === 'audiobook'
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [busy, setBusy] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [createdIds, setCreatedIds] = useState<string[]>([])
  const [uploadedIndexes, setUploadedIndexes] = useState<Set<number>>(() => new Set())
  useEffect(() => () => urlsRef.current.forEach((url) => URL.revokeObjectURL(url)), [])

  async function addFiles(files: FileList) {
    setProcessing(true); setError('')
    try {
      const incoming = Array.from(files)
      if (drafts.length + incoming.length > 50) throw new Error('เพิ่มได้สูงสุด 50 ตอนต่อหนึ่งชุด')
      if (isAudio) {
        const invalid = incoming.find((file) => !file.type.startsWith('audio/') || file.size > 100 * 1024 * 1024)
        if (invalid) throw new Error(`ไฟล์ ${invalid.name} ไม่ใช่ไฟล์เสียงหรือมีขนาดเกิน 100 MB`)
        setDrafts((current) => [...current, ...incoming.map((file) => { const previewUrl = URL.createObjectURL(file); urlsRef.current.push(previewUrl); return { id: crypto.randomUUID(), title: stripExt(file.name), content: '', file, previewUrl, status: 'draft' as const, scheduledAt: '', paid: false, price: 5 } })].slice(0,50))
      } else {
        const parsed: Draft[] = []
        for (const file of incoming) {
          if (!file.name.toLowerCase().endsWith('.txt') && !file.name.toLowerCase().endsWith('.docx')) throw new Error('นิยายรองรับเฉพาะไฟล์ .txt และ .docx')
          const text = file.name.toLowerCase().endsWith('.docx') ? (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value : await file.text()
          for (const chapter of splitChapters(text, stripExt(file.name))) parsed.push({ id: crypto.randomUUID(), title: chapter.title, content: chapter.content, status: 'draft', scheduledAt: '', paid: false, price: 5, warning: chapter.content.trim().length < 300 ? 'เนื้อหาสั้นกว่า 300 ตัวอักษร' : undefined })
        }
        if (drafts.length + parsed.length > 50) throw new Error(`ตรวจพบ ${drafts.length + parsed.length} ตอน ซึ่งเกินขีดจำกัด 50 ตอนต่อชุด`)
        setDrafts((current) => [...current, ...parsed])
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'อ่านไฟล์ไม่สำเร็จ') }
    finally { setProcessing(false) }
  }
  function update(id: string, patch: Partial<Draft>) { setDrafts((current) => current.map((draft) => draft.id === id ? { ...draft, ...patch } : draft)) }
  function remove(id: string) { setDrafts((current) => { const found = current.find((draft) => draft.id === id); if (found?.previewUrl) { URL.revokeObjectURL(found.previewUrl); urlsRef.current = urlsRef.current.filter((url) => url !== found.previewUrl) } return current.filter((draft) => draft.id !== id) }) }
  function move(index: number, delta: number) { setDrafts((current) => { const target = index + delta; if (target < 0 || target >= current.length) return current; const next = [...current]; [next[index],next[target]] = [next[target],next[index]]; return next }) }

  async function saveAll() {
    setBusy(true); setError('')
    try {
      if (!drafts.length) throw new Error('กรุณาเพิ่มไฟล์อย่างน้อยหนึ่งไฟล์')
      if (!work.capabilities.canCreateDraftEpisode) throw new Error('สถานะผลงานนี้ไม่รองรับการเพิ่มตอน')
      for (const draft of drafts) {
        if (!draft.title.trim()) throw new Error('ทุกตอนต้องมีชื่อ')
        if (!isAudio && !draft.content.trim()) throw new Error(`ตอน “${draft.title}” ยังไม่มีเนื้อหา`)
        if (draft.status !== 'draft' && !work.capabilities.canPublishEpisode) throw new Error('ผลงานยังไม่ผ่านการอนุมัติ จึงบันทึกได้เฉพาะฉบับร่าง')
        if (draft.status === 'scheduled' && (!draft.scheduledAt || new Date(draft.scheduledAt).getTime() <= Date.now())) throw new Error(`กำหนดเวลาของ “${draft.title}” ต้องเป็นเวลาในอนาคต`)
      }
      let ids = createdIds
      if (!ids.length) {
        const episodes = drafts.map((draft) => ({ title: draft.title.trim(), type: isAudio ? 'audio' : 'text', status: isAudio ? 'draft' : draft.status, content: isAudio ? undefined : sanitizeEpisodeHtml(plainTextToEpisodeHtml(draft.content)), priceCoins: draft.paid ? draft.price : 0, scheduledAt: draft.status === 'scheduled' ? new Date(draft.scheduledAt).toISOString() : null }))
        const response = await fetch(`/api/creator/works/${work.id}/episodes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ episodes }) })
        if (!response.ok) throw new Error(await apiError(response, 'สร้างตอนไม่สำเร็จ'))
        const data = await response.json() as { episodes: Array<{ id: string }> }; ids = data.episodes.map((item) => item.id); setCreatedIds(ids)
      }
      if (isAudio) {
        for (const [index,draft] of drafts.entries()) {
          if (!uploadedIndexes.has(index)) {
            const body = new FormData(); body.set('file', draft.file!); body.set('kind','audio'); body.set('sortOrder','0')
            const upload = await fetch(`/api/creator/works/${work.id}/episodes/${ids[index]}/assets`, { method: 'POST', body })
            if (!upload.ok) throw new Error(`สร้างฉบับร่างแล้ว แต่อัปโหลด ${draft.file!.name} ไม่สำเร็จ: ${await apiError(upload,'กรุณาลองใหม่')}`)
            setUploadedIndexes((current) => new Set(current).add(index))
          }
          if (draft.status !== 'draft') {
            const finalize = await fetch(`/api/creator/episodes/${ids[index]}`, { method: 'PATCH', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ title: draft.title.trim(), status: draft.status, priceCoins: draft.paid ? draft.price : 0, scheduledAt: draft.status === 'scheduled' ? new Date(draft.scheduledAt).toISOString() : null }) })
            if (!finalize.ok) throw new Error(`อัปโหลด ${draft.file!.name} แล้ว แต่${await apiError(finalize,'เปลี่ยนสถานะไม่สำเร็จ')}`)
          }
        }
      }
      router.push(`/creator/works/${work.id}`); router.refresh()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'บันทึกหลายตอนไม่สำเร็จ') }
    finally { setBusy(false) }
  }

  return <CreatorStudioShell backHref={`/creator/works/${work.id}`} backLabel="หน้าจัดการผลงาน">
    <div className={styles.pageHead}><div className={styles.headTitle}><div className={styles.headIcon}>{isAudio ? <FileAudio size={27} /> : <FileText size={27} />}</div><div><h1>เพิ่มหลายตอน</h1><p>{work.title} · ตอนถัดไปเริ่มที่ {work.episodes.length + 1} · สูงสุด 50 ตอนต่อชุด</p></div></div></div>
    {!work.capabilities.canPublishEpisode && <div className={styles.warning} style={{ marginBottom: 16 }}>ผลงานยังไม่ผ่านการอนุมัติ ทุกตอนจะต้องบันทึกเป็นฉบับร่าง</div>}
    <section className={styles.card}><button type="button" className={styles.upload} disabled={processing || createdIds.length > 0} onClick={() => inputRef.current?.click()}><Upload size={28} /><b>{processing ? 'กำลังอ่านไฟล์…' : isAudio ? 'เลือกไฟล์เสียงหลายไฟล์' : 'เลือกไฟล์ .txt หรือ .docx'}</b><span>{isAudio ? 'หนึ่งไฟล์จะถูกสร้างเป็นหนึ่งตอน' : 'ระบบแยกตอนจากบรรทัดที่ขึ้นต้นด้วย “บทที่” หรือ “ตอนที่”'}</span></button><input hidden multiple ref={inputRef} type="file" accept={isAudio ? 'audio/*,.mp3,.m4a,.wav,.mp4' : '.txt,.docx,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document'} onChange={(event) => { if (event.target.files) void addFiles(event.target.files); event.target.value = '' }} /></section>
    {drafts.length > 0 && <section className={styles.card}><div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,marginBottom:14 }}><div><h2>ตรวจสอบก่อนบันทึก</h2><span className={styles.help}>{drafts.length} ตอน · หมายเลข {work.episodes.length + 1}–{work.episodes.length + drafts.length}</span></div>{!createdIds.length && <button className={styles.secondary} type="button" onClick={() => inputRef.current?.click()}>+ เพิ่มไฟล์</button>}</div><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>ลำดับ</th><th>ชื่อและเนื้อหา</th><th>การเผยแพร่</th><th>ราคา</th><th>จัดการ</th></tr></thead><tbody>{drafts.map((draft,index) => <tr key={draft.id}><td>{work.episodes.length + index + 1}</td><td className={styles.title}><input disabled={createdIds.length > 0} style={{ width:'100%',border:'1px solid #dfe1e6',borderRadius:7,padding:8 }} value={draft.title} onChange={(e) => update(draft.id,{ title:e.target.value })} />{!isAudio && <details style={{ marginTop:7 }}><summary className={styles.help}>แก้ไขเนื้อหา · {draft.content.length.toLocaleString('th-TH')} ตัวอักษร</summary><textarea disabled={createdIds.length > 0} style={{ width:'100%',minHeight:180,marginTop:8,border:'1px solid #dfe1e6',borderRadius:8,padding:9,font:'inherit',fontSize:12 }} value={draft.content} onChange={(e) => update(draft.id,{ content:e.target.value, warning:e.target.value.trim().length < 300 ? 'เนื้อหาสั้นกว่า 300 ตัวอักษร' : undefined })} /></details>}{isAudio && draft.previewUrl && <audio controls src={draft.previewUrl} style={{ width:'100%',marginTop:8 }} />}{draft.warning && <div style={{ color:'#9a690e',fontSize:10,marginTop:5 }}>{draft.warning}</div>}</td><td><select disabled={createdIds.length > 0} value={draft.status} onChange={(e) => update(draft.id,{ status:e.target.value as Draft['status'] })} style={{ border:'1px solid #dfe1e6',borderRadius:7,padding:7 }}><option value="draft">ฉบับร่าง</option><option disabled={!work.capabilities.canPublishEpisode} value="published">เผยแพร่ทันที</option><option disabled={!work.capabilities.canPublishEpisode} value="scheduled">ตั้งเวลา</option></select>{draft.status === 'scheduled' && <input disabled={createdIds.length > 0} type="datetime-local" value={draft.scheduledAt} onChange={(e) => update(draft.id,{ scheduledAt:e.target.value })} style={{ display:'block',marginTop:6,border:'1px solid #dfe1e6',borderRadius:7,padding:7 }} />}</td><td><select disabled={createdIds.length > 0} value={draft.paid ? 'paid':'free'} onChange={(e) => update(draft.id,{ paid:e.target.value==='paid' })} style={{ border:'1px solid #dfe1e6',borderRadius:7,padding:7 }}><option value="free">ฟรี</option><option value="paid">มีค่าใช้จ่าย</option></select>{draft.paid && <input disabled={createdIds.length > 0} type="number" min={3} max={15} value={draft.price} onChange={(e) => update(draft.id,{ price:Math.min(15,Math.max(3,Number(e.target.value))) })} style={{ display:'block',width:70,marginTop:6,border:'1px solid #dfe1e6',borderRadius:7,padding:7 }} />}</td><td><div style={{ display:'flex',gap:3 }}><button disabled={index===0 || createdIds.length > 0} className={styles.secondary} onClick={() => move(index,-1)}><ArrowUp size={13} /></button><button disabled={index===drafts.length-1 || createdIds.length > 0} className={styles.secondary} onClick={() => move(index,1)}><ArrowDown size={13} /></button><button disabled={createdIds.length > 0} className={styles.danger} onClick={() => remove(draft.id)}><Trash2 size={13} /></button></div></td></tr>)}</tbody></table></div></section>}
    {error && <div className={styles.alert} role="alert" style={{ marginTop:16 }}>{error}{createdIds.length > 0 && <div style={{ marginTop:4 }}>สร้างรายการฉบับร่างแล้ว กดบันทึกอีกครั้งเพื่ออัปโหลดต่อโดยไม่สร้างตอนซ้ำ</div>}</div>}
    <div className={styles.actions}><Link className={styles.secondary} href={`/creator/works/${work.id}`}>ยกเลิก</Link><button className={styles.primary} disabled={busy || processing || !drafts.length} onClick={() => void saveAll()}>{busy ? <LoaderCircle className={styles.spin} size={15} /> : <Upload size={15} />}{busy ? 'กำลังบันทึก…' : `บันทึก ${drafts.length} ตอน`}</button></div>
  </CreatorStudioShell>
}
