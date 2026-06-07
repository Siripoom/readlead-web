import { BookCategorySection } from '@/components/BookCategorySection'
import { MOCK_BOOKS, BOOK_CATEGORIES } from '@/lib/mock-data'

export default function BooksPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground">หมวดหมู่หนังสือ</h1>
      <BookCategorySection books={MOCK_BOOKS} categories={BOOK_CATEGORIES} />
    </main>
  )
}
