import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.BACKOFFICE_API_URL?.replace(/\/$/, '')
  if (!baseUrl) {
    console.error('BACKOFFICE_API_URL is not configured')
    return NextResponse.json({ error: 'ระบบข้อมูลที่อยู่ยังไม่พร้อมใช้งาน' }, { status: 503 })
  }

  const upstreamUrl = new URL(`${baseUrl}/api/auth/member/writer-application/addresses`)
  request.nextUrl.searchParams.forEach((value, key) => upstreamUrl.searchParams.append(key, value))
  const headers = new Headers({ Accept: 'application/json' })
  const cookie = request.headers.get('cookie')
  if (cookie) headers.set('cookie', cookie)

  try {
    const upstream = await fetch(upstreamUrl, { headers, cache: 'no-store', redirect: 'manual' })
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Type': upstream.headers.get('content-type') ?? 'application/json; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Thai address upstream request failed', error)
    return NextResponse.json({ error: 'โหลดข้อมูลที่อยู่ไม่สำเร็จ กรุณาลองใหม่' }, { status: 503 })
  }
}
