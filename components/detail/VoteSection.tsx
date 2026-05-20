'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Star, CalendarDays, Ticket, CheckCircle2 } from 'lucide-react'
import { useRole } from '@/contexts/RoleContext'
import type { Work } from '@/lib/types'

interface Props {
  work: Work
}

function fmt(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

function todayKey() { return new Date().toISOString().slice(0, 10) }
function monthKey() { return new Date().toISOString().slice(0, 7) }

export default function VoteSection({ work }: Props) {
  const router = useRouter()
  const { isLoggedIn } = useRole()
  const [voteCount, setVoteCount] = useState(work.voteCount)
  const [usedMonthly, setUsedMonthly] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(`rl_voted_monthly_${work.id}_${monthKey()}`) === '1'
  })
  const [usedDaily, setUsedDaily] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(`rl_voted_daily_${work.id}_${todayKey()}`) === '1'
  })

  function vote(type: 'monthly' | 'daily') {
    if (!isLoggedIn) { router.push('/login'); return }
    if (type === 'monthly') {
      if (usedMonthly) return
      localStorage.setItem(`rl_voted_monthly_${work.id}_${monthKey()}`, '1')
      setUsedMonthly(true)
      setVoteCount(v => v + 5)
    } else {
      if (usedDaily) return
      localStorage.setItem(`rl_voted_daily_${work.id}_${todayKey()}`, '1')
      setUsedDaily(true)
      setVoteCount(v => v + 1)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Star className="h-5 w-5 text-primary" />
        การโหวตนิยาย
      </h2>

      <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Eye className="h-4 w-4" />
          ยอดอ่าน <span className="font-semibold text-foreground ml-1">{fmt(work.viewCount)}</span> ครั้ง
        </span>
        <span className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-foreground">{fmt(voteCount)}</span> โหวต
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={usedMonthly}
          onClick={() => vote('monthly')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
            usedMonthly
              ? 'bg-muted border-border text-muted-foreground cursor-not-allowed'
              : 'bg-primary/5 border-primary/30 text-primary hover:bg-primary/10 active:scale-95'
          }`}
        >
          {usedMonthly ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <CalendarDays className="h-4 w-4" />}
          จั๋วรายเดือน
          {usedMonthly
            ? <span className="text-xs text-green-600 font-normal">ใช้แล้ว</span>
            : <span className="text-xs text-muted-foreground font-normal">(+5 โหวต)</span>
          }
        </button>

        <button
          type="button"
          disabled={usedDaily}
          onClick={() => vote('daily')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
            usedDaily
              ? 'bg-muted border-border text-muted-foreground cursor-not-allowed'
              : 'bg-accent/30 border-accent-foreground/20 text-foreground hover:bg-accent/50 active:scale-95'
          }`}
        >
          {usedDaily ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Ticket className="h-4 w-4" />}
          จั๋วรายวัน
          {usedDaily
            ? <span className="text-xs text-green-600 font-normal">ใช้แล้ว</span>
            : <span className="text-xs text-muted-foreground font-normal">(+1 โหวต)</span>
          }
        </button>
      </div>
    </div>
  )
}
