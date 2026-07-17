import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CONTENT_TYPE_LABELS, HOME_CONTENT_TYPES } from '@/lib/content-types'
import type { ContentType } from '@/lib/types'

interface Props {
  activeType: ContentType
}

export function HomeContentTypeSelector({ activeType }: Props) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">เลือกประเภทคอนเทนต์</h2>
          <p className="text-sm text-muted-foreground">สลับข้อมูลแนะนำและอันดับของแต่ละประเภทได้ทันที</p>
        </div>

        <div className="text-xs text-muted-foreground">
          กำลังดู: <span className="font-semibold text-foreground">{CONTENT_TYPE_LABELS[activeType]}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {HOME_CONTENT_TYPES.map(type => {
          const isActive = type === activeType

          return (
            <Link
              key={type}
              href={`/${type}`}
              className={cn(
                buttonVariants({ variant: isActive ? 'default' : 'outline', size: 'sm' }),
                'rounded-full px-4 py-2',
                isActive
                  ? 'shadow-sm'
                  : 'border-border bg-background hover:border-primary/30 hover:bg-card',
              )}
            >
              {CONTENT_TYPE_LABELS[type]}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
