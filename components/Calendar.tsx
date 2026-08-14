'use client'

import { CalendarEvent, Employee } from '@/types'
import { getDaysInMonth, getDayName } from '@/lib/calendar-utils'
import CalendarDay from './CalendarDay'

interface CalendarProps {
  events: CalendarEvent[]
  employees: Employee[]
  currentDate: Date
  onDayClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export default function Calendar({
  events,
  employees,
  currentDate,
  onDayClick,
  onEventClick,
}: CalendarProps) {
  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Group events by date
  const eventsByDate: Record<string, CalendarEvent[]> = {}
  events.forEach((event) => {
    const dateStr = event.start_date.split('T')[0]
    if (!eventsByDate[dateStr]) {
      eventsByDate[dateStr] = []
    }
    eventsByDate[dateStr].push(event)
  })

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Day headers */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className="p-4 text-center font-semibold text-gray-700">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid">
        {days.map((date, index) => {
          const dateStr = date.toISOString().split('T')[0]
          const dayEvents = eventsByDate[dateStr] || []

          return (
            <CalendarDay
              key={index}
              date={date}
              events={dayEvents}
              employees={employees}
              currentMonth={currentMonth}
              currentYear={currentYear}
              onDayClick={onDayClick}
              onEventClick={onEventClick}
            />
          )
        })}
      </div>
    </div>
  )
}
