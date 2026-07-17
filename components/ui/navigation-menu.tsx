'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BookOpen,
  ChevronDown,
  Coins,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  PenSquare,
  Search,
  WalletCards,
} from 'lucide-react'
import { NotificationDropdown } from '@/components/ui/NotificationDropdown'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useProfile } from '@/contexts/ProfileContext'
import { useRole } from '@/contexts/RoleContext'
import { useWallet } from '@/contexts/WalletContext'
import { ROLE_LABELS } from '@/lib/roles'
import { cn } from '@/lib/utils'

const NAV_ITEMS: ReadonlyArray<{
  href: string
  label: string
  separated?: boolean
}> = [
  { href: '/', label: 'หน้าหลัก' },
  { href: '/ranking', label: 'กระดานอันดับ' },
  { href: '/novel', label: 'นิยาย', separated: true },
  { href: '/manga', label: 'เว็บตูน' },
  { href: '/audiobook', label: 'หนังสือเสียง' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { role, user, isLoggedIn, isLoading, logout: endSession } = useRole()
  const { profile } = useProfile()
  const { balance } = useWallet()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const canOpenCreator = role === 'creator' || role === 'admin'
  const profileHref = user ? `/profile/${encodeURIComponent(user.id)}` : '/dashboard'
  const avatarFallback = profile.displayName.trim().charAt(0) || ROLE_LABELS[role].charAt(0)
  const formattedBalance = balance.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const navigateFromMenu = (href: string) => {
    router.push(href)
  }

  const logout = async () => {
    setIsMobileMenuOpen(false)
    const result = await endSession()
    if (!result.ok) return
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e9edf2] bg-white">
      <div className="flex min-h-[55px] w-full items-center gap-4 px-4 sm:px-6 xl:gap-10 xl:px-10">
        <Link
          href="/"
          aria-label="ReadLead หน้าหลัก"
          className="flex shrink-0 items-center gap-2 text-xl font-extrabold text-[#cc4452] focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc4452]"
        >
          <BookOpen className="h-[22px] w-[22px]" strokeWidth={2.5} />
          <span>ReadLead</span>
        </Link>

        <nav className="hidden items-center gap-[3px] self-stretch xl:flex" aria-label="เมนูหลัก">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href

            return (
              <div key={item.href} className="contents">
                {item.separated && (
                  <span className="mx-[7px] h-[18px] w-px bg-[#e9edf2]" aria-hidden="true" />
                )}
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative whitespace-nowrap rounded-[9px] px-[15px] py-2 text-[14.5px] font-medium text-[#64748b] transition-colors hover:text-[#1e293b] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#cc4452]',
                    isActive &&
                      'font-semibold text-[#cc4452] after:absolute after:inset-x-[15px] after:-bottom-[9px] after:h-[3px] after:rounded-full after:bg-[#cc4452]',
                  )}
                >
                  {item.label}
                </Link>
              </div>
            )
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 xl:gap-4">
          <Link
            href="/discover"
            aria-label="ค้นหา"
            className="grid h-10 w-10 place-items-center rounded-full text-[#475569] transition-colors hover:bg-[#f5f6f8] hover:text-[#1e293b] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#cc4452]"
          >
            <Search className="h-[22px] w-[22px]" />
          </Link>

          <NotificationDropdown />

          <div className="hidden xl:block">
            {isLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-[9px] bg-[#f1f3f5]" aria-label="กำลังตรวจสอบสถานะเข้าสู่ระบบ" />
            ) : isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="เปิดเมนูผู้ใช้"
                  className="flex items-center gap-2.5 rounded-lg p-1 text-[#334155] transition-colors hover:bg-[#f5f6f8] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#cc4452]"
                >
                  <Avatar className="size-9">
                    <AvatarImage src={profile.avatarUrl} alt="" />
                    <AvatarFallback className="bg-[#f5dfe3] font-semibold text-[#9c3340]">
                      {avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-32 truncate text-[14.5px] font-semibold">
                    {profile.displayName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[#94a3b8]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="w-72 p-2">
                  <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2 normal-case">
                    <Avatar className="size-10">
                      <AvatarImage src={profile.avatarUrl} alt="" />
                      <AvatarFallback className="bg-[#f5dfe3] font-semibold text-[#9c3340]">
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[#334155]">
                        {profile.displayName}
                      </span>
                      <span className="block text-xs font-normal text-[#94a3b8]">
                        {ROLE_LABELS[role]}
                      </span>
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigateFromMenu(`${profileHref}?tab=wallet`)}
                    className="my-1 gap-3 bg-[#fff7f8] px-3 py-2.5 focus:bg-[#fcecef]"
                  >
                    <Coins className="text-[#cc4452]" />
                    <span>
                      <span className="block text-xs text-[#94a3b8]">ยอดเหรียญ</span>
                      <span className="font-bold text-[#9c3340]">{formattedBalance} RL</span>
                    </span>
                    <span className="ml-auto rounded-md bg-[#cc4452] px-2 py-1 text-xs font-semibold text-white">
                      เติมเหรียญ
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigateFromMenu(profileHref)} className="gap-3 px-3 py-2">
                    <LayoutDashboard /> บัญชีของฉัน
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateFromMenu(`${profileHref}?tab=wallet`)} className="gap-3 px-3 py-2">
                    <WalletCards /> กระเป๋าเงิน
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateFromMenu(`${profileHref}?tab=wallet`)} className="gap-3 px-3 py-2">
                    <History /> ประวัติการซื้อ
                  </DropdownMenuItem>
                  {canOpenCreator && (
                    <DropdownMenuItem onClick={() => navigateFromMenu(`${profileHref}?tab=creator`)} className="gap-3 px-3 py-2">
                      <PenSquare /> หน้านักเขียน
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} variant="destructive" className="gap-3 px-3 py-2">
                    <LogOut /> ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="inline-flex h-9 items-center rounded-[9px] bg-[#cc4452] px-[18px] text-sm font-semibold text-white transition-colors hover:bg-[#9c3340] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc4452]"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>

          <button
            type="button"
            aria-label="เปิดเมนู"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full text-[#475569] transition-colors hover:bg-[#f5f6f8] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#cc4452] xl:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="right" className="w-[min(88vw,360px)] gap-0 bg-white p-0">
          <SheetHeader className="border-b border-[#e9edf2] px-5 py-4">
            <SheetTitle className="flex items-center gap-2 text-xl font-extrabold text-[#cc4452]">
              <BookOpen className="h-[22px] w-[22px]" strokeWidth={2.5} />
              ReadLead
            </SheetTitle>
            <SheetDescription className="sr-only">เมนูนำทางและบัญชีผู้ใช้</SheetDescription>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5">
            {isLoggedIn && (
              <div className="mb-5 flex items-center gap-3 rounded-xl bg-[#fff7f8] p-3">
                <Avatar className="size-11">
                  <AvatarImage src={profile.avatarUrl} alt="" />
                  <AvatarFallback className="bg-[#f5dfe3] font-semibold text-[#9c3340]">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#334155]">{profile.displayName}</p>
                  <p className="text-xs text-[#94a3b8]">{ROLE_LABELS[role]}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#94a3b8]">ยอดเหรียญ</p>
                  <p className="text-sm font-bold text-[#9c3340]">{formattedBalance} RL</p>
                </div>
              </div>
            )}

            <nav className="space-y-1" aria-label="เมนูหลักบนมือถือ">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex min-h-11 items-center rounded-lg border-l-[3px] border-transparent px-4 text-sm font-medium text-[#64748b] transition-colors hover:bg-[#f8f9fa] hover:text-[#1e293b] focus-visible:outline-2 focus-visible:outline-[#cc4452]',
                      isActive && 'border-[#cc4452] bg-[#fff7f8] font-semibold text-[#cc4452]',
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="my-5 h-px bg-[#e9edf2]" />

            {isLoading ? (
              <div className="h-11 w-full animate-pulse rounded-[9px] bg-[#f1f3f5]" aria-label="กำลังตรวจสอบสถานะเข้าสู่ระบบ" />
            ) : isLoggedIn ? (
              <div className="space-y-1">
                <MobileAccountLink href={profileHref} label="บัญชีของฉัน" onNavigate={() => setIsMobileMenuOpen(false)}>
                  <LayoutDashboard />
                </MobileAccountLink>
                <MobileAccountLink href={`${profileHref}?tab=wallet`} label="กระเป๋าเงิน" onNavigate={() => setIsMobileMenuOpen(false)}>
                  <WalletCards />
                </MobileAccountLink>
                <MobileAccountLink href={`${profileHref}?tab=wallet`} label="ประวัติการซื้อ" onNavigate={() => setIsMobileMenuOpen(false)}>
                  <History />
                </MobileAccountLink>
                {canOpenCreator && (
                  <MobileAccountLink href={`${profileHref}?tab=creator`} label="หน้านักเขียน" onNavigate={() => setIsMobileMenuOpen(false)}>
                    <PenSquare />
                  </MobileAccountLink>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="flex min-h-11 w-full items-center gap-3 rounded-lg px-4 text-sm font-medium text-[#c03645] transition-colors hover:bg-[#fff1f3] focus-visible:outline-2 focus-visible:outline-[#cc4452] [&_svg]:size-4"
                >
                  <LogOut /> ออกจากระบบ
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex h-11 w-full items-center justify-center rounded-[9px] bg-[#cc4452] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#9c3340] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc4452]"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}

function MobileAccountLink({
  href,
  label,
  onNavigate,
  children,
}: {
  href: string
  label: string
  onNavigate: () => void
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex min-h-11 items-center gap-3 rounded-lg px-4 text-sm font-medium text-[#475569] transition-colors hover:bg-[#f8f9fa] hover:text-[#1e293b] focus-visible:outline-2 focus-visible:outline-[#cc4452] [&_svg]:size-4"
    >
      {children}
      {label}
    </Link>
  )
}
