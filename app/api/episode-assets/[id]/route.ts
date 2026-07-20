import { forwardBackoffice } from '@/lib/backoffice-proxy'
type Context = { params: Promise<{ id: string }> }
export async function GET(request: Request, context: Context) {
  return forwardBackoffice(request, `/api/auth/member/episode-assets/${encodeURIComponent((await context.params).id)}`)
}
