'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, Minus, Plus, MessageSquare, SkipForward } from 'lucide-react'
import Link from 'next/link'

interface Props {
  workId: string
  workTitle: string
  episodeTitle: string
  fontSize: number
  onFontSizeChange: (size: number) => void
  showComments: boolean
  onToggleComments: () => void
  autoAdvance: boolean
  onToggleAutoAdvance: () => void
}

export default function ReaderToolbar({
  workId, workTitle, episodeTitle,
  fontSize, onFontSizeChange,
  showComments, onToggleComments,
  autoAdvance, onToggleAutoAdvance,
}: Props) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center gap-3">
        <Link
          href={`/detail?bookId=${workId}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{workTitle}</span>
        </Link>

        <div className="h-4 w-px bg-border hidden sm:block" />

        <span className="flex-1 text-sm font-medium truncate">{episodeTitle}</span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onFontSizeChange(Math.max(14, fontSize - 2))}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="text-sm w-8 text-center">{fontSize}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onFontSizeChange(Math.min(24, fontSize + 2))}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Button
          variant={autoAdvance ? 'default' : 'ghost'}
          size="icon"
          className={`h-8 w-8 ${autoAdvance ? 'bg-primary text-primary-foreground' : ''}`}
          onClick={onToggleAutoAdvance}
          title="เปิด/ปิดอ่านต่ออัตโนมัติ"
        >
          <SkipForward className="h-4 w-4" />
        </Button>

        <Button
          variant={showComments ? 'default' : 'ghost'}
          size="icon"
          className={`h-8 w-8 ${showComments ? 'bg-primary text-primary-foreground' : ''}`}
          onClick={onToggleComments}
          title="เปิด/ปิดความคิดเห็น"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
