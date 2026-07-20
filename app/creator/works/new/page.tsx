import Link from 'next/link'
import RouteGuard from '@/components/layout/RouteGuard'
import { BookOpen, Image as ImageIcon, Headphones, ChevronRight } from 'lucide-react'
import { CreatorStudioShell, creatorStudioStyles as styles } from '@/components/creator/CreatorStudioShell'

const TYPES = [
  { id: 'novel', label: 'นิยาย', desc: 'เรื่องราวข้อความ บทและตอน', icon: BookOpen },
  { id: 'manga', label: 'มังงะ', desc: 'การ์ตูนและคอมิก', icon: ImageIcon },
  { id: 'audiobook', label: 'หนังสือเสียง', desc: 'เนื้อหาเสียงและพอดแคสต์', icon: Headphones },
]

export default function NewWorkTypePage() {
  return (
    <RouteGuard allowedRoles={['creator', 'admin']}>
      <CreatorStudioShell>
        <div className={styles.pageHead}><div><h1>เพิ่มผลงานใหม่</h1><p>เลือกประเภทผลงาน ระบบจะเตรียมฟอร์มและเครื่องมือจัดการตอนให้เหมาะกับสื่อ</p></div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 14 }}>
          {TYPES.map(t => (
            <Link
              key={t.id}
              href={`/creator/works/new/${t.id}`}
              className={styles.card}
              style={{ display: 'flex', minHeight: 190, flexDirection: 'column', justifyContent: 'center', gap: 12, transition: '.15s' }}
            >
              <div className={styles.headIcon}><t.icon size={26} /></div>
              <div><h2 style={{ margin: 0 }}>{t.label}</h2><p className={styles.help}>{t.desc}</p></div>
              <span className={styles.eyebrow} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>เริ่มสร้าง <ChevronRight size={14} /></span>
            </Link>
          ))}
        </div>
      </CreatorStudioShell>
    </RouteGuard>
  )
}
