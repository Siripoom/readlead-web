'use client'

import { useParams } from 'next/navigation'
import BulkEpisodePageLoader from '@/components/creator/BulkEpisodePageLoader'

export default function BulkEpisodePage(){const {workId}=useParams<{workId:string}>();return <BulkEpisodePageLoader workId={workId}/>} 
