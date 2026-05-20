'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, ThumbsUp, MessageSquarePlus, ChevronDown } from 'lucide-react'
import { useRole } from '@/contexts/RoleContext'
import { useRouter } from 'next/navigation'
import type { Review } from '@/lib/types'

interface Props {
  workId: string
  initialReviews: Review[]
}

type FilterValue = 'all' | 1 | 2 | 3 | 4 | 5

function StarRow({
  rating,
  interactive,
  onChange,
}: {
  rating: number
  interactive?: boolean
  onChange?: (n: number) => void
}) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`h-4 w-4 transition-colors ${
            n <= (interactive ? hover || rating : rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground'
          } ${interactive ? 'cursor-pointer' : ''}`}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
        />
      ))}
    </div>
  )
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`
  return `${Math.floor(diff / 86400)} วันที่แล้ว`
}

export default function ReviewSection({ workId, initialReviews }: Props) {
  const router = useRouter()
  const { isLoggedIn } = useRole()

  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [filter, setFilter] = useState<FilterValue>('all')
  const [expanded, setExpanded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formRating, setFormRating] = useState(5)
  const [formText, setFormText] = useState('')

  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.rating === filter)
  const visible = expanded ? filtered : filtered.slice(0, 3)
  const hiddenCount = filtered.length - 3

  function handleSubmit() {
    if (!isLoggedIn) { router.push('/login'); return }
    if (!formText.trim()) return
    const newReview: Review = {
      id: `r-${Date.now()}`,
      workId,
      authorName: 'คุณ',
      avatarUrl: `https://picsum.photos/seed/me/40/40`,
      rating: formRating,
      text: formText.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
    }
    setReviews(prev => [newReview, ...prev])
    setFormText('')
    setFormRating(5)
    setShowForm(false)
    setFilter('all')
    setExpanded(false)
  }

  const filterOptions: { label: string; value: FilterValue }[] = [
    { label: 'ทั้งหมด', value: 'all' },
    { label: '5 ★', value: 5 },
    { label: '4 ★', value: 4 },
    { label: '3 ★', value: 3 },
    { label: '2 ★', value: 2 },
    { label: '1 ★', value: 1 },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageSquarePlus className="h-5 w-5 text-primary" />
          รีวิวจากผู้อ่าน ({reviews.length} รายการ)
        </h2>
        <button
          type="button"
          onClick={() => {
            if (!isLoggedIn) { router.push('/login'); return }
            setShowForm(v => !v)
          }}
          className="flex items-center gap-1.5 text-sm font-medium text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
        >
          <Star className="h-3.5 w-3.5" />
          เขียนรีวิว
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">คะแนน:</span>
            <StarRow rating={formRating} interactive onChange={setFormRating} />
            <span className="font-medium">{formRating} / 5</span>
          </div>
          <textarea
            value={formText}
            onChange={e => setFormText(e.target.value)}
            placeholder="แชร์ความคิดเห็นของคุณเกี่ยวกับนิยายเรื่องนี้..."
            rows={3}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-sm rounded-md border hover:bg-muted transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!formText.trim()}
              className="px-4 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              ส่งรีวิว
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {filterOptions.map(opt => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => { setFilter(opt.value); setExpanded(false) }}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filter === opt.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">ยังไม่มีรีวิวในหมวดนี้</p>
      ) : (
        <div className="space-y-3">
          {visible.map(review => (
            <div key={review.id} className="rounded-lg border bg-card p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative h-8 w-8 rounded-full overflow-hidden shrink-0">
                    <Image src={review.avatarUrl} alt={review.authorName} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">{review.authorName}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(review.createdAt)}</p>
                  </div>
                </div>
                <StarRow rating={review.rating} />
              </div>
              <p className="text-sm text-foreground leading-relaxed">{review.text}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>{review.likes} คนพบว่าเป็นประโยชน์</span>
              </div>
            </div>
          ))}

          {!expanded && hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
              ดูรีวิวเพิ่มเติม ({hiddenCount} รายการ)
            </button>
          )}
        </div>
      )}
    </div>
  )
}
