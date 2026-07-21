import { forwardBackoffice } from '@/lib/backoffice-proxy'

export async function POST(request: Request) {
  return forwardBackoffice(request, '/api/auth/member/wallet/topups')
}
