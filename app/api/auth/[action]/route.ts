import { NextRequest, NextResponse } from 'next/server'

const ACTION_METHODS = {
  login: 'POST',
  register: 'POST',
  session: 'GET',
  logout: 'POST',
} as const

type AuthAction = keyof typeof ACTION_METHODS

function isAuthAction(value: string): value is AuthAction {
  return value in ACTION_METHODS
}

async function forwardAuthRequest(
  request: NextRequest,
  context: RouteContext<'/api/auth/[action]'>,
  method: 'GET' | 'POST',
) {
  const { action } = await context.params
  if (!isAuthAction(action)) return NextResponse.json({ error: 'ไม่พบ API ที่ร้องขอ' }, { status: 404 })
  if (ACTION_METHODS[action] !== method) {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: ACTION_METHODS[action] } })
  }

  const baseUrl = process.env.BACKOFFICE_API_URL?.replace(/\/$/, '')
  if (!baseUrl) {
    console.error('BACKOFFICE_API_URL is not configured')
    return NextResponse.json({ error: 'ระบบสมาชิกยังไม่พร้อมใช้งาน' }, { status: 503 })
  }

  const headers = new Headers({ Accept: 'application/json' })
  const cookie = request.headers.get('cookie')
  const contentType = request.headers.get('content-type')
  if (cookie) headers.set('cookie', cookie)
  if (contentType) headers.set('content-type', contentType)

  try {
    const upstream = await fetch(`${baseUrl}/api/auth/member/${action}`, {
      method,
      headers,
      body: method === 'POST' ? await request.text() : undefined,
      cache: 'no-store',
      redirect: 'manual',
    })
    const responseHeaders = new Headers({
      'cache-control': 'no-store',
      'content-type': upstream.headers.get('content-type') ?? 'application/json; charset=utf-8',
    })
    const setCookie = upstream.headers.get('set-cookie')
    if (setCookie) responseHeaders.set('set-cookie', setCookie)

    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
  } catch (error) {
    console.error(`Auth upstream request failed for ${action}`, error)
    return NextResponse.json({ error: 'เชื่อมต่อระบบสมาชิกไม่สำเร็จ กรุณาลองใหม่' }, { status: 503 })
  }
}

export function GET(request: NextRequest, context: RouteContext<'/api/auth/[action]'>) {
  return forwardAuthRequest(request, context, 'GET')
}

export function POST(request: NextRequest, context: RouteContext<'/api/auth/[action]'>) {
  return forwardAuthRequest(request, context, 'POST')
}
