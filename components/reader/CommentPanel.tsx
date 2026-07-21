'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Heart, Pencil, TriangleAlert } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ReaderComment, ReaderReply, ReaderReportReason } from '@/lib/reader-repository'

interface ReplyTarget {
  commentId: string
  name: string
}

interface ReportTarget {
  commentId: string
  replyId?: string
}

interface Props {
  open: boolean
  onClose: () => void
  slotLabel: string
  comments: ReaderComment[]
  totalCount?: number
  isLoggedIn: boolean
  viewerId: string | null
  onLogin: () => void
  onAddComment: (text: string) => void | boolean | Promise<void | boolean>
  onAddReply?: (commentId: string, text: string, replyToName?: string) => void | boolean | Promise<void | boolean>
  onToggleLike?: (commentId: string, replyId?: string) => void
  onReport?: (commentId: string, reason: ReaderReportReason, replyId?: string) => void
  onSubmitContentReport?: (text: string) => void | boolean | Promise<void | boolean>
  maxCommentLength?: number
}

const REPORT_REASONS: ReaderReportReason[] = [
  'คำหยาบคาย / ไม่สุภาพ',
  'สแปม / โฆษณา',
  'เนื้อหาไม่เหมาะสม',
  'คุกคาม / ก่อกวน',
  'สปอยล์เนื้อหา',
  'อื่น ๆ',
]

function InitialAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  return (
    <span
      className="grid size-8 shrink-0 place-items-center rounded-full bg-[#fdeef0] bg-cover bg-center text-xs font-extrabold text-[#cc4452]"
      style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
      aria-hidden
    >
      {!avatarUrl && (name.charAt(0) || '?')}
    </span>
  )
}

function AuthorTag() {
  return (
    <div className="mb-px inline-flex items-center gap-[3px] text-[10px] font-bold text-[#cc4452]">
      <Pencil className="size-[11px]" strokeWidth={2} />
      <span>ผู้เขียน</span>
    </div>
  )
}

function ReportButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ml-auto inline-flex shrink-0 p-px text-[#c2c6d0] opacity-100 transition-colors hover:text-[#cc4452] sm:opacity-0 sm:group-hover/comment:opacity-100 sm:focus-visible:opacity-100"
      aria-label="รายงานความคิดเห็น"
      title="รายงานความคิดเห็น"
    >
      <TriangleAlert className="size-3.5" strokeWidth={1.9} />
    </button>
  )
}

function LikeCount({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="inline-flex items-center gap-[3px] text-[11px] text-[#aaa]">
      <Heart className="size-[11px] fill-[#cc4452] stroke-[#cc4452]" />
      <span>{count}</span>
    </span>
  )
}

