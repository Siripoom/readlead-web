'use client'

import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
        className="relative grid h-10 w-10 place-items-center rounded-full text-[#475569] transition-colors hover:bg-[#f5f6f8] hover:text-[#1e293b] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#cc4452] xl:h-[22px] xl:w-[22px]"
      >
        <Bell className="h-[22px] w-[22px]" />
        <span className="absolute right-[7px] top-[7px] h-2 w-2 rounded-full border border-white bg-[#cc4452] xl:-right-0.5 xl:-top-0.5 xl:border-[1.5px]" />
        <span className="sr-only">{MOCK_NOTIFICATIONS.length} รายการใหม่</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel>การแจ้งเตือน</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {MOCK_NOTIFICATIONS.map(n => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2.5">
              <span className="text-sm leading-snug">{n.title}</span>
              <span className="text-xs text-muted-foreground">{n.time}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
