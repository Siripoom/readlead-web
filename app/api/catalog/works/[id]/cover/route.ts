import { forwardBackoffice } from '@/lib/backoffice-proxy'

type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Context) {
  const { id } = await context.params
  return forwardBackoffice(request, `/api/public/catalog/works/${encodeURIComponent(id)}/cover`)
}
