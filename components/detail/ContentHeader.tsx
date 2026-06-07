'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, ThumbsUp, BookOpen, Bookmark, Bell, Heart, Calendar } from 'lucide-react'
import { useRole } from '@/contexts/RoleContext'
import DonateModal from '@/components/modals/DonateModal'
import type { Work } from '@/lib/types'
import { GENRE_LABELS } from '@/lib/mock-data'
import { useRouter } from 'next/navigation'

const TYPE_LABELS: Record<string, string> = { novel: 'นิยาย', manga: 'มังงะ', audiobook: 'หนังสือเสียง' }
const STATUS_LABELS: Record<string, string> = { ongoing: 'กำลังดำเนินอยู่', completed: 'จบแล้ว', hiatus: 'หยุดพัก' }
const STATUS_COLORS: Record<string, string> = {
  ongoing: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  hiatus: 'bg-yellow-100 text-yellow-700',
}

interface Props {
  work: Work
}

export default function ContentHeader({ work }: Props) {
  const { isLoggedIn } = useRole()
  const router = useRouter()
  const [bookmarked, setBookmarked] = useState(false)
  const [following, setFollowing] = useState(false)
  const [donateOpen, setDonateOpen] = useState(false)

  function requireLogin(action: () => void) {
    if (!isLoggedIn) { router.push('/login'); return }
    action()
  }

  function fmt(n: number) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return String(n)
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="shrink-0 mx-auto md:mx-0">
        <div className="relative w-40 h-56 md:w-48 rounded-lg overflow-hidden shadow-lg border border-border-gold/30">
          <Image src={work.coverUrl} alt={work.title} fill className="object-cover" />
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <Badge className="bg-primary/10 text-primary border-primary/20">{TYPE_LABELS[work.type]}</Badge>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[work.status]}`}>
            {STATUS_LABELS[work.status]}
          </span>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{work.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">โดย <span className="text-primary font-medium">{work.authorName}</span></p>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>อัพเดต {new Date(work.updatedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />{fmt(work.viewCount)} ครั้ง
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />{work.episodeCount} ตอน
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />{fmt(work.voteCount)} คำแนะนำทั้งหมด
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4 text-primary" />{fmt(work.weeklyVoteCount)} รายสัปดาห์
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {work.genres.map(g => (
            <Badge key={g} variant="outline" className="text-xs">{GENRE_LABELS[g]}</Badge>
          ))}
          {work.tags.map(tag => (
            <span key={tag} className="text-xs bg-accent/50 text-accent-foreground rounded-full px-2 py-0.5">{tag}</span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={bookmarked ? 'default' : 'outline'}
            size="sm"
            onClick={() => requireLogin(() => setBookmarked(b => !b))}
            className={bookmarked ? 'bg-primary text-primary-foreground' : ''}
          >
            <Bookmark className={`h-4 w-4 mr-1 ${bookmarked ? 'fill-current' : ''}`} />
            {bookmarked ? 'บุ๊คมาร์คแล้ว' : 'บุ๊คมาร์ค'}
          </Button>
          <Button
            variant={following ? 'default' : 'outline'}
            size="sm"
            onClick={() => requireLogin(() => setFollowing(f => !f))}
            className={following ? 'bg-primary text-primary-foreground' : ''}
          >
            <Bell className={`h-4 w-4 mr-1 ${following ? 'fill-current' : ''}`} />
            {following ? 'ติดตามแล้ว' : 'ติดตาม'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => requireLogin(() => setDonateOpen(true))}
            className="border-primary/30 text-primary hover:bg-primary/5"
          >
            <Heart className="h-4 w-4 mr-1" />
            บริจาค
          </Button>
        </div>
      </div>

      <DonateModal authorName={work.authorName} open={donateOpen} onOpenChange={setDonateOpen} />
    </div>
  )
}
