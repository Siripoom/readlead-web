import { forwardBackoffice } from '@/lib/backoffice-proxy'

export async function GET(request: Request) {
  return forwardBackoffice(request, '/api/auth/member/reports')
}

export async function POST(request: Request) {
  return forwardBackoffice(request, '/api/auth/member/reports')
}
