import { notFound } from 'next/navigation'
import RouteGuard from '@/components/layout/RouteGuard'
import CreatorWorkForm from '@/components/creator/CreatorWorkForm'
import type { CreatorWorkType } from '@/lib/creator-studio-types'
export default async function NewWorkFormPage({ params }: PageProps<'/creator/works/new/[type]'>) {
  const { type: rawType } = await params
  if (!['novel', 'manga', 'audiobook'].includes(rawType)) notFound()
  const type = rawType as CreatorWorkType
  return (
    <RouteGuard allowedRoles={['creator', 'admin']}>
      <CreatorWorkForm type={type} />
    </RouteGuard>
  )
}
