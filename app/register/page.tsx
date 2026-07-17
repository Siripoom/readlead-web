'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRole } from '@/contexts/RoleContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register } = useRole()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setIsSubmitting(true)
    const result = await register(name, email, password)
    setIsSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่')
      setFieldErrors(result.fields ?? {})
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm border-border shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-2 text-3xl font-serif font-bold text-primary">阅先</div>
          <CardTitle className="text-xl">สมัครสมาชิก</CardTitle>
          <CardDescription>เริ่มต้นการเดินทางการอ่านของคุณ</CardDescription>
        </CardHeader>
        <div className="ornament-divider mx-6" />
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="mb-1.5 block text-sm font-medium">ชื่อผู้ใช้</label>
              <Input id="register-name" name="name" autoComplete="name" placeholder="ชื่อของคุณ" value={name} onChange={e => setName(e.target.value)} aria-invalid={Boolean(fieldErrors.name)} required />
              {fieldErrors.name?.map(message => <p key={message} className="mt-1 text-xs text-destructive">{message}</p>)}
            </div>
            <div>
              <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium">อีเมล</label>
              <Input id="register-email" name="email" type="email" autoComplete="email" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} aria-invalid={Boolean(fieldErrors.email)} required />
              {fieldErrors.email?.map(message => <p key={message} className="mt-1 text-xs text-destructive">{message}</p>)}
            </div>
            <div>
              <label htmlFor="register-password" className="mb-1.5 block text-sm font-medium">รหัสผ่าน</label>
              <Input id="register-password" name="password" type="password" autoComplete="new-password" placeholder="อย่างน้อย 8 ตัวอักษร" value={password} onChange={e => setPassword(e.target.value)} aria-invalid={Boolean(fieldErrors.password)} required minLength={8} />
              {fieldErrors.password?.map(message => <p key={message} className="mt-1 text-xs text-destructive">{message}</p>)}
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-secondary-foreground">
              {isSubmitting ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </Button>
          </form>
          <Separator className="my-4" />
          <p className="text-center text-sm text-muted-foreground">
            มีบัญชีแล้ว?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">เข้าสู่ระบบ</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
