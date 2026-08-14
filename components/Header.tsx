'use client'

import { getMonthName } from '@/lib/calendar-utils'

interface HeaderProps {
  currentDate: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

export default function Header({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {currentDate.getFullYear()}년 {getMonthName(currentDate.getMonth())}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            오늘
          </button>
          <button
            onClick={onPrevMonth}
            className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            onClick={onNextMonth}
            className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>
    </header>
  )
}
