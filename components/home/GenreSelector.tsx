'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { ALL_GENRES, GENRE_LABELS } from '@/lib/mock-data'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

const GENRE_ICONS: Record<string, string> = {
  romance: '💕', fantasy: '✨', action: '⚔️', mystery: '🔍', horror: '👻',
  comedy: '😄', drama: '🎭', historical: '🏯', 'sci-fi': '🚀', 'slice-of-life': '🌸', bl: '💙', gl: '💜',
}

export function GenreSelector() {
  const router = useRouter()
  const params = useSearchParams()
  const active = params.get('genre') ?? ''

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 pb-1">
        <button
          onClick={() => router.push('/discover')}
          className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${active === '' ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary hover:text-primary'}`}
        >
          ทั้งหมด
        </button>
        {ALL_GENRES.map(g => (
          <button
            key={g}
            onClick={() => router.push(`/discover?genre=${g}`)}
            className={`flex-shrink-0 flex items-center gap-1 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${active === g ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary hover:text-primary'}`}
          >
            <span>{GENRE_ICONS[g]}</span>{GENRE_LABELS[g]}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
