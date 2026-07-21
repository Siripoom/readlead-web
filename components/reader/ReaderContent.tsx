'use client'

import { startTransition, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import ReaderCommentBadge, { readerCommentBadgeMarkup } from '@/components/reader/ReaderCommentBadge'
import { isRichEpisodeContent, sanitizeEpisodeHtml } from '@/lib/creator-rich-text'

interface Props {
  content: string
  fontSize: number
  commentsEnabled: boolean
  commentCounts?: Record<string, number>
  sharedCommentCount?: number
  activeSlotId?: string | null
  onParagraphClick?: (slotId: string, text: string) => void
  onBottomVisible?: () => void
  preview?: boolean
}

const EMPTY_COMMENT_COUNTS: Record<string, number> = {}
const RICH_COMMENT_SELECTOR = 'p,h2,blockquote,li'

function annotateRichContent(
  richContent: string,
  commentsEnabled: boolean,
  commentCounts: Record<string, number>,
  sharedCommentCount: number | undefined,
  activeSlotId: string | null | undefined,
) {
  const documentNode = new DOMParser().parseFromString(`<div id="reader-rich-root">${richContent}</div>`, 'text/html')
  const root = documentNode.getElementById('reader-rich-root')
  if (!root) return richContent

  const targets = [...root.querySelectorAll<HTMLElement>(RICH_COMMENT_SELECTOR)].filter((element) => {
    if (element.tagName !== 'BLOCKQUOTE' && element.tagName !== 'LI') return true
    return !element.querySelector(':scope > p, :scope > h2')
  })

  targets.forEach((target, index) => {
    const slotId = `paragraph:${index}`
    const label = target.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    target.dataset.readerCommentSlot = slotId
    target.dataset.readerCommentLabel = label

    if (!commentsEnabled) return
    target.classList.add('reader-comment-target')
    target.setAttribute('role', 'button')
    target.tabIndex = 0
    if (activeSlotId === slotId) target.classList.add('reader-comment-target-active')

    const count = sharedCommentCount ?? commentCounts[slotId] ?? 0
    if (count > 0) target.insertAdjacentHTML('beforeend', readerCommentBadgeMarkup(count))
  })

  return root.innerHTML
}

export default function ReaderContent({
  content,
  fontSize,
  commentsEnabled,
  commentCounts = EMPTY_COMMENT_COUNTS,
  sharedCommentCount,
  activeSlotId,
  onParagraphClick,
  onBottomVisible,
  preview = false,
}: Props) {
  const paragraphs = content.split('\n').filter((paragraph) => paragraph.trim())
  const richContent = isRichEpisodeContent(content) ? sanitizeEpisodeHtml(content) : ''
  const [renderedRichContent, setRenderedRichContent] = useState(richContent)
  const richRoot = useRef<HTMLDivElement>(null)
  const endMarker = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!richContent) return
    const annotated = annotateRichContent(
      richContent,
      commentsEnabled && Boolean(onParagraphClick),
      commentCounts,
      sharedCommentCount,
      activeSlotId,
    )
    startTransition(() => setRenderedRichContent(annotated))
  }, [activeSlotId, commentCounts, commentsEnabled, onParagraphClick, richContent, sharedCommentCount])

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

  function activateRichTarget(target: EventTarget | null) {
    if (!commentsEnabled || !onParagraphClick || !(target instanceof Element)) return false
    const commentTarget = target.closest<HTMLElement>('[data-reader-comment-slot]')
    if (!commentTarget || !richRoot.current?.contains(commentTarget)) return false
    const slotId = commentTarget.dataset.readerCommentSlot
    if (!slotId) return false
    onParagraphClick(slotId, commentTarget.dataset.readerCommentLabel ?? '')
    return true
  }

  function handleRichClick(event: MouseEvent<HTMLDivElement>) {
    activateRichTarget(event.target)
  }

  function handleRichKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    if (activateRichTarget(event.target)) event.preventDefault()
  }

  const visibleParagraphs = preview ? paragraphs.slice(0, 3) : paragraphs

  if (richContent) return (
    <div
      className={`relative mx-auto max-w-2xl text-[var(--reader-ink)] [&_.align-center]:text-center [&_.align-right]:text-right [&_.first-line-indent]:indent-[2.2em] [&_blockquote]:my-5 [&_blockquote]:border-l-3 [&_blockquote]:border-[var(--reader-accent)] [&_blockquote]:pl-5 [&_h2]:my-7 [&_h2]:text-[1.4em] [&_hr]:my-8 [&_hr]:border-[var(--reader-hover)] [&_li]:my-2 [&_ol]:list-decimal [&_ol]:pl-7 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-7 ${preview ? 'max-h-72 overflow-hidden' : ''}`}
      style={{ fontSize: `${fontSize}px`, lineHeight: 1.95 }}
    >
      <div
        ref={richRoot}
        onClick={handleRichClick}
        onKeyDown={handleRichKeyDown}
        dangerouslySetInnerHTML={{ __html: renderedRichContent }}
      />
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
        const count = sharedCommentCount ?? commentCounts[slotId] ?? 0
        const active = activeSlotId === slotId
        const clickable = commentsEnabled && Boolean(onParagraphClick)
        const activate = () => onParagraphClick?.(slotId, paragraph)
        return (
          <p
            key={slotId}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            className={`mb-1 indent-[2.2em] ${clickable ? 'reader-comment-target' : ''} ${active ? 'reader-comment-target-active' : ''}`}
            onClick={clickable ? activate : undefined}
            onKeyDown={clickable ? (event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              activate()
            } : undefined}
          >
            {paragraph}
            {commentsEnabled && count > 0 && <ReaderCommentBadge count={count} />}
          </p>
        )
      })}
      {preview && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[var(--reader-paper)]" />}
      <div ref={endMarker} className="h-px" aria-hidden />
    </div>
  )
}
