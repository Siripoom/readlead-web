'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import RouteGuard from '@/components/layout/RouteGuard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ALL_GENRES, GENRE_LABELS } from '@/lib/mock-data'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = { novel: 'นิยาย', manga: 'มังงะ', audiobook: 'หนังสือเสียง' }

interface Props {
  params: Promise<{ type: string }>
}

export default function NewWorkFormPage({ params }: Props) {
  const { type } = use(params)
  if (!['novel', 'manga', 'audiobook'].includes(type)) notFound()

  const [titleTh, setTitleTh] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [titleZh, setTitleZh] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [genre, setGenre] = useState('')
  const [tags, setTags] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <RouteGuard allowedRoles={['creator', 'admin']}>
        <main className="container mx-auto px-4 py-8 max-w-2xl flex flex-col items-center text-center gap-6">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <div>
            <h1 className="text-2xl font-bold mb-2">ส่งผลงานเรียบร้อย!</h1>
            <p className="text-muted-foreground">
              ผลงานของคุณถูกส่งให้แอดมินตรวจสอบแล้ว
              <br />ทีมงานจะตรวจสอบภายใน 1-3 วันทำการ
            </p>
          </div>
          <div className="w-full max-w-xs rounded-lg border bg-muted/30 p-4 text-left space-y-1 text-sm">
            <p><span className="text-muted-foreground">ชื่อ (ไทย):</span> {titleTh}</p>
            {titleEn && <p><span className="text-muted-foreground">ชื่อ (EN):</span> {titleEn}</p>}
            {titleZh && <p><span className="text-muted-foreground">ชื่อ (中文):</span> {titleZh}</p>}
            <p><span className="text-muted-foreground">ประเภท:</span> {TYPE_LABELS[type]}</p>
            <p><span className="text-muted-foreground">สถานะ:</span> <span className="text-amber-600 font-medium">รอตรวจสอบ</span></p>
          </div>
          <Link href="/creator">
            <Button className="bg-primary text-primary-foreground">กลับหน้า Creator Studio</Button>
          </Link>
        </main>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard allowedRoles={['creator', 'admin']}>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/creator/works/new" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4" />
          เลือกประเภทอีกครั้ง
        </Link>

        <h1 className="text-2xl font-bold mb-2">สร้าง{TYPE_LABELS[type]}ใหม่</h1>
        <p className="text-sm text-muted-foreground mb-8">กรอกข้อมูลผลงานของคุณ แล้วส่งให้แอดมินตรวจสอบ</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">ชื่อเรื่อง (ภาษาไทย) *</label>
            <Input
              placeholder="ใส่ชื่อเรื่องภาษาไทย"
              value={titleTh}
              onChange={e => setTitleTh(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">ชื่อเรื่อง (ภาษาอังกฤษ)</label>
            <Input
              placeholder="Enter English title"
              value={titleEn}
              onChange={e => setTitleEn(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">ชื่อเรื่อง (ภาษาจีน)</label>
            <Input
              placeholder="输入中文标题"
              value={titleZh}
              onChange={e => setTitleZh(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">เรื่องย่อ *</label>
            <textarea
              className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              placeholder="เรื่องย่อของผลงาน"
              value={synopsis}
              onChange={e => setSynopsis(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">หมวดหมู่หลัก *</label>
            <Select value={genre} onValueChange={value => value && setGenre(value)} required>
              <SelectTrigger>
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                {ALL_GENRES.map(g => (
                  <SelectItem key={g} value={g}>{GENRE_LABELS[g]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">แท็ก</label>
            <Input
              placeholder="เช่น ชีวิตราชสำนัก, ข้ามมิติ (คั่นด้วยจุลภาค)"
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">URL ปกหนังสือ</label>
            <Input
              placeholder="https://..."
              value={coverUrl}
              onChange={e => setCoverUrl(e.target.value)}
            />
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            หลังจากส่งผลงาน ทีมแอดมินจะตรวจสอบและอนุมัติก่อนที่จะเผยแพร่สู่สาธารณะ
          </div>

          <div className="flex gap-3">
            <Link href="/creator" className="flex-1">
              <Button type="button" variant="outline" className="w-full">ยกเลิก</Button>
            </Link>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground">
              ส่งให้แอดมินตรวจสอบ
            </Button>
          </div>
        </form>
      </main>
    </RouteGuard>
  )
}
