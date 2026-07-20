'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import CreatorWorkForm from '@/components/creator/CreatorWorkForm'
import RouteGuard from '@/components/layout/RouteGuard'
import type { CreatorWorkDetail } from '@/lib/creator-studio-types'
import { creatorStudioStyles as styles } from '@/components/creator/CreatorStudioShell'

export default function EditWorkPage() {
  const { workId } = useParams<{ workId: string }>()
  const [work, setWork] = useState<CreatorWorkDetail | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/creator/works/${workId}`, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => { const body = await response.json().catch(() => ({})) as { work?: CreatorWorkDetail; error?: string }; if (!response.ok || !body.work) throw new Error(body.error || 'โหลดข้อมูลผลงานไม่สำเร็จ'); setWork(body.work) })
      .catch((cause) => { if (cause instanceof Error && cause.name !== 'AbortError') setError(cause.message) })
    return () => controller.abort()
  }, [workId])
  return <RouteGuard allowedRoles={['creator', 'admin']}>{work ? <CreatorWorkForm type={work.type} work={work} /> : <main className={styles.studio}><div className={styles.loading}>{error || <><LoaderCircle className={styles.spin} size={20} />กำลังโหลดข้อมูลผลงาน…</>}</div></main>}</RouteGuard>
}
