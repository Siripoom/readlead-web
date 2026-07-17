'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRole } from '@/contexts/RoleContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useRole()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setIsSubmitting(true)
    const result = await login(email, password)
    setIsSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่')
      setFieldErrors(result.fields ?? {})
      return
    }
    const requestedPath = new URLSearchParams(window.location.search).get('next')
    const nextPath = requestedPath?.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '/'
    router.push(nextPath)
    router.refresh()
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm border-border shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-2 text-3xl font-serif font-bold text-primary">阅先</div>
          <CardTitle className="text-xl">เข้าสู่ระบบ</CardTitle>
          <CardDescription>ยินดีต้อนรับกลับมา</CardDescription>
        </CardHeader>
        <div className="ornament-divider mx-6" />
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium">อีเมล</label>
              <Input id="login-email" name="email" type="email" autoComplete="email" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} aria-invalid={Boolean(fieldErrors.email)} required />
              {fieldErrors.email?.map(message => <p key={message} className="mt-1 text-xs text-destructive">{message}</p>)}
            </div>
            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium">รหัสผ่าน</label>
              <Input id="login-password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} aria-invalid={Boolean(fieldErrors.password)} required />
              {fieldErrors.password?.map(message => <p key={message} className="mt-1 text-xs text-destructive">{message}</p>)}
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-secondary-foreground">
              {isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </form>
          <Separator className="my-4" />
          <p className="text-center text-sm text-muted-foreground">
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">สมัครสมาชิก</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
