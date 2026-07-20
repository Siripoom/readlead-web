'use client'

import { startTransition, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, Bookmark, ChevronDown, ChevronRight, Clock, Crown, Eye, Headphones, MessageCircle, MoreHorizontal, Pencil, Reply, Share2, Star, Ticket, ThumbsDown, ThumbsUp, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import DonateModal from '@/components/modals/DonateModal'
import PurchaseEpisodeModal from '@/components/modals/PurchaseEpisodeModal'
import { useRole } from '@/contexts/RoleContext'
import { useProfile } from '@/contexts/ProfileContext'
import { localProfileRepository, purchaseStorageKey, recordEpisodePurchase, shelfStorageKey } from '@/lib/profile-repository'
import { localReaderRepository } from '@/lib/reader-repository'
import type { DetailCatalogItem, DetailEpisode, DetailReview } from '@/lib/detail-catalog'
import styles from './DetailLanding.module.css'

const VOTE_KEY = 'rl_ranking_votes_v1'
const DAILY_MAX = 15
const MONTHLY_MAX = 30
const CHAPTER_GROUP_SIZE = 20
type VoteKind = 'daily' | 'monthly'
type Ledger = { dailyKey: string; monthlyKey: string; dailyUsed: number; monthlyUsed: number; bonuses: Record<string, { daily: number; monthly: number }> }
type ServerTickets = { daily: { allowance: number; used: number; balance: number; resetsAt: string }; monthly: { balance: number } }
type ApiReview = {
  id: string; userId: string; workId: string; rating: number; body: string; recommended: boolean; spoiler: boolean; likes: number; dislikes: number; viewerReaction?: 'like' | 'dislike' | null; createdAt: string; updatedAt: string
  user: { id: string; name: string }
  replies: Array<{ id: string; userId: string; body: string; createdAt: string; updatedAt: string; user: { id: string; name: string } }>
}
type ChapterGroup = { index: number; start: number; end: number; episodes: DetailEpisode[] }

const todayKey = () => new Date().toLocaleDateString('en-CA')
const monthKey = () => todayKey().slice(0, 7)
const defaultLedger = (): Ledger => ({ dailyKey: todayKey(), monthlyKey: monthKey(), dailyUsed: 12, monthlyUsed: 23, bonuses: {} })
const fmt = (value: number) => value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : value >= 1_000 ? value.toLocaleString('en-US') : String(value)
const typeLabel = (type: DetailCatalogItem['type']) => type === 'novel' ? 'นิยาย' : type === 'manga' ? 'เว็บตูน' : 'หนังสือเสียง'
const routeForType = (type: DetailCatalogItem['type']) => type === 'novel' ? '/novel' : type === 'manga' ? '/manga' : '/audiobook'
const formatEpisodeDate = (value: string | null) => value ? new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : ''
const audioDuration = (episode: DetailEpisode) => `${12 + (episode.episodeNum % 8)}:00`

function mapApiReview(review: ApiReview): DetailReview {
  return {
    id: review.id,
    detailId: review.workId,
    userId: review.userId,
    authorName: review.user.name,
    rating: review.rating,
    body: review.body,
    recommended: review.recommended,
    spoiler: review.spoiler,
    likes: review.likes,
    dislikes: review.dislikes,
    viewerReaction: review.viewerReaction ?? null,
    replies: review.replies.map((reply) => ({ id: reply.id, userId: reply.userId, authorName: reply.user.name, body: reply.body, createdAt: reply.createdAt, updatedAt: +new Date(reply.updatedAt) > +new Date(reply.createdAt) + 1000 ? reply.updatedAt : undefined })),
    createdAt: review.createdAt,
    updatedAt: +new Date(review.updatedAt) > +new Date(review.createdAt) + 1000 ? review.updatedAt : undefined,
  }
}

function countEpisodeComments(workId: string, episodeId: string) {
  const slots = localReaderRepository.getEpisodeComments(workId, episodeId)
  return Object.values(slots).reduce((total, comments) => total + comments.reduce((slotTotal, comment) => slotTotal + 1 + comment.replies.length, 0), 0)
}

function seededReviews(work: DetailCatalogItem): DetailReview[] {
  return [
    { id: `seed-${work.detailId}-1`, detailId: work.detailId, userId: 'reader-1', authorName: 'นักอ่านใต้แสงจันทร์', rating: 5, body: 'เล่าเรื่องดีมาก จังหวะพอดีและตัวละครมีเสน่ห์ รอติดตามตอนต่อไปเลยค่ะ', recommended: true, spoiler: false, likes: 18, dislikes: 1, replies: [], createdAt: '2026-07-14T09:20:00Z' },
    { id: `seed-${work.detailId}-2`, detailId: work.detailId, userId: 'reader-2', authorName: 'กระดาษสีคราม', rating: 4, body: 'ช่วงกลางตอนมีจุดพลิกที่คาดไม่ถึง ความสัมพันธ์ของตัวละครกำลังเข้มข้นขึ้นมาก', recommended: true, spoiler: true, likes: 9, dislikes: 0, replies: [], createdAt: '2026-07-12T14:05:00Z' },
  ]
}

export function DetailLanding({ work, episodes, related, initialReviews, serverBacked = false }: { work: DetailCatalogItem; episodes: DetailEpisode[]; related: DetailCatalogItem[]; initialReviews?: DetailReview[]; serverBacked?: boolean }) {
  const router = useRouter()
  const comingSoon = work.availability === 'coming_soon'
  const { isLoggedIn, user } = useRole()
  const { profile } = useProfile()
  const [followed, setFollowed] = useState(false)
  const [shelved, setShelved] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [notice, setNotice] = useState('')
  const [ledger, setLedger] = useState<Ledger>(defaultLedger)
  const [ledgerReady, setLedgerReady] = useState(false)
  const [serverTickets, setServerTickets] = useState<ServerTickets | null>(null)
  const [voteBusy, setVoteBusy] = useState(false)
  const [voteOpen, setVoteOpen] = useState(false)
  const [voteKind, setVoteKind] = useState<VoteKind>('daily')
  const [voteAmount, setVoteAmount] = useState(1)
  const [donateOpen, setDonateOpen] = useState(false)
  const [tipTotal, setTipTotal] = useState(0)
  const [reviews, setReviews] = useState<DetailReview[]>(() => initialReviews ?? seededReviews(work))
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(5)
  const [recommend, setRecommend] = useState(true)
  const [spoiler, setSpoiler] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [reviewBusy, setReviewBusy] = useState<string | null>(null)
  const [reviewSort, setReviewSort] = useState<'new' | 'old'>('new')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewsExpanded, setReviewsExpanded] = useState(false)
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set())
  const [openReplies, setOpenReplies] = useState<Set<string>>(new Set())
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [openChapterGroups, setOpenChapterGroups] = useState<Set<number>>(() => new Set([0]))
  const [episodeCommentCounts, setEpisodeCommentCounts] = useState<Record<string, number>>({})
  const [purchased, setPurchased] = useState<Set<string>>(new Set())
  const [purchaseEpisode, setPurchaseEpisode] = useState<DetailEpisode | null>(null)
  const [fanMode, setFanMode] = useState<'month' | 'all'>('month')
  const [fanKind, setFanKind] = useState<'daily' | 'monthly' | 'tip'>('daily')
  const [fanOpen, setFanOpen] = useState(false)
  const [coverFailed, setCoverFailed] = useState(false)

  useEffect(() => {
    if (serverBacked) {
      startTransition(() => {
        setLedgerReady(true)
        setReviews(initialReviews ?? [])
        setServerTickets(null)
        setOpenChapterGroups(new Set(episodes.length ? [0] : []))
      })
      if (comingSoon) return
      void fetch(`/api/catalog/works/${encodeURIComponent(work.detailId)}/view`, { method: 'POST' })
      if (user) {
        const controller = new AbortController()
        void fetch(`/api/interactions/state?workId=${encodeURIComponent(work.detailId)}`, { cache: 'no-store', signal: controller.signal })
          .then(async (response) => {
            const data = await response.json().catch(() => ({})) as { tickets?: ServerTickets; totals?: { daily: number; monthly: number }; review?: ApiReview | null; reviewReactions?: Record<string, 'like' | 'dislike'>; error?: string }
            if (!response.ok || !data.tickets) throw new Error(data.error || 'state')
            startTransition(() => {
              setServerTickets(data.tickets ?? null)
              setLedger((current) => ({
                ...current,
                bonuses: {
                  ...current.bonuses,
                  [work.detailId]: {
                    daily: Math.max(0, (data.totals?.daily ?? work.voteCount) - work.voteCount),
                    monthly: Math.max(0, (data.totals?.monthly ?? work.weeklyVoteCount) - work.weeklyVoteCount),
                  },
                },
              }))
              const base = initialReviews ?? []
              const merged = base.map((review) => ({ ...review, viewerReaction: data.reviewReactions?.[review.id] ?? null }))
              if (data.review) {
                const own = mapApiReview(data.review)
                setReviews([own, ...merged.filter((review) => review.id !== own.id && review.userId !== own.userId)])
              } else setReviews(merged)
            })
          })
          .catch((error) => { if (error instanceof Error && error.name !== 'AbortError') setNotice('ไม่สามารถโหลดยอดตั๋วล่าสุดได้') })
        return () => controller.abort()
      }
      return
    }
    try {
      const stored = JSON.parse(localStorage.getItem(VOTE_KEY) ?? 'null') as Ledger | null
      const next = stored ? {
        ...stored,
        dailyKey: todayKey(), monthlyKey: monthKey(),
        dailyUsed: stored.dailyKey === todayKey() ? stored.dailyUsed : 0,
        monthlyUsed: stored.monthlyKey === monthKey() ? stored.monthlyUsed : 0,
      } : defaultLedger()
      const savedReviews = JSON.parse(localStorage.getItem(`rl_detail_reviews:${work.detailId}`) ?? 'null') as DetailReview[] | null
      const purchasesKey = user ? purchaseStorageKey(user.id) : 'rl_purchases'
      const shelfKey = user ? shelfStorageKey(user.id) : 'rl_ranking_shelf'
      const savedPurchases = JSON.parse(localStorage.getItem(purchasesKey) ?? localStorage.getItem('rl_purchases') ?? '[]') as string[]
      const savedShelf = JSON.parse(localStorage.getItem(shelfKey) ?? localStorage.getItem('rl_ranking_shelf') ?? '[]') as string[]
      const supportLogs = JSON.parse(localStorage.getItem('rl_detail_support_v1') ?? '[]') as Array<{ detailId?: string; amount?: number }>
      startTransition(() => {
        setLedger(next); setLedgerReady(true)
        setFollowed(user ? localProfileRepository.isFollowing(user.id, work.authorId) : false)
        setShelved(localStorage.getItem(`rl_detail_shelf:${work.detailId}`) === '1' || savedShelf.includes(work.detailId))
        setReviews(savedReviews ?? seededReviews(work))
        setPurchased(new Set(savedPurchases))
        setTipTotal(supportLogs.filter((log) => log.detailId === work.detailId).reduce((sum, log) => sum + (log.amount ?? 0), 0))
      })
    } catch { startTransition(() => setLedgerReady(true)) }
  }, [comingSoon, episodes.length, initialReviews, serverBacked, user, work])

  useEffect(() => { if (ledgerReady && !serverBacked) localStorage.setItem(VOTE_KEY, JSON.stringify(ledger)) }, [ledger, ledgerReady, serverBacked])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 2400); return () => window.clearTimeout(timer) }, [notice])
  useEffect(() => {
    if (serverBacked) {
      startTransition(() => {
        setEpisodeCommentCounts(Object.fromEntries(episodes.map((episode) => [episode.id, 0])))
        setOpenChapterGroups(new Set(episodes.length ? [0] : []))
      })
      return
    }
    const counts = Object.fromEntries(episodes.map((episode) => [episode.id, countEpisodeComments(work.id, episode.id)]))
    startTransition(() => {
      setEpisodeCommentCounts(counts)
      setOpenChapterGroups(new Set(episodes.length ? [0] : []))
    })
  }, [episodes, serverBacked, work.id])

  const bonus = ledger.bonuses[work.detailId] ?? { daily: 0, monthly: 0 }
  const availableTickets = (kind: VoteKind) => serverBacked
    ? (kind === 'daily' ? serverTickets?.daily.balance ?? 0 : serverTickets?.monthly.balance ?? 0)
    : Math.max(0, (kind === 'daily' ? DAILY_MAX - ledger.dailyUsed : MONTHLY_MAX - ledger.monthlyUsed))
  const sortedEpisodes = useMemo(() => [...episodes].sort((a, b) => a.episodeNum - b.episodeNum), [episodes])
  const chapterGroups = useMemo<ChapterGroup[]>(() => {
    const buckets = new Map<number, DetailEpisode[]>()
    sortedEpisodes.forEach((episode) => {
      const groupIndex = Math.max(0, Math.floor((episode.episodeNum - 1) / CHAPTER_GROUP_SIZE))
      buckets.set(groupIndex, [...(buckets.get(groupIndex) ?? []), episode])
    })
    const maximumEpisode = sortedEpisodes.at(-1)?.episodeNum ?? 0
    return [...buckets.entries()].sort(([a], [b]) => a - b).map(([index, groupEpisodes]) => {
      const start = index * CHAPTER_GROUP_SIZE + 1
      return { index, start, end: Math.min(start + CHAPTER_GROUP_SIZE - 1, maximumEpisode), episodes: groupEpisodes }
    })
  }, [sortedEpisodes])
  const newestEpisode = useMemo(() => [...sortedEpisodes].reverse().find((episode) => episode.status === 'published'), [sortedEpisodes])
  const sortedReviews = useMemo(() => [...reviews].sort((a, b) => reviewSort === 'new' ? +new Date(b.createdAt) - +new Date(a.createdAt) : +new Date(a.createdAt) - +new Date(b.createdAt)), [reviews, reviewSort])
  const visibleReviews = reviewsExpanded ? sortedReviews : sortedReviews.slice(0, 3)
  const fans = useMemo(() => ['มะลิในสายฝน','เจ้าหญิงชาเย็น','Bookworm99','ดาวเหนือ','คุณนักอ่าน'].map((name, index) => ({ name, score: (fanMode === 'month' ? 820 : 3280) - index * 137 + (fanKind === 'tip' ? 200 : fanKind === 'monthly' ? 80 : 0) })), [fanMode, fanKind])

  function requireLogin(action: () => void) { if (!isLoggedIn) { router.push('/login'); return } action() }
  function togglePersist(kind: 'follow' | 'shelf', value: boolean) { requireLogin(() => {
    if (serverBacked) {
      void fetch(`/api/interactions/${kind}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(kind === 'follow' ? { creatorId: work.authorId } : { workId: work.detailId }) }).then(async (response) => {
        const data = await response.json().catch(() => ({})) as { active?: boolean; error?: string }
        if (!response.ok) { setNotice(data.error || 'ดำเนินการไม่สำเร็จ'); return }
        if (kind === 'follow') setFollowed(Boolean(data.active)); else setShelved(Boolean(data.active))
      })
      return
    }
    if (kind === 'follow') { if (user) setFollowed(localProfileRepository.toggleFollow(user.id, work.authorId)); return }
    const next = !value; setShelved(next); const key = user ? shelfStorageKey(user.id) : 'rl_ranking_shelf'; const shelf = new Set(JSON.parse(localStorage.getItem(key) ?? localStorage.getItem('rl_ranking_shelf') ?? '[]') as string[]); if (next) shelf.add(work.detailId); else shelf.delete(work.detailId); localStorage.setItem(key, JSON.stringify([...shelf]))
  }) }
  async function share() { const url = window.location.href; try { if (navigator.share) await navigator.share({ title: work.title, text: work.synopsis, url }); else { await navigator.clipboard.writeText(url); setNotice('คัดลอกลิงก์แล้ว') } } catch { setNotice('ยกเลิกการแชร์') } }
  function openVote(kind: VoteKind) { requireLogin(() => { setVoteKind(kind); setVoteAmount(1); setVoteOpen(true) }) }
  async function submitVote() {
    const remaining = availableTickets(voteKind)
    const amount = Math.max(1, Math.min(voteAmount, remaining))
    if (remaining <= 0) { setNotice('ตั๋วประเภทนี้ไม่เพียงพอ'); return }
    if (serverBacked) {
      setVoteBusy(true)
      try {
        const response = await fetch('/api/interactions/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workId: work.detailId, kind: voteKind, amount, requestId: crypto.randomUUID() }) })
        const data = await response.json().catch(() => ({})) as { tickets?: ServerTickets; totals?: { daily: number; monthly: number }; error?: string }
        if (!response.ok || !data.tickets || !data.totals) { if (data.tickets) setServerTickets(data.tickets); setNotice(data.error || 'โหวตไม่สำเร็จ'); return }
        setServerTickets(data.tickets)
        setLedger((current) => ({ ...current, bonuses: { ...current.bonuses, [work.detailId]: { daily: Math.max(0, data.totals!.daily - work.voteCount), monthly: Math.max(0, data.totals!.monthly - work.weeklyVoteCount) } } }))
        setVoteOpen(false); setNotice(`โหวตให้ ${work.title} ${amount} ใบแล้ว`); return
      } catch { setNotice('เชื่อมต่อระบบโหวตไม่สำเร็จ') } finally { setVoteBusy(false) }
    }
    setLedger((current) => ({ ...current, dailyUsed: current.dailyUsed + (voteKind === 'daily' ? amount : 0), monthlyUsed: current.monthlyUsed + (voteKind === 'monthly' ? amount : 0), bonuses: { ...current.bonuses, [work.detailId]: { ...(current.bonuses[work.detailId] ?? { daily: 0, monthly: 0 }), [voteKind]: (current.bonuses[work.detailId]?.[voteKind] ?? 0) + amount } } }))
    setVoteOpen(false); setNotice(`โหวตให้ ${work.title} ${amount} ใบแล้ว`)
  }
  function persistReviews(next: DetailReview[]) { setReviews(next); if (!serverBacked) localStorage.setItem(`rl_detail_reviews:${work.detailId}`, JSON.stringify(next)) }
  function resetReviewComposer() { setReviewText(''); setRating(5); setRecommend(true); setSpoiler(false); setEditingReviewId(null); setShowReviewForm(false) }
  function addReview() { requireLogin(() => { void submitReview() }) }
  async function submitReview() {
    if (!reviewText.trim()) return
    if (serverBacked) {
      setReviewBusy(editingReviewId ?? 'new')
      try {
        const response = await fetch('/api/interactions/review', { method: editingReviewId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...(editingReviewId ? { id: editingReviewId } : { workId: work.detailId }), rating, body: reviewText.trim(), recommended: recommend, spoiler }) })
        const data = await response.json().catch(() => ({})) as { review?: ApiReview; error?: string }
        if (!response.ok || !data.review) { setNotice(data.error || 'ส่งรีวิวไม่สำเร็จ'); return }
        const next = mapApiReview(data.review)
        setReviews((current) => [next, ...current.filter((item) => item.id !== next.id && item.userId !== next.userId)])
        resetReviewComposer(); setReviewSort('new'); setReviewsExpanded(false); setNotice(editingReviewId ? 'แก้ไขรีวิวแล้ว' : 'เผยแพร่รีวิวแล้ว')
      } catch { setNotice('เชื่อมต่อระบบรีวิวไม่สำเร็จ') } finally { setReviewBusy(null) }
      return
    }
    const next: DetailReview = { id: crypto.randomUUID(), detailId: work.detailId, userId: user?.id ?? 'current-user', authorName: profile.displayName, rating, body: reviewText.trim(), recommended: recommend, spoiler, likes: 0, dislikes: 0, replies: [], createdAt: new Date().toISOString() }; persistReviews([next, ...reviews]); resetReviewComposer(); setReviewSort('new'); setReviewsExpanded(false); setNotice('เผยแพร่รีวิวแล้ว')
  }
  function editReview(review: DetailReview) {
    if (!serverBacked) { const body = window.prompt('แก้ไขรีวิว', review.body)?.trim(); if (body) persistReviews(reviews.map((item) => item.id === review.id ? { ...item, body, updatedAt: new Date().toISOString() } : item)); return }
    setEditingReviewId(review.id); setReviewText(review.body); setRating(review.rating); setRecommend(review.recommended); setSpoiler(review.spoiler); setShowReviewForm(true)
  }
  async function deleteReview(id: string) {
    if (!window.confirm('ลบรีวิวนี้หรือไม่?')) return
    if (!serverBacked) { persistReviews(reviews.filter((item) => item.id !== id)); return }
    const previous = reviews
    setReviews((current) => current.filter((item) => item.id !== id)); setReviewBusy(id)
    try {
      const response = await fetch('/api/interactions/review', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      const data = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) { setReviews(previous); setNotice(data.error || 'ลบรีวิวไม่สำเร็จ'); return }
      if (editingReviewId === id) resetReviewComposer(); setNotice('ลบรีวิวแล้ว')
    } catch { setReviews(previous); setNotice('เชื่อมต่อระบบรีวิวไม่สำเร็จ') } finally { setReviewBusy(null) }
  }
  async function reactReview(id: string, kind: 'likes' | 'dislikes') {
    if (!serverBacked) { persistReviews(reviews.map((item) => item.id === id ? { ...item, [kind]: item[kind] + 1 } : item)); return }
    if (!isLoggedIn) { router.push('/login'); return }
    const previous = reviews
    const reactionKind = kind === 'likes' ? 'like' : 'dislike'
    setReviews((current) => current.map((item) => {
      if (item.id !== id) return item
      const nextReaction = item.viewerReaction === reactionKind ? null : reactionKind
      return { ...item, likes: Math.max(0, item.likes + (nextReaction === 'like' ? 1 : 0) - (item.viewerReaction === 'like' ? 1 : 0)), dislikes: Math.max(0, item.dislikes + (nextReaction === 'dislike' ? 1 : 0) - (item.viewerReaction === 'dislike' ? 1 : 0)), viewerReaction: nextReaction }
    }))
    try {
      const response = await fetch('/api/interactions/review-reaction', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reviewId: id, kind: reactionKind }) })
      const data = await response.json().catch(() => ({})) as { reaction?: { likes: number; dislikes: number; viewerReaction: 'like' | 'dislike' | null }; error?: string }
      if (!response.ok || !data.reaction) { setReviews(previous); setNotice(data.error || 'บันทึกปฏิกิริยาไม่สำเร็จ'); return }
      setReviews((current) => current.map((item) => item.id === id ? { ...item, ...data.reaction } : item))
    } catch { setReviews(previous); setNotice('เชื่อมต่อระบบรีวิวไม่สำเร็จ') }
  }
  function toggleReviewSet(setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) { setter((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next }) }
  function startReply(reviewId: string) { requireLogin(() => { setReplyingTo((current) => current === reviewId ? null : reviewId); setReplyText('') }) }
  async function submitReply(reviewId: string) {
    const body = replyText.trim()
    if (!body) return
    if (serverBacked) {
      setReviewBusy(`reply:${reviewId}`)
      try {
        const response = await fetch('/api/interactions/review-reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reviewId, body }) })
        const data = await response.json().catch(() => ({})) as { reply?: { id: string; userId: string; body: string; createdAt: string; updatedAt: string; user: { name: string } }; error?: string }
        if (!response.ok || !data.reply) { setNotice(data.error || 'ส่งคำตอบไม่สำเร็จ'); return }
        setReviews((current) => current.map((item) => item.id === reviewId ? { ...item, replies: [...item.replies, { id: data.reply!.id, userId: data.reply!.userId, authorName: data.reply!.user.name, body: data.reply!.body, createdAt: data.reply!.createdAt, updatedAt: data.reply!.updatedAt }] } : item))
      } catch { setNotice('เชื่อมต่อระบบรีวิวไม่สำเร็จ'); return } finally { setReviewBusy(null) }
    } else persistReviews(reviews.map((item) => item.id === reviewId ? { ...item, replies: [...item.replies, { id: crypto.randomUUID(), userId: user?.id ?? 'current-user', authorName: profile.displayName, body, createdAt: new Date().toISOString() }] } : item))
    setOpenReplies((current) => new Set(current).add(reviewId)); setReplyingTo(null); setReplyText(''); setNotice('ส่งคำตอบแล้ว')
  }
  async function editReply(reviewId: string, replyId: string, currentBody: string) {
    const body = window.prompt('แก้ไขคำตอบ', currentBody)?.trim()
    if (!body) return
    if (serverBacked) {
      const response = await fetch('/api/interactions/review-reply', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: replyId, body }) })
      const data = await response.json().catch(() => ({})) as { reply?: { body: string; updatedAt: string }; error?: string }
      if (!response.ok || !data.reply) { setNotice(data.error || 'แก้ไขคำตอบไม่สำเร็จ'); return }
      setReviews((current) => current.map((review) => review.id === reviewId ? { ...review, replies: review.replies.map((reply) => reply.id === replyId ? { ...reply, body: data.reply!.body, updatedAt: data.reply!.updatedAt } : reply) } : review))
    } else persistReviews(reviews.map((review) => review.id === reviewId ? { ...review, replies: review.replies.map((reply) => reply.id === replyId ? { ...reply, body, updatedAt: new Date().toISOString() } : reply) } : review))
    setNotice('แก้ไขคำตอบแล้ว')
  }
  async function deleteReply(reviewId: string, replyId: string) {
    if (!window.confirm('ลบคำตอบนี้หรือไม่?')) return
    const previous = reviews
    setReviews((current) => current.map((review) => review.id === reviewId ? { ...review, replies: review.replies.filter((reply) => reply.id !== replyId) } : review))
    if (serverBacked) {
      const response = await fetch('/api/interactions/review-reply', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: replyId }) })
      const data = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) { setReviews(previous); setNotice(data.error || 'ลบคำตอบไม่สำเร็จ'); return }
    } else persistReviews(reviews.map((review) => review.id === reviewId ? { ...review, replies: review.replies.filter((reply) => reply.id !== replyId) } : review))
    setNotice('ลบคำตอบแล้ว')
  }
  function toggleChapterGroup(index: number) { setOpenChapterGroups((current) => { const next = new Set(current); if (next.has(index)) next.delete(index); else next.add(index); return next }) }
  function openEpisode(episode: DetailEpisode) { if (episode.status === 'scheduled') { setNotice(`ตอนนี้จะเผยแพร่ ${formatEpisodeDate(episode.publishedAt)}`); return } const unlocked = episode.price === 0 || purchased.has(episode.id); if (unlocked) router.push(`/reader?bookId=${encodeURIComponent(work.detailId)}&episodeId=${encodeURIComponent(episode.id)}`); else setPurchaseEpisode(episode) }
  function purchasedEpisode(id: string) { const next = new Set([...purchased, id]); setPurchased(next); if (!serverBacked && user) recordEpisodePurchase(user.id, id); const episode = episodes.find((item) => item.id === id); if (episode) router.push(`/reader?bookId=${encodeURIComponent(work.detailId)}&episodeId=${encodeURIComponent(id)}`) }
  async function purchaseOnServer(id: string) {
    const response = await fetch(`/api/episodes/${encodeURIComponent(id)}/purchase`, { method: 'POST' })
    const data = await response.json().catch(() => ({})) as { error?: string }
    return { ok: response.ok, error: data.error }
  }

  return <main className={styles.page}><div className={styles.wrap}>
    <nav className={styles.breadcrumbs}><Link href="/">หน้าแรก</Link><ChevronRight size={13}/><Link href={routeForType(work.type)}>{typeLabel(work.type)}</Link><ChevronRight size={13}/><span>{work.title}</span></nav>
    <section className={`${styles.card} ${styles.hero}`}>
      <div className={styles.heroMain}><div className={styles.cover} style={{ background: work.coverGradient }}>{work.coverUrl && !coverFailed && <Image unoptimized fill sizes="(max-width: 640px) 150px, 210px" src={work.coverUrl} alt={`ภาพปก ${work.title}`} className="object-cover" onError={() => setCoverFailed(true)} />}<span className={styles.coverType}>{typeLabel(work.type)}</span></div><div>
        <h1 className={styles.title}>{work.title}</h1>
        <div className={styles.authorRow}><span>โดย</span><Link href={`/profile/${encodeURIComponent(work.authorId)}`} className={styles.author}>{work.authorName}</Link><button className={`${styles.follow} ${followed ? styles.followActive : ''}`} onClick={() => togglePersist('follow', followed)}>{followed ? 'กำลังติดตาม' : '+ ติดตาม'}</button></div>
        <div className={styles.meta}><span className={styles.pill}>{work.genreLabel}</span><span>{work.originLabel}</span><span>•</span><span>{comingSoon ? 'เร็ว ๆ นี้' : work.status === 'completed' ? 'จบแล้ว' : 'กำลังอัปเดต'}</span><span>•</span><span>{comingSoon ? `อนุมัติ ${formatEpisodeDate(work.updatedAt)}` : `อัปเดต ${formatEpisodeDate(work.updatedAt)}`}</span></div>
        <p className={styles.synopsis}>{work.synopsis}</p>
        <div className={styles.stats}><div className={styles.stat}><b>{fmt(work.voteCount + bonus.daily)}</b><span>โหวตแนะนำ</span></div><div className={styles.stat}><b>{fmt(work.weeklyVoteCount + bonus.monthly)}</b><span>โหวตรายเดือน</span></div><div className={styles.stat}><b>{fmt(work.viewCount)}</b><span>{work.type === 'audiobook' ? 'ยอดฟัง' : 'ยอดอ่าน'}</span></div><div className={styles.stat}><b>{work.episodeCount}</b><span>ตอนทั้งหมด</span></div></div>
        <div className={styles.actions}>{!comingSoon && <><button className={styles.primary} onClick={() => episodes[0] && openEpisode(episodes[0])}>{work.type === 'audiobook' ? <Headphones size={16}/> : <BookOpen size={16}/>} {work.type === 'audiobook' ? 'เริ่มฟัง' : 'เริ่มอ่าน'}</button><button className={`${styles.secondary} ${shelved ? styles.secondaryActive : ''}`} onClick={() => togglePersist('shelf', shelved)}><Bookmark size={15} fill={shelved ? 'currentColor' : 'none'}/> {shelved ? 'อยู่ในชั้นแล้ว' : 'เพิ่มเข้าชั้น'}</button></>}<button className={styles.ghost} onClick={share}><Share2 size={16}/> แชร์</button></div>
      </div></div>
      {comingSoon ? <div className={styles.comingSoonNotice}><b>เร็ว ๆ นี้</b><span>ผลงานผ่านการอนุมัติแล้ว นักเขียนกำลังเตรียมตอนแรก</span></div> : <div className={styles.support}>
        <Support variant="daily" title="โหวตแนะนำ" subtitle="แนะนำเรื่องโปรดของคุณ" score={fmt(work.voteCount + bonus.daily)} detail={serverBacked ? `เหลือ ${availableTickets('daily')} / ${serverTickets?.daily.allowance ?? DAILY_MAX} ใบวันนี้` : `เหลือ ${availableTickets('daily')} / ${DAILY_MAX} ใบวันนี้`} action="โหวต" onClick={() => openVote('daily')}/>
        <Support variant="monthly" title="โหวตรายเดือน" subtitle="คะแนนชิงอันดับประจำเดือนนี้" score={fmt(work.weeklyVoteCount + bonus.monthly)} detail={serverBacked ? `คงเหลือ ${availableTickets('monthly')} ใบ` : `เหลือ ${availableTickets('monthly')} / ${MONTHLY_MAX} ใบเดือนนี้`} action="โหวต" onClick={() => openVote('monthly')}/>
        <Support variant="tip" title="ทิปนักเขียน" subtitle="สนับสนุนนักเขียนโดยตรง" score={fmt(tipTotal)} unit="เหรียญ" detail={tipTotal ? 'ขอบคุณสำหรับทุกกำลังใจ' : 'ส่งกำลังใจพร้อมข้อความ'} action="ทิป" onClick={() => requireLogin(() => setDonateOpen(true))}/>
      </div>}
    </section>
    <section className={`${styles.card} ${styles.description}`}><h2 className={styles.sectionTitle}>รายละเอียดเรื่อง</h2><p className={expanded ? '' : 'line-clamp-3'}>{work.synopsis} {work.synopsis} เรื่องราวจะค่อย ๆ เปิดเผยปริศนาและความสัมพันธ์ของตัวละคร ผ่านบททดสอบที่ไม่มีใครสามารถหลีกเลี่ยงได้</p><button className={styles.readMore} onClick={() => setExpanded((value) => !value)}>{expanded ? 'ย่อรายละเอียด' : 'อ่านเพิ่มเติม'}</button><div className={styles.tags}>{work.tags.map((tag) => <span key={tag} className={styles.tag}>#{tag}</span>)}</div></section>
    <div className={styles.columns}><div className={styles.stack}>
      {!comingSoon && <section className={`${styles.card} ${styles.section} ${styles.reviewsSection}`}>
        <div className={styles.reviewsHeader}>
          <h2>รีวิวจากผู้อ่าน</h2>
          <div className={styles.reviewsHeaderActions}>
            <label className={styles.reviewSortSelect}>
              <span className="sr-only">เรียงรีวิว</span>
              <select value={reviewSort} onChange={(event)=>{ setReviewSort(event.target.value as 'new' | 'old'); setReviewsExpanded(false) }}>
                <option value="new">ล่าสุด</option><option value="old">เก่าสุด</option>
              </select>
              <ChevronDown aria-hidden="true"/>
            </label>
            <button type="button" className={styles.reviewWriteButton} onClick={()=>requireLogin(()=>setShowReviewForm((value)=>!value))}><Pencil aria-hidden="true"/>เขียนรีวิว</button>
          </div>
        </div>
        {showReviewForm&&<div className={styles.reviewComposer}>
          <span className={styles.reviewAvatar} aria-hidden="true">{profile.displayName.slice(0,1)}</span>
          <div className={styles.reviewComposerBody}>
            <textarea rows={2} value={reviewText} onChange={(event)=>setReviewText(event.target.value)} placeholder="เขียนรีวิวของคุณ..." autoFocus/>
            <div className={styles.reviewComposerActions}>
              <div className={styles.recommendButtons}>
                <button type="button" className={recommend?styles.recommendYesActive:''} onClick={()=>setRecommend(true)}>แนะนำ</button>
                <button type="button" className={!recommend?styles.recommendNoActive:''} onClick={()=>setRecommend(false)}>ไม่แนะนำ</button>
              </div>
              <div className={styles.reviewComposerRight}>
                <button type="button" role="switch" aria-checked={spoiler} className={`${styles.spoilerSwitch} ${spoiler?styles.spoilerSwitchActive:''}`} onClick={()=>setSpoiler((value)=>!value)}><span aria-hidden="true"/>สปอย</button>
                <button type="button" className={styles.reviewSubmit} disabled={!reviewText.trim()||Boolean(reviewBusy)} onClick={addReview}>{reviewBusy?'กำลังบันทึก...':editingReviewId?'บันทึก':'ส่งรีวิว'}</button>
              </div>
            </div>
          </div>
        </div>}
        <div className={styles.reviewList}>
          {visibleReviews.map((review)=><article key={review.id} className={styles.review}>
            <span className={styles.reviewAvatar} aria-hidden="true">{review.authorName.slice(0,1)}</span>
            <div className={styles.reviewContent}>
              <div className={styles.reviewHead}>
                <strong className={styles.reviewName}>{review.authorName}</strong>
                <span className={styles.reviewStars} aria-label={`${review.rating} ดาว`}>{[1,2,3,4,5].map((value)=><Star key={value} fill={value<=review.rating?'currentColor':'none'}/>)}</span>
                <time className={styles.reviewDate} dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString('th-TH')}{review.updatedAt?' · แก้ไขแล้ว':''}</time>
                {review.userId===(user?.id??'current-user')&&<details className={styles.reviewMenu}><summary aria-label="จัดการรีวิว"><MoreHorizontal/></summary><div><button type="button" onClick={()=>editReview(review)}>แก้ไข</button><button type="button" onClick={()=>void deleteReview(review.id)}>ลบรีวิว</button></div></details>}
              </div>
              {review.spoiler&&!revealedSpoilers.has(review.id)?<button type="button" className={styles.revealSpoiler} onClick={()=>toggleReviewSet(setRevealedSpoilers,review.id)}><Eye/>สปอย — กดเพื่ออ่าน</button>:<p className={styles.reviewBody}>{review.body}</p>}
              <div className={styles.reviewFooter}>
                <button type="button" className={styles.reviewReplyButton} onClick={()=>review.replies.length?toggleReviewSet(setOpenReplies,review.id):startReply(review.id)}><Reply/>{review.replies.length?(openReplies.has(review.id)?'ซ่อนการตอบกลับ':'ดูการตอบกลับ'):'ตอบกลับ'}{review.replies.length>0&&` (${review.replies.length})`}</button>
                <button type="button" className={review.viewerReaction==='like'?styles.reviewReactionActive:''} aria-pressed={review.viewerReaction==='like'} onClick={()=>void reactReview(review.id,'likes')}><ThumbsUp/>{review.likes}</button>
                <button type="button" className={review.viewerReaction==='dislike'?styles.reviewReactionActive:''} aria-pressed={review.viewerReaction==='dislike'} onClick={()=>void reactReview(review.id,'dislikes')}><ThumbsDown/>{review.dislikes||''}</button>
                <span className={review.recommended?styles.reviewRecommended:styles.reviewNotRecommended}>{review.recommended?'แนะนำ':'ไม่แนะนำ'}</span>
              </div>
              {openReplies.has(review.id)&&review.replies.length>0&&<div className={styles.reviewReplies}>{review.replies.map((reply)=><div key={reply.id} className={styles.reviewReply}><span className={styles.replyAvatar}>{reply.authorName.slice(0,1)}</span><div><div className={styles.replyHead}><strong>{reply.authorName}</strong><time dateTime={reply.createdAt}>{new Date(reply.createdAt).toLocaleDateString('th-TH')}{reply.updatedAt&&reply.updatedAt!==reply.createdAt?' · แก้ไขแล้ว':''}</time>{reply.userId===(user?.id??'current-user')&&<span className={styles.replyActions}><button type="button" onClick={()=>void editReply(review.id,reply.id,reply.body)}>แก้ไข</button><button type="button" onClick={()=>void deleteReply(review.id,reply.id)}>ลบ</button></span>}</div><p>{reply.body}</p></div></div>)}</div>}
              {replyingTo===review.id&&<div className={styles.replyComposer}><span className={styles.replyAvatar}>{profile.displayName.slice(0,1)}</span><div><textarea rows={1} value={replyText} onChange={(event)=>setReplyText(event.target.value)} placeholder="เขียนตอบกลับ..." autoFocus/><div><button type="button" onClick={()=>{setReplyingTo(null);setReplyText('')}}>ยกเลิก</button><button type="button" disabled={!replyText.trim()||reviewBusy===`reply:${review.id}`} onClick={()=>void submitReply(review.id)}>{reviewBusy===`reply:${review.id}`?'กำลังส่ง...':'ส่ง'}</button></div></div></div>}
            </div>
          </article>)}
          {!reviews.length&&<p className={styles.empty}>ยังไม่มีรีวิว เป็นคนแรกที่เขียนรีวิวเรื่องนี้ได้เลย</p>}
        </div>
        {sortedReviews.length>3&&<button type="button" className={styles.reviewMore} onClick={()=>setReviewsExpanded((value)=>!value)}>{reviewsExpanded?'แสดงน้อยลง ▲':`อ่านเพิ่มเติม (${sortedReviews.length-3}) ...`}</button>}
      </section>}
      <section className={`${styles.card} ${styles.section}`}>
        <div className={styles.chapterHeader}>
          <h2 className={styles.chapterHeading}>สารบัญ</h2>
          <p className={styles.chapterSummary}>{episodes.length} ตอน{newestEpisode?.publishedAt ? ` · เพิ่มตอนล่าสุด ${formatEpisodeDate(newestEpisode.publishedAt)}` : ''}</p>
        </div>
        {chapterGroups.length ? <div className={styles.chapterList}>{chapterGroups.map((group) => {
          const isOpen = openChapterGroups.has(group.index)
          const panelId = `detail-chapter-group-${group.index}`
          return <div key={group.index} className={`${styles.chapterAccordion} ${isOpen ? styles.chapterAccordionOpen : ''}`}>
            <button type="button" className={styles.chapterGroupHeader} aria-expanded={isOpen} aria-controls={panelId} onClick={() => toggleChapterGroup(group.index)}>
              <span>{group.start} – {group.end}</span><ChevronDown className={styles.chapterGroupChevron} aria-hidden="true"/>
            </button>
            <div id={panelId} className={styles.chapterGroupBody} hidden={!isOpen}>{group.episodes.map((episode) => {
              const isNewest = episode.id === newestEpisode?.id
              const isScheduled = episode.status === 'scheduled'
              const showPrice = episode.price > 0 && !purchased.has(episode.id)
              return <button key={episode.id} type="button" className={`${styles.chapterRow} ${isScheduled ? styles.chapterScheduled : ''}`} aria-disabled={isScheduled} onClick={() => openEpisode(episode)}>
                <span className={styles.chapterInfo}>
                  <span className={styles.chapterTitleLine}><span className={styles.chapterRowTitle}>{episode.title}</span>{isNewest && <span className={styles.chapterNew}>NEW</span>}</span>
                  <span className={styles.chapterDate}>{isScheduled ? 'ตั้งเวลา ' : ''}{formatEpisodeDate(episode.publishedAt)}</span>
                </span>
                <span className={styles.chapterRowMeta}>
                  <span className={styles.chapterPrice}>{showPrice && <><span className={styles.chapterCoin} aria-hidden="true"/>{episode.price}</>}</span>
                  <span className={styles.chapterStat}><MessageCircle aria-hidden="true"/>{fmt(episodeCommentCounts[episode.id] ?? 0)}</span>
                  {work.type === 'audiobook' && <span className={styles.chapterStat}><Clock aria-hidden="true"/>{audioDuration(episode)}</span>}
                </span>
              </button>
            })}</div>
          </div>
        })}</div> : <div className={styles.chapterEmpty}>ยังไม่มีตอน — นักเขียนกำลังเตรียมเนื้อหา</div>}
      </section>
    </div><aside className={`${styles.stack} ${styles.sidebar}`}>
      {!comingSoon && <section className={`${styles.card} ${styles.section}`}><div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>อันดับแฟนคลับ</h2><Users size={18}/></div><div className={styles.sideTabs}><button className={fanMode==='month'?styles.sideTabActive:''} onClick={()=>setFanMode('month')}>เดือนนี้</button><button className={fanMode==='all'?styles.sideTabActive:''} onClick={()=>setFanMode('all')}>ตลอดกาล</button></div><div className={styles.sideTabs}><button className={fanKind==='daily'?styles.sideTabActive:''} onClick={()=>setFanKind('daily')}>แนะนำ</button><button className={fanKind==='monthly'?styles.sideTabActive:''} onClick={()=>setFanKind('monthly')}>รายเดือน</button><button className={fanKind==='tip'?styles.sideTabActive:''} onClick={()=>setFanKind('tip')}>บริจาค</button></div>{fans.slice(0,5).map((fan,index)=><div key={fan.name} className={styles.fan}><span className={styles.fanRank}>{index+1}</span><span className={styles.avatar}>{fan.name[0]}</span><strong>{fan.name}</strong><span>{fmt(fan.score)}</span></div>)}{isLoggedIn&&<div className={`${styles.fan} ${styles.currentFan}`}><span>–</span><span className={styles.avatar}>{profile.displayName[0]}</span><strong>{profile.displayName}</strong><span>{bonus.daily+bonus.monthly+tipTotal}</span></div>}<button className={styles.allButton} onClick={()=>setFanOpen(true)}>ดูอันดับทั้งหมด</button></section>}
      <section className={`${styles.card} ${styles.section}`}><div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>เรื่องแนะนำ</h2><Star size={18}/></div><div className={styles.related}>{related.map((item)=><Link key={item.detailId} href={`/detail?bookId=${encodeURIComponent(item.detailId)}`} className={styles.relatedItem}><span className={styles.relatedCover} style={{background:item.coverGradient}}/><span><b>{item.title}</b><span>{item.authorName}<br/>{item.genreLabel}</span></span></Link>)}</div></section>
    </aside></div>
  </div>
  {!comingSoon && <><Dialog open={voteOpen} onOpenChange={setVoteOpen}><DialogContent><DialogHeader><DialogTitle>ใช้ตั๋วโหวตให้ “{work.title}”</DialogTitle></DialogHeader><div className={styles.dialogOptions}><button className={voteKind==='daily'?styles.dialogOptionActive:''} disabled={availableTickets('daily')<=0} onClick={()=>{setVoteKind('daily');setVoteAmount(1)}}><span><Ticket size={16}/> โหวตแนะนำ</span><b>เหลือ {availableTickets('daily')} ใบ</b></button><button className={voteKind==='monthly'?styles.dialogOptionActive:''} disabled={availableTickets('monthly')<=0} onClick={()=>{setVoteKind('monthly');setVoteAmount(1)}}><span><Crown size={16}/> โหวตรายเดือน</span><b>เหลือ {availableTickets('monthly')} ใบ</b></button></div><div className={styles.quantity}><label htmlFor="vote-amount">จำนวนตั๋ว</label><input id="vote-amount" type="number" min={1} max={Math.max(1,availableTickets(voteKind))} value={voteAmount} onChange={(event)=>setVoteAmount(Number(event.target.value))}/><button className={styles.primary} disabled={voteBusy||availableTickets(voteKind)<=0} onClick={()=>void submitVote()}>{voteBusy?'กำลังโหวต...':'ยืนยันโหวต'}</button></div></DialogContent></Dialog>
  <Dialog open={fanOpen} onOpenChange={setFanOpen}><DialogContent><DialogHeader><DialogTitle>อันดับแฟนคลับทั้งหมด</DialogTitle></DialogHeader><div className={styles.fanDialog}>{[...fans,...fans.map((fan,index)=>({...fan,name:`${fan.name} ${index+2}`,score:fan.score-420}))].map((fan,index)=><div key={`${fan.name}-${index}`} className={styles.fan}><span className={styles.fanRank}>{index+1}</span><span className={styles.avatar}>{fan.name[0]}</span><strong>{fan.name}</strong><span>{fmt(fan.score)}</span></div>)}</div></DialogContent></Dialog>
  <DonateModal authorName={work.authorName} detailId={work.detailId} open={donateOpen} onOpenChange={setDonateOpen} onSuccess={(amount)=>{setTipTotal((value)=>value+amount);setNotice('ส่งกำลังใจให้นักเขียนแล้ว')}}/></>}
  <PurchaseEpisodeModal episode={purchaseEpisode} workTitle={work.title} open={Boolean(purchaseEpisode)} onOpenChange={(open)=>!open&&setPurchaseEpisode(null)} onPurchased={purchasedEpisode} serverPurchase={serverBacked ? purchaseOnServer : undefined}/>
  {notice&&<div className={styles.notice}>{notice}</div>}</main>
}

function Support({ variant, title, subtitle, score, unit, detail, action, onClick }: { variant: 'daily' | 'monthly' | 'tip'; title: string; subtitle: string; score: string; unit?: string; detail: string; action: string; onClick: () => void }) {
  return <div className={`${styles.supportItem} ${styles[`support${variant[0].toUpperCase()}${variant.slice(1)}`]}`}>
    <div className={styles.supportInfo}>
      <div className={styles.supportTop}><b>{title}</b><span>{subtitle}</span></div>
      <div className={styles.supportScore}><strong>{score}</strong>{unit&&<span>{unit}</span>}</div>
      <small>{detail}</small>
    </div>
    <button className={styles.supportButton} onClick={onClick}>{action}</button>
  </div>
}
