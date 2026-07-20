'use client'

import { usePathname } from 'next/navigation'

export function SiteFooter() {
  const pathname = usePathname()
  if (pathname === '/login' || pathname === '/register') return null

  return (
    <footer className="border-t border-border bg-card mt-12">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-muted-foreground">
        <p className="mb-1 text-primary font-serif text-base font-semibold">ReadLead · 阅先</p>
        <p>แพลตฟอร์มนิยายจีนและคอนเทนต์ดิจิทัล สำหรับผู้รักการอ่าน</p>
      </div>
    </footer>
  )
}
