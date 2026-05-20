'use client'

import { useRef, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'

interface Props {
  content: string
  fontSize: number
  showComments: boolean
  commentCounts?: Record<number, number>
  activeParagraphIdx?: number | null
  onParagraphClick?: (idx: number, text: string) => void
  onBottomVisible?: () => void
}

export default function ReaderContent({
  content,
  fontSize,
  showComments,
  commentCounts = {},
  activeParagraphIdx,
  onParagraphClick,
  onBottomVisible,
}: Props) {
  const paragraphs = content.split('\n').filter(p => p.trim())

  const firedRef = useRef(false)

  useEffect(() => {
    if (!onBottomVisible) return
    firedRef.current = false

    let timer: ReturnType<typeof setTimeout> | null = null

    function handleScroll() {
      if (firedRef.current) return
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      if (atBottom) {
        firedRef.current = true
        timer = setTimeout(() => { onBottomVisible!() }, 1000)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timer !== null) clearTimeout(timer)
    }
  }, [onBottomVisible, content])

  return (
    <div
      className="max-w-2xl mx-auto leading-loose text-foreground"
      style={{ fontSize: `${fontSize}px` }}
    >
      {paragraphs.map((para, idx) => {
        const count = commentCounts[idx] ?? 0
        const isActive = activeParagraphIdx === idx
        const clickable = showComments && !!onParagraphClick

        return (
          <div
            key={idx}
            onClick={clickable ? () => onParagraphClick(idx, para) : undefined}
            className={`mb-4 flex items-start gap-2 group rounded-sm px-1 -mx-1 transition-colors ${
              clickable ? 'cursor-pointer' : ''
            } ${isActive ? 'bg-primary/8' : clickable ? 'hover:bg-muted/40' : ''}`}
          >
            <p className="flex-1 indent-8">{para}</p>

            {showComments && (
              <span className={`shrink-0 mt-1 flex items-center gap-0.5 text-xs transition-opacity ${
                count > 0 ? 'text-primary' : 'text-muted-foreground opacity-0 group-hover:opacity-60'
              }`}>
                <MessageSquare className="h-3.5 w-3.5" />
                {count > 0 && count}
              </span>
            )}
          </div>
        )
      })}

    </div>
  )
}
