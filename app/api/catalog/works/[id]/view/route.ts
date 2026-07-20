import { forwardBackoffice } from '@/lib/backoffice-proxy'

type Context = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: Context) {
  return forwardBackoffice(request, `/api/public/works/${encodeURIComponent((await context.params).id)}/view`)
}
