'use client'

import { Lock, MessageSquare, Share2, Volume2 } from 'lucide-react'

interface Props {
  commentsActive: boolean
  onToggleComments: () => void
  onShare?: () => void
  speech?: {
    active: boolean
    locked: boolean
    disabled?: boolean
    onClick: () => void
  }
}

export default function ReaderFloatingActions({ commentsActive, onToggleComments, onShare, speech }: Props) {
  return (
    <div className="fixed right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2.5 xl:left-[calc(50%+425px)] xl:right-auto">
      {speech && <button type="button" onClick={speech.onClick} aria-disabled={speech.disabled} title={speech.disabled ? 'เบราว์เซอร์นี้ไม่รองรับการอ่านออกเสียง' : undefined} className={`relative grid size-[42px] place-items-center rounded-full shadow-[0_2px_10px_rgba(0,0,0,.12)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${speech.disabled ? 'cursor-not-allowed opacity-45' : ''} ${speech.active ? 'bg-primary text-primary-foreground' : 'bg-[var(--reader-paper)] text-[var(--reader-muted)] hover:text-[var(--reader-accent)]'}`} aria-label={speech.disabled ? 'เบราว์เซอร์ไม่รองรับการอ่านออกเสียง' : speech.locked ? 'ซื้อฟีเจอร์อ่านออกเสียง 300 เหรียญ' : 'เปิดหรือปิดเครื่องเล่นอ่านออกเสียง'} aria-pressed={speech.active}>
        <Volume2 className="size-[18px]" />
        {speech.locked && <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-foreground text-background"><Lock className="size-2.5" /></span>}
      </button>}
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
