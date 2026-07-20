import { forwardBackoffice } from '@/lib/backoffice-proxy'

export async function GET(request: Request) {
  return forwardBackoffice(request, '/api/auth/member/wallet')
}
