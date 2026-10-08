import { forwardBackoffice } from '@/lib/backoffice-proxy'

export async function GET(request: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key } = await context.params
  return forwardBackoffice(request, `/api/public/media/${key.map(encodeURIComponent).join('/')}`)
}
