export interface ReaderContentReportContext {
  workId: string
  workTitle: string
  episodeId: string
  episodeTitle: string
  slotLabel: string
}

async function responseMessage(response: Response) {
  const payload = await response.json().catch(() => null) as { error?: string; message?: string } | null
  return payload?.error || payload?.message || 'ส่งรายงานไม่สำเร็จ กรุณาลองใหม่'
}

export async function submitReaderContentReport(context: ReaderContentReportContext, detail: string) {
  const form = new FormData()
  form.set('subject', `รายงานเนื้อหาจากหน้าอ่าน: ${context.workTitle}`.slice(0, 160))
  form.set('type', 'content')
  form.set('message', [
    detail.trim(),
    '',
    `ผลงาน: ${context.workTitle} (${context.workId})`,
    `ตอน: ${context.episodeTitle} (${context.episodeId})`,
    `ตำแหน่ง: ${context.slotLabel}`,
  ].join('\n'))

  const response = await fetch('/api/member/reports', { method: 'POST', body: form })
  if (!response.ok) throw new Error(await responseMessage(response))
}
