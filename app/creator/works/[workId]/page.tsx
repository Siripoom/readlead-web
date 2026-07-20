import RouteGuard from '@/components/layout/RouteGuard'
import CreatorWorkManager from '@/components/creator/CreatorWorkManager'

export default async function CreatorWorkDetailPage({ params }: PageProps<'/creator/works/[workId]'>) {
  const { workId } = await params
  return (
    <RouteGuard allowedRoles={['creator', 'admin']}>
      <CreatorWorkManager workId={workId} />
    </RouteGuard>
  )
}
