'use client'

import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import RouteGuard from '@/components/layout/RouteGuard'
import type { CreatorWorkDetail } from '@/lib/creator-studio-types'
import CreatorEpisodeEditor from './CreatorEpisodeEditor'
import { creatorStudioStyles as styles } from './CreatorStudioShell'

export default function CreatorEpisodePageLoader({ workId, episodeId }: { workId: string; episodeId?: string }) {
  const [work, setWork] = useState<CreatorWorkDetail | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { const controller = new AbortController(); fetch(`/api/creator/works/${workId}`, { cache: 'no-store', signal: controller.signal }).then(async (response) => { const data = await response.json().catch(() => ({})) as { work?: CreatorWorkDetail; error?: string }; if (!response.ok || !data.work) throw new Error(data.error || 'โหลดข้อมูลตอนไม่สำเร็จ'); if (episodeId && !data.work.episodes.some((item) => item.id === episodeId)) throw new Error('ไม่พบตอนที่ต้องการแก้ไข'); setWork(data.work) }).catch((cause) => { if (cause instanceof Error && cause.name !== 'AbortError') setError(cause.message) }); return () => controller.abort() }, [episodeId, workId])
  return <RouteGuard allowedRoles={['creator','admin']}>{work ? <CreatorEpisodeEditor work={work} episode={episodeId ? work.episodes.find((item) => item.id === episodeId) : undefined} /> : <main className={styles.studio}><div className={styles.loading}>{error || <><LoaderCircle className={styles.spin} size={20} />กำลังโหลดข้อมูลตอน…</>}</div></main>}</RouteGuard>
}
