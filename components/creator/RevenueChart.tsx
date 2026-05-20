'use client'

const MONTH_LABELS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.']

interface Props {
  data: number[]
}

export default function RevenueChart({ data }: Props) {
  const max = Math.max(...data, 1)
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">รายได้รายเดือน (฿)</p>
      <div className="flex items-end gap-2 h-32">
        {data.map((val, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">{(val / 1000).toFixed(0)}K</span>
            <div
              className="w-full rounded-t bg-primary/80 hover:bg-primary transition-colors"
              style={{ height: `${(val / max) * 96}px` }}
            />
            <span className="text-xs text-muted-foreground">{MONTH_LABELS[idx]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
