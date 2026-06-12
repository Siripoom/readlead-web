import Image from 'next/image'
import Link from 'next/link'
import { Eye, List } from 'lucide-react'

interface RecommendedNovel {
  id: string
  title: string
  coverUrl: string
  discount: string
  countdown: string
  meta: string
  views: string
  episodes: string
  href: string
}

const RECOMMENDED_NOVELS: RecommendedNovel[] = [
  {
    id: 'rec1',
    title: 'ระบบสุดโกงอัปสกิลหมอ',
    coverUrl: 'https://picsum.photos/seed/rec1/800/350',
    discount: '-30%',
    countdown: '16 วัน 01 : 07 : 13',
    meta: 'Stone_Fantasy · 手握寸关尺 (ใส่วิวุ่นเกมหมอ) · ศิษย์สายนอก · แฟนตาซี · แปล',
    views: '3.3M',
    episodes: '2,043',
    href: '/detail?bookId=1',
  },
  {
    id: 'rec2',
    title: '[จบ] บันทึกตำนานราชันอหังการ',
    coverUrl: 'https://picsum.photos/seed/rec2/800/350',
    discount: '-20%',
    countdown: '16 วัน 01 : 07 : 13',
    meta: 'EnjoyBook · 萧瑾瑜 · กำลังภายใน · แปล',
    views: '4.4M',
    episodes: '3,689',
    href: '/detail?bookId=2',
  },
  {
    id: 'rec3',
    title: 'จอมเวทย์พลิกชะตาข้ามภพ',
    coverUrl: 'https://picsum.photos/seed/rec3/800/350',
    discount: '-25%',
    countdown: '09 วัน 14 : 22 : 48',
    meta: 'MoonReader · 苍穹之上 · เกิดใหม่ · แฟนตาซี · แปล',
    views: '2.1M',
    episodes: '1,204',
    href: '/detail?bookId=3',
  },
  {
    id: 'rec4',
    title: 'ราชินีดาบนิรันดร์กาล',
    coverUrl: 'https://picsum.photos/seed/rec4/800/350',
    discount: '-15%',
    countdown: '21 วัน 06 : 41 : 05',
    meta: 'StarInk · 剑舞红尘 · กระบี่ · โรแมนติก · แต่งเอง',
    views: '1.8M',
    episodes: '964',
    href: '/detail?bookId=4',
  },
  {
    id: 'rec5',
    title: 'เทพศาสตราคืนสู่บัลลังก์',
    coverUrl: 'https://picsum.photos/seed/rec5/800/350',
    discount: '-40%',
    countdown: '03 วัน 18 : 55 : 30',
    meta: 'DragonPen · 战神归来 · ต่อสู้ · ระบบ · แปล',
    views: '5.7M',
    episodes: '4,512',
    href: '/detail?bookId=5',
  },
  {
    id: 'rec6',
    title: 'บันทึกพ่อครัวแห่งต่างโลก',
    coverUrl: 'https://picsum.photos/seed/rec6/800/350',
    discount: '-10%',
    countdown: '12 วัน 22 : 10 : 59',
    meta: 'TastyTale · 异世厨神 · ทำอาหาร · สโลว์ไลฟ์ · แต่งเอง',
    views: '980K',
    episodes: '612',
    href: '/detail?bookId=6',
  },
]

function NovelCard({ novel }: { novel: RecommendedNovel }) {
  return (
    <Link href={novel.href} className="group block">
      <div className="relative aspect-16/7 overflow-hidden rounded-xl bg-muted/30">
        <Image
          src={novel.coverUrl}
          alt={novel.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 700px"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-lg bg-rose-500 px-2.5 py-1 text-sm font-bold text-white shadow-sm">
          <span>{novel.discount}</span>
          <span className="font-medium tabular-nums opacity-95">{novel.countdown}</span>
        </span>
      </div>

      <div className="mt-3 space-y-2">
        <h3 className="line-clamp-2 text-xl font-bold leading-snug text-black md:text-2xl">
          {novel.title}
        </h3>
        <p className="line-clamp-2 text-[15px] font-medium text-[#8A8A8A] md:text-[17px]">
          {novel.meta}
        </p>
        <div className="flex items-center gap-5 text-[15px] font-medium text-[#8A8A8A] md:text-[17px]">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-5 w-5" />
            <span className="tabular-nums">{novel.views}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <List className="h-5 w-5" />
            <span className="tabular-nums">{novel.episodes}</span>
          </span>
        </div>
      </div>
    </Link>
  )
}

export function RecommendedByWebsiteSection() {
  return (
    <section className="space-y-6">
      <h2 className="text-4xl font-black text-black md:text-5xl">แนะนำโดยเว็บ</h2>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
        {RECOMMENDED_NOVELS.slice(0, 2).map((novel) => (
          <NovelCard key={novel.id} novel={novel} />
        ))}
      </div>
    </section>
  )
}
