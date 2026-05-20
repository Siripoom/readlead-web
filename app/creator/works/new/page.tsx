import Link from 'next/link'
import RouteGuard from '@/components/layout/RouteGuard'
import { BookOpen, Image as ImageIcon, Headphones, ChevronRight } from 'lucide-react'

const TYPES = [
  { id: 'novel', label: 'นิยาย', desc: 'เรื่องราวข้อความ บทและตอน', icon: BookOpen },
  { id: 'manga', label: 'มังงะ', desc: 'การ์ตูนและคอมิก', icon: ImageIcon },
  { id: 'audiobook', label: 'หนังสือเสียง', desc: 'เนื้อหาเสียงและพอดแคสต์', icon: Headphones },
]

export default function NewWorkTypePage() {
  return (
    <RouteGuard allowedRoles={['creator', 'admin']}>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">เพิ่มผลงานใหม่</h1>
        <p className="text-sm text-muted-foreground mb-8">เลือกประเภทผลงานที่ต้องการสร้าง</p>

        <div className="grid gap-4">
          {TYPES.map(t => (
            <Link
              key={t.id}
              href={`/creator/works/new/${t.id}`}
              className="flex items-center gap-4 p-6 rounded-xl border-2 hover:border-primary hover:bg-accent/10 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <t.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">{t.label}</p>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </main>
    </RouteGuard>
  )
}
