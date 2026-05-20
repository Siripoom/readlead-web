'use client'
import { useState, useMemo } from 'react'
import { MOCK_WORKS, ALL_GENRES, GENRE_LABELS } from '@/lib/mock-data'
import { BookCard } from '@/components/shared/BookCard'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import type { Genre } from '@/lib/types'

export default function DiscoverPage() {
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState<string>('all')
  const [type, setType] = useState<string>('all')
  const [sort, setSort] = useState<string>('ranking')

  const results = useMemo(() => {
    let list = [...MOCK_WORKS]
    if (query) list = list.filter(w => w.title.includes(query) || w.authorName.includes(query) || w.tags.some(t => t.includes(query)))
    if (genre !== 'all') list = list.filter(w => w.genres.includes(genre as Genre))
    if (type !== 'all') list = list.filter(w => w.type === type)
    if (sort === 'ranking') list.sort((a, b) => b.rankingScore - a.rankingScore)
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    if (sort === 'views') list.sort((a, b) => b.viewCount - a.viewCount)
    if (sort === 'latest') list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    return list
  }, [query, genre, type, sort])

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">ค้นพบ <span className="text-muted-foreground font-serif text-lg">发现</span></h1>
        <p className="mt-1 text-sm text-muted-foreground">ค้นหาและกรองนิยาย มังงะ และ Audiobook</p>
      </div>
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="ค้นหาชื่อ ผู้เขียน แท็ก..." className="pl-9" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <Select value={genre} onValueChange={v => v && setGenre(v)}>
          <SelectTrigger className="w-36"><SelectValue placeholder="หมวดหมู่" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกหมวด</SelectItem>
            {ALL_GENRES.map(g => <SelectItem key={g} value={g}>{GENRE_LABELS[g]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={v => v && setType(v)}>
          <SelectTrigger className="w-32"><SelectValue placeholder="ประเภท" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกประเภท</SelectItem>
            <SelectItem value="novel">นิยาย</SelectItem>
            <SelectItem value="manga">มังงะ</SelectItem>
            <SelectItem value="audiobook">Audiobook</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={v => v && setSort(v)}>
          <SelectTrigger className="w-32"><SelectValue placeholder="เรียงตาม" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ranking">อันดับ</SelectItem>
            <SelectItem value="rating">คะแนน</SelectItem>
            <SelectItem value="views">ยอดวิว</SelectItem>
            <SelectItem value="latest">ล่าสุด</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">พบ <Badge variant="secondary">{results.length}</Badge> รายการ</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {results.map(w => <BookCard key={w.id} work={w} />)}
      </div>
      {results.length === 0 && (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">📚</p><p className="font-medium">ไม่พบรายการที่ตรงกัน</p>
        </div>
      )}
    </div>
  )
}
