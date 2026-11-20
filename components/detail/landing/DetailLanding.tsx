'use client'

import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowDownUp, Bookmark, ChevronDown, Clock, Eye, Headphones, MessageCircle, MoreHorizontal, Pause, Play, Share2, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import DonateModal from '@/components/modals/DonateModal'
import PurchaseEpisodeModal from '@/components/modals/PurchaseEpisodeModal'
import { useRole } from '@/contexts/RoleContext'
import { useProfile } from '@/contexts/ProfileContext'
import { localProfileRepository, purchaseStorageKey, recordEpisodePurchase, shelfStorageKey } from '@/lib/profile-repository'
import { localReaderRepository } from '@/lib/reader-repository'
import type { DetailCatalogItem, DetailEpisode, DetailReview } from '@/lib/detail-catalog'
import { AudioPlayerBar, audioEpisodeDurationSeconds, formatTime, type AudioPlayerHandle } from './AudioPlayerBar'
import styles from './DetailLanding.module.css'

const VOTE_KEY = 'rl_ranking_votes_v1'
const DAILY_MAX = 15
const MONTHLY_MAX = 30
const CHAPTER_GROUP_SIZE = 50
type VoteKind = 'daily' | 'monthly'
type Ledger = { dailyKey: string; monthlyKey: string; dailyUsed: number; monthlyUsed: number; bonuses: Record<string, { daily: number; monthly: number }> }
type ServerTickets = { daily: { allowance: number; used: number; balance: number; resetsAt: string }; monthly: { balance: number } }
type ApiReview = {
  id: string; userId: string; workId: string; rating: number; body: string; recommended: boolean; spoiler: boolean; likes: number; dislikes: number; viewerReaction?: 'like' | 'dislike' | null; createdAt: string; updatedAt: string
  user: { id: string; name: string }
  readEpisodeCount?: number; avatarUrl?: string; history?: DetailReview['history']
  replies: Array<{ id: string; userId: string; body: string; createdAt: string; updatedAt: string; user: { id: string; name: string } }>
}
type ChapterGroup = { index: number; start: number; end: number; episodes: DetailEpisode[] }

