import { NextResponse } from 'next/server'

export async function forwardBackoffice(request: Request, path: string) {
  const baseUrl = process.env.BACKOFFICE_API_URL?.replace(/\/$/, '')
  if (!baseUrl) return NextResponse.json({ error: 'ระบบหลังบ้านยังไม่พร้อมใช้งาน' }, { status: 503 })
  const sourceUrl = new URL(request.url)
  const headers = new Headers({ Accept: request.headers.get('accept') ?? 'application/json' })
  for (const name of ['cookie', 'content-type', 'content-length', 'range', 'if-none-match', 'idempotency-key']) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }
  try {
    const upstream = await fetch(`${baseUrl}${path}${sourceUrl.search}`, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(),
      cache: 'no-store',
      redirect: 'manual',
    })
    const responseHeaders = new Headers()
    for (const name of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'content-disposition', 'etag', 'set-cookie']) {
      const value = upstream.headers.get(name)
      if (value) responseHeaders.set(name, value)
    }
    responseHeaders.set('Cache-Control', upstream.headers.get('cache-control') ?? 'private, no-store')
    responseHeaders.set('X-Content-Type-Options', upstream.headers.get('x-content-type-options') ?? 'nosniff')
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
  } catch (error) {
    console.error('Backoffice proxy request failed', { path, error: error instanceof Error ? error.name : 'UnknownError' })
    return NextResponse.json({ error: 'เชื่อมต่อระบบหลังบ้านไม่สำเร็จ' }, { status: 503 })
  }
}
