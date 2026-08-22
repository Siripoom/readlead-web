import { forwardBackoffice } from '@/lib/backoffice-proxy'

type Context = { params: Promise<{ chargeId: string }> }

export async function GET(request: Request, context: Context) {
  return forwardBackoffice(request, `/api/auth/member/wallet/topups/charge/${encodeURIComponent((await context.params).chargeId)}`)
}
