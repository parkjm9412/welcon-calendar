export const EVENT_TYPES = [
  { value: 'meeting', label: '미팅' },
  { value: 'trip', label: '출장' },
  { value: 'vacation', label: '휴가' },
  { value: 'deadline', label: '납기' },
  { value: 'other', label: '기타' },
] as const

export type EventType = (typeof EVENT_TYPES)[number]['value']

const TYPE_LABEL: Record<EventType, string> = {
  meeting: '미팅',
  trip: '출장',
  vacation: '휴가',
  deadline: '납기',
  other: '기타',
}

export interface EventFormData {
  eventType: EventType
  title: string
  startDate: string // YYYY-MM-DD
  endDate: string
  startTime: string // HH:MM
  endTime: string
  allDay: boolean
  owner: string
  location?: string
  memo?: string
  createdBy?: string
  createdByName?: string
}

export function formatEventTitle(eventType: EventType, title: string): string {
  const label = TYPE_LABEL[eventType]
  const trimmed = title.trim()
  if (trimmed.startsWith(`[${label}]`)) return trimmed
  return `[${label}] ${trimmed}`
}

export function formatEventDescription(data: EventFormData): string {
  const lines = [
    `유형: ${TYPE_LABEL[data.eventType]}`,
    `담당: ${data.owner}`,
  ]
  if (data.createdByName) lines.push(`등록: ${data.createdByName}`)
  if (data.location?.trim()) lines.push(`장소: ${data.location.trim()}`)
  if (data.memo?.trim()) lines.push(`\n메모:\n${data.memo.trim()}`)
  return lines.join('\n')
}

export function toScheduleDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return `${y}-${m}-${d}`
}

export function buildGoogleEventBody(data: EventFormData) {
  const summary = formatEventTitle(data.eventType, data.title)
  const description = formatEventDescription(data)

  if (data.allDay) {
    const endExclusive = new Date(data.endDate)
    endExclusive.setDate(endExclusive.getDate() + 1)
    const endStr = endExclusive.toISOString().split('T')[0]
    return {
      summary,
      description,
      location: data.location?.trim() || undefined,
      start: { date: data.startDate },
      end: { date: endStr },
    }
  }

  return {
    summary,
    description,
    location: data.location?.trim() || undefined,
    start: {
      dateTime: `${data.startDate}T${data.startTime}:00`,
      timeZone: 'Asia/Seoul',
    },
    end: {
      dateTime: `${data.endDate}T${data.endTime}:00`,
      timeZone: 'Asia/Seoul',
    },
  }
}
