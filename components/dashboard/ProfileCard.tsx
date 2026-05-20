'use client'

import { Crown, ShieldCheck, Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProfile } from '@/contexts/ProfileContext'

export default function ProfileCard() {
  const { profile } = useProfile()
  const initials = profile.displayName.trim().slice(0, 1).toUpperCase()

  return (
    <Card className="border-primary/15 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-primary">โปรไฟล์บัญชี</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar size="lg" className="size-14">
            <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-foreground">{profile.displayName}</p>
            <p className="text-sm text-muted-foreground">บัญชีสมาชิก ReadLead</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <Crown className="h-4 w-4" />
              <span>ระดับ VIP</span>
            </div>
            <p className="text-base font-semibold text-foreground">{profile.vipLevel}</p>
          </div>

          <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              <span>EXP</span>
            </div>
            <p className="text-base font-semibold text-foreground">{profile.exp.toLocaleString()}</p>
          </div>

          <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span>Current Rank</span>
            </div>
            <p className="text-base font-semibold text-foreground">{profile.currentRank}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
