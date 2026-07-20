import { NextRequest, NextResponse } from 'next/server'

function getBackofficeUrl() {
  return process.env.BACKOFFICE_API_URL?.replace(/\/$/, '')
}

async function forward(request: NextRequest, method: 'GET' | 'POST') {
  const baseUrl = getBackofficeUrl()
  if (!baseUrl) {
    console.error('BACKOFFICE_API_URL is not configured')
    return NextResponse.json({ error: 'ระบบสมัครนักเขียนยังไม่พร้อมใช้งาน' }, { status: 503 })
  }

  const headers = new Headers({ Accept: 'application/json' })
  const cookie = request.headers.get('cookie')
  const contentType = request.headers.get('content-type')
  const contentLength = request.headers.get('content-length')
  if (cookie) headers.set('cookie', cookie)
  if (contentType) headers.set('content-type', contentType)
  if (contentLength) headers.set('content-length', contentLength)

  try {
    const upstream = await fetch(`${baseUrl}/api/auth/member/writer-application`, {
      method,
      headers,
      body: method === 'POST' ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
      redirect: 'manual',
    })
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': upstream.headers.get('content-type') ?? 'application/json; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Writer application upstream request failed', error)
    return NextResponse.json({ error: 'เชื่อมต่อระบบสมัครนักเขียนไม่สำเร็จ กรุณาลองใหม่' }, { status: 503 })
  }
}

export function GET(request: NextRequest) {
  return forward(request, 'GET')
}

export function POST(request: NextRequest) {
  return forward(request, 'POST')
}
