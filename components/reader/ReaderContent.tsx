'use client'

import { useEffect, useRef } from 'react'
import { MessageSquare } from 'lucide-react'
import { isRichEpisodeContent, sanitizeEpisodeHtml } from '@/lib/creator-rich-text'

interface Props {
  content: string
  fontSize: number
  commentsEnabled: boolean
  commentCounts?: Record<string, number>
  activeSlotId?: string | null
  onParagraphClick?: (slotId: string, text: string) => void
  onBottomVisible?: () => void
  preview?: boolean
}

export default function ReaderContent({
  content,
  fontSize,
  commentsEnabled,
  commentCounts = {},
  activeSlotId,
  onParagraphClick,
  onBottomVisible,
  preview = false,
}: Props) {
  const paragraphs = content.split('\n').filter((paragraph) => paragraph.trim())
  const richContent = isRichEpisodeContent(content) ? sanitizeEpisodeHtml(content) : ''
  const endMarker = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!onBottomVisible || !endMarker.current || preview) return
    let fired = false
    let timer: ReturnType<typeof setTimeout> | null = null
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || fired) return
      fired = true
      timer = setTimeout(onBottomVisible, 900)
    }, { threshold: 0.8 })
    observer.observe(endMarker.current)
    return () => {
      observer.disconnect()
      if (timer) clearTimeout(timer)
    }
  }, [content, onBottomVisible, preview])

  const visibleParagraphs = preview ? paragraphs.slice(0, 3) : paragraphs

  if (richContent) return (
    <div
      className={`relative mx-auto max-w-2xl text-[var(--reader-ink)] [&_.align-center]:text-center [&_.align-right]:text-right [&_.first-line-indent]:indent-[2.2em] [&_blockquote]:my-5 [&_blockquote]:border-l-3 [&_blockquote]:border-[var(--reader-accent)] [&_blockquote]:pl-5 [&_h2]:my-7 [&_h2]:text-[1.4em] [&_hr]:my-8 [&_hr]:border-[var(--reader-hover)] [&_li]:my-2 [&_ol]:list-decimal [&_ol]:pl-7 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-7 ${preview ? 'max-h-72 overflow-hidden' : ''}`}
      style={{ fontSize: `${fontSize}px`, lineHeight: 1.95 }}
    >
      <div dangerouslySetInnerHTML={{ __html: richContent }} />
      {commentsEnabled && <p className="mt-7 text-center text-xs text-[var(--reader-accent)]">ความคิดเห็นรายย่อหน้ารองรับเฉพาะเนื้อหาแบบข้อความเดิม</p>}
      {preview && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[var(--reader-paper)]" />}
      <div ref={endMarker} className="h-px" aria-hidden />
    </div>
  )

  return (
    <div
      className={`relative mx-auto max-w-2xl text-[var(--reader-ink)] ${preview ? 'max-h-72 overflow-hidden' : ''}`}
      style={{ fontSize: `${fontSize}px`, lineHeight: 1.95 }}
    >
      {visibleParagraphs.map((paragraph, index) => {
        const slotId = `paragraph:${index}`
        const count = commentCounts[slotId] ?? 0
        const active = activeSlotId === slotId
        const clickable = commentsEnabled && Boolean(onParagraphClick)
        return (
          <div
            key={slotId}
            className={`group -mx-1 mb-1 flex items-start gap-1 rounded px-1 transition-colors ${
              active ? 'bg-[var(--reader-highlight)]' : clickable ? 'cursor-pointer hover:bg-[var(--reader-hover)]' : ''
            }`}
            onClick={clickable ? () => onParagraphClick?.(slotId, paragraph) : undefined}
          >
            <p className="min-w-0 flex-1 indent-[2.2em]">{paragraph}</p>
            {commentsEnabled && count > 0 && (
              <span className="mt-1 inline-flex shrink-0 items-center gap-0.5 text-[11px] font-bold text-[var(--reader-accent)]" aria-label={`${count} ความคิดเห็น`}>
                <MessageSquare className="h-3.5 w-3.5" />{count}
              </span>
            )}
          </div>
        )
      })}
      {preview && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[var(--reader-paper)]" />}
      <div ref={endMarker} className="h-px" aria-hidden />
    </div>
  )
}
