'use client'

import { useState, type ChangeEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { BookOpen, ChevronLeft, Eye, EyeOff } from 'lucide-react'

export function AuthShell({ children, backHref }: { children: ReactNode; backHref?: string }) {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-[#9998a2] p-1.5 sm:p-6">
      <section className="relative w-full max-w-[480px] rounded-[20px] bg-white px-[clamp(27px,7vw,46px)] py-9 text-[#373244] shadow-sm sm:rounded-[28px] sm:py-12">
        {backHref && (
          <Link
            href={backHref}
            className="absolute left-6 top-5 inline-flex items-center gap-1 rounded-lg px-1 py-1 text-sm font-semibold text-[#77728a] transition-colors hover:text-[#d04655] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d04655] sm:left-8 sm:top-7"
          >
            <ChevronLeft className="h-4 w-4" /> กลับ
          </Link>
        )}
        {children}
      </section>
    </div>
  )
}

export function AuthBrand() {
  return (
    <Link
      href="/"
      aria-label="ReadLead หน้าหลัก"
      className="mx-auto flex w-fit items-center gap-2 rounded-lg text-[25px] font-extrabold leading-none text-[#d04655] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d04655] sm:text-[30px]"
    >
      <BookOpen className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.4} />
      <span>ReadLead</span>
    </Link>
  )
}

interface AuthInputProps {
  id: string
  name: string
  type?: 'text' | 'email'
  label: string
  value: string
  placeholder: string
  autoComplete: string
  invalid?: boolean
  describedBy?: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function AuthInput({ id, name, type = 'text', label, value, placeholder, autoComplete, invalid, describedBy, onChange }: AuthInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-[#716c84]">{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="h-[42px] w-full rounded-xl border border-[#e8e3f0] bg-white px-3.5 text-sm text-[#373244] outline-none transition placeholder:text-[#b1abc4] focus:border-[#d04655] focus:ring-2 focus:ring-[#d04655]/15 aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/15"
      />
    </div>
  )
}

interface PasswordFieldProps {
  id: string
  name: string
  label: string
  value: string
  placeholder: string
  autoComplete: 'current-password' | 'new-password'
  invalid?: boolean
  describedBy?: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function PasswordField({ id, name, label, value, placeholder, autoComplete, invalid, describedBy, onChange }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-[#716c84]">{label}</label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="h-[42px] w-full rounded-xl border border-[#e8e3f0] bg-white px-3.5 pr-12 text-sm text-[#373244] outline-none transition placeholder:text-[#b1abc4] focus:border-[#d04655] focus:ring-2 focus:ring-[#d04655]/15 aria-invalid:border-red-500 aria-invalid:ring-2 aria-invalid:ring-red-500/15"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-2.5 grid w-9 place-items-center rounded-lg text-[#aaa4bd] transition-colors hover:text-[#d04655] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#d04655]"
          aria-label={visible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  )
}

export function FieldMessages({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) return null
  return <div id={id} className="mt-1.5 space-y-1">{messages.map((message) => <p key={message} className="text-xs text-red-600">{message}</p>)}</div>
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-[#aaa4bd]" aria-hidden>
      <span className="h-px flex-1 bg-[#e8e3f0]" />
      <span>หรือ</span>
      <span className="h-px flex-1 bg-[#e8e3f0]" />
    </div>
  )
}

function GoogleIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden><path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.2c1.9-1.8 3.1-4.4 3.1-7.6Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.3l-3.2-2.6c-.9.6-2 1-3.5 1a5.9 5.9 0 0 1-5.5-4.1H3.2v2.7A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.9V7.4H3.2a10 10 0 0 0 0 9.3L6.5 14Z"/><path fill="#EA4335" d="M12 6.1c1.6 0 3 .5 4.1 1.6l3-3A10 10 0 0 0 3.2 7.4l3.3 2.7A5.9 5.9 0 0 1 12 6.1Z"/></svg>
}

function FacebookIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden><circle cx="12" cy="12" r="11" fill="white"/><path fill="#1877F2" d="M13.5 20v-7h2.4l.4-2.8h-2.8V8.4c0-.8.2-1.4 1.4-1.4h1.5V4.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8V13h2.5v7h3Z"/></svg>
}

function AppleIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden><path d="M17.1 12.5c0-2.5 2-3.7 2.1-3.8a4.5 4.5 0 0 0-3.5-1.9c-1.5-.2-2.9.9-3.6.9-.8 0-1.9-.9-3.1-.9a4.7 4.7 0 0 0-4 2.4c-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3.1 2.4 1.2-.1 1.7-.8 3.2-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4a10.7 10.7 0 0 0 1.4-2.9 4.2 4.2 0 0 1-3-3.6ZM14.7 5.2A4.3 4.3 0 0 0 15.8 2a4.5 4.5 0 0 0-3 1.5 4.1 4.1 0 0 0-1.1 3.1 3.7 3.7 0 0 0 3-1.4Z"/></svg>
}

export function SocialAuthButtons({ onUnavailable }: { onUnavailable: (provider: string) => void }) {
  const providers = [
    { name: 'Google', icon: <GoogleIcon />, className: 'border border-[#e8e3f0] bg-white text-[#47474c] hover:bg-[#f8f7fa]' },
    { name: 'Facebook', icon: <FacebookIcon />, className: 'border border-[#1877f2] bg-[#1877f2] text-white hover:bg-[#1269df]' },
    { name: 'Apple', icon: <AppleIcon />, className: 'border border-black bg-black text-white hover:bg-[#1d1d1d]' },
  ]
  return (
    <div className="space-y-2.5">
      {providers.map((provider) => (
        <button
          key={provider.name}
          type="button"
          onClick={() => onUnavailable(provider.name)}
          className={`flex h-[42px] w-full items-center justify-center gap-3 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d04655] ${provider.className}`}
          aria-describedby="auth-feature-status"
        >
          {provider.icon}
          ดำเนินการต่อด้วย {provider.name}
        </button>
      ))}
    </div>
  )
}

export function AuthFeatureStatus({ message }: { message: string }) {
  return (
    <div id="auth-feature-status" aria-live="polite" aria-atomic="true">
      {message && <p role="status" className="mb-3 rounded-lg bg-[#f4f1f8] px-3 py-2 text-center text-xs leading-relaxed text-[#716c84]">{message}</p>}
    </div>
  )
}

export function safeAuthNext(value?: string) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/'
}

export function authHref(path: '/login' | '/register', nextPath: string) {
  return nextPath === '/' ? path : `${path}?next=${encodeURIComponent(nextPath)}`
}
