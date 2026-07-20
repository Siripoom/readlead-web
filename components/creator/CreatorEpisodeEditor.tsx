'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, FileAudio, FileText, ImageIcon, LoaderCircle, Save, Upload, X } from 'lucide-react'
import type { CreatorEpisodeRecord, CreatorWorkDetail } from '@/lib/creator-studio-types'
import { sanitizeEpisodeHtml } from '@/lib/creator-rich-text'
import { CreatorStudioShell, creatorStudioStyles as styles } from './CreatorStudioShell'
import RichTextEditor from './RichTextEditor'

type PublishStatus = 'draft' | 'published' | 'scheduled' | 'hidden'
type EpisodeAsset = NonNullable<CreatorEpisodeRecord['assets']>[number]
type MediaItem =
  | { key: string; source: 'existing'; asset: EpisodeAsset }
  | { key: string; source: 'new'; file: File; url: string; uploadedId?: string }

async function apiError(response: Response, fallback: string) {
  const data = await response.json().catch(() => ({})) as { error?: string }
  return data.error || fallback
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return 'ไม่ทราบขนาด'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function CreatorEpisodeEditor({ work, episode }: { work: CreatorWorkDetail; episode?: CreatorEpisodeRecord }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const urlsRef = useRef<string[]>([])
  const isEditing = Boolean(episode)
  const mediaType = work.type === 'novel' ? 'text' : work.type === 'manga' ? 'image' : 'audio'
  const [title, setTitle] = useState(episode?.title ?? '')
  const [content, setContent] = useState(episode?.content ?? '')
  const [status, setStatus] = useState<PublishStatus>(episode?.status ?? 'draft')
  const [price, setPrice] = useState(episode?.priceCoins ? Math.min(15, Math.max(3, episode.priceCoins)) : 5)
  const [paid, setPaid] = useState(Boolean(episode?.priceCoins))
  const [scheduledAt, setScheduledAt] = useState(episode?.scheduledAt?.slice(0, 16) ?? '')
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    const kind = mediaType === 'image' ? 'page' : 'audio'
    const assets = (episode?.assets ?? []).filter((asset) => asset.kind === kind).sort((a, b) => mediaType === 'audio' ? Number(Boolean(b.isPublic)) - Number(Boolean(a.isPublic)) || a.sortOrder - b.sortOrder : a.sortOrder - b.sortOrder)
    return (mediaType === 'audio' ? assets.slice(0, 1) : assets).map((asset) => ({ key: `asset:${asset.id}`, source: 'existing' as const, asset }))
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [createdId, setCreatedId] = useState<string | null>(episode?.id ?? null)
  const [assetsCommitted, setAssetsCommitted] = useState(false)

  useEffect(() => () => urlsRef.current.forEach((url) => URL.revokeObjectURL(url)), [])

  function discardLocalItem(item: MediaItem) {
    if (item.source !== 'new') return
    URL.revokeObjectURL(item.url)
    urlsRef.current = urlsRef.current.filter((url) => url !== item.url)
  }

  function addFiles(list: FileList) {
    setError('')
    const incoming = Array.from(list)
    if (mediaType === 'audio' && incoming.length > 1) {
      setError('หนึ่งตอนรองรับไฟล์เสียงหนึ่งไฟล์ หากต้องการหลายตอนให้ใช้ “เพิ่มหลายตอน”')
      return
    }
    for (const file of incoming) {
      const valid = mediaType === 'image'
        ? ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 10 * 1024 * 1024
        : file.type.startsWith('audio/') && file.size <= 100 * 1024 * 1024
      if (!valid) {
        setError(mediaType === 'image' ? 'ภาพรองรับ JPEG, PNG, WebP ไม่เกิน 10 MB ต่อไฟล์' : 'ไฟล์เสียงต้องเป็นชนิด audio และไม่เกิน 100 MB')
        return
      }
    }
    const additions = incoming.map((file) => {
      const url = URL.createObjectURL(file)
      urlsRef.current.push(url)
      return { key: `new:${crypto.randomUUID()}`, source: 'new' as const, file, url }
    })
    setMediaItems((current) => {
      if (mediaType !== 'audio') return [...current, ...additions]
      current.filter((item) => item.source === 'new').forEach(discardLocalItem)
      return [...current.filter((item) => item.source === 'existing'), additions[0]]
    })
    setAssetsCommitted(false)
  }

  function removeItem(key: string) {
    setMediaItems((current) => {
      const found = current.find((item) => item.key === key)
      if (found) discardLocalItem(found)
      return current.filter((item) => item.key !== key)
    })
    setAssetsCommitted(false)
  }

  function move(index: number, delta: number) {
    setMediaItems((current) => {
      const target = index + delta
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setAssetsCommitted(false)
  }

  function existingAssetUrl(assetId: string) {
    return `/api/creator/works/${encodeURIComponent(work.id)}/episodes/${encodeURIComponent(episode!.id)}/assets/${encodeURIComponent(assetId)}`
  }

  async function syncMedia(episodeId: string) {
    let workingItems = [...mediaItems]
    const selected = mediaType === 'audio'
      ? [workingItems.find((item) => item.source === 'new') ?? workingItems.find((item) => item.source === 'existing')].filter((item): item is MediaItem => Boolean(item))
      : workingItems
    if (!selected.length) throw new Error(mediaType === 'image' ? 'ต้องเหลือหน้าภาพอย่างน้อยหนึ่งหน้า' : 'กรุณาเลือกไฟล์เสียง')

    const orderedAssetIds: string[] = []
    for (const [index, item] of selected.entries()) {
      if (item.source === 'existing') {
        orderedAssetIds.push(item.asset.id)
        continue
      }
      if (item.uploadedId) {
        orderedAssetIds.push(item.uploadedId)
        continue
      }
      const body = new FormData()
      body.set('file', item.file)
      body.set('kind', mediaType === 'image' ? 'page' : 'audio')
      body.set('sortOrder', String(index))
      body.set('staged', 'true')
      const upload = await fetch(`/api/creator/works/${work.id}/episodes/${episodeId}/assets`, { method: 'POST', body })
      if (!upload.ok) throw new Error(`อัปโหลด ${item.file.name} ไม่สำเร็จ: ${await apiError(upload, 'กรุณาลองใหม่')}`)
      const data = await upload.json() as { asset: { id: string } }
      orderedAssetIds.push(data.asset.id)
      workingItems = workingItems.map((current) => current.key === item.key && current.source === 'new' ? { ...current, uploadedId: data.asset.id } : current)
      setMediaItems(workingItems)
    }

    const response = await fetch(`/api/creator/works/${work.id}/episodes/${episodeId}/assets`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: mediaType === 'image' ? 'page' : 'audio', orderedAssetIds }),
    })
    if (!response.ok) throw new Error(await apiError(response, 'จัดลำดับไฟล์ไม่สำเร็จ'))
    setAssetsCommitted(true)
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    let filesSavedThisAttempt = false
    try {
      if (!title.trim()) throw new Error('กรุณาระบุชื่อตอน')
      if (status !== 'draft' && status !== 'hidden' && !work.capabilities.canPublishEpisode) throw new Error('ต้องรอให้ผลงานผ่านการอนุมัติก่อนเผยแพร่หรือตั้งเวลา')
      if (status === 'scheduled' && (!scheduledAt || new Date(scheduledAt).getTime() <= Date.now())) throw new Error('เวลาเผยแพร่ต้องเป็นเวลาในอนาคต')
      if (mediaType === 'image' && mediaItems.length === 0) throw new Error('ต้องเหลือหน้าภาพอย่างน้อยหนึ่งหน้า')
      if (mediaType === 'audio' && !mediaItems.length) throw new Error('กรุณาเลือกไฟล์เสียง')

      const finalStatus = work.capabilities.canPublishEpisode ? status : 'draft'
      const payload = {
        title: title.trim(),
        type: mediaType,
        status: mediaType === 'text' ? finalStatus : 'draft',
        priceCoins: paid ? price : 0,
        content: mediaType === 'text' ? sanitizeEpisodeHtml(content) : undefined,
        scheduledAt: finalStatus === 'scheduled' ? new Date(scheduledAt).toISOString() : null,
      }
      let episodeId = createdId
      if (!episodeId) {
        const response = await fetch(`/api/creator/works/${work.id}/episodes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ episodes: [payload] }),
        })
        if (!response.ok) throw new Error(await apiError(response, 'สร้างตอนไม่สำเร็จ'))
        const data = await response.json() as { episodes: Array<{ id: string }> }
        episodeId = data.episodes[0].id
        setCreatedId(episodeId)
      }

      if (mediaType !== 'text' && !assetsCommitted) {
        await syncMedia(episodeId)
        filesSavedThisAttempt = true
      }

      if (isEditing || mediaType !== 'text') {
        const response = await fetch(`/api/creator/episodes/${episodeId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, status: finalStatus }),
        })
        if (!response.ok) throw new Error(await apiError(response, 'บันทึกข้อมูลตอนไม่สำเร็จ'))
      }
      router.push(`/creator/works/${work.id}`)
      router.refresh()
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'บันทึกตอนไม่สำเร็จ'
      setError(filesSavedThisAttempt ? `ไฟล์ถูกบันทึกแล้ว แต่${message} กดบันทึกอีกครั้งเพื่อทำต่อ` : message)
    } finally {
      setBusy(false)
    }
  }

  const Icon = mediaType === 'text' ? FileText : mediaType === 'image' ? ImageIcon : FileAudio
  const existingAudio = mediaItems.find((item) => item.source === 'existing')
  const replacementAudio = mediaItems.find((item) => item.source === 'new')

  return <CreatorStudioShell backHref={`/creator/works/${work.id}`} backLabel="หน้าจัดการผลงาน">
    <div className={styles.pageHead}>
      <div className={styles.headTitle}>
        <div className={styles.headIcon}><Icon size={27} /></div>
        <div><h1>{isEditing ? `แก้ไขตอนที่ ${episode?.episodeNumber}` : 'เพิ่มตอนใหม่'}</h1><p>{work.title} · {mediaType === 'text' ? 'เนื้อหานิยาย' : mediaType === 'image' ? 'หน้ามังงะ' : 'ไฟล์หนังสือเสียง'}</p></div>
      </div>
      {!isEditing && work.type !== 'manga' && <Link href={`/creator/works/${work.id}/episodes/bulk`} className={styles.secondary}>เพิ่มหลายตอน</Link>}
    </div>
    {!work.capabilities.canPublishEpisode && <div className={styles.warning} style={{ marginBottom: 16 }}>ผลงานยังไม่ผ่านการอนุมัติ จึงบันทึกตอนได้เฉพาะฉบับร่าง</div>}
    <form onSubmit={save} className={styles.publishGrid}>
      <div>
        <section className={styles.card}><label className={styles.field}><span>ชื่อตอน *</span><input required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="ชื่อตอนที่นักอ่านจะเห็น" /></label></section>
        {mediaType === 'text' && <section className={styles.card}><RichTextEditor value={content} onChange={setContent} /></section>}
        {mediaType === 'image' && <section className={styles.card}>
          <h2>หน้าภาพ ({mediaItems.length})</h2>
          <button type="button" className={styles.upload} onClick={() => fileRef.current?.click()}><Upload size={28} /><b>เพิ่มหน้าภาพ</b><span>JPEG, PNG, WebP · ไม่เกิน 10 MB/หน้า</span></button>
          <input hidden ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = '' }} />
          {mediaItems.length > 0 && <div className={styles.mediaGrid} style={{ marginTop: 14 }}>{mediaItems.map((item, index) => {
            const src = item.source === 'existing' ? existingAssetUrl(item.asset.id) : item.url
            const size = item.source === 'existing' ? item.asset.sizeBytes : item.file.size
            return <article key={item.key} className={styles.mediaItem}>
              <Image unoptimized src={src} width={180} height={240} alt={`หน้า ${index + 1}`} />
              <footer><span>หน้า {index + 1}<small style={{ display: 'block' }}>{formatBytes(size)} · {item.source === 'existing' ? 'ไฟล์เดิม' : 'ไฟล์ใหม่'}</small></span><span><button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`เลื่อนหน้า ${index + 1} ขึ้น`}><ArrowUp size={13} /></button><button type="button" disabled={index === mediaItems.length - 1} onClick={() => move(index, 1)} aria-label={`เลื่อนหน้า ${index + 1} ลง`}><ArrowDown size={13} /></button><button type="button" onClick={() => removeItem(item.key)} aria-label={`ลบหน้า ${index + 1}`}><X size={13} /></button></span></footer>
            </article>
          })}</div>}
        </section>}
        {mediaType === 'audio' && <section className={styles.card}>
          <h2>ไฟล์เสียง</h2>
          {existingAudio?.source === 'existing' && <div className={styles.note}><b>ไฟล์ปัจจุบัน · {formatBytes(existingAudio.asset.sizeBytes)}</b><audio controls preload="metadata" src={existingAssetUrl(existingAudio.asset.id)} style={{ width: '100%', marginTop: 10 }} /></div>}
          {replacementAudio?.source === 'new' && <div className={styles.note}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><b>{isEditing ? 'ไฟล์ใหม่ที่จะใช้แทน' : 'ไฟล์เสียงที่เลือก'} · {formatBytes(replacementAudio.file.size)}</b><button type="button" onClick={() => removeItem(replacementAudio.key)} aria-label="ยกเลิกไฟล์เสียงใหม่"><X size={15} /></button></div><audio controls preload="metadata" src={replacementAudio.url} style={{ width: '100%', marginTop: 10 }} /></div>}
          <button type="button" className={styles.upload} style={{ marginTop: 12 }} onClick={() => fileRef.current?.click()}><Upload size={28} /><b>{existingAudio || replacementAudio ? 'เปลี่ยนไฟล์เสียง' : 'เลือกไฟล์เสียง'}</b><span>ไฟล์ audio · ไม่เกิน 100 MB</span></button>
          <input hidden ref={fileRef} type="file" accept="audio/*,.mp3,.m4a,.wav,.mp4" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = '' }} />
        </section>}
      </div>
      <aside className={styles.sideStack}>
        <section className={styles.card}><h2>การเผยแพร่</h2><div style={{ display: 'grid', gap: 8, marginTop: 12 }}>{([['draft', 'บันทึกฉบับร่าง', 'ยังไม่แสดงต่อนักอ่าน'], ['published', 'เผยแพร่ตอนนี้', 'แสดงทันทีหลังบันทึก'], ['scheduled', 'ตั้งเวลา', 'เลือกวันและเวลาเผยแพร่'], ...(isEditing ? [['hidden', 'ซ่อนตอน', 'หยุดแสดงตอนชั่วคราว']] : [])] as Array<[PublishStatus, string, string]>).map(([value, label, description]) => <label className={styles.choice} key={value}><input type="radio" name="status" value={value} checked={status === value} disabled={value !== 'draft' && value !== 'hidden' && !work.capabilities.canPublishEpisode} onChange={() => setStatus(value)} /><span><b>{label}</b><small>{description}</small></span></label>)}</div>{status === 'scheduled' && <label className={styles.field} style={{ marginTop: 12 }}><span>วันและเวลาเผยแพร่</span><input required type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} /></label>}</section>
        <section className={styles.card}><h2>ราคาตอน</h2><div className={styles.segments} style={{ marginTop: 12 }}><button type="button" onClick={() => setPaid(false)} className={`${styles.segment} ${!paid ? styles.segmentActive : ''}`}><b>ฟรี</b><span>อ่านได้ทุกคน</span></button><button type="button" onClick={() => setPaid(true)} className={`${styles.segment} ${paid ? styles.segmentActive : ''}`}><b>มีค่าใช้จ่าย</b><span>3–15 เหรียญ</span></button></div>{paid && <label className={styles.field} style={{ marginTop: 12 }}><span>จำนวนเหรียญ</span><input type="number" min={3} max={15} value={price} onChange={(event) => setPrice(Math.min(15, Math.max(3, Number(event.target.value))))} /></label>}</section>
        {error && <div className={styles.alert} role="alert">{error}{createdId && !isEditing && <div style={{ marginTop: 4 }}>สร้างฉบับร่างแล้ว กดบันทึกอีกครั้งเพื่อทำต่อโดยไม่สร้างตอนซ้ำ</div>}</div>}
        <div className={styles.actions} style={{ position: 'static', marginTop: 0 }}><Link href={`/creator/works/${work.id}`} className={styles.secondary}>ยกเลิก</Link><button disabled={busy} className={styles.primary}>{busy ? <LoaderCircle className={styles.spin} size={15} /> : <Save size={15} />}{busy ? 'กำลังบันทึก…' : isEditing ? 'บันทึกตอน' : status === 'published' ? 'เผยแพร่ตอน' : 'บันทึกตอน'}</button></div>
      </aside>
    </form>
  </CreatorStudioShell>
}
