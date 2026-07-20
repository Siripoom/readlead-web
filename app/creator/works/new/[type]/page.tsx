'use client'

import Image from 'next/image'
import Link from 'next/link'
import { notFound, useParams, useRouter } from 'next/navigation'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { BookOpen, ChevronLeft, FileImage, Headphones, ImageIcon, LoaderCircle, Upload, X } from 'lucide-react'
import RouteGuard from '@/components/layout/RouteGuard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ALL_GENRES, GENRE_LABELS } from '@/lib/mock-data'
import type { CreatorWorkType } from '@/lib/creator-studio-types'

const labels: Record<CreatorWorkType, string> = { novel: 'นิยาย', manga: 'เว็บตูน', audiobook: 'หนังสือเสียง' }
const icons = { novel: BookOpen, manga: ImageIcon, audiobook: Headphones }

async function errorText(response: Response) {
  const data = await response.json().catch(() => ({})) as { error?: string }
  return data.error || 'สร้างผลงานไม่สำเร็จ'
}

export default function NewWorkFormPage() {
  const { type: rawType } = useParams<{ type: string }>()
  if (!['novel', 'manga', 'audiobook'].includes(rawType)) notFound()
  const type = rawType as CreatorWorkType
  const Icon = icons[type]
  const router = useRouter()
  const coverRef = useRef<HTMLInputElement>(null)
  const [origin, setOrigin] = useState<'original' | 'translated'>('original')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [rating, setRating] = useState('general')
  const [creationMethod, setCreationMethod] = useState('self_written')
  const [tagline, setTagline] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [tags, setTags] = useState('')
  const [seriesStatus, setSeriesStatus] = useState('ongoing')
  const [originalTitle, setOriginalTitle] = useState('')
  const [originalAuthor, setOriginalAuthor] = useState('')
  const [translatorName, setTranslatorName] = useState('')
  const [originalLanguage, setOriginalLanguage] = useState('')
  const [cover, setCover] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [draftId, setDraftId] = useState<string | null>(null)
  const [coverUploaded, setCoverUploaded] = useState(false)

  useEffect(() => () => { if (coverPreview) URL.revokeObjectURL(coverPreview) }, [coverPreview])

  function chooseCover(file?: File) {
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setError('')
    if (!file) { setCover(null); setCoverPreview(''); setCoverUploaded(false); return }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setError('ปกรองรับ JPEG, PNG หรือ WebP ขนาดไม่เกิน 5 MB'); setCover(null); setCoverPreview(''); return }
    setCover(file); setCoverPreview(URL.createObjectURL(file)); setCoverUploaded(false)
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const payload = {
        type, origin, title, category, rating, creationMethod, tagline, synopsis,
        tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean), seriesStatus,
        ...(origin === 'translated' ? { originalTitle, originalAuthor, translatorName, originalLanguage } : {}),
      }
      let workId = draftId
      if (!workId) {
        const response = await fetch('/api/creator/works', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!response.ok) throw new Error(await errorText(response))
        const data = await response.json() as { work: { id: string } }
        workId = data.work.id
        setDraftId(workId)
      } else {
        const update = await fetch(`/api/creator/works/${workId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!update.ok) throw new Error(await errorText(update))
      }
      if (cover && !coverUploaded) {
        const form = new FormData(); form.set('file', cover)
        const upload = await fetch(`/api/creator/works/${workId}/cover`, { method: 'POST', body: form })
        if (!upload.ok) throw new Error(`บันทึกฉบับร่างแล้ว แต่อัปโหลดปกไม่สำเร็จ: ${await errorText(upload)}`)
        setCoverUploaded(true)
      }
      const submitReview = await fetch(`/api/creator/works/${workId}/submit-review`, { method: 'POST' })
      if (!submitReview.ok) throw new Error(`บันทึกฉบับร่างแล้ว แต่${await errorText(submitReview)}`)
      router.push(`/creator/works/${workId}`)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'สร้างผลงานไม่สำเร็จ') }
    finally { setBusy(false) }
  }

  return (
    <RouteGuard allowedRoles={['creator', 'admin']}>
      <main className="container mx-auto max-w-5xl px-4 py-7">
        <Link href="/creator/works/new" className="mb-5 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ChevronLeft className="size-4" />เลือกประเภทผลงาน</Link>
        <div className="mb-7 flex items-center gap-4"><div className="rounded-2xl bg-primary/10 p-4 text-primary"><Icon className="size-8" /></div><div><h1 className="text-2xl font-bold">สร้าง{labels[type]}ใหม่</h1><p className="text-sm text-muted-foreground">ระบบจะบันทึกฉบับร่างและส่งให้ผู้ดูแลตรวจสอบก่อนเปิดเผยแพร่ตอน</p></div></div>

        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-3">
            <h2 className="font-semibold">ภาพปก</h2>
            <button type="button" onClick={() => coverRef.current?.click()} className="relative flex aspect-[3/4] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-muted/20 text-center text-muted-foreground hover:border-primary hover:text-primary">
              {coverPreview ? <Image src={coverPreview} alt="ตัวอย่างปก" fill unoptimized className="object-cover" /> : <><FileImage className="mb-3 size-10" /><b className="text-sm">อัปโหลดภาพปก</b><span className="mt-1 px-5 text-xs">JPEG, PNG, WebP ไม่เกิน 5 MB</span></>}
            </button>
            <input ref={coverRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseCover(event.target.files?.[0])} />
            {cover && <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs"><span className="truncate">{cover.name}</span><button type="button" onClick={() => chooseCover()} aria-label="ลบภาพปก"><X className="size-4" /></button></div>}
            <div className="rounded-xl border bg-muted/30 p-4 text-xs leading-6 text-muted-foreground"><b className="block text-foreground">คำแนะนำภาพปก</b>อัตราส่วน 3:4 ความละเอียดอย่างน้อย 900 × 1,200 พิกเซล และไม่มีข้อมูลติดต่อภายนอก</div>
          </aside>

          <div className="space-y-6">
            <section className="space-y-4 rounded-2xl border bg-card p-5 sm:p-6"><div><span className="text-xs font-semibold text-primary">ขั้นตอนที่ 1</span><h2 className="text-lg font-semibold">ประเภทลิขสิทธิ์</h2></div><div className="grid gap-3 sm:grid-cols-2">{([['original', 'ผลงานต้นฉบับ', 'ฉันเป็นเจ้าของลิขสิทธิ์และส่งเรื่องนี้ให้ตรวจได้'], ['translated', 'ผลงานแปล', 'มีสิทธิ์แปลและมีข้อมูลต้นฉบับครบถ้วน']] as const).map(([value, label, description]) => <button type="button" key={value} disabled={Boolean(draftId)} onClick={() => setOrigin(value)} className={`rounded-xl border p-4 text-left disabled:cursor-not-allowed disabled:opacity-60 ${origin === value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/40'}`}><b>{label}</b><span className="mt-1 block text-xs text-muted-foreground">{description}</span></button>)}</div></section>

            <section className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6"><div><span className="text-xs font-semibold text-primary">ขั้นตอนที่ 2</span><h2 className="text-lg font-semibold">ข้อมูลผลงาน</h2></div><label className="block space-y-2"><span className="text-sm font-medium">ชื่อเรื่อง *</span><Input required maxLength={200} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={`ชื่อ${labels[type]}ของคุณ`} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><span className="text-sm font-medium">หมวดหมู่หลัก *</span><select required value={category} onChange={(event) => setCategory(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="">เลือกหมวดหมู่</option>{ALL_GENRES.map((genre) => <option value={genre} key={genre}>{GENRE_LABELS[genre]}</option>)}</select></label><label className="space-y-2"><span className="text-sm font-medium">เรตเนื้อหา</span><select value={rating} onChange={(event) => setRating(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="general">ทั่วไป</option><option value="13+">13+</option><option value="18+">18+</option></select></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><span className="text-sm font-medium">วิธีสร้างผลงาน</span><select value={creationMethod} onChange={(event) => setCreationMethod(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="self_written">เขียน/สร้างด้วยตนเอง</option><option value="collaboration">สร้างร่วมกับผู้อื่น</option></select></label><label className="space-y-2"><span className="text-sm font-medium">สถานะเรื่อง</span><select value={seriesStatus} onChange={(event) => setSeriesStatus(event.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="ongoing">กำลังดำเนินเรื่อง</option><option value="completed">จบแล้ว</option><option value="hiatus">พักการอัปเดต</option></select></label></div><label className="block space-y-2"><span className="text-sm font-medium">คำโปรย</span><Input maxLength={200} value={tagline} onChange={(event) => setTagline(event.target.value)} placeholder="ประโยคสั้น ๆ ที่ทำให้นักอ่านสนใจ" /><small className="block text-right text-muted-foreground">{tagline.length}/200</small></label><label className="block space-y-2"><span className="text-sm font-medium">เรื่องย่อ</span><textarea value={synopsis} onChange={(event) => setSynopsis(event.target.value)} className="min-h-36 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="อธิบายเรื่องราว ตัวละคร และจุดเด่นของผลงาน" /></label><label className="block space-y-2"><span className="text-sm font-medium">แท็ก</span><Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="แฟนตาซี, โรแมนติก, ต่างโลก (ไม่เกิน 10 แท็ก)" /></label></section>

            {origin === 'translated' && <section className="space-y-5 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 sm:p-6"><div><span className="text-xs font-semibold text-amber-700">ขั้นตอนที่ 3</span><h2 className="text-lg font-semibold">ข้อมูลผลงานต้นฉบับและผู้แปล</h2></div><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><span className="text-sm font-medium">ชื่อต้นฉบับ *</span><Input required value={originalTitle} onChange={(event) => setOriginalTitle(event.target.value)} /></label><label className="space-y-2"><span className="text-sm font-medium">ภาษาต้นฉบับ *</span><Input required value={originalLanguage} onChange={(event) => setOriginalLanguage(event.target.value)} placeholder="เช่น จีน, อังกฤษ" /></label><label className="space-y-2"><span className="text-sm font-medium">ชื่อผู้แต่ง *</span><Input required value={originalAuthor} onChange={(event) => setOriginalAuthor(event.target.value)} /></label><label className="space-y-2"><span className="text-sm font-medium">ชื่อผู้แปล *</span><Input required value={translatorName} onChange={(event) => setTranslatorName(event.target.value)} /></label></div><p className="text-xs leading-5 text-amber-800">เมื่อส่งแล้วผลงานจะอยู่ในสถานะ “รอตรวจสอบ” ผู้ดูแลอาจขอหลักฐานสิทธิ์แปลเพิ่มเติมก่อนอนุมัติ</p></section>}

            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            {draftId && error && <p className="text-xs text-muted-foreground">ฉบับร่างถูกบันทึกแล้ว คุณสามารถลองส่งตรวจอีกครั้งได้โดยไม่สร้างเรื่องซ้ำ</p>}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href="/creator"><Button type="button" variant="outline" className="w-full sm:w-auto">กลับแดชบอร์ด</Button></Link><Button disabled={busy} className="sm:min-w-48">{busy ? <><LoaderCircle className="size-4 animate-spin" />กำลังบันทึก…</> : <><Upload className="size-4" />{draftId ? 'ลองส่งตรวจอีกครั้ง' : 'บันทึกและส่งตรวจสอบ'}</>}</Button></div>
          </div>
        </form>
      </main>
    </RouteGuard>
  )
}
