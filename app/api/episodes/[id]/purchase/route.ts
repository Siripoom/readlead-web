import { forwardBackoffice } from '@/lib/backoffice-proxy'

type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Context) {
  return forwardBackoffice(request, `/api/auth/member/episodes/${encodeURIComponent((await context.params).id)}/purchase`)
}

export async function POST(request: Request, context: Context) {
  return forwardBackoffice(request, `/api/auth/member/episodes/${encodeURIComponent((await context.params).id)}/purchase`)
}
