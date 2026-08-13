'use client'

import { CalendarEvent, Employee } from '@/types'
import { isToday, isSameMonth, getEmployeeColor } from '@/lib/calendar-utils'

interface CalendarDayProps {
  date: Date
  events: CalendarEvent[]
  employees: Employee[]
  currentMonth: number
  currentYear: number
  onDayClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export default function CalendarDay({
  date,
  events,
  employees,
  currentMonth,
  currentYear,
  onDayClick,
  onEventClick,
}: CalendarDayProps) {
  const isCurrentMonth = isSameMonth(date, currentMonth, currentYear)
  const isTodayDate = isToday(date)

  return (
    <div
      onClick={() => onDayClick(date)}
      className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${
        isTodayDate ? 'today' : ''
      } cursor-pointer hover:bg-blue-50 transition-colors`}
    >
      <div className={`text-sm font-semibold mb-1 ${!isCurrentMonth ? 'text-gray-400' : ''}`}>
        {date.getDate()}
      </div>
      <div className="space-y-1 overflow-hidden">
        {events.slice(0, 3).map((event) => {
          const employee = employees.find((emp) => emp.id === event.employee_id)
          const color = employee ? getEmployeeColor(employee.color_index) : '#999999'

          return (
            <div
              key={event.id}
              onClick={(e) => {
                e.stopPropagation()
                onEventClick(event)
              }}
              className="event text-xs truncate"
              style={{ backgroundColor: color }}
              title={`${employee?.name}: ${event.title}`}
            >
              {event.title}
            </div>
          )
        })}
        {events.length > 3 && (
          <div className="text-xs text-gray-500 px-1">+{events.length - 3}개</div>
        )}
      </div>
    </div>
  )
}
