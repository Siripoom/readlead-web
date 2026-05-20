'use client'

import { useState } from 'react'
import { X, Send, MessageSquare, CornerDownRight, ChevronDown, ChevronRight, Heart } from 'lucide-react'

export interface Reply {
  id: string
  author: string
  text: string
}

export type CommentType = 'normal' | 'report'

export interface Comment {
  id: string
  author: string
  text: string
  type: CommentType
  likes: number
  replies: Reply[]
}

interface Props {
  open: boolean
  onClose: () => void
  paragraphText: string
  comments: Comment[]
  onAddComment: (text: string, type: CommentType) => void
  onAddReply: (commentId: string, text: string) => void
}

function AuthorAvatar({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-semibold shrink-0">
      {name.charAt(0)}
    </span>
  )
}

export default function CommentPanel({
  open, onClose,
  paragraphText,
  comments,
  onAddComment,
  onAddReply,
}: Props) {
  const [newText, setNewText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  // track which comments have their replies expanded
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())

  function toggleLike(commentId: string) {
    setLikedComments(prev => {
      const next = new Set(prev)
      if (next.has(commentId)) next.delete(commentId)
      else next.add(commentId)
      return next
    })
  }

  function toggleRepliesExpanded(commentId: string) {
    setExpandedReplies(prev => {
      const next = new Set(prev)
      if (next.has(commentId)) next.delete(commentId)
      else next.add(commentId)
      return next
    })
  }

  function submitComment(type: CommentType = 'normal') {
    const t = newText.trim()
    if (!t) return
    onAddComment(t, type)
    setNewText('')
  }

  function submitReply(commentId: string) {
    const t = replyText.trim()
    if (!t) return
    onAddReply(commentId, t)
    setReplyText('')
    setReplyingTo(null)
    // auto-expand replies after posting
    setExpandedReplies(prev => new Set(prev).add(commentId))
  }

  function openReplyInput(id: string) {
    if (replyingTo === id) {
      setReplyingTo(null)
      setReplyText('')
    } else {
      setReplyingTo(id)
      setReplyText('')
    }
  }

  return (
    <>
      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Slide panel */}
      <div
        className={`fixed inset-y-0 right-0 z-40 flex flex-col w-80 sm:w-96 bg-background border-l shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b shrink-0">
          <MessageSquare className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold text-sm flex-1">ความคิดเห็น</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Paragraph preview */}
        {paragraphText && (
          <div className="px-4 py-2 border-b bg-muted/30 shrink-0">
            <p className="text-xs text-muted-foreground line-clamp-3 italic">
              &ldquo;{paragraphText}&rdquo;
            </p>
          </div>
        )}

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              ยังไม่มีความคิดเห็นสำหรับบรรทัดนี้
            </p>
          ) : (
            comments.map(comment => {
              const repliesOpen = expandedReplies.has(comment.id)
              const replyCount = comment.replies.length

              return (
                <div key={comment.id} className="space-y-2">
                  {/* Comment bubble */}
                  <div className={`rounded-lg px-3 py-2.5 space-y-1.5 ${
                    comment.type === 'report'
                      ? 'bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800'
                      : 'bg-muted/40'
                  }`}>
                    {/* Author row */}
                    <div className="flex items-center gap-1.5">
                      <AuthorAvatar name={comment.author} />
                      <span className="text-xs font-semibold">{comment.author}</span>
                      {comment.type === 'report' && (
                        <span className="ml-auto text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 rounded px-1.5 py-0.5">
                          รายงาน
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed pl-7">{comment.text}</p>

                    {/* Action row */}
                    <div className="flex items-center gap-3 pl-7 pt-0.5">
                      {/* Like */}
                      <button
                        type="button"
                        onClick={() => toggleLike(comment.id)}
                        className={`flex items-center gap-1 text-xs transition-colors ${likedComments.has(comment.id) ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'}`}
                      >
                        <Heart className={`h-3 w-3 ${likedComments.has(comment.id) ? 'fill-current' : ''}`} />
                        {comment.likes + (likedComments.has(comment.id) ? 1 : 0) || ''}
                      </button>

                      {/* Reply input toggle */}
                      <button
                        type="button"
                        onClick={() => openReplyInput(comment.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <CornerDownRight className="h-3 w-3" />
                        {replyingTo === comment.id ? 'ยกเลิก' : 'ตอบกลับ'}
                      </button>

                      {/* Expand/collapse replies */}
                      {replyCount > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleRepliesExpanded(comment.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          {repliesOpen
                            ? <><ChevronDown className="h-3 w-3" />ซ่อน {replyCount} การตอบกลับ</>
                            : <><ChevronRight className="h-3 w-3" />แสดง {replyCount} การตอบกลับ</>}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Replies (collapsible) */}
                  {replyCount > 0 && repliesOpen && (
                    <div className="ml-4 space-y-2">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="flex gap-2">
                          <div className="w-px bg-border shrink-0 mt-2 mb-2" />
                          <div className="rounded-lg bg-background border px-3 py-2.5 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <AuthorAvatar name={reply.author} />
                              <span className="text-xs font-semibold">{reply.author}</span>
                            </div>
                            <p className="text-sm leading-relaxed pl-7">{reply.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply input */}
                  {replyingTo === comment.id && (
                    <div className="ml-4 flex items-end gap-2">
                      <textarea
                        autoFocus
                        rows={2}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            submitReply(comment.id)
                          }
                        }}
                        placeholder="ตอบกลับ..."
                        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => submitReply(comment.id)}
                        disabled={!replyText.trim()}
                        className="p-2 rounded-md bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* New comment input */}
        <div className="border-t px-4 py-3 shrink-0 space-y-2">
          <textarea
            rows={2}
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submitComment()
              }
            }}
            placeholder="เขียนความคิดเห็น... (Enter เพื่อส่ง)"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => submitComment('normal')}
              disabled={!newText.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 transition-opacity"
            >
              <Send className="h-3.5 w-3.5" />
              ส่งความคิดเห็น
            </button>
            <button
              type="button"
              onClick={() => submitComment('report')}
              disabled={!newText.trim()}
              title="รายงานถึงแอดมิน"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-red-600 text-white text-sm font-medium disabled:opacity-40 transition-opacity hover:bg-red-700"
            >
              <Send className="h-3.5 w-3.5" />
              รายงาน
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
