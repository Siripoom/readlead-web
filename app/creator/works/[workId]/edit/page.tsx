import { notFound } from 'next/navigation'
import RouteGuard from '@/components/layout/RouteGuard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MOCK_WORKS, ALL_GENRES, GENRE_LABELS } from '@/lib/mock-data'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface Props {
  params: Promise<{ workId: string }>
}

export default async function EditWorkPage({ params }: Props) {
  const { workId } = await params
  const work = MOCK_WORKS.find(w => w.id === workId)
  if (!work) notFound()

  return (
    <RouteGuard allowedRoles={['creator', 'admin']}>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href={`/creator/works/${workId}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4" />
          กลับไปหน้าผลงาน
        </Link>

        <h1 className="text-2xl font-bold mb-8">แก้ไขผลงาน</h1>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">ชื่อเรื่อง</label>
            <Input defaultValue={work.title} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">เรื่องย่อ</label>
            <textarea
              className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={work.synopsis}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">หมวดหมู่หลัก</label>
            <Select defaultValue={work.genres[0]}>
              <SelectTrigger>
                <SelectValue />
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
            <Input defaultValue={work.tags.join(', ')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">สถานะ</label>
            <Select defaultValue={work.status}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ongoing">กำลังดำเนิน</SelectItem>
                <SelectItem value="completed">จบแล้ว</SelectItem>
                <SelectItem value="hiatus">หยุดพัก</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Link href={`/creator/works/${workId}`} className="flex-1">
              <Button variant="outline" className="w-full">ยกเลิก</Button>
            </Link>
            <Link href={`/creator/works/${workId}`} className="flex-1">
              <Button className="w-full bg-primary text-primary-foreground">บันทึกการเปลี่ยนแปลง</Button>
            </Link>
          </div>
        </form>
      </main>
    </RouteGuard>
  )
}
