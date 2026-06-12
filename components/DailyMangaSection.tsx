'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DailyMangaEpisode {
  id: string
  label: string
  /** ระยะเวลาที่อัพโหลด เช่น "5 ชม. ที่แล้ว" */
  uploadedAt: string
}

export interface DailyManga {
  id: string
  title: string
  author: string
  coverUrl: string
  day: string
  /** ตอนล่าสุด (เรียงจากใหม่ไปเก่า) */
  episodes?: DailyMangaEpisode[]
}

interface Props {
  title?: string
  days: string[]
  mangas: DailyManga[]
  itemsPerPage?: number
}

export function DailyMangaSection({
  title = 'มังงะรายวัน',
  days,
  mangas,
  itemsPerPage = 8,
}: Props) {
  const [activeDay, setActiveDay] = useState(days[0])
  const [page, setPage] = useState(1)

  const filteredMangas = useMemo(
    () => mangas.filter((m) => m.day === activeDay),
    [mangas, activeDay],
  )

  const totalPages = Math.max(1, Math.ceil(filteredMangas.length / itemsPerPage))

  const paginatedMangas = useMemo(
    () => filteredMangas.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [filteredMangas, page, itemsPerPage],
  )

  function handleDayChange(day: string) {
    setActiveDay(day)
    setPage(1)
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {days.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => handleDayChange(day)}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-colors',
              activeDay === day
                ? 'bg-black text-white'
                : 'bg-[#f5f5f5] text-foreground hover:bg-[#ebebeb]',
            )}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Manga grid */}
      {filteredMangas.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {paginatedMangas.map((manga) => (
              <Link
                key={manga.id}
                href={`/detail?bookId=${manga.id}`}
                className="group block"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-sm transition-shadow duration-300 group-hover:shadow-md">
                  <Image
                    src={manga.coverUrl}
                    alt={manga.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                </div>
                <h3 className="mt-2 line-clamp-1 text-base font-bold text-foreground">
                  {manga.title}
                </h3>
                <p className="line-clamp-1 text-sm text-muted-foreground">
                  {manga.author}
                </p>

                {manga.episodes && manga.episodes.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {manga.episodes.slice(0, 3).map((ep) => (
                      <li
                        key={ep.id}
                        className="flex items-center justify-between gap-2 rounded-md px-1.5 py-1 text-xs transition-colors group-hover:bg-[#f5f5f5]"
                      >
                        <span className="line-clamp-1 font-medium text-foreground/80">
                          {ep.label}
                        </span>
                        <span className="shrink-0 text-muted-foreground">
                          {ep.uploadedAt}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-foreground transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                ก่อนหน้า
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={cn(
                    'h-9 w-9 rounded-md border text-sm font-semibold transition-colors',
                    p === page
                      ? 'border-black bg-black text-white'
                      : 'border-[#e5e5e5] bg-white text-foreground hover:bg-[#f5f5f5]',
                  )}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-foreground transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-40"
              >
                ถัดไป
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
          ยังไม่มีมังงะสำหรับวันนี้
        </div>
      )}
    </section>
  )
}
