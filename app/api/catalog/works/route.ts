import { forwardBackoffice } from '@/lib/backoffice-proxy'

export function GET(request: Request) {
  return forwardBackoffice(request, '/api/public/catalog/works')
}
