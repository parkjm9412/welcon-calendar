export function getDaysInMonth(year: number, month: number): Date[] {
  const date = new Date(year, month, 1)
  const days: Date[] = []

  // Add days from previous month
  const firstDayOfWeek = date.getDay()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i)
    days.push(prevDate)
  }

  // Add days of current month
  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }

  // Add days from next month
  while (days.length % 7 !== 0) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }

  return days
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  return `${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getMonth() + 1}월 ${end.getDate()}일`
}

export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

export function isSameMonth(date: Date, month: number, year: number): boolean {
  return date.getMonth() === month && date.getFullYear() === year
}

export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

export function getEmployeeColor(colorIndex: number): string {
  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
    '#06b6d4', // cyan
    '#6366f1', // indigo
    '#84cc16', // lime
    '#d946ef', // fuchsia
    '#0891b2', // cyan-dark
  ]
  return colors[colorIndex % colors.length]
}

export function getMonthName(month: number): string {
  const months = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ]
  return months[month]
}

export function getDayName(day: number): string {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return days[day]
}
