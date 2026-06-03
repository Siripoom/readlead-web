import type { ElementType } from 'react'
import { Compass, BookMarked, Home, PenSquare } from 'lucide-react'
import type { Role } from '@/lib/types'

export interface NavItem {
  href: string
  label: string
  icon: ElementType
}

export const ROLE_LABELS: Record<Role, string> = {
  guest: 'ผู้เยี่ยมชม',
  user: 'สมาชิก',
  creator: 'นักเขียน',
  admin: 'ผู้ดูแล',
}

const BASE_ITEMS: NavItem[] = [
  { href: '/', label: 'หน้าหลัก', icon: Home },
  { href: '/discover', label: 'ค้นพบ', icon: Compass },
]

const LIBRARY_ITEM: NavItem = { href: '/dashboard', label: 'ห้องสมุด', icon: BookMarked }
const STUDIO_ITEM: NavItem = { href: '/creator', label: 'สตูดิโอ', icon: PenSquare }

export const TOP_NAV_ITEMS_BY_ROLE: Record<Role, NavItem[]> = {
  guest: BASE_ITEMS,
  user: [...BASE_ITEMS, LIBRARY_ITEM],
  creator: [...BASE_ITEMS, LIBRARY_ITEM, STUDIO_ITEM],
  admin: [...BASE_ITEMS, LIBRARY_ITEM, STUDIO_ITEM],
}
