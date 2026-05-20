'use client'

import { useState, use, useRef, useEffect } from 'react'
import RouteGuard from '@/components/layout/RouteGuard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  ChevronLeft, Upload, X, ImageIcon, Music, FileText,
  Plus, GripVertical, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { EpisodeType } from '@/lib/types'

interface Props {
  params: Promise<{ workId: string }>
}

// text / audio: each file → 1 episode
const ADMIN_PRICE = 5 // coins per episode, set by admin

interface EpisodeDraft {
  id: string
  title: string
  isFree: boolean
  fileName: string
  fileSize: number
  previewUrl?: string
  content?: string
  status: 'ready' | 'pending'
}

// image: multiple files → pages of 1 episode
interface ImagePage {
  id: string
  url: string
  name: string
  fileSize: number
}

function FreePaidToggle({ isFree, onChange, small }: { isFree: boolean; onChange: (v: boolean) => void; small?: boolean }) {
  const h = small ? 'h-7 text-xs px-2.5' : 'h-9 text-sm px-3'
  return (
    <div className="flex items-center rounded-md border overflow-hidden shrink-0">
      <button type="button" onClick={() => onChange(true)}
        className={`${h} font-medium transition-colors ${isFree ? 'bg-green-500 text-white' : 'bg-background text-muted-foreground hover:bg-muted'}`}>
        ฟรี
      </button>
      <button type="button" onClick={() => onChange(false)}
        className={`${h} font-medium transition-colors border-l ${!isFree ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}>
        {small ? `${ADMIN_PRICE}🪙` : `มีค่าใช้จ่าย (${ADMIN_PRICE} เหรียญ/ตอน)`}
      </button>
    </div>
  )
}

export default function NewEpisodePage({ params }: Props) {
  const { workId } = use(params)
  const router = useRouter()
  const [episodeType, setEpisodeType] = useState<EpisodeType>('text')

  // ── text / audio state ──────────────────────────────────────────
  const [drafts, setDrafts] = useState<EpisodeDraft[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  // ── image state ─────────────────────────────────────────────────
  const [imgTitle, setImgTitle] = useState('')
  const [imgIsFree, setImgIsFree] = useState(false)
  const [pages, setPages] = useState<ImagePage[]>([])
  const [pageDragId, setPageDragId] = useState<string | null>(null)
  const [pageOverId, setPageOverId] = useState<string | null>(null)

  const textFileRef  = useRef<HTMLInputElement>(null)
  const imageFileRef = useRef<HTMLInputElement>(null)
  const audioFileRef = useRef<HTMLInputElement>(null)
  const previewUrlsRef = useRef<string[]>([])

  useEffect(() => {
    return () => { previewUrlsRef.current.forEach(u => URL.revokeObjectURL(u)) }
  }, [])

  // ── helpers ──────────────────────────────────────────────────────
  const stripExt = (name: string) => name.replace(/\.[^/.]+$/, '')
  const fmt = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  // ── text / audio file add ────────────────────────────────────────
  function addTextFiles(files: FileList) {
    Array.from(files).forEach(file => {
      const id = crypto.randomUUID()
      const isPending = file.name.endsWith('.docx')
      setDrafts(prev => [...prev, { id, title: stripExt(file.name), isFree: false, fileName: file.name, fileSize: file.size, status: isPending ? 'pending' : 'ready' }])
      if (!isPending) {
        const reader = new FileReader()
        reader.onload = e => setDrafts(prev => prev.map(d => d.id === id ? { ...d, content: e.target?.result as string } : d))
        reader.readAsText(file, 'UTF-8')
      }
    })
  }

  function addAudioFiles(files: FileList) {
    const newDrafts: EpisodeDraft[] = Array.from(files).map(file => {
      const url = URL.createObjectURL(file)
      previewUrlsRef.current.push(url)
      return { id: crypto.randomUUID(), title: stripExt(file.name), isFree: false, fileName: file.name, fileSize: file.size, previewUrl: url, status: 'ready' as const }
    })
    setDrafts(prev => [...prev, ...newDrafts])
  }

  function removeDraft(id: string) {
    setDrafts(prev => {
      const t = prev.find(d => d.id === id)
      if (t?.previewUrl) { URL.revokeObjectURL(t.previewUrl); previewUrlsRef.current = previewUrlsRef.current.filter(u => u !== t.previewUrl) }
      return prev.filter(d => d.id !== id)
    })
    if (expandedId === id) setExpandedId(null)
  }

  function updateDraft(id: string, patch: Partial<EpisodeDraft>) {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d))
  }

  // ── image page add / remove ───────────────────────────────────────
  function addImagePages(files: FileList) {
    const newPages: ImagePage[] = Array.from(files).map(file => {
      const url = URL.createObjectURL(file)
      previewUrlsRef.current.push(url)
      return { id: crypto.randomUUID(), url, name: file.name, fileSize: file.size }
    })
    setPages(prev => [...prev, ...newPages])
  }

  function removePage(id: string) {
    setPages(prev => {
      const t = prev.find(p => p.id === id)
      if (t) { URL.revokeObjectURL(t.url); previewUrlsRef.current = previewUrlsRef.current.filter(u => u !== t.url) }
      return prev.filter(p => p.id !== id)
    })
  }

  // ── drag for episode drafts ──────────────────────────────────────
  function draftDragStart(id: string) { setDragId(id) }
  function draftDragOver(e: React.DragEvent, id: string) { e.preventDefault(); if (id !== dragId) setOverId(id) }
  function draftDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); return }
    setDrafts(prev => {
      const from = prev.findIndex(d => d.id === dragId)
      const to   = prev.findIndex(d => d.id === targetId)
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
    setDragId(null); setOverId(null)
  }

  // ── drag for image pages ─────────────────────────────────────────
  function pageDragStart(id: string) { setPageDragId(id) }
  function pageDragOver(e: React.DragEvent, id: string) { e.preventDefault(); if (id !== pageDragId) setPageOverId(id) }
  function pageDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    if (!pageDragId || pageDragId === targetId) { setPageDragId(null); setPageOverId(null); return }
    setPages(prev => {
      const from = prev.findIndex(p => p.id === pageDragId)
      const to   = prev.findIndex(p => p.id === targetId)
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
    setPageDragId(null); setPageOverId(null)
  }

  // ── misc ─────────────────────────────────────────────────────────
  function switchType(t: EpisodeType) {
    if (t === episodeType) return
    previewUrlsRef.current.forEach(u => URL.revokeObjectURL(u))
    previewUrlsRef.current = []
    setDrafts([]); setExpandedId(null); setDragId(null); setOverId(null)
    setPages([]); setImgTitle(''); setImgIsFree(false); setPageDragId(null); setPageOverId(null)
    setEpisodeType(t)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    if (episodeType === 'text')  addTextFiles(e.target.files)
    if (episodeType === 'image') addImagePages(e.target.files)
    if (episodeType === 'audio') addAudioFiles(e.target.files)
    e.target.value = ''
  }

  function handlePublish() { router.push(`/creator/works/${workId}`) }

  const canPublish = episodeType === 'image' ? pages.length > 0 : drafts.length > 0
  const currentRef = episodeType === 'text' ? textFileRef : episodeType === 'image' ? imageFileRef : audioFileRef

  const typeButtons: { key: EpisodeType; label: string; icon: React.ElementType; accept: string }[] = [
    { key: 'text',  label: 'เนื้อหาบรรยาย', icon: FileText,  accept: '.txt,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { key: 'image', label: 'ภาพ',            icon: ImageIcon, accept: 'image/*' },
    { key: 'audio', label: 'เสียง',           icon: Music,     accept: 'audio/*,.mp3,.mp4,.wav,.m4a' },
  ]

  return (
    <RouteGuard allowedRoles={['creator', 'admin']}>
      <div className="min-h-screen flex flex-col">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
          <Link href={`/creator/works/${workId}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">กลับ</span>
          </Link>
          <div className="flex-1 text-sm font-medium">
            เพิ่มตอนใหม่
            {episodeType !== 'image' && drafts.length > 0 && (
              <span className="ml-2 text-muted-foreground font-normal">({drafts.length} ตอน)</span>
            )}
          </div>
          <Button onClick={handlePublish} disabled={!canPublish}
            className="bg-primary text-primary-foreground disabled:opacity-40" size="sm"
          >
            {episodeType === 'image'
              ? 'เผยแพร่ตอนนี้'
              : drafts.length > 0 ? `เผยแพร่ ${drafts.length} ตอน` : 'เผยแพร่'}
          </Button>
        </div>

        {/* Type selector */}
        <div className="border-b px-4 py-2 flex items-center gap-2 bg-muted/10">
          <span className="text-xs text-muted-foreground mr-1 hidden sm:block">ประเภทตอน:</span>
          {typeButtons.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => switchType(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                episodeType === key ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 container mx-auto px-4 py-6 max-w-3xl space-y-4">

          {/* ══ IMAGE MODE — single episode, multi-page ══════════════ */}
          {episodeType === 'image' && (
            <div className="space-y-4">
              {/* Episode meta */}
              <div className="flex items-center gap-3">
                <Input placeholder="ชื่อตอน" value={imgTitle} onChange={e => setImgTitle(e.target.value)} className="flex-1" />
                <FreePaidToggle isFree={imgIsFree} onChange={setImgIsFree} />
              </div>

              {/* Upload zone */}
              <button type="button" onClick={() => imageFileRef.current?.click()}
                className="w-full flex flex-col items-center gap-2 py-6 border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-colors text-muted-foreground hover:text-foreground"
              >
                <Upload className="h-6 w-6" />
                <span className="text-sm font-medium">อัพโหลดหน้าภาพ</span>
                <span className="text-xs">รองรับ JPG, PNG, WebP — เลือกได้หลายไฟล์, ลากเพื่อเรียงลำดับ</span>
              </button>

              {/* Page grid */}
              {pages.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{pages.length} หน้า <span className="text-xs">(ลากเพื่อเรียงลำดับ)</span></p>
                    <button type="button" onClick={() => imageFileRef.current?.click()}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Plus className="h-3 w-3" />เพิ่มหน้า
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {pages.map((page, idx) => (
                      <div
                        key={page.id}
                        draggable
                        onDragStart={() => pageDragStart(page.id)}
                        onDragOver={e => pageDragOver(e, page.id)}
                        onDrop={e => pageDrop(e, page.id)}
                        onDragEnd={() => { setPageDragId(null); setPageOverId(null) }}
                        className={`relative group rounded-md overflow-hidden border aspect-3/4 bg-muted cursor-grab active:cursor-grabbing transition-all ${
                          pageDragId === page.id ? 'opacity-40' : ''
                        } ${pageOverId === page.id ? 'ring-2 ring-primary' : ''}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={page.url} alt={page.name} className="w-full h-full object-cover" />
                        {/* Page number */}
                        <span className="absolute top-1 left-1 bg-black/60 text-white text-xs rounded px-1.5 py-0.5 select-none">
                          {idx + 1}
                        </span>
                        {/* Drag handle hint */}
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="h-4 w-4 text-white drop-shadow" />
                        </div>
                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removePage(page.id)}
                          className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 bg-destructive text-destructive-foreground rounded-full p-0.5 transition-opacity"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handlePublish} disabled={!imgTitle.trim()} className="w-full bg-primary text-primary-foreground disabled:opacity-40">
                    {imgTitle.trim() ? `เผยแพร่ตอน "${imgTitle}" (${pages.length} หน้า)` : 'กรุณาใส่ชื่อตอนก่อนเผยแพร่'}
                  </Button>
                </>
              )}
            </div>
          )}

          {/* ══ TEXT / AUDIO MODE — 1 file = 1 episode ══════════════ */}
          {episodeType !== 'image' && (
            <div className="space-y-4">
              {/* Upload zone */}
              <button type="button" onClick={() => currentRef.current?.click()}
                className="w-full flex flex-col items-center gap-2 py-8 border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-colors text-muted-foreground hover:text-foreground"
              >
                <Upload className="h-7 w-7" />
                <span className="text-sm font-medium">คลิกเพื่อเลือกไฟล์ หรือลากวางที่นี่</span>
                <span className="text-xs">
                  {episodeType === 'text'  ? 'รองรับ .txt, .docx — แต่ละไฟล์คือ 1 ตอน' : 'รองรับ MP3, WAV, M4A — แต่ละไฟล์คือ 1 ตอน'}
                </span>
              </button>

              {/* Draft list */}
              {drafts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      {drafts.length} ตอนที่รอเผยแพร่
                      <span className="ml-1 text-xs font-normal">(ลากเพื่อเรียงลำดับ)</span>
                    </p>
                    <button type="button" onClick={() => currentRef.current?.click()}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Plus className="h-3 w-3" />เพิ่มไฟล์
                    </button>
                  </div>

                  {drafts.map((draft, idx) => {
                    const isExpanded = expandedId === draft.id
                    return (
                      <div
                        key={draft.id}
                        draggable
                        onDragStart={() => draftDragStart(draft.id)}
                        onDragOver={e => draftDragOver(e, draft.id)}
                        onDrop={e => draftDrop(e, draft.id)}
                        onDragEnd={() => { setDragId(null); setOverId(null) }}
                        className={`border rounded-lg overflow-hidden transition-all ${
                          dragId === draft.id ? 'opacity-40' : ''
                        } ${overId === draft.id ? 'border-primary ring-1 ring-primary' : ''}`}
                      >
                        {/* Row */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/10">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0" />
                          <span className="text-xs font-mono text-muted-foreground w-5 text-right shrink-0">{idx + 1}.</span>
                          {episodeType === 'audio' ? <Music className="h-4 w-4 text-primary shrink-0" /> : <FileText className="h-4 w-4 text-muted-foreground shrink-0" />}
                          <div className="flex-1 flex items-center gap-2 min-w-0">
                            <Input
                              placeholder="ชื่อตอน" value={draft.title}
                              onChange={e => updateDraft(draft.id, { title: e.target.value })}
                              onClick={e => e.stopPropagation()}
                              className="flex-1 h-7 text-sm"
                            />
                            <div onClick={e => e.stopPropagation()}>
                              <FreePaidToggle isFree={draft.isFree} onChange={v => updateDraft(draft.id, { isFree: v })} small />
                            </div>
                          </div>
                          {draft.status === 'pending' && (
                            <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 rounded px-1.5 py-0.5 shrink-0">
                              รอประมวลผล
                            </span>
                          )}
                          <button
                            type="button" title="จัดการเนื้อหา"
                            onClick={() => setExpandedId(isExpanded ? null : draft.id)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          <button
                            type="button" onClick={() => removeDraft(draft.id)}
                            className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="border-t px-3 py-3 bg-background space-y-2">
                            <p className="text-xs text-muted-foreground">{draft.fileName} · {fmt(draft.fileSize)}</p>
                            {episodeType === 'text' && draft.status === 'ready' && (
                              <textarea
                                className="w-full min-h-48 text-sm leading-relaxed bg-muted/20 rounded-md border border-input px-3 py-2 resize-y outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                                placeholder="เนื้อหาตอน..."
                                value={draft.content ?? ''}
                                onChange={e => updateDraft(draft.id, { content: e.target.value })}
                              />
                            )}
                            {episodeType === 'text' && draft.status === 'pending' && (
                              <p className="text-sm text-muted-foreground bg-muted/30 rounded-md px-3 py-4 text-center">
                                ไฟล์ .docx จะถูกประมวลผลโดยระบบหลังจากส่ง
                              </p>
                            )}
                            {episodeType === 'audio' && draft.previewUrl && (
                              <audio controls src={draft.previewUrl} className="w-full" />
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  <Button onClick={handlePublish} className="w-full bg-primary text-primary-foreground">
                    เผยแพร่ทั้งหมด {drafts.length} ตอน
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Hidden file inputs */}
          <input ref={textFileRef}  type="file" multiple accept={typeButtons[0].accept} className="hidden" onChange={handleFileChange} />
          <input ref={imageFileRef} type="file" multiple accept={typeButtons[1].accept} className="hidden" onChange={handleFileChange} />
          <input ref={audioFileRef} type="file" multiple accept={typeButtons[2].accept} className="hidden" onChange={handleFileChange} />

        </div>
      </div>
    </RouteGuard>
  )
}
