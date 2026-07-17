import Link from 'next/link'
import { ChevronRight, Feather, Sparkles } from 'lucide-react'

export function NovelWriterCallout() {
  return (
    <div className="relative overflow-hidden rounded-[18px] bg-[linear-gradient(120deg,#fbeef5,#f0e8fb)] shadow-[0_2px_7px_rgba(0,0,0,0.10)]">
      <div className="grid min-h-[244px] items-center gap-7 px-6 py-8 sm:px-10 md:grid-cols-[minmax(0,1fr)_300px]">
        <div className="relative z-10 max-w-xl">
          <h3 className="text-2xl font-extrabold text-[#3a3350] sm:text-[28px]">มาเป็นนักเขียนกับเรา</h3>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#6a6280]">
            แบ่งปันจินตนาการ สร้างสรรค์ผลงาน ให้โลกของนิยายเป็นที่รู้จัก
          </p>
          <Link
            href="/creator"
            className="mt-6 inline-flex items-center gap-1.5 rounded-[10px] bg-[#7355df] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#6344c8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7355df]"
          >
            เริ่มเขียนนิยายเลย <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative hidden h-[180px] md:block" aria-hidden="true">
          <div className="absolute left-8 top-4 h-36 w-28 -rotate-6 rounded-2xl border border-white/70 bg-white/65 shadow-lg" />
          <div className="absolute right-8 top-7 h-36 w-28 rotate-6 rounded-2xl bg-[linear-gradient(145deg,#d9cdf7,#ad96e8)] shadow-lg" />
          <div className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#7355df] shadow-xl">
            <Feather className="h-9 w-9" />
          </div>
          <Sparkles className="absolute right-2 top-1 h-7 w-7 text-[#cc4452]" />
          <Sparkles className="absolute bottom-2 left-1 h-5 w-5 text-[#8b6df0]" />
        </div>
      </div>
    </div>
  )
}
