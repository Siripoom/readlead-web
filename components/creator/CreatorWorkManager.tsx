'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, BookOpen, CheckCircle2, Coins, Edit3, Eye, FileText, LoaderCircle, MessageCircle, Plus, Send, Star, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { CreatorEpisodeRecord, CreatorWorkDetail } from '@/lib/creator-studio-types'
import { CreatorStudioShell, creatorStudioStyles as styles } from './CreatorStudioShell'
import CreatorCover from './CreatorCover'

const statusLabel = { draft: 'ฉบับร่าง', pending_review: 'รอตรวจสอบ', approved: 'อนุมัติแล้ว', published: 'เผยแพร่แล้ว', rejected: 'ไม่ผ่านการตรวจ', deletion_pending: 'รออนุมัติการลบ', archived: 'เก็บถาวร' }
const episodeStatus = { draft: 'ฉบับร่าง', scheduled: 'ตั้งเวลา', published: 'เผยแพร่', hidden: 'ซ่อน' }
const typeLabel = { novel: 'นิยาย', manga: 'เว็บตูน', audiobook: 'หนังสือเสียง' }

function date(value: string | null | undefined) { return value ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—' }
async function responseError(response: Response, fallback = 'ดำเนินการไม่สำเร็จ') { const data = await response.json().catch(() => ({})) as { error?: string }; return data.error || fallback }

export default function CreatorWorkManager({ workId }: { workId: string }) {
  const [work, setWork] = useState<CreatorWorkDetail | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'episodes' | 'reviews' | 'comments'>('episodes')
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled'>('all')
  const [actionBusy, setActionBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [deleteEpisode, setDeleteEpisode] = useState<CreatorEpisodeRecord | null>(null)

  const loadWork = useCallback((signal?: AbortSignal) => fetch(`/api/creator/works/${workId}`, { cache: 'no-store', signal })
    .then(async (response) => { if (!response.ok) throw new Error(await responseError(response, 'โหลดข้อมูลผลงานไม่สำเร็จ')); return response.json() as Promise<{ work: CreatorWorkDetail }> })
    .then((data) => setWork(data.work))
    .catch((cause) => { if (cause instanceof Error && cause.name !== 'AbortError') setError(cause.message) }), [workId])

  useEffect(() => { const controller = new AbortController(); void loadWork(controller.signal); return () => controller.abort() }, [loadWork])
  async function submitReview() { setActionBusy(true); setActionError(''); try { const response = await fetch(`/api/creator/works/${workId}/submit-review`, { method: 'POST' }); if (!response.ok) throw new Error(await responseError(response)); await loadWork() } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'ส่งตรวจสอบไม่สำเร็จ') } finally { setActionBusy(false) } }
  async function removeEpisode() { if (!deleteEpisode) return; setActionBusy(true); setActionError(''); try { const response = await fetch(`/api/creator/episodes/${deleteEpisode.id}`, { method: 'DELETE' }); if (!response.ok) throw new Error(await responseError(response, 'ลบตอนไม่สำเร็จ')); setDeleteEpisode(null); await loadWork() } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'ลบตอนไม่สำเร็จ') } finally { setActionBusy(false) } }

  const episodes = useMemo(() => work?.episodes.filter((episode) => filter === 'all' || episode.status === filter) ?? [], [filter, work])
  if (error) return <CreatorStudioShell><div className={styles.empty}><AlertCircle size={34} /><b>{error}</b><Link href="/creator" className={styles.secondary}>กลับแดชบอร์ด</Link></div></CreatorStudioShell>
  if (!work) return <main className={styles.studio}><div className={styles.loading}><LoaderCircle className={styles.spin} size={20} />กำลังโหลดผลงาน…</div></main>

  const publishedEpisodes = work.episodes.filter((episode) => episode.status === 'published').length
  const stats: Array<{ label: string; value: number; Icon: LucideIcon }> = [
    { label: 'ยอดอ่าน', value: work.views, Icon: Eye }, { label: 'เหรียญ', value: work.coins, Icon: Coins }, { label: 'ตอนเผยแพร่', value: publishedEpisodes, Icon: FileText }, { label: 'รีวิว', value: work.reviewCount, Icon: Star }, { label: 'ความคิดเห็น', value: work.commentCount, Icon: MessageCircle }, { label: 'ชั้นหนังสือ', value: work.shelfCount, Icon: BookOpen },
  ]
  return <CreatorStudioShell>
    <section className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ height: 80, background: 'linear-gradient(110deg,#f8dadd,#cc4452 55%,#9d3040)' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '112px minmax(0,1fr)', gap: 20, padding: '0 24px 24px' }}>
        <CreatorCover workId={work.id} type={work.type} title={work.title} iconSize={38} style={{ marginTop: -42, aspectRatio: '2/3', display: 'grid', placeItems: 'center', border: '4px solid white', borderRadius: 12, background: '#fae8ea', color: '#cc4452' }} />
        <div style={{ paddingTop: 18 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}><div><div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}><span className={styles.status}>{typeLabel[work.type]}</span><span className={`${styles.status} ${work.status === 'published' || work.status === 'approved' ? styles.statusPublished : work.status === 'rejected' ? styles.statusRejected : ''}`}>{statusLabel[work.status]}</span><span className={styles.status}>{work.origin === 'translated' ? 'ผลงานแปล' : 'ผลงานต้นฉบับ'}</span></div><h1 style={{ margin: '10px 0 4px', fontSize: 26 }}>{work.title}</h1><p className={styles.help}>{work.tagline || work.synopsis || 'ยังไม่มีคำโปรย'}</p></div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{work.status === 'published' && <Link className={styles.secondary} href={`/detail?bookId=${work.id}`}><Eye size={15} />ดูหน้าสาธารณะ</Link>}{work.status !== 'pending_review' && !['archived','deletion_pending'].includes(work.status) && <Link className={styles.primary} href={`/creator/works/${work.id}/edit`}><Edit3 size={15} />แก้ไขข้อมูล</Link>}</div></div>
        {work.rejectionReason && <div className={styles.alert} style={{ marginTop: 12 }}>เหตุผลที่ไม่ผ่าน: {work.rejectionReason}</div>}
        {work.status === 'pending_review' && <div className={styles.warning} style={{ marginTop: 12 }}>ส่งตรวจเมื่อ {date(work.moderation?.submittedAt)} ระหว่างนี้เพิ่มตอนได้เฉพาะฉบับร่าง</div>}
        {work.status === 'approved' && <div className={styles.success} style={{ marginTop: 12 }}><CheckCircle2 size={15} style={{ display: 'inline', marginRight: 6 }} />ผลงานผ่านการอนุมัติแล้ว สามารถเผยแพร่ตอนแรกได้</div>}
        {work.capabilities.canSubmitReview && <div className={styles.note} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><span>{work.status === 'rejected' ? 'แก้ไขตามเหตุผลแล้วส่งตรวจใหม่ได้' : 'ส่งข้อมูลผลงานให้ผู้ดูแลตรวจสอบ'}</span><button className={styles.primary} disabled={actionBusy} onClick={() => void submitReview()}>{actionBusy ? <LoaderCircle className={styles.spin} size={14} /> : <Send size={14} />}ส่งตรวจ</button></div>}
      </div></div>
    </section>
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(135px,1fr))', gap: 10, margin: '16px 0' }}>{stats.map(({ label, value, Icon }) => <div className={styles.card} style={{ padding: 15 }} key={label}><Icon size={18} color="#cc4452" /><b style={{ display: 'block', fontSize: 20, marginTop: 9 }}>{value.toLocaleString('th-TH')}</b><span className={styles.help}>{label}</span></div>)}</section>
    {actionError && <div role="alert" className={styles.alert} style={{ marginBottom: 14 }}>{actionError}</div>}
    <section className={styles.card} style={{ padding: 0, overflow: 'hidden' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', padding: '0 14px' }}><div className={styles.tabs} role="tablist">{([['episodes',`ตอน (${work.episodes.length})`],['reviews',`รีวิว (${work.reviews.length})`],['comments',`ความคิดเห็น (${work.comments.length})`]] as const).map(([value,label]) => <button key={value} role="tab" aria-selected={tab === value} className={tab === value ? styles.tabActive : ''} onClick={() => setTab(value)}>{label}</button>)}</div>{tab === 'episodes' && work.capabilities.canCreateDraftEpisode && <div style={{ display: 'flex', gap: 7, padding: 8 }}><Link className={styles.secondary} href={`/creator/works/${work.id}/episodes/new`}><Plus size={14} />เพิ่มตอนใหม่</Link>{work.type !== 'manga' && <Link className={styles.primary} href={`/creator/works/${work.id}/episodes/bulk`}><Plus size={14} />เพิ่มหลายตอน</Link>}</div>}</div>
      {tab === 'episodes' && <><div style={{ display: 'flex', gap: 6, padding: 14, borderTop: '1px solid #e7e8ee' }}>{([['all','ทั้งหมด'],['draft','ฉบับร่าง'],['scheduled','ตั้งเวลา']] as const).map(([value,label]) => <button key={value} className={filter === value ? styles.primary : styles.secondary} onClick={() => setFilter(value)}>{label}</button>)}</div><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>ตอน</th><th>ชื่อ</th><th>วันที่เผยแพร่</th><th>ยอดอ่าน</th><th>เหรียญ</th><th>ความคิดเห็น</th><th>ราคา</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>{episodes.map((episode) => <tr key={episode.id}><td>{episode.episodeNumber}</td><td className={styles.title}><b>{episode.title}</b><div className={styles.help}>{episode.type === 'text' ? `${episode.content?.replace(/<[^>]+>/g, '').length ?? 0} ตัวอักษร` : episode.type === 'image' ? 'ตอนแบบภาพ' : `${Math.ceil((episode.durationSeconds ?? 0) / 60)} นาที`}</div></td><td>{date(episode.publishedAt || episode.scheduledAt)}</td><td>—</td><td>—</td><td>—</td><td>{episode.priceCoins ? `${episode.priceCoins} เหรียญ` : 'ฟรี'}</td><td><span className={`${styles.status} ${episode.status === 'published' ? styles.statusPublished : episode.status === 'scheduled' ? styles.statusScheduled : ''}`}>{episodeStatus[episode.status]}</span></td><td><div style={{ display: 'flex', gap: 5 }}><Link className={styles.secondary} href={`/creator/works/${work.id}/episodes/${episode.id}/edit`}>แก้ไข</Link><button className={styles.danger} onClick={() => setDeleteEpisode(episode)} aria-label={`ลบ ${episode.title}`}><Trash2 size={13} /></button></div></td></tr>)}</tbody></table></div>{episodes.length === 0 && <div className={styles.empty}><FileText size={36} /><b>{filter === 'all' ? 'ยังไม่มีตอน' : 'ไม่พบตอนในสถานะนี้'}</b>{work.capabilities.canCreateDraftEpisode && <Link className={styles.primary} href={`/creator/works/${work.id}/episodes/new`}>เพิ่มตอนแรก</Link>}</div>}</>}
      {tab === 'reviews' && <div>{work.reviews.map((review) => <article key={review.id} style={{ padding: 18, borderTop: '1px solid #e7e8ee' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{review.user.name}</b><span style={{ color: '#dc9511' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span></div><p style={{ fontSize: 13 }}>{review.body}</p><time className={styles.help}>{date(review.createdAt)}</time></article>)}{work.reviews.length === 0 && <div className={styles.empty}>ยังไม่มีรีวิวจากนักอ่าน</div>}</div>}
      {tab === 'comments' && <div>{work.comments.map((comment) => <article key={comment.id} style={{ padding: 18, borderTop: '1px solid #e7e8ee' }}><b>{comment.user.name}</b><p style={{ fontSize: 13 }}>{comment.body}</p><time className={styles.help}>{date(comment.createdAt)}</time>{comment.replies.map((reply) => <div key={reply.id} className={styles.note} style={{ marginLeft: 24 }}><b>{reply.user.name}</b><p>{reply.body}</p></div>)}</article>)}{work.comments.length === 0 && <div className={styles.empty}>ยังไม่มีความคิดเห็นจากนักอ่าน</div>}</div>}
    </section>
    {deleteEpisode && <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'grid', placeItems: 'center', background: 'rgba(20,20,25,.45)', padding: 20 }}><div className={styles.card} style={{ width: 'min(440px,100%)' }}><h2>ลบตอน “{deleteEpisode.title}”</h2><p className={styles.help}>รายการนี้ไม่สามารถกู้คืนได้ โปรดยืนยันว่าต้องการลบตอนนี้</p><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}><button className={styles.secondary} onClick={() => setDeleteEpisode(null)}>ยกเลิก</button><button className={styles.danger} disabled={actionBusy} onClick={() => void removeEpisode()}>{actionBusy ? <LoaderCircle className={styles.spin} size={14} /> : <Trash2 size={14} />}ยืนยันลบ</button></div></div></div>}
  </CreatorStudioShell>
}
