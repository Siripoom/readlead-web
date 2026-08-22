'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BookOpen,
  ChevronDown,
  Coins,
  Headphones,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  PenSquare,
  Search,
  Settings,
  WalletCards,
} from 'lucide-react'
import { NotificationDropdown } from '@/components/ui/NotificationDropdown'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
  const [isMobileAccountOpen, setIsMobileAccountOpen] = useState(false)

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
    setIsMobileAccountOpen(false)
    const result = await endSession()
    if (!result.ok) return
    router.push('/')
    router.refresh()
  }

  useEffect(() => {
    if (!isMobileAccountOpen) return
    const mobile = window.matchMedia('(max-width: 639px)')
    if (!mobile.matches) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileAccountOpen(false)
    }
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (!event.matches) setIsMobileAccountOpen(false)
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    mobile.addEventListener('change', closeAtDesktop)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
      mobile.removeEventListener('change', closeAtDesktop)
    }
  }, [isMobileAccountOpen])

  return (
    <header data-site-header className="sticky top-0 z-50 w-full border-b border-[#e9edf2] bg-white max-sm:mx-auto max-sm:h-[52px] max-sm:max-w-[480px] xl:h-[55px]">
      <div className="flex min-h-[55px] w-full items-center gap-4 px-4 max-sm:h-[51px] max-sm:min-h-[51px] max-sm:gap-2 max-sm:px-3 sm:px-6 xl:h-[54px] xl:min-h-0 xl:gap-10 xl:px-10 xl:py-[9px]">
        <Link
          href="/"
          onClick={() => setIsMobileAccountOpen(false)}
          aria-label="ReadLead หน้าหลัก"
          className="flex shrink-0 items-center gap-2 text-xl font-extrabold text-[#cc4452] focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc4452] max-sm:flex-1 max-sm:gap-[7px] max-sm:text-[19px]"
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

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 xl:gap-5">
          <Link
            href="/discover"
            onClick={() => setIsMobileAccountOpen(false)}
            aria-label="ค้นหา"
            className="grid h-10 w-10 place-items-center rounded-full text-[#475569] transition-colors hover:bg-[#f5f6f8] hover:text-[#1e293b] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#cc4452] max-sm:h-[38px] max-sm:w-[38px] xl:h-[22px] xl:w-[22px]"
          >
            <Search className="h-[22px] w-[22px]" />
          </Link>

          <NotificationDropdown triggerClassName="max-sm:h-[38px] max-sm:w-[38px]" />

          <div className="sm:hidden">
            {isLoading ? (
              <div className="h-8 w-[78px] animate-pulse rounded-lg bg-[#f1f3f5]" aria-label="กำลังตรวจสอบสถานะเข้าสู่ระบบ" />
            ) : isLoggedIn ? (
              <button
                type="button"
                aria-label={isMobileAccountOpen ? 'ปิดเมนูโปรไฟล์' : 'เปิดเมนูโปรไฟล์'}
                aria-expanded={isMobileAccountOpen}
                aria-controls="mobile-account-panel"
                onClick={() => setIsMobileAccountOpen((open) => !open)}
                className="grid h-[38px] w-[38px] place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#cc4452]"
              >
                <Avatar className="size-8">
                  <AvatarImage src={profile.avatarUrl} alt="" />
                  <AvatarFallback className="bg-[#f1eef6] font-bold text-[#9c3340]">{avatarFallback}</AvatarFallback>
                </Avatar>
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex h-8 items-center rounded-lg bg-[#cc4452] px-3.5 text-[13px] font-extrabold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cc4452]"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>

          <div className="hidden xl:block">
            {isLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-[9px] bg-[#f1f3f5]" aria-label="กำลังตรวจสอบสถานะเข้าสู่ระบบ" />
            ) : isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="เปิดเมนูผู้ใช้"
                  className="flex items-center gap-2.5 rounded-lg p-1 text-[#334155] transition-colors hover:bg-[#f5f6f8] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#cc4452] xl:p-0"
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
                  <DropdownMenuGroup>
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
                  </DropdownMenuGroup>
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
            className="grid h-10 w-10 place-items-center rounded-full text-[#475569] transition-colors hover:bg-[#f5f6f8] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#cc4452] max-sm:hidden xl:hidden"
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

      {isLoggedIn && isMobileAccountOpen && (
        <MobileAccountPanel
          profileHref={profileHref}
          displayName={profile.displayName}
          handle={profile.handle || user?.email.split('@')[0] || user?.id || ''}
          avatarUrl={profile.avatarUrl}
          avatarFallback={avatarFallback}
          balance={formattedBalance}
          canOpenCreator={canOpenCreator}
          onClose={() => setIsMobileAccountOpen(false)}
          onLogout={logout}
        />
      )}
    </header>
  )
}

function MobileAccountPanel({
  profileHref,
  displayName,
  handle,
  avatarUrl,
  avatarFallback,
  balance,
  canOpenCreator,
  onClose,
  onLogout,
}: {
  profileHref: string
  displayName: string
  handle: string
  avatarUrl: string
  avatarFallback: string
  balance: string
  canOpenCreator: boolean
  onClose: () => void
  onLogout: () => Promise<void>
}) {
  const accountItems = [
    canOpenCreator
      ? { href: `${profileHref}?tab=creator`, label: 'ศูนย์นักเขียน', Icon: LayoutDashboard }
      : { href: `${profileHref}?tab=writer-application`, label: 'สมัครนักเขียน', Icon: PenSquare },
    { href: `${profileHref}?tab=wallet`, label: 'กระเป๋าเงิน', Icon: WalletCards },
    { href: `${profileHref}?tab=report`, label: 'แจ้งปัญหา', Icon: Headphones },
    { href: `${profileHref}?tab=activity`, label: 'คอมเมนต์ & รีวิวของฉัน', Icon: MessageSquareText },
    { href: `${profileHref}?tab=help`, label: 'คู่มือผู้ใช้', Icon: BookOpen },
    { href: `${profileHref}?tab=account`, label: 'การตั้งค่า', Icon: Settings },
  ]

  return (
    <>
      <button
        type="button"
        aria-label="ปิดเมนูโปรไฟล์"
        onClick={onClose}
        className="fixed inset-x-0 bottom-0 top-[52px] z-[51] hidden bg-black/5 max-sm:block"
      />
      <section
        id="mobile-account-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-account-title"
        className="fixed bottom-0 left-1/2 top-[52px] z-[52] hidden w-full max-w-[480px] -translate-x-1/2 overflow-y-auto bg-white shadow-xl max-sm:block"
      >
        <h2 id="mobile-account-title" className="sr-only">เมนูบัญชีผู้ใช้</h2>
        <div className="flex items-center gap-3.5 border-b border-[#ececf1] px-5 py-[22px]">
          <Avatar className="size-14">
            <AvatarImage src={avatarUrl} alt="" />
            <AvatarFallback className="bg-[#f1eef6] text-2xl font-extrabold text-[#9c3340]">{avatarFallback}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-[17px] font-extrabold text-[#cc4452]">{displayName}</p>
            <p className="truncate text-[13px] font-semibold text-[#8a8894]">@{handle.replace(/^@/, '')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 border-b border-[#ececf1] px-5 py-4">
          <span className="grid size-[26px] place-items-center rounded-full bg-[#fdf3e0] text-[#dfa321]">
            <Coins className="size-4" />
          </span>
          <strong className="flex-1 text-[16.5px] font-extrabold text-[#1c1b22]">{balance}</strong>
          <Link href={`${profileHref}?tab=wallet`} onClick={onClose} className="rounded-[9px] bg-[#cc4452] px-5 py-2.5 text-sm font-extrabold text-white">
            เติมเหรียญ
          </Link>
        </div>

        <nav className="py-2" aria-label="เมนูบัญชีบนมือถือ">
          {accountItems.map(({ href, label, Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={onClose}
              className="flex min-h-[49px] items-center gap-[15px] px-5 text-[15.5px] font-bold text-[#3a3644] active:bg-[#faf8fc] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#cc4452]"
            >
              <Icon className="size-[21px] text-[#6b6580]" strokeWidth={2} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="h-px bg-[#ececf1]" />
        <div className="py-2">
          <button
            type="button"
            onClick={() => void onLogout()}
            className="flex min-h-[49px] w-full items-center gap-[15px] px-5 text-left text-[15.5px] font-bold text-[#3a3644] active:bg-[#faf8fc] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#cc4452]"
          >
            <LogOut className="size-[21px] text-[#6b6580]" strokeWidth={2} />
            ออกจากระบบ
          </button>
        </div>
      </section>
    </>
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
