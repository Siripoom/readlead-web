import { forwardBackoffice } from '@/lib/backoffice-proxy'

export async function GET(request: Request, context: RouteContext<'/api/member/reports/[id]'>) {
  return forwardBackoffice(request, `/api/auth/member/reports/${encodeURIComponent((await context.params).id)}`)
}

export async function POST(request: Request, context: RouteContext<'/api/member/reports/[id]'>) {
  return forwardBackoffice(request, `/api/auth/member/reports/${encodeURIComponent((await context.params).id)}`)
}
