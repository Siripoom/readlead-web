'use client'

import { ArrowRight, BookOpen } from 'lucide-react'

interface Props {
  nextEpisode?: { title: string } | null
  continuous: boolean
  onNext: () => void
  onContinuousChange: (enabled: boolean) => void
}

export default function ReaderChapterEnd({
  nextEpisode,
  continuous,
  onNext,
  onContinuousChange,
}: Props) {
  return (
    <section className="mt-11 border-t border-[var(--reader-border)] pt-6 text-center" aria-label="สิ้นสุดตอน">
      {nextEpisode ? (
        <>
          <p className="text-[11px] font-bold text-[var(--reader-muted)]">บทต่อไป</p>
          <p className="mb-4 mt-1 text-base font-bold text-[var(--reader-ink)]">{nextEpisode.title}</p>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            อ่านต่อ <ArrowRight className="size-4" />
          </button>
        </>
      ) : (
        <p className="inline-flex items-center gap-2 text-sm font-bold text-[var(--reader-muted)]">
          <BookOpen className="size-4" /> อ่านถึงตอนล่าสุดแล้ว
        </p>
      )}

      <div className="mx-auto mt-6 flex w-fit items-center gap-2.5 text-[13px] text-[var(--reader-muted)]">
        <span id="continuous-reading-label">โหมดอ่านต่อเนื่อง</span>
        <button
          type="button"
          role="switch"
          aria-labelledby="continuous-reading-label"
          aria-checked={continuous}
          onClick={() => onContinuousChange(!continuous)}
          className={`relative h-[22px] w-10 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            continuous ? 'bg-primary' : 'bg-[var(--reader-border)]'
          }`}
        >
          <span
            aria-hidden
            className={`absolute left-0.5 top-0.5 size-[18px] rounded-full bg-white shadow-sm transition-transform ${
              continuous ? 'translate-x-[18px]' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </section>
  )
}
