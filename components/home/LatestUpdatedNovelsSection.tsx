import Image from 'next/image'
import Link from 'next/link'
import { Eye, List, MessageSquare, ChevronRight } from 'lucide-react'

interface LatestNovel {
  id: string
  title: string
  badge: string
  category: string
  description: string
  coverUrl: string
  views: string
  chapters: string
  comments: string
  href: string
}

const LATEST_NOVELS: LatestNovel[] = [
  {
    id: 'lu1',
    title: 'ย้อนเวลาพร้อมมือถือเทพ สู่บัลลังก์เจ้าพ่อไอที',
    badge: 'เพิ่มตอนฟรี 11 วัน',
    category: 'แฟนตาซี · แปล',
    description:
      'เป้าหมายเดียวที่มีคือการก้าวขึ้นเป็นผู้กุมชะตาอนาคต... ในฐานะ "เจ้าพ่อแห่งโลกเทคโนโลยี"!',
    coverUrl: 'https://picsum.photos/seed/lu1/360/520',
    views: '6K',
    chapters: '382',
    comments: '13',
    href: '/detail?bookId=1',
  },
  {
    id: 'lu2',
    title: 'โดนทิ้งแล้วไง ผมกลายเป็นมหาเทพด้วยพรสวรรค์',
    badge: 'เพิ่มตอนฟรี 11 วัน',
    category: 'แฟนตาซี · แปล',
    description: 'ฉันอัปเลเวลแค่หนึ่งขั้นก็เท่ากับพวกแกสิบขั้นแล้ว...',
    coverUrl: 'https://picsum.photos/seed/lu2/360/520',
    views: '1.6K',
    chapters: '80',
    comments: '0',
    href: '/detail?bookId=2',
  },
  {
    id: 'lu3',
    title: 'จอมเวทย์พเนจร กับตำราต้องห้ามแห่งรัตติกาล',
    badge: 'เพิ่มตอนฟรี 7 วัน',
    category: 'แฟนตาซี · แปล',
    description:
      'คำสาปที่ติดตัวมาแต่กำเนิดกลับกลายเป็นพลังที่ทำให้เขากลายเป็นที่หมายปองของทุกสำนัก...',
    coverUrl: 'https://picsum.photos/seed/lu3/360/520',
    views: '12K',
    chapters: '526',
    comments: '47',
    href: '/detail?bookId=3',
  },
  {
    id: 'lu4',
    title: 'นางพญาดาบพลิกแผ่นดิน ครองบัลลังก์ด้วยคมกระบี่',
    badge: 'เพิ่มตอนฟรี 3 วัน',
    category: 'กำลังภายใน · แต่งเอง',
    description:
      'จากองค์หญิงที่ถูกหักหลัง สู่จอมยุทธ์ผู้ไร้พ่าย เธอจะทวงคืนทุกสิ่งที่เคยถูกพรากไป...',
    coverUrl: 'https://picsum.photos/seed/lu4/360/520',
    views: '8.9K',
    chapters: '214',
    comments: '21',
    href: '/detail?bookId=4',
  },
]

function NovelItem({ novel }: { novel: LatestNovel }) {
  return (
    <Link
      href={novel.href}
      className="group flex flex-col gap-4 sm:flex-row sm:gap-5"
    >
      {/* รูปปก */}
      <div className="relative aspect-3/4 w-full shrink-0 overflow-hidden rounded-xl bg-muted/30 sm:h-[240px] sm:w-[170px]">
        <Image
          src={novel.coverUrl}
          alt={novel.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, 170px"
        />
      </div>

      {/* รายละเอียด */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 inline-block shrink-0 rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white">
            {novel.badge}
          </span>
          <h3 className="line-clamp-2 text-xl font-bold leading-snug text-black md:text-2xl">
            {novel.title}
          </h3>
        </div>

        <p className="mt-2 text-[15px] font-medium text-[#777] md:text-[17px]">
          {novel.category}
        </p>

        <p className="mt-2 line-clamp-3 text-[16px] leading-relaxed text-[#8A8A8A] md:text-[18px]">
          {novel.description}
        </p>

        <div className="mt-auto flex items-center gap-5 pt-4 text-[15px] text-[#777] md:text-[17px]">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-5 w-5" />
            <span className="tabular-nums">{novel.views}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <List className="h-5 w-5" />
            <span className="tabular-nums">{novel.chapters}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="h-5 w-5" />
            <span className="tabular-nums">{novel.comments}</span>
          </span>
        </div>
      </div>
    </Link>
  )
}

export function LatestUpdatedNovelsSection() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-3xl font-black text-black md:text-4xl">
          นิยายอัปเดตล่าสุด
        </h2>
        <Link
          href="/discover"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[#777] transition-colors hover:text-black"
        >
          ดูเพิ่มเติม
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-2">
        {LATEST_NOVELS.map((novel) => (
          <NovelItem key={novel.id} novel={novel} />
        ))}
      </div>
    </section>
  )
}
