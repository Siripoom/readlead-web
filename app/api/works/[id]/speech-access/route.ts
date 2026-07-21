import { forwardBackoffice } from '@/lib/backoffice-proxy'

type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Context) {
  return forwardBackoffice(request, `/api/auth/member/works/${encodeURIComponent((await context.params).id)}/speech-access`)
}

export async function POST(request: Request, context: Context) {
  return forwardBackoffice(request, `/api/auth/member/works/${encodeURIComponent((await context.params).id)}/speech-access`)
}
