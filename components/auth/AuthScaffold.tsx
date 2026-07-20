'use client'

import { useState, type ChangeEvent, type MouseEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, ChevronLeft, Eye, EyeOff } from 'lucide-react'
import { AppleIcon, FacebookIcon, GoogleIcon } from '@/components/icons/SocialProviderIcons'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

export type AuthPresentation = 'page' | 'modal'

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div data-auth-page className="flex min-h-[100svh] items-center justify-center bg-[#9998a2] p-1.5 sm:p-6">
      <section className="relative w-full max-w-[480px] rounded-[20px] bg-white px-[clamp(27px,7vw,46px)] py-9 text-[#373244] shadow-sm sm:rounded-[28px] sm:py-12">
        {children}
      </section>
    </div>
  )
}

export function AuthModalShell({ children, labelledBy }: { children: ReactNode; labelledBy: string }) {
  const router = useRouter()

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) router.back()
      }}
    >
      <DialogContent
        aria-labelledby={labelledBy}
        showCloseButton={false}
        overlayClassName="z-[90] bg-[rgba(30,25,50,0.5)] backdrop-blur-[4px]"
        className="z-[91] block max-h-[calc(100svh-24px)] w-[calc(100%-24px)] max-w-[430px] overflow-y-auto rounded-[22px] bg-white px-[30px] pb-[30px] pt-[34px] text-[#373244] shadow-none ring-0 sm:max-h-[calc(100svh-48px)] sm:w-[calc(100%-48px)] data-open:duration-200 data-open:slide-in-from-bottom-3 data-open:zoom-in-95"
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

export function AuthBackLink({ href, presentation }: { href: string; presentation: AuthPresentation }) {
  function forceFullPage(event: MouseEvent<HTMLAnchorElement>) {
    if (presentation !== 'page') return
    event.preventDefault()
    window.location.assign(href)
  }

  return (
    <Link
      href={href}
      replace={presentation === 'modal'}
      onClick={forceFullPage}
      className={`absolute inline-flex items-center rounded-lg px-1 py-1 text-sm font-semibold text-[#77728a] transition-colors hover:text-[#d04655] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d04655] ${presentation === 'modal' ? 'left-4 top-4 gap-0.5' : 'left-6 top-5 gap-1 sm:left-8 sm:top-7'}`}
    >
      <ChevronLeft className={presentation === 'modal' ? 'h-[17px] w-[17px]' : 'h-4 w-4'} /> กลับ
    </Link>
  )
}

export function AuthModeLink({ href, presentation, children, className }: { href: string; presentation: AuthPresentation; children: ReactNode; className?: string }) {
  function forceFullPage(event: MouseEvent<HTMLAnchorElement>) {
    if (presentation !== 'page') return
    event.preventDefault()
    window.location.assign(href)
  }

  return (
    <Link href={href} replace={presentation === 'modal'} onClick={forceFullPage} className={className}>
      {children}
    </Link>
  )
}

export function AuthTitle({ id, presentation, children }: { id: string; presentation: AuthPresentation; children: ReactNode }) {
  const className = "mb-7 mt-6 text-center text-[23px] font-extrabold leading-normal text-[#373244]"
  if (presentation === 'modal') {
    return <DialogTitle id={id} className={className}>{children}</DialogTitle>
  }
  return <h1 id={id} className={className}>{children}</h1>
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
