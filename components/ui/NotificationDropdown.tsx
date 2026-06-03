'use client'

import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'ตอนใหม่มาแล้ว — ฝ่าดาวเคราะห์ทะลุมิติ ตอนที่ 121', time: '5 นาทีที่แล้ว' },
  { id: '2', title: 'ยอด VIP ของคุณหมดอายุในอีก 3 วัน', time: '1 ชั่วโมงที่แล้ว' },
  { id: '3', title: 'มีผู้ติดตามผลงานของคุณใหม่ 12 คน', time: 'เมื่อวาน' },
]

export function NotificationDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="การแจ้งเตือน"
        className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
          {MOCK_NOTIFICATIONS.length}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>การแจ้งเตือน</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {MOCK_NOTIFICATIONS.map(n => (
          <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2.5">
            <span className="text-sm leading-snug">{n.title}</span>
            <span className="text-xs text-muted-foreground">{n.time}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
