import { forwardBackoffice } from '@/lib/backoffice-proxy'

type Context = { params: Promise<{ action: string }> }

export async function GET(request: Request, context: Context) {
  return forwardBackoffice(request, `/api/auth/member/interactions/${encodeURIComponent((await context.params).action)}`)
}

export async function POST(request: Request, context: Context) {
  return forwardBackoffice(request, `/api/auth/member/interactions/${encodeURIComponent((await context.params).action)}`)
}

export async function PATCH(request: Request, context: Context) {
  return forwardBackoffice(request, `/api/auth/member/interactions/${encodeURIComponent((await context.params).action)}`)
}

export async function DELETE(request: Request, context: Context) {
  return forwardBackoffice(request, `/api/auth/member/interactions/${encodeURIComponent((await context.params).action)}`)
}
