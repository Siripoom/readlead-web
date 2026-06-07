'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface Book {
  id: string
  title: string
  publisher: string
  translator: string
  coverUrl: string
  category: string
}

const ALL_CATEGORY = 'ทั้งหมด'

interface Props {
  books: Book[]
  /** หากไม่ส่งมา จะ derive จาก books ที่มี (เรียงตามลำดับที่พบ) */
  categories?: string[]
}

export function BookCategorySection({ books, categories }: Props) {
  const tabs = useMemo(() => {
    const derived = categories ?? [...new Set(books.map((b) => b.category))]
    return [ALL_CATEGORY, ...derived]
  }, [books, categories])

  const [active, setActive] = useState<string>(ALL_CATEGORY)

  const visibleBooks =
    active === ALL_CATEGORY ? books : books.filter((b) => b.category === active)

  return (
    <section className="space-y-5">
      {/* หมวดหมู่ — เลื่อนแนวนอนได้บนมือถือ */}
      <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
        {tabs.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full border px-5 py-2 text-sm font-semibold transition-colors',
              'border-[#e5e5e5] bg-[#f5f5f5] text-gray-600 hover:text-black',
              active === cat && 'bg-[#e5e5e5] text-black',
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* รายการหนังสือ */}
      {visibleBooks.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {visibleBooks.map((book) => (
            <article key={book.id} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-sm transition-shadow duration-300 group-hover:shadow-md">
                <Image
                  src={book.coverUrl}
                  alt={book.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              </div>
              <h3 className="mt-2 line-clamp-1 text-base font-bold text-foreground">
                {book.title}
              </h3>
              <p className="line-clamp-1 text-sm text-gray-500">
                {book.publisher} · {book.translator}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex min-h-48 items-center justify-center text-sm text-gray-500">
          ยังไม่มีหนังสือในหมวดนี้
        </div>
      )}
    </section>
  )
}
