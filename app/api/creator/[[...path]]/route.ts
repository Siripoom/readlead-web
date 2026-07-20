import { forwardBackoffice } from '@/lib/backoffice-proxy'

type Context = { params: Promise<{ path?: string[] }> }

async function forward(request: Request, context: Context) {
  const path = (await context.params).path ?? []
  return forwardBackoffice(request, `/api/auth/member/creator/${path.map(encodeURIComponent).join('/')}`)
}

export const GET = forward
export const POST = forward
export const PATCH = forward
export const DELETE = forward
