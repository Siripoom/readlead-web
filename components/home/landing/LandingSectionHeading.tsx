import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type Props = {
  title: string
  href?: string
}

export function LandingSectionHeading({ title, href }: Props) {
  return (
    <div className="mb-[18px] flex items-center justify-between gap-4">
      <h2 className="text-xl font-bold leading-tight text-[var(--home-ink)] sm:text-[23px]">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--home-ink-2)] transition hover:text-[var(--home-red)] sm:text-[13px]"
        >
          ดูเพิ่มเติม <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}
