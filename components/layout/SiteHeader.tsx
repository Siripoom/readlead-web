'use client'
import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useProfile } from '@/contexts/ProfileContext'
import { useRole } from '@/contexts/RoleContext'
import { useWallet } from '@/contexts/WalletContext'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Coins, BookOpen, ChevronDown } from 'lucide-react'
import type { Role } from '@/lib/types'
import {
  CONTENT_TYPE_LABELS,
  HOME_CONTENT_TYPES,
  parseHomeContentType,
} from '@/lib/content-types'
import { cn } from '@/lib/utils'

const ROLE_LABELS: Record<Role, string> = {
  guest: 'ผู้เยี่ยมชม', user: 'สมาชิก', creator: 'นักเขียน', admin: 'ผู้ดูแล',
}

export function SiteHeader() {
  const { role, setRole, isLoggedIn } = useRole()
  const { profile } = useProfile()
  const { balance } = useWallet()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex min-h-14 items-center justify-between gap-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-primary text-lg tracking-wide">
            <BookOpen className="h-5 w-5" />
            <span className="font-serif">ReadLead</span>
            <span className="rounded bg-primary px-1.5 py-0.5 text-xs font-normal text-white">阅</span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">หน้าหลัก</Link>
            <Link href="/discover" className="text-muted-foreground hover:text-primary transition-colors">ค้นพบ</Link>
            {isLoggedIn && <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">ห้องสมุด</Link>}
            {(role === 'creator' || role === 'admin') && (
              <Link href="/creator" className="text-muted-foreground hover:text-primary transition-colors">สตูดิโอ</Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <Link href="/dashboard" className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors">
                <Coins className="h-3.5 w-3.5 text-accent-foreground" />
                <span className="font-semibold">{balance}</span>
              </Link>
            )}

            {isLoggedIn && (
              <Link
                href="/dashboard"
                className="max-w-28 truncate rounded-full border border-border px-3 py-1 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary sm:max-w-40"
              >
                {profile.displayName}
              </Link>
            )}

            {/* Dev role switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1 text-xs')}>
                {ROLE_LABELS[role]} <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">สลับบทบาท (Dev)</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(['guest', 'user', 'creator', 'admin'] as Role[]).map(r => (
                    <DropdownMenuItem key={r} onClick={() => setRole(r)} className={role === r ? 'text-primary font-semibold' : ''}>
                      {ROLE_LABELS[r]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {!isLoggedIn ? (
              <Link href="/login" className={cn(buttonVariants({ size: 'sm' }), 'bg-primary text-primary-foreground hover:bg-primary/90')}>
                เข้าสู่ระบบ
              </Link>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setRole('guest')} className="text-muted-foreground">
                ออกจากระบบ
              </Button>
            )}
          </div>
        </div>
        <Suspense fallback={<HeaderContentTypeNavSkeleton />}>
          <HeaderContentTypeNav />
        </Suspense>
      </div>
    </header>
  )
}

function HeaderContentTypeNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isHome = pathname === '/'
  const activeType = isHome
    ? parseHomeContentType(searchParams.get('type'))
    : null

  return (
    <nav className="flex gap-2 overflow-x-auto pb-3">
      {HOME_CONTENT_TYPES.map(type => {
        const isActive = activeType === type

        return (
          <Link
            key={type}
            href={`/?type=${type}`}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'border-primary bg-primary text-white'
                : 'border-border text-muted-foreground hover:border-primary hover:text-primary',
            )}
          >
            {CONTENT_TYPE_LABELS[type]}
          </Link>
        )
      })}
    </nav>
  )
}

function HeaderContentTypeNavSkeleton() {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-3">
      {HOME_CONTENT_TYPES.map(type => (
        <Link
          key={type}
          href={`/?type=${type}`}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
            'border-border text-muted-foreground hover:border-primary hover:text-primary',
          )}
        >
          {CONTENT_TYPE_LABELS[type]}
        </Link>
      ))}
    </nav>
  )
}
