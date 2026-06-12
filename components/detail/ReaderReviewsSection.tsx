'use client'

import { useState } from 'react'
import { Pencil, ChevronDown, ThumbsUp, ThumbsDown, Reply, User } from 'lucide-react'

interface ReaderReview {
  id: string
  username: string
  time: string
  content: string
  readChapters: number
  likes: number
  dislikes: number
  replyCount: number
}

const MOCK_READER_REVIEWS: ReaderReview[] = [
  {
    id: 'rr-1',
    username: 'pag1',
    time: '4 ปีที่แล้ว',
    content:
      'งานแปลดีคับ เนื้อเรื่อง นิสัยพระเอกถือว่าผ่านคับ ใครที่ผิดหวังกับแนวเกิดใหม่ที่พระเอกอ่อนตื่นเกินไปหรือหลงสาว ขอแนะนำเรื่องนี้คับ ไม่ทำให้ผิดหวังแน่นอน',
    readChapters: 1124,
    likes: 46,
    dislikes: 7,
    replyCount: 0,
  },
  {
    id: 'rr-2',
    username: 'บัญชีผู้ใช้ถูกลบ',
    time: '4 ปีที่แล้ว',
    content:
      'ตอนแรกไม่ชอบงานของนักเขียนคนนี้ที่ชอบเขียนแนวดูถูกแล้วโดนพระเอกตบคืนเพราะชอบทำให้สังคมในเรื่องฟอนเฟะมากๆ เหมือนเจอใครก็นิสัยแย่ไปหมด ยกเว้นกลุ่มพระเอกที่อ่านไปเรื่อยๆแล้วจะอาเหนื่อยใจและกิ่นตอกย้ำดูถูกไปอยู่นั่นแหละเหมือนเป็นปมในใจคนแต่ง แต่เรื่องนี้ถึงแม้จะมีการดูถูกอยู่เหมือนเดิมแต่ก็พัฒนาขึ้น ตัวละครรอบข้างเริ่มมีมิติมากขึ้น ไม่ได้แบนราบเหมือนเรื่องก่อนๆ ทำให้อ่านสนุกและไม่หงุดหงิดเท่าไหร่นัก',
    readChapters: 0,
    likes: 26,
    dislikes: 6,
    replyCount: 2,
  },
  {
    id: 'rr-3',
    username: 'นักอ่านตัวยง',
    time: '3 ปีที่แล้ว',
    content:
      'เรื่องนี้อ่านแล้วติดมากเลย การพัฒนาตัวละครดีมาก เขียนได้ลึกซึ้งและอารมณ์ดีมากครับ แนะนำสำหรับคนที่ชอบแนวนี้',
    readChapters: 832,
    likes: 38,
    dislikes: 2,
    replyCount: 1,
  },
  {
    id: 'rr-4',
    username: 'แฟนนิยายจีน',
    time: '2 ปีที่แล้ว',
    content:
      'ชอบตรงที่โลกในเรื่องสมจริงและมีเหตุผล การพลิกสถานการณ์ตอนท้ายทำให้ประหลาดใจมาก รอตอนใหม่ทุกสัปดาห์เลยครับ',
    readChapters: 540,
    likes: 21,
    dislikes: 1,
    replyCount: 0,
  },
  {
    id: 'rr-5',
    username: 'หนอนหนังสือ',
    time: '1 ปีที่แล้ว',
    content:
      'อ่านมาหลายเรื่องแล้ว แต่เรื่องนี้พล็อตแน่นที่สุด ไม่มีฉากที่รู้สึกว่าเสียเวลาเลย คุ้มค่าเวลาอ่านมากๆ',
    readChapters: 256,
    likes: 54,
    dislikes: 3,
    replyCount: 4,
  },
  {
    id: 'rr-6',
    username: 'ฟ้าใสวันสบาย',
    time: '8 เดือนที่แล้ว',
    content:
      'อ่านแล้วอินมากเลยค่ะ ร้องไห้หลายรอบ เขียนได้อารมณ์มาก ขอบคุณนักเขียนที่ทำให้ชีวิตมีความสุขขึ้น',
    readChapters: 98,
    likes: 73,
    dislikes: 4,
    replyCount: 0,
  },
]

const TOTAL_REVIEWS = 132
const CLAMP_THRESHOLD = 160

export default function ReaderReviewsSection() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  function toggleExpanded(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
            รีวิวผู้อ่าน
          </h2>
          <p className="mt-1 text-lg text-muted-foreground">{TOTAL_REVIEWS} รีวิว</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-muted-foreground">จัดเรียงตาม</span>
          <div className="relative">
            <select
              className="h-12 appearance-none rounded-lg border border-border bg-white pl-4 pr-10 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              defaultValue="popular"
            >
              <option value="popular">ยอดนิยม</option>
              <option value="newest">ใหม่ล่าสุด</option>
              <option value="oldest">เก่าสุด</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          <button
            type="button"
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-white transition-colors hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            เขียนรีวิว
          </button>
        </div>
      </div>

      {/* Review list */}
      <div className="mt-6 divide-y divide-[#E5E7EB]">
        {MOCK_READER_REVIEWS.map(review => {
          const isExpanded = expandedIds.has(review.id)
          const isLong = review.content.length > CLAMP_THRESHOLD

          return (
            <div
              key={review.id}
              className="grid grid-cols-1 gap-4 py-8 md:grid-cols-[220px_1fr_180px] md:gap-8"
            >
              {/* Col 1 — user info */}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-primary">{review.username}</p>
                  <p className="text-sm text-muted-foreground">{review.time}</p>
                </div>
              </div>

              {/* Col 2 — content */}
              <div>
                <p
                  className={`text-lg leading-relaxed text-[#555] ${
                    isLong && !isExpanded ? 'line-clamp-4' : ''
                  }`}
                >
                  {review.content}
                </p>
                {isLong && (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(review.id)}
                    className="mt-1 text-primary hover:underline"
                  >
                    {isExpanded ? 'ย่อข้อความ' : '…อ่านเพิ่มเติม'}
                  </button>
                )}

                <button
                  type="button"
                  className="mt-4 inline-flex items-center gap-1.5 text-primary hover:underline"
                >
                  <Reply className="h-4 w-4" />
                  ตอบกลับ
                  {review.replyCount > 0 && <span>({review.replyCount})</span>}
                </button>
              </div>

              {/* Col 3 — stats */}
              <div className="md:text-right">
                <p className="text-sm font-medium text-foreground">
                  อ่านแล้ว {review.readChapters.toLocaleString()} ตอน
                </p>
                <div className="mt-2 flex items-center gap-4 text-muted-foreground md:justify-end">
                  <span className="inline-flex items-center gap-1.5">
                    <ThumbsUp className="h-4 w-4" />
                    {review.likes}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ThumbsDown className="h-4 w-4" />
                    {review.dislikes}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
