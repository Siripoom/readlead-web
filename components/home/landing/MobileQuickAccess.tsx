import Image from 'next/image'
import Link from 'next/link'

const QUICK_ACCESS_ITEMS = [
  { key: 'novel', label: 'นิยาย', href: '/discover?type=novel', icon: '/home/quick-novel.png' },
  { key: 'manga', label: 'เว็บตูน', href: '/discover?type=manga', icon: '/home/quick-webtoon.png' },
  { key: 'audiobook', label: 'หนังสือเสียง', href: '/discover?type=audiobook', icon: '/home/quick-audiobook.png' },
  { key: 'ranking', label: 'อันดับ', href: '/ranking', icon: '/home/quick-ranking.png' },
] as const

export function MobileQuickAccess() {
  return (
    <div className="flex items-start justify-between px-[14px] sm:hidden">
      {QUICK_ACCESS_ITEMS.map(({ key, label, href, icon }) => (
        <Link key={key} href={href} className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-[var(--home-ink)] transition active:scale-[0.95]">
          <span className="grid h-[34px] w-[34px] place-items-center">
            <Image src={icon} alt="" width={34} height={34} className="h-[34px] w-[34px]" />
          </span>
          <span className="text-[11px] font-bold">{label}</span>
        </Link>
      ))}
    </div>
  )
}
