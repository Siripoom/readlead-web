'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronRight, CornerDownRight, Flag, Heart, MessageSquare, Send, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ReaderComment, ReaderReportReason } from '@/lib/reader-repository'

interface Props {
  open: boolean
  onClose: () => void
  slotLabel: string
  comments: ReaderComment[]
  isLoggedIn: boolean
  viewerId: string | null
  onLogin: () => void
  onAddComment: (text: string) => void
  onAddReply: (commentId: string, text: string) => void
  onToggleLike: (commentId: string, replyId?: string) => void
  onReport: (commentId: string, reason: ReaderReportReason) => void
}

const REPORT_REASONS: ReaderReportReason[] = [
  'คำหยาบคาย / ไม่สุภาพ',
  'สแปม / โฆษณา',
  'เนื้อหาไม่เหมาะสม',
  'คุกคาม / ก่อกวน',
  'สปอยล์เนื้อหา',
  'อื่น ๆ',
]

function InitialAvatar({ name }: { name: string }) {
  return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-extrabold text-primary" aria-hidden>{name.charAt(0) || '?'}</span>
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value))
}

export default function CommentPanel({
  open,
  onClose,
  slotLabel,
  comments,
  isLoggedIn,
  viewerId,
  onLogin,
  onAddComment,
  onAddReply,
  onToggleLike,
  onReport,
}: Props) {
  const [newText, setNewText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [reportTarget, setReportTarget] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState<ReaderReportReason | null>(null)
  const [localNotice, setLocalNotice] = useState('')
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const reportOpenRef = useRef(false)

  const sortedComments = useMemo(() => [...comments].sort((a, b) =>
    b.likes.length - a.likes.length || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  ), [comments])

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

  function submitComment() {
    const text = newText.trim()
    if (!text) return
    onAddComment(text)
    setNewText('')
  }

  function submitReply(commentId: string) {
    const text = replyText.trim()
    if (!text) return
    onAddReply(commentId, text)
    setReplyText('')
    setReplyingTo(null)
    setExpanded((current) => new Set(current).add(commentId))
  }

  function submitReport() {
    if (!reportTarget || !reportReason) return
    onReport(reportTarget, reportReason)
    setReportTarget(null)
    setReportReason(null)
    setLocalNotice('บันทึกรายงานไว้ในอุปกรณ์แล้ว และยังไม่ได้ส่งถึงผู้ดูแล')
  }

  return (
    <>
      {open && <button type="button" className="fixed inset-0 z-40 cursor-default bg-black/30" onClick={onClose} aria-label="ปิดความคิดเห็น" />}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="ความคิดเห็น"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[380px] flex-col border-l bg-background shadow-2xl transition-transform duration-300 motion-reduce:transition-none ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center gap-2 border-b px-5 py-4">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h2 className="min-w-0 flex-1 truncate text-sm font-extrabold">ความคิดเห็น {comments.length} รายการ</h2>
          <button ref={closeRef} type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="ปิดความคิดเห็น">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="line-clamp-3 border-b bg-muted/30 px-5 py-3 text-xs leading-relaxed text-muted-foreground">{slotLabel}</p>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {sortedComments.length === 0 ? (
            <div className="py-14 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-semibold">ยังไม่มีความคิดเห็น</p>
              <p className="mt-1 text-xs text-muted-foreground">เริ่มบทสนทนาสำหรับส่วนนี้ได้เลย</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedComments.map((comment) => {
                const repliesOpen = expanded.has(comment.id)
                const liked = viewerId ? comment.likes.includes(viewerId) : false
                return (
                  <article key={comment.id} className="flex gap-2.5">
                    <InitialAvatar name={comment.authorName} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <strong className="truncate text-xs">{comment.authorName}</strong>
                        {comment.isAuthor && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">ผู้เขียน</span>}
                        <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{formatDate(comment.createdAt)}</span>
                        <button
                          type="button"
                          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                          onClick={() => isLoggedIn ? setReportTarget(comment.id) : onLogin()}
                          aria-label="รายงานความคิดเห็น"
                        ><Flag className="h-3.5 w-3.5" /></button>
                      </div>
                      <p className="mt-1 break-words text-sm leading-relaxed">{comment.text}</p>
                      <div className="mt-2 flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => isLoggedIn ? onToggleLike(comment.id) : onLogin()}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${liked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                          aria-pressed={liked}
                        ><Heart className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} /> ถูกใจ {comment.likes.length || ''}</button>
                        <button
                          type="button"
                          onClick={() => isLoggedIn ? setReplyingTo((current) => current === comment.id ? null : comment.id) : onLogin()}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-primary"
                        ><CornerDownRight className="h-3.5 w-3.5" /> ตอบกลับ</button>
                        {comment.replies.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setExpanded((current) => {
                              const next = new Set(current)
                              if (next.has(comment.id)) next.delete(comment.id); else next.add(comment.id)
                              return next
                            })}
                            className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-primary"
                          >{repliesOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />} {comment.replies.length} การตอบกลับ</button>
                        )}
                      </div>

                      {replyingTo === comment.id && (
                        <div className="mt-3 flex items-end gap-2">
                          <textarea
                            autoFocus
                            rows={2}
                            maxLength={500}
                            value={replyText}
                            onChange={(event) => setReplyText(event.target.value)}
                            placeholder={`ตอบกลับ ${comment.authorName}`}
                            className="min-w-0 flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          <button type="button" disabled={!replyText.trim()} onClick={() => submitReply(comment.id)} className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40" aria-label="ส่งการตอบกลับ"><Send className="h-4 w-4" /></button>
                        </div>
                      )}

                      {repliesOpen && comment.replies.length > 0 && (
                        <div className="mt-4 space-y-4 border-l pl-3">
                          {comment.replies.map((reply) => {
                            const replyLiked = viewerId ? reply.likes.includes(viewerId) : false
                            return (
                              <div key={reply.id} className="flex gap-2">
                                <InitialAvatar name={reply.authorName} />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5"><strong className="truncate text-xs">{reply.authorName}</strong>{reply.isAuthor && <span className="text-[9px] font-bold text-primary">ผู้เขียน</span>}<span className="ml-auto text-[10px] text-muted-foreground">{formatDate(reply.createdAt)}</span></div>
                                  <p className="mt-1 break-words text-sm leading-relaxed">{reply.replyToName && <span className="mr-1 font-bold text-primary">@{reply.replyToName}</span>}{reply.text}</p>
                                  <button type="button" onClick={() => isLoggedIn ? onToggleLike(comment.id, reply.id) : onLogin()} className={`mt-1 inline-flex items-center gap-1 text-[11px] ${replyLiked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`} aria-pressed={replyLiked}><Heart className={`h-3 w-3 ${replyLiked ? 'fill-current' : ''}`} /> {reply.likes.length || 'ถูกใจ'}</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t p-4">
          {localNotice && <p role="status" className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">{localNotice}</p>}
          {isLoggedIn ? (
            <div className="flex items-end gap-2">
              <textarea
                rows={2}
                maxLength={500}
                value={newText}
                onChange={(event) => setNewText(event.target.value)}
                placeholder="เขียนความคิดเห็น..."
                className="min-w-0 flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button type="button" disabled={!newText.trim()} onClick={submitComment} className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40" aria-label="ส่งความคิดเห็น"><Send className="h-4 w-4" /></button>
            </div>
          ) : (
            <button type="button" onClick={onLogin} className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">เข้าสู่ระบบเพื่อแสดงความคิดเห็น</button>
          )}
        </div>
      </aside>

      <Dialog open={Boolean(reportTarget)} onOpenChange={(value) => { if (!value) { setReportTarget(null); setReportReason(null) } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Flag className="h-5 w-5 text-destructive" />รายงานความคิดเห็น</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">เลือกเหตุผลที่ต้องการบันทึกรายงาน</p>
          <div className="grid gap-2">
            {REPORT_REASONS.map((reason) => (
              <button key={reason} type="button" onClick={() => setReportReason(reason)} className={`rounded-lg border px-3 py-2 text-left text-sm ${reportReason === reason ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-muted'}`}>{reason}</button>
            ))}
          </div>
          <p className="rounded-lg bg-amber-50 p-2 text-[11px] leading-relaxed text-amber-800">ระบบยังไม่มี API รายงาน รายการนี้จะถูกเก็บเป็น local pending ในอุปกรณ์นี้เท่านั้น</p>
          <div className="flex justify-end gap-2"><button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setReportTarget(null)}>ยกเลิก</button><button type="button" disabled={!reportReason} className="rounded-lg bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground disabled:opacity-40" onClick={submitReport}>บันทึกรายงาน</button></div>
        </DialogContent>
      </Dialog>
    </>
  )
}
