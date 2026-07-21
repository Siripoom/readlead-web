'use client'

import { MessageSquare, Share2 } from 'lucide-react'

interface Props {
  commentsActive: boolean
  onToggleComments: () => void
  onShare?: () => void
}

export default function ReaderFloatingActions({ commentsActive, onToggleComments, onShare }: Props) {
  return (
    <div className="fixed right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2.5 xl:left-[calc(50%+425px)] xl:right-auto">
      <button
        type="button"
        onClick={onToggleComments}
        className={`grid size-[42px] place-items-center rounded-full shadow-[0_2px_10px_rgba(0,0,0,.12)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          commentsActive ? 'bg-primary text-primary-foreground' : 'bg-[var(--reader-paper)] text-[var(--reader-muted)] hover:text-[var(--reader-accent)]'
        }`}
        aria-label="เปิดหรือปิดโหมดความคิดเห็น"
        aria-pressed={commentsActive}
      >
        <MessageSquare className="size-[18px]" />
      </button>
      {onShare && (
        <button
          type="button"
          onClick={onShare}
          className="grid size-[42px] place-items-center rounded-full bg-[var(--reader-paper)] text-[var(--reader-muted)] shadow-[0_2px_10px_rgba(0,0,0,.12)] transition-colors hover:text-[var(--reader-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="แชร์ตอนนี้"
        >
          <Share2 className="size-[18px]" />
        </button>
      )}
    </div>
  )
}
