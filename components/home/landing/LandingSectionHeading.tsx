import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type Props = {
  title: string
  href?: string
  allLabel?: string
}

export function LandingSectionHeading({ title, href, allLabel = 'ดูเพิ่มเติม' }: Props) {
  return (
    <div className="mb-[14px] flex items-center justify-between gap-4 sm:mb-[18px]">
      <h2 className="text-[17.5px] font-bold leading-tight text-[var(--home-ink)] sm:text-[23px]">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--home-ink-2)] transition hover:text-[var(--home-red)] sm:text-[13px]"
        >
          {allLabel} <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}
