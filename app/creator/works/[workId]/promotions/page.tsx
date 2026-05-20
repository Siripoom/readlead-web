'use client'

import { use, useState } from 'react'
import RouteGuard from '@/components/layout/RouteGuard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ChevronLeft, Plus, Tag, Trash2, Clock } from 'lucide-react'
import { MOCK_EPISODES } from '@/lib/mock-data'
import type { Promotion, PromotionScope, DiscountType } from '@/lib/types'

interface Props { params: Promise<{ workId: string }> }

export default function PromotionsPage({ params }: Props) {
  const { workId } = use(params)
  const episodes = MOCK_EPISODES[workId] ?? []

  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [showForm, setShowForm] = useState(false)

  const [scope, setScope] = useState<PromotionScope>('work')
  const [episodeId, setEpisodeId] = useState('')
  const [label, setLabel] = useState('')
  const [discountType, setDiscountType] = useState<DiscountType>('free')
  const [discountValue, setDiscountValue] = useState('20')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  function resetForm() {
    setScope('work'); setEpisodeId(''); setLabel('')
    setDiscountType('free'); setDiscountValue('20')
    setStartDate(''); setEndDate('')
  }

  function handleAdd() {
    if (!startDate || !endDate) return
    if (scope === 'episode' && !episodeId) return
    setPromotions(prev => [...prev, {
      id: crypto.randomUUID(),
      workId,
      episodeId: scope === 'episode' ? episodeId : undefined,
      label: label || (discountType === 'free' ? 'ฟรีช่วงโปรโมชั่น' : `ลด ${discountValue}%`),
      scope,
      discountType,
      discountValue: discountType === 'percent' ? Number(discountValue) : undefined,
      startDate,
      endDate,
    }])
    resetForm()
    setShowForm(false)
  }

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
  }

  function isActive(p: Promotion) {
    const now = new Date()
    return new Date(p.startDate) <= now && now <= new Date(p.endDate)
  }

  return (
    <RouteGuard allowedRoles={['creator', 'admin']}>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href={`/creator/works/${workId}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4" />กลับ
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">โปรโมชั่น</h1>
            <p className="text-sm text-muted-foreground mt-0.5">กำหนดส่วนลดรายเรื่องหรือรายตอน พร้อมช่วงเวลา</p>
          </div>
          <Button onClick={() => setShowForm(v => !v)} className="bg-primary text-primary-foreground" size="sm">
            <Plus className="h-4 w-4 mr-1" />เพิ่มโปรโมชั่น
          </Button>
        </div>

        {showForm && (
          <div className="border rounded-lg p-4 space-y-4 mb-6 bg-muted/20">
            <p className="text-sm font-medium">โปรโมชั่นใหม่</p>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">ขอบเขต</label>
              <div className="flex rounded-md border overflow-hidden w-fit">
                {(['work', 'episode'] as PromotionScope[]).map(s => (
                  <button key={s} type="button" onClick={() => setScope(s)}
                    className={`px-4 py-1.5 text-sm transition-colors ${scope === s ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}>
                    {s === 'work' ? 'รายเรื่อง' : 'รายตอน'}
                  </button>
                ))}
              </div>
            </div>

            {scope === 'episode' && (
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">เลือกตอน *</label>
                <select value={episodeId} onChange={e => setEpisodeId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">-- เลือกตอน --</option>
                  {episodes.map(ep => (
                    <option key={ep.id} value={ep.id}>ตอนที่ {ep.episodeNum}: {ep.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">ประเภทส่วนลด</label>
              <div className="flex rounded-md border overflow-hidden w-fit">
                {(['free', 'percent'] as DiscountType[]).map(t => (
                  <button key={t} type="button" onClick={() => setDiscountType(t)}
                    className={`px-4 py-1.5 text-sm transition-colors ${discountType === t ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}>
                    {t === 'free' ? 'ฟรี 100%' : 'ลด %'}
                  </button>
                ))}
              </div>
            </div>

            {discountType === 'percent' && (
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">ส่วนลด (%)</label>
                <div className="flex items-center gap-2 w-32">
                  <Input type="number" min="1" max="99" value={discountValue} onChange={e => setDiscountValue(e.target.value)} />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">วันที่เริ่ม *</label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">วันที่สิ้นสุด *</label>
                <Input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">ชื่อโปรโมชั่น (ไม่บังคับ)</label>
              <Input placeholder="เช่น ฉลองยอดวิว 1 ล้าน" value={label} onChange={e => setLabel(e.target.value)} />
            </div>

            <div className="flex gap-2 pt-1">
              <Button onClick={handleAdd} className="bg-primary text-primary-foreground flex-1">บันทึก</Button>
              <Button variant="outline" onClick={() => { resetForm(); setShowForm(false) }}>ยกเลิก</Button>
            </div>
          </div>
        )}

        {promotions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm border rounded-lg">
            <Tag className="h-8 w-8 mx-auto mb-2 opacity-30" />
            ยังไม่มีโปรโมชั่น
          </div>
        ) : (
          <div className="space-y-3">
            {promotions.map(p => {
              const active = isActive(p)
              const epTitle = p.episodeId ? episodes.find(e => e.id === p.episodeId)?.title : null
              return (
                <div key={p.id} className="border rounded-lg px-4 py-3 flex items-start gap-3">
                  <Tag className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{p.label}</span>
                      <Badge className={`text-xs border-0 ${active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                        {active ? 'กำลังใช้งาน' : 'ไม่ได้ใช้งาน'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {p.scope === 'work' ? 'รายเรื่อง' : 'รายตอน'}
                      </Badge>
                    </div>
                    {epTitle && <p className="text-xs text-muted-foreground mt-0.5">ตอน: {epTitle}</p>}
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {fmtDate(p.startDate)} – {fmtDate(p.endDate)}
                      <span className="ml-1 font-medium text-foreground">
                        {p.discountType === 'free' ? '• ฟรี 100%' : `• ลด ${p.discountValue}%`}
                      </span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setPromotions(prev => prev.filter(x => x.id !== p.id))}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </RouteGuard>
  )
}
