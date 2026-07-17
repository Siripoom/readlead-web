'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, List, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface NovelBannerCardProps {
  novel: LatestNovel
  gradientDir?: 'left' | 'right'
  priority?: boolean
  className?: string
}

function NovelBannerCard({
  novel,
  gradientDir = 'left',
  priority,
  className,
}: NovelBannerCardProps) {
  return (
    <Link
      href={novel.href}
      className={cn(
        'group relative block overflow-hidden rounded-2xl shadow-lg',
        className,
      )}
    >
      <div className="relative aspect-5/2 min-h-32">
        <Image
          src={novel.coverUrl}
          alt={novel.title}
          fill
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div
          className={cn(
            'absolute inset-0',
            gradientDir === 'right'
              ? 'bg-linear-to-l from-black/80 via-black/55 to-transparent'
              : 'bg-linear-to-r from-black/80 via-black/55 to-transparent',
          )}
        />
        <div
          className={cn(
            'absolute inset-0 flex flex-col justify-end gap-2 p-5 text-white md:p-7',
            gradientDir === 'right' && 'items-end text-right',
          )}
        >
          <span className="inline-flex self-start rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/85 backdrop-blur">
            {novel.badge}
          </span>
          <h3 className="line-clamp-2 text-xl font-black leading-tight md:text-2xl">
            {novel.title}
          </h3>
          <p className="text-sm text-white/80 md:text-base">{novel.category}</p>
          <div
            className={cn(
              'mt-1 flex items-center gap-5 text-sm text-white/80',
              gradientDir === 'right' && 'justify-end',
            )}
          >
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span className="tabular-nums">{novel.views}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <List className="h-4 w-4" />
              <span className="tabular-nums">{novel.chapters}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              <span className="tabular-nums">{novel.comments}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

interface DesktopSlideProps {
  novels: [LatestNovel, LatestNovel?]
  priority?: boolean
}

function DesktopSlide({ novels, priority }: DesktopSlideProps) {
  return (
    <div className="flex gap-3 md:gap-4">
      <NovelBannerCard
        novel={novels[0]}
        gradientDir="left"
        priority={priority}
        className="flex-1"
      />
      {novels[1] && (
        <NovelBannerCard
          novel={novels[1]}
          gradientDir="right"
          priority={priority}
          className="flex-1"
        />
      )}
    </div>
  )
}

const AUTO_SLIDE_MS = 6000

function chunkPairs(novels: LatestNovel[]): [LatestNovel, LatestNovel?][] {
  const pairs: [LatestNovel, LatestNovel?][] = []
  for (let i = 0; i < novels.length; i += 2) {
    pairs.push([novels[i], novels[i + 1]])
  }
  return pairs
}

export function LatestUpdatedNovelsSection() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
  const [idx, setIdx] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const touchStartX = useRef<number>(0)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setPrefersReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const update = () => {
      const next = window.innerWidth >= 768
      setIsDesktop(prev => {
        if (prev !== null && prev !== next) setIdx(0)
        return next
      })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const pairs = chunkPairs(LATEST_NOVELS)
  const count = isDesktop ? pairs.length : LATEST_NOVELS.length

  useEffect(() => {
    if (count <= 1 || prefersReducedMotion) return
    const timer = window.setInterval(() => {
      setIdx(prev => (prev + 1) % count)
    }, AUTO_SLIDE_MS)
    return () => window.clearInterval(timer)
  }, [count, prefersReducedMotion])

  if (LATEST_NOVELS.length === 0 || isDesktop === null) return null

  const goToPrev = () => setIdx(prev => (prev - 1 + count) % count)
  const goToNext = () => setIdx(prev => (prev + 1) % count)

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 50) {
      if (delta < 0) goToNext()
      else goToPrev()
    }
  }

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

      <div className="relative overflow-hidden rounded-[1.75rem]">
        <div
          className={cn(
            'flex',
            !prefersReducedMotion && 'transition-transform duration-500 ease-out',
          )}
          style={{ transform: `translateX(-${idx * 100}%)` }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {isDesktop
            ? pairs.map((pair, i) => (
                <div key={`pair-${pair[0].id}`} className="w-full shrink-0">
                  <DesktopSlide novels={pair} priority={i === 0} />
                </div>
              ))
            : LATEST_NOVELS.map((novel, i) => (
                <div key={novel.id} className="w-full shrink-0">
                  <NovelBannerCard novel={novel} priority={i === 0} />
                </div>
              ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Previous novel"
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/25 bg-black/35 p-2 text-white backdrop-blur transition-colors hover:bg-black/55"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next novel"
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/25 bg-black/35 p-2 text-white backdrop-blur transition-colors hover:bg-black/55"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Dots indicator — below the image */}
      {count > 1 && (
        <div className="mt-2.5 flex justify-center gap-1.5">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={`dot-${i}`}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                'h-2 rounded-full transition-all',
                i === idx ? 'w-5.5 bg-rl-red-deep' : 'w-2 bg-rl-line',
              )}
            />
          ))}
        </div>
      )}
    </section>
  )
}