const todayKey = () => new Date().toLocaleDateString('en-CA')
const monthKey = () => todayKey().slice(0, 7)
const defaultLedger = (): Ledger => ({ dailyKey: todayKey(), monthlyKey: monthKey(), dailyUsed: 12, monthlyUsed: 23, bonuses: {} })
const fmt = (value: number) => value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : value >= 1_000 ? value.toLocaleString('en-US') : String(value)
const routeForType = (type: DetailCatalogItem['type']) => type === 'novel' ? '/novel' : type === 'manga' ? '/manga' : '/audiobook'
const formatEpisodeDate = (value: string | null) => value ? new Intl.DateTimeFormat('th-TH-u-ca-gregory', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : ''
const audioDuration = (episode: DetailEpisode) => formatTime(audioEpisodeDurationSeconds(episode))

function mapApiReview(review: ApiReview): DetailReview {
  return {
    id: review.id,
    detailId: review.workId,
    userId: review.userId,
    authorName: review.user.name,
    avatarUrl: review.avatarUrl,
    readEpisodeCount: review.readEpisodeCount,
    history: review.history,
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
  const [descriptionOverflow, setDescriptionOverflow] = useState(false)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const [recentEpisodeIds, setRecentEpisodeIds] = useState<Set<string>>(new Set())
  const [purchaseMode, setPurchaseMode] = useState<'read' | 'listen'>('read')
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
  const [tipCount, setTipCount] = useState(0)
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
  const [reviewHistoryId, setReviewHistoryId] = useState<string | null>(null)
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set())
  const [openReplies, setOpenReplies] = useState<Set<string>>(new Set())
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [selectedChapterGroup, setSelectedChapterGroup] = useState<number | null>(null)
  const [chapterAscending, setChapterAscending] = useState(false)
  const [episodeCommentCounts, setEpisodeCommentCounts] = useState<Record<string, number>>({})
  const [purchased, setPurchased] = useState<Set<string>>(new Set())
  const [purchaseEpisode, setPurchaseEpisode] = useState<DetailEpisode | null>(null)
  const [fanMode, setFanMode] = useState<'daily' | 'monthly' | 'tip'>('daily')
  const [fanOpen, setFanOpen] = useState(false)
  const [fanPeriod, setFanPeriod] = useState<'today' | 'month' | 'all'>('all')
  const [coverFailed, setCoverFailed] = useState(false)
  const audioPlayerRef = useRef<AudioPlayerHandle>(null)
  const [audioActiveId, setAudioActiveId] = useState<string | null>(null)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [chapterMode, setChapterMode] = useState<'read' | 'listen'>('read')
  const hasAudioEdition = work.type === 'novel' && Boolean(work.hasAudioEdition)
  const showAudioPlayer = work.type === 'audiobook' || hasAudioEdition
  const listenMode = work.type === 'audiobook' || (hasAudioEdition && chapterMode === 'listen')

  useEffect(() => {
    if (serverBacked) {
      startTransition(() => {
        setLedgerReady(true)
        setReviews(initialReviews ?? [])
        setServerTickets(null)
        setSelectedChapterGroup(null)
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
        const ownSupportLogs = supportLogs.filter((log) => log.detailId === work.detailId)
        setTipTotal(ownSupportLogs.reduce((sum, log) => sum + (log.amount ?? 0), 0))
        setTipCount(ownSupportLogs.length)
      })
    } catch { startTransition(() => setLedgerReady(true)) }
  }, [comingSoon, episodes.length, initialReviews, serverBacked, user, work])

  useEffect(() => { if (ledgerReady && !serverBacked) localStorage.setItem(VOTE_KEY, JSON.stringify(ledger)) }, [ledger, ledgerReady, serverBacked])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 2400); return () => window.clearTimeout(timer) }, [notice])
  useEffect(() => {
    if (serverBacked) {
      startTransition(() => {
        setEpisodeCommentCounts(Object.fromEntries(episodes.map((episode) => [episode.id, 0])))
        setSelectedChapterGroup(null)
      })
      return
    }
    const counts = Object.fromEntries(episodes.map((episode) => [episode.id, countEpisodeComments(work.id, episode.id)]))
    startTransition(() => {
      setEpisodeCommentCounts(counts)
      setSelectedChapterGroup(null)
    })
  }, [episodes, serverBacked, work.id])

  useEffect(() => {
    const now = Date.now()
    startTransition(() => setRecentEpisodeIds(new Set(episodes.filter((episode) => {
      const age = now - new Date(episode.publishedAt ?? 0).getTime()
      return age >= 0 && age <= 86_400_000
    }).map((episode) => episode.id))))
  }, [episodes])

  useEffect(() => {
    const element = descriptionRef.current
    if (!element || expanded) return
    const measure = () => setDescriptionOverflow(element.scrollHeight > element.clientHeight + 1)
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [expanded, work.synopsis])

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
  const sortedReviews = useMemo(() => [...reviews].sort((a, b) => reviewSort === 'new' ? +new Date(b.updatedAt ?? b.createdAt) - +new Date(a.updatedAt ?? a.createdAt) : +new Date(a.updatedAt ?? a.createdAt) - +new Date(b.updatedAt ?? b.createdAt)), [reviews, reviewSort])
  const visibleReviews = reviewsExpanded ? sortedReviews : sortedReviews.slice(0, 3)
  const fanTabs = [{ kind: 'daily', label: 'โหวตแนะนำ' }, { kind: 'monthly', label: 'โหวตเดือน' }, { kind: 'tip', label: 'สนับสนุน' }] satisfies Array<{ kind: typeof fanMode; label: string }>
  const fans = useMemo(() => ['มะลิในสายฝน', 'เจ้าหญิงชาเย็น', 'Bookworm99', 'ดาวเหนือ', 'คุณนักอ่าน', 'แพรว', 'ฟ้าใส', 'ออมสิน', 'บีม', 'น้ำหวาน'].map((name, index) => ({ name, score: Math.round(((fanMode === 'daily' ? 96 : fanMode === 'monthly' ? 820 : 3280) - index * (fanMode === 'daily' ? 7 : fanMode === 'monthly' ? 57 : 220)) * (fanPeriod === 'today' ? 0.2 : fanPeriod === 'month' ? 0.6 : 1)) })), [fanMode, fanPeriod])
  const historyReview = reviews.find((review) => review.id === reviewHistoryId)
  const fanColors = ['#fde2e4', '#fde2e4', '#e0f5f5', '#fdf3d8', '#e2ecfd', '#f0e4fd', '#e4f7e9', '#e0f5f5', '#e2ecfd', '#e4f7e9']
  const activeChapterGroup = chapterGroups.find((group) => group.index === selectedChapterGroup) ?? chapterGroups.at(-1)
  const visibleEpisodes = activeChapterGroup ? (chapterAscending ? activeChapterGroup.episodes : [...activeChapterGroup.episodes].reverse()) : []
  const chapterUnit = work.type === 'manga' ? 'ตอน' : 'บท'


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
    if (editingReviewId) {
      persistReviews(reviews.map((review) => review.id === editingReviewId ? { ...review, body: reviewText.trim(), rating, recommended: recommend, spoiler, updatedAt: new Date().toISOString(), history: [...(review.history ?? []), { body: review.body, recommended: review.recommended, spoiler: review.spoiler, createdAt: review.updatedAt ?? review.createdAt, readEpisodeCount: review.readEpisodeCount }] } : review))
      resetReviewComposer(); setReviewSort('new'); setReviewsExpanded(false); setNotice('แก้ไขรีวิวแล้ว'); return
    }
    const next: DetailReview = { id: crypto.randomUUID(), detailId: work.detailId, userId: user?.id ?? 'current-user', authorName: profile.displayName, rating, body: reviewText.trim(), recommended: recommend, spoiler, likes: 0, dislikes: 0, replies: [], createdAt: new Date().toISOString() }; persistReviews([next, ...reviews]); resetReviewComposer(); setReviewSort('new'); setReviewsExpanded(false); setNotice('เผยแพร่รีวิวแล้ว')
  }
  function editReview(review: DetailReview) {

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
  function startReply(reviewId: string, replyToName?: string) { requireLogin(() => { setReplyingTo((current) => current === reviewId ? null : reviewId); setReplyText(replyToName ? `@${replyToName} ` : '') }) }
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

  function openEpisode(episode: DetailEpisode) { if (episode.status === 'scheduled') { setNotice(`ตอนนี้จะเผยแพร่ ${formatEpisodeDate(episode.publishedAt)}`); return } const unlocked = episode.price === 0 || purchased.has(episode.id); if (unlocked) router.push(`/reader?bookId=${encodeURIComponent(work.detailId)}&episodeId=${encodeURIComponent(episode.id)}`); else { setPurchaseMode('read'); setPurchaseEpisode(episode) } }
  function startListening(episode?: DetailEpisode, justPurchased = false) { if (!episode || episode.status === 'scheduled') return; const unlocked = justPurchased || episode.price === 0 || purchased.has(episode.id); if (!unlocked) { setPurchaseMode('listen'); setPurchaseEpisode(episode); return } audioPlayerRef.current?.toggle(episode) }
  function purchasedEpisode(id: string) { const next = new Set([...purchased, id]); setPurchased(next); if (!serverBacked && user) recordEpisodePurchase(user.id, id); const episode = episodes.find((item) => item.id === id); if (episode) { if (purchaseMode === 'listen') startListening(episode, true); else router.push(`/reader?bookId=${encodeURIComponent(work.detailId)}&episodeId=${encodeURIComponent(id)}`) } }
  async function purchaseOnServer(id: string) {
    const response = await fetch(`/api/episodes/${encodeURIComponent(id)}/purchase`, { method: 'POST' })
    const data = await response.json().catch(() => ({})) as { error?: string }
    return { ok: response.ok, error: data.error }
  }

  return <div className={`${styles.page} ${audioActiveId ? styles.pageWithPlayer : ''}`} data-content-type={work.type}>
    <div className={styles.coverBand} aria-hidden="true"><div style={{ background: work.coverGradient }}>{work.coverUrl && !coverFailed && <Image unoptimized fill sizes="100vw" src={work.coverUrl} alt="" className="object-cover"/>}</div></div>
    <div className={styles.wrap}>
    <section className={`${styles.card} ${styles.hero}`}>
      <div className={styles.heroMain}>
        <div className={styles.cover} style={{ background: work.coverGradient }}>{work.coverUrl && !coverFailed && <Image unoptimized fill loading="eager" sizes="(max-width: 640px) 150px, 227px" src={work.coverUrl} alt={`ภาพปก ${work.title}`} className="object-cover" onError={() => setCoverFailed(true)} />}</div>
        <div className={styles.heroBody}>
          <h1 className={styles.title}>{work.title}</h1>
          <div className={styles.authorRow}><Link href={`/profile/${encodeURIComponent(work.authorId)}`} className={styles.author}>{work.authorName}</Link><button className={`${styles.follow} ${followed ? styles.followActive : ''}`} onClick={() => togglePersist('follow', followed)}>{followed ? 'กำลังติดตาม' : 'ติดตาม'}</button></div>
          <div className={styles.meta}><Link href={`${routeForType(work.type)}?genre=${encodeURIComponent(work.genres[0] ?? '')}`} className={styles.pill}>{work.genreLabel}</Link><span>{work.type === 'audiobook' ? work.narrationType === 'ai' ? 'เอไอ' : 'พากย์' : work.originLabel === 'แปล' ? 'แปลไทย' : work.originLabel}</span>{hasAudioEdition && <span>พากย์</span>}<span className={styles.updated}>{comingSoon ? `เร็ว ๆ นี้ · อนุมัติ ${formatEpisodeDate(work.updatedAt)}` : `อัปเดตล่าสุด ${formatEpisodeDate(work.updatedAt)}${work.latestEpisode ? ` ${work.latestEpisode}` : ''}`}</span></div>
          <p className={styles.synopsis}>{work.tagline || work.synopsis}</p>
          <div className={styles.stats}>
            <div className={styles.stat}><b>{fmt(work.viewCount)}</b><span>{work.type === 'audiobook' ? 'ยอดฟัง' : 'ยอดเข้าชม'}</span></div>
            {hasAudioEdition && <div className={styles.stat}><b>{fmt(work.listenCount ?? 0)}</b><span>ยอดฟัง</span></div>}
            <div className={styles.stat}><b>{fmt(work.voteCount + bonus.daily)}</b><span>โหวตแนะนำรวม</span></div>
            <div className={styles.stat}><b>{fmt(work.weeklyVoteCount + bonus.monthly)}</b><span>โหวตรายเดือนรวม</span></div>
          </div>
          <div className={styles.actions}>{!comingSoon && <>
            <button className={styles.primary} onClick={() => work.type === 'audiobook' ? startListening(sortedEpisodes[0]) : sortedEpisodes[0] && openEpisode(sortedEpisodes[0])}>{work.type === 'audiobook' ? <Headphones size={15}/> : <Eye size={15}/>} {work.type === 'audiobook' ? 'เริ่มฟัง' : 'เริ่มอ่าน'}</button>
            {hasAudioEdition && <button className={styles.listenBtn} onClick={() => startListening(sortedEpisodes[0])}><Headphones size={15}/> เริ่มฟัง</button>}
            <button className={`${styles.secondary} ${shelved ? styles.secondaryActive : ''}`} onClick={() => togglePersist('shelf', shelved)}><Bookmark size={15} fill={shelved ? 'currentColor' : 'none'}/> {shelved ? 'อยู่ในชั้นแล้ว' : 'เพิ่มเข้าชั้น'}</button>
          </>}<button className={styles.ghost} onClick={share}><Share2 size={15}/> แชร์</button></div>
        </div>
      </div>
      {comingSoon ? <div className={styles.comingSoonNotice}><b>เร็ว ๆ นี้</b><span>ผลงานผ่านการอนุมัติแล้ว นักเขียนกำลังเตรียมตอนแรก</span></div> : <div className={styles.support}>
        <Support variant="daily" title="โหวตแนะนำ" subtitle="แนะนำเรื่องโปรดของคุณ" score={fmt(work.voteCount + bonus.daily)} detail={serverBacked ? `เหลือ ${availableTickets('daily')} / ${serverTickets?.daily.allowance ?? DAILY_MAX} ใบวันนี้` : `เหลือ ${availableTickets('daily')} / ${DAILY_MAX} ใบวันนี้`} action="โหวต" onClick={() => openVote('daily')}/>
        <Support variant="monthly" title="โหวตรายเดือน" subtitle="คะแนนชิงอันดับประจำเดือนนี้" score={fmt(work.weeklyVoteCount + bonus.monthly)} detail={serverBacked ? `คงเหลือ ${availableTickets('monthly')} ใบ` : `เหลือ ${availableTickets('monthly')} / ${MONTHLY_MAX} ใบเดือนนี้`} action="โหวต" onClick={() => openVote('monthly')}/>
        <Support variant="tip" title="สนับสนุนผลงาน" subtitle="สนับสนุนนักเขียนโดยตรง" score={fmt(tipTotal)} unit="เหรียญ" detail={`ผู้สนับสนุน ${tipCount} คน`} action="สนับสนุน" onClick={() => requireLogin(() => setDonateOpen(true))}/>
      </div>}
    </section>
    <section className={`${styles.card} ${styles.description}`}><h2 className={styles.sectionTitle}>รายละเอียด</h2><p ref={descriptionRef} className={expanded ? '' : 'line-clamp-3'}>{work.synopsis}</p>{descriptionOverflow && <button className={styles.readMore} onClick={() => setExpanded((value) => !value)}>{expanded ? 'ย่อรายละเอียด' : '...อ่านเพิ่มเติม'}</button>}<div className={styles.tagsBlock}><p className={styles.tagsLabel}>แท็ก</p><div className={styles.tags}>{work.tags.map((tag) => <span key={tag} className={styles.tag}>#{tag.replace(/^#/, '')}</span>)}</div></div></section>
    <div className={styles.columns}><div className={styles.stack}>
      {!comingSoon && <section className={`${styles.card} ${styles.section} ${styles.reviewsSection}`}>
        <div className={styles.reviewsHeader}>
          <h2>รีวิวจากผู้อ่าน</h2>
          <div className={styles.reviewsHeaderActions}>
            <DropdownMenu>
              <DropdownMenuTrigger className={styles.reviewSortTrigger} aria-label="เรียงรีวิว"><span>{reviewSort === 'new' ? 'ล่าสุด' : 'เก่าสุด'}</span><ChevronDown aria-hidden="true"/></DropdownMenuTrigger>
              <DropdownMenuContent className={styles.reviewSortMenu} align="end" sideOffset={6}>
                {([{ value: 'new', label: 'ล่าสุด' }, { value: 'old', label: 'เก่าสุด' }] satisfies Array<{ value: typeof reviewSort; label: string }>).map((option) => <DropdownMenuItem key={option.value} className={reviewSort === option.value ? styles.reviewSortSelected : ''} onClick={() => { setReviewSort(option.value); setReviewsExpanded(false) }}>{option.label}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
            <button type="button" className={styles.reviewWriteButton} onClick={()=>requireLogin(()=>setShowReviewForm((value)=>!value))}>เขียนรีวิว</button>
          </div>
        </div>
        {showReviewForm&&<div className={styles.reviewComposer}>
          <span className={styles.reviewAvatar} aria-hidden="true"/>
          <div className={styles.reviewComposerBody}>
            <textarea rows={1} maxLength={2000} value={reviewText} onChange={(event)=>setReviewText(event.target.value)} placeholder="เขียนรีวิวของคุณ..." autoFocus/>
            <div className={styles.reviewComposerActions}>
              <div className={styles.recommendButtons}><span className={styles.recommendQuestion}>แนะนำเรื่องนี้ไหม</span>
                <button type="button" className={recommend?styles.recommendYesActive:''} onClick={()=>setRecommend(true)}>แนะนำ</button>
                <span className={styles.recommendSeparator}>·</span><button type="button" className={!recommend?styles.recommendNoActive:''} onClick={()=>setRecommend(false)}>ไม่แนะนำ</button>
              </div>
              <div className={styles.reviewComposerRight}><span className={styles.reviewCharacterCount}>{reviewText.length} / 2000</span>
                <button type="button" role="switch" aria-checked={spoiler} className={`${styles.spoilerSwitch} ${spoiler?styles.spoilerSwitchActive:''}`} onClick={()=>setSpoiler((value)=>!value)}><span aria-hidden="true"/>สปอย</button>
                <button type="button" className={styles.reviewSubmit} disabled={!reviewText.trim()||Boolean(reviewBusy)} onClick={addReview}>{reviewBusy?'กำลังบันทึก...':editingReviewId?'บันทึก':'ส่งรีวิว'}</button>
              </div>
            </div>
          </div>
        </div>}
        <div className={styles.reviewList}>
          {visibleReviews.map((review)=><article key={review.id} className={styles.review}>
            <span className={styles.reviewAvatar} aria-hidden="true">{review.avatarUrl && <Image unoptimized fill sizes="43px" src={review.avatarUrl} alt="" className="object-cover"/>}</span>
            <div className={styles.reviewContent}>
              <div className={styles.reviewHead}>
                <strong className={styles.reviewName}>{review.authorName}</strong>

                <time className={styles.reviewDate} dateTime={review.updatedAt ?? review.createdAt}>{formatEpisodeDate(review.updatedAt ?? review.createdAt)}</time>
                {review.userId===(user?.id??'current-user')&&<details className={styles.reviewMenu}><summary aria-label="จัดการรีวิว"><MoreHorizontal/></summary><div><button type="button" onClick={()=>editReview(review)}>แก้ไข</button><button type="button" onClick={()=>void deleteReview(review.id)}>ลบรีวิว</button></div></details>}
              </div>
              {review.readEpisodeCount !== undefined && <span className={styles.reviewReadCount}>อ่านไปแล้ว {review.readEpisodeCount.toLocaleString()} {chapterUnit}</span>}
              {review.spoiler && !revealedSpoilers.has(review.id) ? <button type="button" className={styles.revealSpoiler} onClick={() => toggleReviewSet(setRevealedSpoilers, review.id)}><Eye/><span>เนื้อหาที่มีการสปอย</span><span className={styles.spoilerRevealLabel}>แสดงเนื้อหา</span></button> : <ReviewBody body={review.body}/>}

              <div className={styles.reviewFooter}>
                <button type="button" className={styles.reviewReplyButton} onClick={()=>review.replies.length?toggleReviewSet(setOpenReplies,review.id):startReply(review.id)}><ReviewReplyIcon/><span>{review.replies.length?(openReplies.has(review.id)?'ซ่อนการตอบกลับ':'ดูการตอบกลับ'):'ตอบกลับ'}</span>{review.replies.length>0&&<span>({review.replies.length})</span>}</button>
                <button type="button" className={review.viewerReaction==='like'?styles.reviewReactionActive:''} aria-pressed={review.viewerReaction==='like'} onClick={()=>void reactReview(review.id,'likes')}><ThumbsUp/><span className={styles.reviewReactionCount}>{review.likes || ''}</span></button>
                <button type="button" className={review.viewerReaction==='dislike'?styles.reviewReactionActive:''} aria-pressed={review.viewerReaction==='dislike'} onClick={()=>void reactReview(review.id,'dislikes')}><ThumbsDown/><span className={styles.reviewReactionCount}>{review.dislikes||''}</span></button>
                {!!review.history?.length && <button type="button" className={styles.reviewHistoryLink} onClick={() => setReviewHistoryId(review.id)}>รีวิวก่อนหน้า ({review.history.length})</button>}
                {(review.readEpisodeCount === undefined || review.readEpisodeCount >= 10) && <span className={review.recommended?styles.reviewRecommended:styles.reviewNotRecommended}>{review.recommended?'แนะนำ':'ไม่แนะนำ'}</span>}
              </div>
              {openReplies.has(review.id)&&review.replies.length>0&&<div className={styles.reviewReplies}>{review.replies.map((reply)=><div key={reply.id} className={styles.reviewReply}><span className={styles.replyAvatar} aria-hidden="true"/><div><div className={styles.replyHead}><strong>{reply.authorName}</strong><time dateTime={reply.createdAt}>{formatEpisodeDate(reply.createdAt)}{reply.updatedAt&&reply.updatedAt!==reply.createdAt?' · แก้ไขแล้ว':''}</time>{reply.userId===(user?.id??'current-user')&&<span className={styles.replyActions}><button type="button" onClick={()=>void editReply(review.id,reply.id,reply.body)}>แก้ไข</button><button type="button" onClick={()=>void deleteReply(review.id,reply.id)}>ลบ</button></span>}</div><p>{reply.body}</p><button type="button" className={styles.reviewReplyAgain} onClick={() => startReply(review.id, reply.authorName)}>ตอบกลับ</button></div></div>)}</div>}
              {replyingTo===review.id&&<div className={styles.replyComposer}><span className={styles.replyAvatar}>{profile.displayName.slice(0,1)}</span><div><textarea rows={1} value={replyText} onChange={(event)=>setReplyText(event.target.value)} placeholder="เขียนตอบกลับ..." autoFocus/><div><button type="button" onClick={()=>{setReplyingTo(null);setReplyText('')}}>ยกเลิก</button><button type="button" disabled={!replyText.trim()||reviewBusy===`reply:${review.id}`} onClick={()=>void submitReply(review.id)}>{reviewBusy===`reply:${review.id}`?'กำลังส่ง...':'ส่ง'}</button></div></div></div>}
            </div>
          </article>)}
          {!reviews.length&&<p className={styles.empty}>ยังไม่มีรีวิว เป็นคนแรกที่เขียนรีวิวเรื่องนี้ได้เลย</p>}
        </div>
        {sortedReviews.length>3&&<button type="button" className={styles.reviewMore} onClick={()=>setReviewsExpanded((value)=>!value)}>{reviewsExpanded?'แสดงน้อยลง ▲':`อ่านเพิ่มเติม (${sortedReviews.length-3}) ...`}</button>}
      </section>}
      <section className={`${styles.card} ${styles.section}`}>
        {hasAudioEdition && <div className={styles.chapterModeTabs} role="tablist" aria-label="รูปแบบสารบัญ">
          <button type="button" role="tab" aria-selected={chapterMode === 'read'} className={chapterMode === 'read' ? styles.chapterModeActive : ''} onClick={() => setChapterMode('read')}>นิยาย</button>
          <button type="button" role="tab" aria-selected={chapterMode === 'listen'} className={chapterMode === 'listen' ? styles.chapterModeActive : ''} onClick={() => setChapterMode('listen')}>หนังสือเสียง</button>
        </div>}
        <div className={styles.chapterHeader}>
          <div><h2 className={styles.chapterHeading}>สารบัญ</h2><p className={styles.chapterSummary}>{episodes.length} {chapterUnit}{newestEpisode?.publishedAt ? ` · เพิ่ม${chapterUnit}ล่าสุด ${formatEpisodeDate(newestEpisode.publishedAt)}` : ''}</p></div>
          {activeChapterGroup && <div className={styles.chapterNav}>
            <label className={styles.chapterSelect}><span className="sr-only">เลือกช่วง{chapterUnit}</span><select value={activeChapterGroup.index} onChange={(event) => setSelectedChapterGroup(Number(event.target.value))}>{[...chapterGroups].reverse().map((group) => <option key={group.index} value={group.index}>{chapterUnit}ที่ {group.start} – {group.end}</option>)}</select><ChevronDown size={14} aria-hidden="true"/></label>
            <button type="button" className={styles.chapterSort} aria-label={chapterAscending ? 'เรียงตอนล่าสุดก่อน' : 'เรียงตอนแรกก่อน'} aria-pressed={chapterAscending} onClick={() => setChapterAscending((value) => !value)}><ArrowDownUp size={17}/></button>
          </div>}
        </div>
        {visibleEpisodes.length ? <div className={styles.chapterList} key={`${activeChapterGroup?.index}-${chapterAscending}-${listenMode}`}><div className={styles.chapterPage}>{visibleEpisodes.map((episode) => {
          const isNewest = episode.id === newestEpisode?.id && recentEpisodeIds.has(episode.id)
          const isScheduled = episode.status === 'scheduled'
          const showPrice = episode.price > 0 && !purchased.has(episode.id)
          const rowInner = <>
            <span className={styles.chapterInfo}>
              <span className={styles.chapterTitleLine}><span className={styles.chapterRowTitle}>{work.type === 'manga' ? `ตอนที่ ${episode.episodeNum}` : episode.title}</span>{isNewest && <span className={styles.chapterNew}>NEW</span>}</span>
              <span className={styles.chapterDate}>{isScheduled ? 'ตั้งเวลา ' : ''}{formatEpisodeDate(episode.publishedAt)}{listenMode && <span className={styles.chapterInlineDuration}><Clock aria-hidden="true"/>{audioDuration(episode)}</span>}</span>
            </span>
            <span className={styles.chapterRowMeta}>
              <span className={styles.chapterPrice}>{showPrice && <><span className={styles.chapterCoin} aria-hidden="true"/>{episode.price}</>}</span>
              <span className={styles.chapterStat}><Eye aria-hidden="true"/>{fmt(episode.viewCount ?? 0)}</span>
              <span className={styles.chapterStat}><MessageCircle aria-hidden="true"/>{fmt(episodeCommentCounts[episode.id] ?? 0)}</span>
            </span>
          </>
          if (listenMode) {
            const isAudioPlaying = audioActiveId === episode.id && audioPlaying
            return <div key={episode.id} className={`${styles.chapterRow} ${styles.chapterRowAudio} ${isScheduled ? styles.chapterScheduled : ''}`}>
              <button type="button" className={styles.chapterPlayBtn} aria-label={`${isAudioPlaying ? 'หยุด' : 'เล่น'} ${episode.title}`} disabled={isScheduled} onClick={() => startListening(episode)}>{isAudioPlaying ? <Pause size={18}/> : <Play size={18}/>}</button>
              <button type="button" className={styles.chapterRowBody} aria-disabled={isScheduled} onClick={() => startListening(episode)}>{rowInner}</button>
            </div>
          }
          return <button key={episode.id} type="button" className={`${styles.chapterRow} ${isScheduled ? styles.chapterScheduled : ''}`} aria-disabled={isScheduled} onClick={() => openEpisode(episode)}>{rowInner}</button>
        })}</div></div> : <div className={styles.chapterEmpty}>ยังไม่มี{chapterUnit} นักเขียนกำลังเตรียมเนื้อหา</div>}
      </section>
    </div><aside className={`${styles.stack} ${styles.sidebar}`}>
      {!comingSoon && <section className={`${styles.card} ${styles.section} ${styles.fansCard}`}>
        <h2 className={styles.fanHeading}>แฟนคลับ</h2>
        <div className={styles.sideTabs}>{fanTabs.map((tab) => <button key={tab.kind} className={fanMode === tab.kind ? styles.sideTabActive : ''} aria-pressed={fanMode === tab.kind} onClick={() => setFanMode(tab.kind)}>{tab.label}</button>)}</div>
        {fans.map((fan,index)=><div key={fan.name} className={styles.fan}><span className={`${styles.fanRank} ${index===0?styles.fanRankGold:index===1?styles.fanRankSilver:index===2?styles.fanRankBronze:''}`}>{index+1}</span><span className={styles.avatar} style={{ background: fanColors[index % fanColors.length] }} aria-hidden="true"/><strong>{fan.name}</strong><span>{fmt(fan.score)}</span></div>)}
        {isLoggedIn&&<div className={`${styles.fan} ${styles.currentFan}`}><span>–</span><span className={styles.avatar} style={{ background: '#e2ecfd' }} aria-hidden="true"/><strong>อันดับของคุณ</strong><span>{fanMode === 'daily' ? bonus.daily : fanMode === 'monthly' ? bonus.monthly : tipTotal}</span></div>}
        <button className={styles.allButtonLink} onClick={()=>setFanOpen(true)}>ดูเพิ่มเติม ›</button>
      </section>}
      <section className={`${styles.card} ${styles.section}`}><div className={styles.sectionHeader}><h2 className={styles.sectionTitle}>เรื่องแนวเดียวกัน</h2></div><div className={styles.related}>{related.map((item)=><Link key={item.detailId} href={`/detail?bookId=${encodeURIComponent(item.detailId)}`} className={styles.relatedItem}><span className={styles.relatedCover} style={{background:item.coverGradient}}>{item.coverUrl && <Image unoptimized fill sizes="45px" src={item.coverUrl} alt="" className="object-cover"/>}</span><span><b>{item.title}</b><span>{item.authorName}<br/>{item.genreLabel}</span></span></Link>)}</div></section>
    </aside></div>
  </div>
  {!comingSoon && <><Dialog open={voteOpen} onOpenChange={setVoteOpen}>
    <DialogContent className={styles.voteDialog} overlayClassName={styles.dialogBackdrop}>
      <DialogHeader><DialogTitle className={styles.voteDialogTitle}>{voteKind === 'daily' ? 'โหวตแนะนำ' : 'โหวตรายเดือน'}</DialogTitle>
        <DialogDescription className={styles.voteDialogDescription}>{voteKind === 'daily' ? 'ร่วมโหวตแนะนำผลงานที่คุณชื่นชอบ คะแนนโหวตมีผลต่ออันดับแนะนำและการมองเห็นของผลงาน' : 'ร่วมโหวตจัดอันดับผลงานประจำเดือน ตั๋วเดือนใช้ได้ถึงวันสุดท้ายของเดือน'} <Link href="/legal?doc=tos">อ่านรายละเอียดเพิ่มเติม</Link></DialogDescription>
      </DialogHeader>
      <div className={styles.voteDialogSummary}><span>{work.title}</span><strong>{fmt(voteKind === 'daily' ? work.voteCount + bonus.daily : work.weeklyVoteCount + bonus.monthly)} ใบ</strong></div>
      <div className={styles.voteDialogSummary}><span>{voteKind === 'daily' ? 'สิทธิ์โหวตของคุณวันนี้' : 'ตั๋วเดือนของคุณ'}</span><strong>{availableTickets(voteKind)} ใบ</strong></div>
      <div className={styles.quantity}>
        <button type="button" aria-label="ลดจำนวนตั๋ว" disabled={voteAmount <= 1 || voteBusy} onClick={() => setVoteAmount((value) => Math.max(1, value - 1))}>−</button>
        <label className="sr-only" htmlFor="vote-amount">จำนวนตั๋ว</label><input id="vote-amount" type="number" min={1} max={Math.max(1,availableTickets(voteKind))} value={voteAmount} onChange={(event)=>setVoteAmount(Math.max(1, Math.min(Number(event.target.value) || 1, Math.max(1, availableTickets(voteKind)))))}/>
        <button type="button" aria-label="เพิ่มจำนวนตั๋ว" disabled={voteAmount >= availableTickets(voteKind) || voteBusy} onClick={() => setVoteAmount((value) => Math.min(availableTickets(voteKind), value + 1))}>+</button>
      </div>
      <button className={styles.voteConfirm} disabled={voteBusy || availableTickets(voteKind) <= 0} onClick={() => void submitVote()}>{voteBusy ? 'กำลังโหวต...' : `โหวต ${voteAmount} ใบ`}</button>
    </DialogContent>
  </Dialog>
  <Dialog open={fanOpen} onOpenChange={setFanOpen}><DialogContent className={styles.fanModal} overlayClassName={styles.dialogBackdrop}>
    <DialogHeader><DialogTitle className={styles.fanModalTitle}>แฟนคลับ</DialogTitle><DialogDescription className="sr-only">อันดับผู้โหวตและสนับสนุนผลงาน {work.title}</DialogDescription></DialogHeader>
    <div className={styles.sideTabs}>{fanTabs.map((tab) => <button key={tab.kind} className={fanMode === tab.kind ? styles.sideTabActive : ''} aria-pressed={fanMode === tab.kind} onClick={() => setFanMode(tab.kind)}>{tab.label}</button>)}</div>
    <div className={styles.fanPeriods}>{([{ kind: 'today', label: 'วันนี้' }, { kind: 'month', label: 'เดือนนี้' }, { kind: 'all', label: 'ตลอดกาล' }] satisfies Array<{ kind: typeof fanPeriod; label: string }>).map((period) => <button key={period.kind} aria-pressed={fanPeriod === period.kind} onClick={() => setFanPeriod(period.kind)}>{period.label}</button>)}</div>
    <div className={styles.fanPodium}>{[1,0,2].map((index) => {const fan = fans[index];return fan && <div key={fan.name} className={index === 0 ? styles.fanWinner : ''}><div className={styles.podiumAvatar} style={{ background: fanColors[index] }}><span>{index + 1}</span></div><strong>{fan.name}</strong><small>{fmt(fan.score)} {fanMode === 'tip' ? 'เหรียญ' : 'ใบ'}</small></div>})}</div>
    {isLoggedIn && <div className={styles.fanOwnRank}><span>—</span><span className={styles.avatar} style={{ background: '#e2ecfd' }} aria-hidden="true"/><strong>อันดับของคุณ</strong><span>{fanMode === 'daily' ? bonus.daily : fanMode === 'monthly' ? bonus.monthly : tipTotal}</span></div>}
    <div className={styles.fanDialog}>{fans.slice(3).map((fan,index)=><div key={fan.name} className={styles.fan}><span className={styles.fanRank}>{index+4}</span><span className={styles.avatar} style={{ background: fanColors[(index + 3) % fanColors.length] }} aria-hidden="true"/><strong>{fan.name}</strong><span>{fmt(fan.score)}</span></div>)}</div>
  </DialogContent></Dialog>
  <Dialog open={Boolean(historyReview)} onOpenChange={(open) => !open && setReviewHistoryId(null)}><DialogContent className={styles.reviewHistoryDialog} overlayClassName={styles.dialogBackdrop}>
    <DialogHeader><DialogTitle className={styles.reviewHistoryTitle}>ประวัติรีวิว · {historyReview?.authorName}</DialogTitle></DialogHeader>
    {historyReview && <div className={styles.reviewHistoryList}>{[{ ...historyReview, createdAt: historyReview.updatedAt ?? historyReview.createdAt }, ...[...(historyReview.history ?? [])].reverse()].map((version, index) => <article key={`${version.createdAt}-${index}`} className={styles.reviewHistoryItem}>
      <div className={styles.reviewHistoryMeta}>{index === 0 && <b>ล่าสุด</b>}{version.readEpisodeCount !== undefined && <span>อ่านไปแล้ว {version.readEpisodeCount.toLocaleString()} {chapterUnit}</span>}<span className={version.recommended ? styles.reviewRecommended : styles.reviewNotRecommended}>{version.recommended ? 'แนะนำ' : 'ไม่แนะนำ'}</span><time>{formatEpisodeDate(version.createdAt)}</time></div>
      {version.spoiler && <span className={styles.reviewCharacterCount}>เนื้อหาที่มีการสปอย</span>}<p>{version.body}</p>
    </article>)}</div>}
  </DialogContent></Dialog>
  <DonateModal authorName={work.authorName} detailId={work.detailId} open={donateOpen} onOpenChange={setDonateOpen} appearance="detail" onSuccess={(amount)=>{setTipTotal((value)=>value+amount);setTipCount((value)=>value+1);setNotice('ส่งกำลังใจให้นักเขียนแล้ว')}}/></>}
  <PurchaseEpisodeModal episode={purchaseEpisode} workTitle={work.title} open={Boolean(purchaseEpisode)} onOpenChange={(open)=>!open&&setPurchaseEpisode(null)} onPurchased={purchasedEpisode} serverPurchase={serverBacked ? purchaseOnServer : undefined}/>
  {showAudioPlayer && <AudioPlayerBar ref={audioPlayerRef} episodes={sortedEpisodes} authorName={work.authorName} coverUrl={work.coverUrl} coverGradient={work.coverGradient} onStateChange={(id, playing) => { setAudioActiveId(id); setAudioPlaying(playing) }}/>}
  {notice&&<div className={styles.notice}>{notice}</div>}</div>
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

function ReviewReplyIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><g transform="translate(24,0) scale(-1,1)"><path d="M13.5 3.2 L22.8 12 L13.5 20.8 V16.3 C7.6 16.3 3.6 17.9 1.2 21.4 C1.6 13.2 6.2 9.2 13.5 8.8 Z"/></g></svg>
}

function ReviewBody({ body }: { body: string }) {
  const [expanded, setExpanded] = useState(false)
  const [excerpt, setExcerpt] = useState<string | null>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    const element = bodyRef.current
    if (!element || expanded) return
    const measure = () => {
      const probe = element.cloneNode(false)
      if (!(probe instanceof HTMLParagraphElement)) return
      probe.style.visibility = 'hidden'
      probe.style.display = 'block'
      element.before(probe)
      try {
        const maxHeight = Number.parseFloat(getComputedStyle(element).lineHeight) * 3 + 1
        probe.textContent = body
        if (probe.getBoundingClientRect().height <= maxHeight) { setExcerpt(null); return }
        const more = document.createElement('button')
        more.className = styles.reviewInlineMore
        more.textContent = '...อ่านเพิ่มเติม'
        let low = 0
        let high = body.length
        let best = 0
        while (low <= high) {
          const middle = Math.floor((low + high) / 2)
          probe.replaceChildren(document.createTextNode(body.slice(0, middle) + ' '), more)
          if (probe.getBoundingClientRect().height <= maxHeight) { best = middle; low = middle + 1 }
          else high = middle - 1
        }
        const text = body.slice(0, best)
        const wordEnd = text.lastIndexOf(' ')
        setExcerpt((wordEnd > 0 ? text.slice(0, wordEnd) : text).trimEnd())
      } finally { probe.remove() }
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [body, expanded])
  return <p ref={bodyRef} className={styles.reviewBody}>{expanded || excerpt === null ? body : excerpt}{excerpt !== null && <> <button type="button" className={styles.reviewInlineMore} onClick={() => setExpanded((value) => !value)}>{expanded ? 'ย่อเนื้อหา' : '...อ่านเพิ่มเติม'}</button></>}</p>
}
