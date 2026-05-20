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
  const { setRole } = useRole()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setRole('user')
    router.push('/')
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
              <label className="mb-1.5 block text-sm font-medium">อีเมล</label>
              <Input type="email" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">รหัสผ่าน</label>
              <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-secondary-foreground">เข้าสู่ระบบ</Button>
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
