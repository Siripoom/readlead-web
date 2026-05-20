import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RouteGuard from '@/components/layout/RouteGuard'
import CreatorStudioHome from '@/components/creator/CreatorStudioHome'
import OrnamentalDivider from '@/components/shared/OrnamentalDivider'
import { MOCK_CREATORS } from '@/lib/mock-data'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen, Eye } from 'lucide-react'
import { MOCK_WORKS } from '@/lib/mock-data'

const CURRENT_CREATOR = MOCK_CREATORS[0]

export default function CreatorPage() {
  const myWorks = MOCK_WORKS.filter(w => CURRENT_CREATOR.workIds.includes(w.id))

  return (
    <RouteGuard allowedRoles={['creator', 'admin']}>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Creator Studio</h1>
          <p className="text-sm text-muted-foreground">จัดการผลงานและรายได้ของคุณ</p>
        </div>

        <OrnamentalDivider />

        <div className="mt-6">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-2 max-w-xs">
              <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
              <TabsTrigger value="works">ผลงาน</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <CreatorStudioHome creator={CURRENT_CREATOR} />
            </TabsContent>

            <TabsContent value="works" className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">ผลงานทั้งหมด</h2>
                <Link href="/creator/works/new">
                  <Button className="bg-primary text-primary-foreground" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    เพิ่มผลงานใหม่
                  </Button>
                </Link>
              </div>

              <div className="grid gap-3">
                {myWorks.map(work => (
                  <Link
                    key={work.id}
                    href={`/creator/works/${work.id}`}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary/40 hover:bg-accent/10 transition-colors"
                  >
                    <div className="relative w-12 h-16 rounded overflow-hidden shrink-0">
                      <Image src={work.coverUrl} alt={work.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{work.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{work.episodeCount} ตอน</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{(work.viewCount / 1000).toFixed(0)}K ครั้ง</span>
                      </div>
                    </div>
                    <span className="text-xs text-primary font-medium shrink-0">จัดการ →</span>
                  </Link>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </RouteGuard>
  )
}
