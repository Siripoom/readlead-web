'use client'

import { useState, use } from 'react'
import RouteGuard from '@/components/layout/RouteGuard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft, Bold, Italic, List } from 'lucide-react'
import { MOCK_EPISODES } from '@/lib/mock-data'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ workId: string; episodeId: string }>
}

export default function EditEpisodePage({ params }: Props) {
  const { workId, episodeId } = use(params)
  const router = useRouter()

  const episodes = MOCK_EPISODES[workId] ?? []
  const episode = episodes.find(e => e.id === episodeId)

  if (!episode) notFound()

  const [title, setTitle] = useState(episode.title)
  const [price, setPrice] = useState(String(episode.price))
  const [content, setContent] = useState(episode.content)

  function handleSave() {
    router.push(`/creator/works/${workId}`)
  }

  return (
    <RouteGuard allowedRoles={['creator', 'admin']}>
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
          <Link href={`/creator/works/${workId}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">กลับ</span>
          </Link>
          <div className="flex-1 flex items-center gap-3">
            <Input
              placeholder="ชื่อตอน"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">ราคา</label>
              <Input
                type="number"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-20"
              />
            </div>
          </div>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground" size="sm">
            บันทึก
          </Button>
        </div>

        <div className="border-b px-4 py-2 flex items-center gap-1 bg-muted/20">
          {[
            { icon: Bold, label: 'ตัวหนา' },
            { icon: Italic, label: 'ตัวเอียง' },
            { icon: List, label: 'รายการ' },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              title={label}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <div className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
          <textarea
            className="w-full h-full min-h-96 text-base leading-loose bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>
      </div>
    </RouteGuard>
  )
}