function RepliesToggle({ open, count, onClick }: { open: boolean; count: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 py-[5px] text-xs font-bold text-[#cc4452] hover:[&_span]:underline">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden>
        <g transform="translate(24,0) scale(-1,1)">
          <path d="M13.5 3.2 L22.8 12 L13.5 20.8 V16.3 C7.6 16.3 3.6 17.9 1.2 21.4 C1.6 13.2 6.2 9.2 13.5 8.8 Z" />
        </g>
      </svg>
      <span>{open ? 'ซ่อนการตอบกลับ' : `ดูการตอบกลับ (${count})`}</span>
    </button>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)} ${new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date).replace(':', '.')} น.`
}

function growTextarea(element: HTMLTextAreaElement) {
  element.style.height = 'auto'
  element.style.height = `${Math.min(element.scrollHeight, 170)}px`
}

export default function CommentPanel({
  open,
  onClose,
  slotLabel,
  comments,
  totalCount,
  isLoggedIn,
  viewerId,
  onLogin,
  onAddComment,
  onAddReply,
  onToggleLike,
  onReport,
  onSubmitContentReport,
  maxCommentLength = 500,
}: Props) {
  const [newText, setNewText] = useState('')
  const [reportMode, setReportMode] = useState(false)
  const [replyingTo, setReplyingTo] = useState<ReplyTarget | null>(null)
  const [replyText, setReplyText] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null)
  const [reportReason, setReportReason] = useState<ReaderReportReason | null>(null)
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replySubmitting, setReplySubmitting] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const replyComposerRef = useRef<HTMLTextAreaElement>(null)
  const reportOpenRef = useRef(false)

  const sortedComments = useMemo(() => [...comments].sort((a, b) =>
    b.likes.length - a.likes.length || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  ), [comments])
  const visibleCount = totalCount ?? comments.reduce((count, comment) => count + 1 + comment.replies.length, 0)

  useEffect(() => {
    reportOpenRef.current = Boolean(reportTarget)
  }, [reportTarget])

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    function handleKeyDown(event: KeyboardEvent) {
      if (reportOpenRef.current) return
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [onClose, open])

  useEffect(() => {
    if (!newText && composerRef.current) composerRef.current.style.height = 'auto'
  }, [newText])

  useEffect(() => {
    if (!replyText && replyComposerRef.current) replyComposerRef.current.style.height = 'auto'
  }, [replyText])

  async function submitComment() {
    const text = newText.trim()
    if (!text || submitting) return
    setSubmitting(true)
    setNotice('')
    try {
      const result = reportMode && onSubmitContentReport
        ? await onSubmitContentReport(text)
        : await onAddComment(text)
      if (result !== false) {
        setNewText('')
        setReportMode(false)
        setNotice(reportMode ? 'ส่งรายงานแล้ว ขอบคุณครับ' : '')
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setSubmitting(false)
    }
  }

  async function submitReply() {
    const text = replyText.trim()
    if (!text || !onAddReply || !replyingTo || replySubmitting) return
    setReplySubmitting(true)
    try {
      const result = await onAddReply(replyingTo.commentId, text, replyingTo.name)
      if (result !== false) {
        setReplyText('')
        setReplyingTo(null)
        setExpanded((current) => new Set(current).add(replyingTo.commentId))
      }
    } finally {
      setReplySubmitting(false)
    }
  }

  function openReply(commentId: string, name: string) {
    if (!isLoggedIn) return onLogin()
    setReplyText('')
    setReplyingTo((current) => current?.commentId === commentId && current.name === name ? null : { commentId, name })
    window.setTimeout(() => replyComposerRef.current?.focus(), 0)
  }

  function openReport(commentId: string, replyId?: string) {
    if (!isLoggedIn) return onLogin()
    setReportTarget({ commentId, replyId })
  }

  function submitReport() {
    if (!reportTarget || !reportReason || !onReport) return
    onReport(reportTarget.commentId, reportReason, reportTarget.replyId)
    setReportTarget(null)
    setReportReason(null)
    setNotice('บันทึกรายงานไว้ในอุปกรณ์แล้ว')
  }

  function toggleReplies(commentId: string) {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(commentId)) next.delete(commentId)
      else next.add(commentId)
      return next
    })
  }

  function renderReply(comment: ReaderComment, reply: ReaderReply) {
    const liked = viewerId ? reply.likes.includes(viewerId) : false
    return (
      <div key={reply.id} className="group/comment flex gap-2">
        <InitialAvatar name={reply.authorName} avatarUrl={reply.avatarUrl} />
        <div className="min-w-0 flex-1">
          {reply.isAuthor && <AuthorTag />}
          <div className="flex items-center gap-[7px]">
            <strong className="truncate text-xs font-extrabold leading-[1.45] text-[#24252d]">{reply.authorName}</strong>
            <time className="shrink-0 whitespace-nowrap text-[10.5px] text-[#b0b4bf]" dateTime={reply.createdAt}>{formatDate(reply.createdAt)}</time>
            {onReport && <ReportButton onClick={() => openReport(comment.id, reply.id)} />}
          </div>
          <p className="break-words font-[Sarabun,sans-serif] text-[13px] leading-[1.55] text-[#333]">
            {reply.replyToName && <span className="mr-1 font-bold text-[#b8323f]">@{reply.replyToName}</span>}
            {reply.text}
          </p>
          {(onToggleLike || onAddReply) && (
            <div className="mt-[3px] flex flex-wrap items-center gap-x-3.5 gap-y-1">
              {onToggleLike && <button type="button" onClick={() => isLoggedIn ? onToggleLike(comment.id, reply.id) : onLogin()} className={`p-0 text-[11px] font-bold ${liked ? 'text-[#cc4452]' : 'text-[#888] hover:text-[#cc4452]'}`} aria-pressed={liked}>ถูกใจ</button>}
              {onAddReply && <button type="button" onClick={() => openReply(comment.id, reply.authorName)} className="p-0 text-[11px] font-bold text-[#888] hover:text-[#cc4452]">ตอบกลับ</button>}
              <LikeCount count={reply.likes.length} />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      {open && <button type="button" className="fixed inset-0 z-40 cursor-default bg-black/30" onClick={onClose} aria-label="ปิดความคิดเห็น" />}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reader-comment-panel-title"
        aria-describedby="reader-comment-panel-context"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-hidden border-l border-[#e7e8ee] bg-white p-5 font-[\"Noto_Sans_Thai\",sans-serif] text-[#24252d] transition-transform duration-[350ms] [transition-timing-function:cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none sm:w-[360px] ${open ? 'translate-x-0 shadow-[-4px_0_20px_rgba(0,0,0,.15)]' : 'translate-x-full'}`}
      >
        <div className="mb-3 flex shrink-0 items-center justify-between border-b border-[#e7e8ee] pb-2.5">
          <h2 id="reader-comment-panel-title" className="text-[13px] font-extrabold text-black">ความคิดเห็น {visibleCount} รายการ</h2>
          <button ref={closeRef} type="button" onClick={onClose} className="bg-transparent text-xl leading-none text-[#999] hover:text-[#cc4452]" aria-label="ปิดความคิดเห็น">×</button>
        </div>
        <p id="reader-comment-panel-context" className="sr-only">{slotLabel}</p>

        <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sortedComments.map((comment) => {
            const repliesOpen = expanded.has(comment.id)
            const liked = viewerId ? comment.likes.includes(viewerId) : false
            return (
              <article key={comment.id} className="mb-[18px]">
                <div className="group/comment flex gap-2">
                  <InitialAvatar name={comment.authorName} avatarUrl={comment.avatarUrl} />
                  <div className="min-w-0 flex-1">
                    {comment.isAuthor && <AuthorTag />}
                    <div className="flex items-center gap-[7px]">
                      <strong className="truncate text-xs font-extrabold leading-[1.45] text-[#24252d]">{comment.authorName}</strong>
                      <time className="shrink-0 whitespace-nowrap text-[10.5px] text-[#b0b4bf]" dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
                      {onReport && <ReportButton onClick={() => openReport(comment.id)} />}
                    </div>
                    <p className="break-words font-[Sarabun,sans-serif] text-[13px] leading-[1.55] text-[#333]">{comment.text}</p>
                    {(onToggleLike || onAddReply) && (
                      <div className="mt-[3px] flex flex-wrap items-center gap-x-3.5 gap-y-1">
                        {onToggleLike && <button type="button" onClick={() => isLoggedIn ? onToggleLike(comment.id) : onLogin()} className={`p-0 text-[11px] font-bold ${liked ? 'text-[#cc4452]' : 'text-[#888] hover:text-[#cc4452]'}`} aria-pressed={liked}>ถูกใจ</button>}
                        {onAddReply && <button type="button" onClick={() => openReply(comment.id, comment.authorName)} className="p-0 text-[11px] font-bold text-[#888] hover:text-[#cc4452]">ตอบกลับ</button>}
                        <LikeCount count={comment.likes.length} />
                      </div>
                    )}

                    {comment.replies.length > 0 && <RepliesToggle open={repliesOpen} count={comment.replies.length} onClick={() => toggleReplies(comment.id)} />}
                    {repliesOpen && comment.replies.length > 0 && <div className="mt-1.5 space-y-2.5">{comment.replies.map((reply) => renderReply(comment, reply))}</div>}

                    {onAddReply && replyingTo?.commentId === comment.id && (
                      <div className="-ml-10 mt-2 w-[calc(100%+2.5rem)]">
                        <div className="rounded-[14px] border border-[#e7e8ee] bg-white px-3.5 pb-2.5 pt-3">
                          <textarea
                            ref={replyComposerRef}
                            autoFocus
                            rows={1}
                            maxLength={500}
                            value={replyText}
                            onChange={(event) => { setReplyText(event.target.value); growTextarea(event.currentTarget) }}
                            onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submitReply() } }}
                            placeholder={`ตอบกลับ ${replyingTo.name}...`}
                            className="block min-h-6 max-h-[170px] w-full resize-none overflow-hidden bg-transparent px-0.5 py-1.5 text-[13.5px] leading-[1.55] text-[#333] outline-none placeholder:text-[#a5a8b1]"
                          />
                          <div className="mt-2 flex items-center justify-end gap-2 border-t border-[#f0f1f5] pt-[9px]">
                            <button type="button" onClick={() => { setReplyingTo(null); setReplyText('') }} className="min-w-[52px] rounded-[7px] border border-[#dfe1e7] bg-white px-2 py-1 text-[11px] font-semibold text-[#6b7080] hover:bg-[#f7f8fa]">ยกเลิก</button>
                            <button type="button" disabled={!replyText.trim() || replySubmitting} onClick={() => void submitReply()} className="min-w-[52px] rounded-[7px] border border-[#cc4452] bg-[#cc4452] px-2 py-1 text-[11px] font-bold text-white hover:bg-[#b23a48] disabled:cursor-not-allowed disabled:opacity-45">ส่ง</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-3.5 shrink-0 border-t border-[#e7e8ee] pt-3">
          {isLoggedIn ? (
            <div className="rounded-[14px] border border-[#e7e8ee] bg-white px-3.5 pb-2.5 pt-3">
              <textarea
                ref={composerRef}
                rows={1}
                maxLength={maxCommentLength}
                value={newText}
                onChange={(event) => { setNewText(event.target.value); growTextarea(event.currentTarget) }}
                onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submitComment() } }}
                placeholder={reportMode ? 'อธิบายเนื้อหาที่ต้องการรายงาน...' : 'เขียนความคิดเห็น...'}
                className="block min-h-6 max-h-[170px] w-full resize-none overflow-y-auto bg-transparent px-0.5 py-1.5 text-[13.5px] leading-[1.55] text-[#333] outline-none placeholder:text-[#a5a8b1]"
              />
              <div className="mt-2 flex items-center gap-[9px] border-t border-[#f0f1f5] pt-[9px]">
                {onSubmitContentReport && <>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={reportMode}
                    onClick={() => setReportMode((current) => !current)}
                    className={`relative h-[15px] w-7 shrink-0 rounded-full transition-colors ${reportMode ? 'bg-[#cc4452]' : 'bg-[#d9d9d9]'}`}
                    aria-label="ส่งเป็นรายงานเนื้อหา"
                  ><span className={`absolute top-0.5 size-[11px] rounded-full bg-white transition-[left] ${reportMode ? 'left-[15px]' : 'left-0.5'}`} /></button>
                  <span className="text-[11px] font-semibold text-[#888]">รายงาน</span>
                  <span className="-ml-1 inline-flex size-[13px] shrink-0 cursor-help items-center justify-center rounded-full border border-[#cfd3dc] font-sans text-[9px] font-bold text-[#9aa0ad]" title="เปิดเพื่อส่งข้อความนี้เป็นการรายงานเนื้อหาที่ไม่เหมาะสม" aria-label="ข้อมูลเกี่ยวกับโหมดรายงาน">?</span>
                </>}
                <span className="flex-1" />
                <button type="button" onClick={() => { setNewText(''); setReportMode(false); onClose() }} className="min-w-[52px] rounded-[7px] border border-[#dfe1e7] bg-white px-2 py-1 text-[11px] font-semibold text-[#6b7080] hover:bg-[#f7f8fa]">ยกเลิก</button>
                <button type="button" disabled={!newText.trim() || submitting} onClick={() => void submitComment()} className="min-w-[52px] rounded-[7px] border border-[#cc4452] bg-[#cc4452] px-2 py-1 text-[11px] font-bold text-white hover:bg-[#b23a48] disabled:cursor-not-allowed disabled:border-[#e8b9c0] disabled:bg-[#e8b9c0]">ส่ง</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={onLogin} className="w-full bg-transparent px-0.5 py-3 text-center text-[11px] font-semibold text-[#8a8fa0] hover:text-[#cc4452]">เข้าสู่ระบบเพื่อแสดงความคิดเห็น</button>
          )}
        </div>
      </aside>

      <Dialog open={Boolean(reportTarget)} onOpenChange={(value) => { if (!value) { setReportTarget(null); setReportReason(null) } }}>
        <DialogContent showCloseButton={false} overlayClassName="z-[70] bg-black/40 backdrop-blur-none" className="z-[80] w-[340px] max-w-[calc(100%-2.5rem)] gap-0 rounded-2xl border border-[#e3e5ea] bg-white p-5 text-[#24252d] shadow-[0_4px_20px_rgba(0,0,0,.10),0_1px_4px_rgba(0,0,0,.05)] ring-0">
          <DialogHeader className="gap-0">
            <DialogTitle className="flex items-center gap-2 text-base font-extrabold leading-normal text-[#24252d]"><TriangleAlert className="size-[19px] text-[#cc4452]" strokeWidth={1.9} />รายงานความคิดเห็น</DialogTitle>
          </DialogHeader>
          <p className="mb-3.5 mt-1 text-xs text-[#8b91a0]">เลือกเหตุผลที่ต้องการรายงาน</p>
          <div className="flex flex-col gap-[7px]">
            {REPORT_REASONS.map((reason) => (
              <button key={reason} type="button" onClick={() => setReportReason(reason)} className={`rounded-[9px] border-[1.5px] px-[13px] py-2.5 text-left text-[13px] transition-colors ${reportReason === reason ? 'border-[#cc4452] bg-[#fdeef0] font-bold text-[#cc4452]' : 'border-[#eef0f4] bg-[#f7f8fa] text-[#24252d] hover:border-[#f0c4cb] hover:bg-[#fdeef0]'}`}>{reason}</button>
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className="min-w-24 rounded-lg border border-[#dfe1e7] bg-white px-3 py-2 text-[12.5px] font-semibold text-[#6b7080]" onClick={() => { setReportTarget(null); setReportReason(null) }}>ยกเลิก</button>
            <button type="button" disabled={!reportReason} className="min-w-24 rounded-lg border border-[#cc4452] bg-[#cc4452] px-3 py-2 text-[12.5px] font-bold text-white disabled:cursor-not-allowed disabled:border-[#e8b9c0] disabled:bg-[#e8b9c0]" onClick={submitReport}>ส่งรายงาน</button>
          </div>
        </DialogContent>
      </Dialog>

      {notice && <div role="status" aria-live="polite" className="fixed bottom-10 left-1/2 z-[90] -translate-x-1/2 rounded-[10px] bg-[#2b2d3a] px-5 py-[11px] text-[13px] text-white shadow-lg">{notice}</div>}
    </>
  )
}
