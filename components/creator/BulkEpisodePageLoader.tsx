'use client'

import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import RouteGuard from '@/components/layout/RouteGuard'
import type { CreatorWorkDetail } from '@/lib/creator-studio-types'
import BulkEpisodeUploader from './BulkEpisodeUploader'
import { creatorStudioStyles as styles } from './CreatorStudioShell'

export default function BulkEpisodePageLoader({ workId }: { workId: string }) {
  const [work,setWork] = useState<CreatorWorkDetail|null>(null)
  const [error,setError] = useState('')
  useEffect(() => { const controller=new AbortController(); fetch(`/api/creator/works/${workId}`,{cache:'no-store',signal:controller.signal}).then(async(response)=>{const data=await response.json().catch(()=>({})) as {work?:CreatorWorkDetail;error?:string};if(!response.ok||!data.work)throw new Error(data.error||'โหลดข้อมูลผลงานไม่สำเร็จ');if(data.work.type==='manga')throw new Error('มังงะรองรับการเพิ่มหลายหน้าภายในหนึ่งตอน แต่ยังไม่รองรับการเพิ่มหลายตอนพร้อมกัน');setWork(data.work)}).catch((cause)=>{if(cause instanceof Error&&cause.name!=='AbortError')setError(cause.message)});return()=>controller.abort() },[workId])
  return <RouteGuard allowedRoles={['creator','admin']}>{work ? <BulkEpisodeUploader work={work} /> : <main className={styles.studio}><div className={styles.loading}>{error || <><LoaderCircle className={styles.spin} size={20}/>กำลังโหลดข้อมูลผลงาน…</>}</div></main>}</RouteGuard>
}
