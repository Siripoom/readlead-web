import { notFound, redirect } from 'next/navigation'
import { MOCK_CREATORS } from '@/lib/mock-data'

export default async function LegacyWriterRedirect({ searchParams }: PageProps<'/writer'>) {
  const { writerId } = await searchParams
  if (typeof writerId !== 'string' || !MOCK_CREATORS.some((creator) => creator.id === writerId)) notFound()
  redirect(`/profile/${encodeURIComponent(writerId)}`)
}
