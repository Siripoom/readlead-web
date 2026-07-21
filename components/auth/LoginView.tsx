'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'
import {
  AuthBrand,
  AuthDivider,
  AuthFeatureStatus,
  AuthInput,
  AuthModalShell,
  AuthModeLink,
  AuthShell,
  AuthTitle,
  FieldMessages,
  PasswordField,
  SocialAuthButtons,
  authHref,
  safeAuthNext,
  type AuthPresentation,
} from '@/components/auth/AuthScaffold'

interface Props {
  searchParams: Promise<{ next?: string | string[] }>
  presentation: AuthPresentation
}

export function LoginView({ searchParams, presentation }: Props) {
  const params = use(searchParams)
  const requestedNext = typeof params.next === 'string' ? params.next : undefined
  const nextPath = safeAuthNext(requestedNext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [featureStatus, setFeatureStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useRole()
  const router = useRouter()
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSubmitting) return
    if (!email.trim() || !password) {
      setError('')
      setFieldErrors({})
      setFeatureStatus('')
      return
    }
    setError('')
    setFieldErrors({})
    setFeatureStatus('')
    setIsSubmitting(true)
    const result = await login(email.trim(), password)
    setIsSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่')
      setFieldErrors(result.fields ?? {})
      return
    }

    if (presentation === 'modal' && !requestedNext) {
      router.refresh()
      router.back()
      return
    }

    if (presentation === 'modal') router.replace(nextPath)
    else router.push(nextPath)
    router.refresh()
  }

  function unavailable(label: string) {
    setFeatureStatus(`${label} ยังไม่พร้อมใช้งานในขณะนี้`)
  }

  const content = (
    <>
      <AuthBrand />
      <AuthTitle id="login-title" presentation={presentation}>เข้าสู่ระบบ</AuthTitle>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <div>
            <AuthInput
              id="login-email"
              name="email"
              type="email"
              label="อีเมล"
              value={email}
              placeholder="อีเมล"
              autoComplete="email"
              invalid={Boolean(fieldErrors.email)}
              describedBy={fieldErrors.email?.length ? 'login-email-errors' : undefined}
              onChange={(event) => {
                setEmail(event.target.value)
                if (fieldErrors.email) setFieldErrors((current) => ({ ...current, email: [] }))
              }}
            />
            <FieldMessages id="login-email-errors" messages={fieldErrors.email} />
          </div>

          <div>
            <PasswordField
              id="login-password"
              name="password"
              label="รหัสผ่าน"
              value={password}
              placeholder="รหัสผ่าน"
              autoComplete="current-password"
              invalid={Boolean(fieldErrors.password)}
              describedBy={fieldErrors.password?.length ? 'login-password-errors' : undefined}
              onChange={(event) => {
                setPassword(event.target.value)
                if (fieldErrors.password) setFieldErrors((current) => ({ ...current, password: [] }))
              }}
            />
            <FieldMessages id="login-password-errors" messages={fieldErrors.password} />
          </div>
        </div>

        <div className="mt-2 text-right">
          <button type="button" onClick={() => unavailable('การกู้คืนรหัสผ่าน')} className="rounded px-1 py-1 text-sm font-semibold text-[#d04655] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d04655]">ลืมรหัสผ่าน?</button>
        </div>

        {error && <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-3 h-[42px] w-full rounded-xl bg-[#d04655] text-sm font-bold text-white transition-colors hover:bg-[#bd3948] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d04655] disabled:cursor-not-allowed disabled:bg-[#dfdbea] disabled:text-white"
        >
          {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>

      <AuthDivider />
      <AuthFeatureStatus message={featureStatus} />
      <SocialAuthButtons onUnavailable={unavailable} />

      <p className="mt-6 text-center text-sm text-[#77728a]">
        ยังไม่มีบัญชีผู้ใช้?{' '}
        <AuthModeLink
          href={authHref('/register', nextPath)}
          presentation={presentation}
          className="rounded font-bold text-[#d04655] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d04655]"
        >
          สมัครสมาชิก
        </AuthModeLink>
      </p>
    </>
  )

  if (presentation === 'modal') {
    return <AuthModalShell labelledBy="login-title">{content}</AuthModalShell>
  }
  return <AuthShell>{content}</AuthShell>
}
