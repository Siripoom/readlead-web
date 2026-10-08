import { forwardBackoffice } from '@/lib/backoffice-proxy'

export async function GET(request: Request, context: { params: Promise<{ id: string; attachmentId: string }> }) {
  const { id, attachmentId } = await context.params
  return forwardBackoffice(request, `/api/auth/member/reports/${encodeURIComponent(id)}/attachments/${encodeURIComponent(attachmentId)}`)
}
