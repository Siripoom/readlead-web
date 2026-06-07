'use client'

import { CalendarDays, Ticket, CircleHelp } from 'lucide-react'

export interface TicketCardInfo {
  title: string
  secondaryTitle?: string
  label: string
  value: string
  description: string
  notification?: string
  buttonLabel: string
}

interface Props {
  daily: TicketCardInfo
  monthly: TicketCardInfo
  onDailyClick?: () => void
  onMonthlyClick?: () => void
}

function SectionHeader({
  title,
  secondary,
  notification,
}: {
  title: string
  secondary?: string
  notification?: string
}) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex items-baseline gap-2 shrink-0">
        <span className="text-base font-bold text-gray-900">{title}</span>
        {secondary && <span className="text-sm text-gray-400">{secondary}</span>}
      </div>
      <div className="flex-1 border-t border-dashed border-gray-200 min-w-0" />
      {notification && (
        <span className="shrink-0 text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1 max-w-50 truncate">
          {notification}
        </span>
      )}
    </div>
  )
}

function TicketCard({
  info,
  icon,
  onClick,
}: {
  info: TicketCardInfo
  icon: React.ReactNode
  onClick?: () => void
}) {
  return (
    <div className="space-y-5">
      <SectionHeader
        title={info.title}
        secondary={info.secondaryTitle}
        notification={info.notification}
      />
      <div>
        <p className="text-xs text-gray-400 mb-3">{info.label}</p>
        <p className="text-6xl font-bold text-gray-900 leading-none tracking-tight">
          {info.value}
        </p>
      </div>
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <span>{info.description}</span>
          <CircleHelp className="h-3.5 w-3.5 shrink-0" />
        </div>
        <button
          type="button"
          onClick={onClick}
          className="flex shrink-0 items-center gap-2 px-5 py-2.5 rounded-lg bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 active:scale-95 transition-all"
        >
          {icon}
          {info.buttonLabel}
        </button>
      </div>
    </div>
  )
}

export default function NovelSupportStats({ daily, monthly, onDailyClick, onMonthlyClick }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 py-6">
      <TicketCard
        info={daily}
        icon={<Ticket className="h-4 w-4" />}
        onClick={onDailyClick}
      />
      <TicketCard
        info={monthly}
        icon={<CalendarDays className="h-4 w-4" />}
        onClick={onMonthlyClick}
      />
    </div>
  )
}
