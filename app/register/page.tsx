'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRole } from '@/contexts/RoleContext'
import {
  AuthBrand,
  AuthDivider,
  AuthFeatureStatus,
  AuthInput,
  AuthShell,
  FieldMessages,
  PasswordField,
  SocialAuthButtons,
  authHref,
  safeAuthNext,
} from '@/components/auth/AuthScaffold'

interface Props {
  searchParams: Promise<{ next?: string | string[] }>
}

const USERNAME_PATTERN = /^[a-z0-9_]+$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage({ searchParams }: Props) {
  const params = use(searchParams)
  const nextPath = safeAuthNext(typeof params.next === 'string' ? params.next : undefined)
  const loginHref = authHref('/login', nextPath)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [featureStatus, setFeatureStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register } = useRole()
  const router = useRouter()

  const usernameValid = USERNAME_PATTERN.test(name)
  const emailValid = EMAIL_PATTERN.test(email.trim())
  const passwordValid = password.length >= 8
  const canSubmit = usernameValid && emailValid && passwordValid && acceptedTerms && !isSubmitting

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    setError('')
    setFieldErrors({})
    setFeatureStatus('')
    setIsSubmitting(true)
    const result = await register(name, email.trim(), password)
    setIsSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่')
      setFieldErrors(result.fields ?? {})
      return
    }
    router.push(nextPath)
    router.refresh()
  }

  function unavailable(label: string) {
    setFeatureStatus(`${label} ยังไม่พร้อมใช้งานในขณะนี้`)
  }

  return (
    <AuthShell backHref={loginHref}>
      <div className="pt-1 sm:pt-0"><AuthBrand /></div>
      <h1 className="mb-7 mt-6 text-center text-[23px] font-extrabold text-[#373244]">สมัครสมาชิก</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <div>
            <AuthInput
              id="register-name"
              name="name"
              label="ชื่อผู้ใช้"
              value={name}
              placeholder="ชื่อผู้ใช้"
              autoComplete="username"
              invalid={Boolean(fieldErrors.name) || (name.length > 0 && !usernameValid)}
              describedBy="register-name-help register-name-errors"
              onChange={(event) => {
                setName(event.target.value)
                if (fieldErrors.name) setFieldErrors((current) => ({ ...current, name: [] }))
              }}
            />
            <p id="register-name-help" className={`mt-1.5 text-xs ${name.length > 0 && !usernameValid ? 'text-red-600' : 'text-[#aaa4bd]'}`}>ใช้ได้เฉพาะ a-z, 0-9 และ _ โดยไม่มีเว้นวรรค</p>
            <FieldMessages id="register-name-errors" messages={fieldErrors.name} />
          </div>

          <div>
            <AuthInput
              id="register-email"
              name="email"
              type="email"
              label="อีเมล"
              value={email}
              placeholder="อีเมล"
              autoComplete="email"
              invalid={Boolean(fieldErrors.email)}
              describedBy={fieldErrors.email?.length ? 'register-email-errors' : undefined}
              onChange={(event) => {
                setEmail(event.target.value)
                if (fieldErrors.email) setFieldErrors((current) => ({ ...current, email: [] }))
              }}
            />
            <FieldMessages id="register-email-errors" messages={fieldErrors.email} />
          </div>

          <div>
            <PasswordField
              id="register-password"
              name="password"
              label="รหัสผ่าน"
              value={password}
              placeholder="รหัสผ่าน"
              autoComplete="new-password"
              invalid={Boolean(fieldErrors.password) || (password.length > 0 && !passwordValid)}
              describedBy={`${password.length > 0 && !passwordValid ? 'register-password-help ' : ''}${fieldErrors.password?.length ? 'register-password-errors' : ''}`.trim() || undefined}
              onChange={(event) => {
                setPassword(event.target.value)
                if (fieldErrors.password) setFieldErrors((current) => ({ ...current, password: [] }))
              }}
            />
            {password.length > 0 && !passwordValid && <p id="register-password-help" className="mt-1.5 text-xs text-red-600">รหัสผ่านอย่างน้อย 8 ตัวอักษร</p>}
            <FieldMessages id="register-password-errors" messages={fieldErrors.password} />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2.5">
          <input
            id="register-terms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer rounded border-[#ddd7ea] accent-[#d04655] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d04655]"
          />
          <p className="text-xs leading-5 text-[#77728a]">
            <label htmlFor="register-terms" className="cursor-pointer">ฉันได้อ่านและยอมรับ </label>
            <button type="button" onClick={() => unavailable('ข้อตกลงและเงื่อนไขการใช้บริการ')} className="rounded font-bold text-[#d04655] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d04655]">ข้อตกลงและเงื่อนไขการใช้บริการ</button>
            {' '}และ{' '}
            <button type="button" onClick={() => unavailable('นโยบายความเป็นส่วนตัว')} className="rounded font-bold text-[#d04655] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d04655]">นโยบายความเป็นส่วนตัว</button>
          </p>
        </div>

        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-5 h-[42px] w-full rounded-xl bg-[#d04655] text-sm font-bold text-white transition-colors hover:bg-[#bd3948] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d04655] disabled:cursor-not-allowed disabled:bg-[#dfdbea] disabled:text-white"
        >
          {isSubmitting ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
        </button>
      </form>

      <AuthDivider />
      <AuthFeatureStatus message={featureStatus} />
      <SocialAuthButtons onUnavailable={unavailable} />

      <p className="mt-6 text-center text-sm text-[#77728a]">
        มีบัญชีผู้ใช้อยู่แล้ว?{' '}
        <Link href={loginHref} className="rounded font-bold text-[#d04655] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d04655]">เข้าสู่ระบบ</Link>
      </p>
    </AuthShell>
  )
}
