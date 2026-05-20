import { Users, BookOpen, Eye, Coins } from 'lucide-react'
import StatCard from './StatCard'
import RevenueChart from './RevenueChart'
import WithdrawButton from './WithdrawButton'
import type { Creator } from '@/lib/types'
import { MOCK_WORKS } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  creator: Creator
}

export default function CreatorStudioHome({ creator }: Props) {
  const myWorks = MOCK_WORKS.filter(w => creator.workIds.includes(w.id))
  const totalViews = myWorks.reduce((sum, w) => sum + w.viewCount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">สวัสดี, {creator.name}</h2>
          <p className="text-sm text-muted-foreground">{creator.bio}</p>
        </div>
        <WithdrawButton totalRevenue={creator.totalRevenue} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="รายได้รวม" value={`฿${creator.totalRevenue.toLocaleString()}`} icon={Coins} trend={17} />
        <StatCard title="ผู้ติดตาม" value={creator.followerCount.toLocaleString()} icon={Users} trend={8} />
        <StatCard title="ผลงาน" value={myWorks.length} icon={BookOpen} />
        <StatCard title="ยอดอ่านรวม" value={`${(totalViews / 1000).toFixed(0)}K`} icon={Eye} trend={12} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">รายได้ย้อนหลัง 6 เดือน</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={creator.monthlyRevenue} />
        </CardContent>
      </Card>
    </div>
  )
}
