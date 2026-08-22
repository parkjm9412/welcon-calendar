export interface GCalEvent {
  id: string
  title: string
  date: string // 'YYYY-M-D'
  timeStart: string
  timeEnd: string
  allDay: boolean
  location?: string
  htmlLink?: string
}

export interface GCalCalendar {
  id: string
  summary: string
  primary?: boolean
  backgroundColor?: string
}

export interface GCalFetchResult {
  events: GCalEvent[]
  error?: string
}

const DEFAULT_CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID ?? 'primary'

export function getDefaultCalendarId() {
  return DEFAULT_CALENDAR_ID
}

function toLocalDate(iso: string): Date {
  return new Date(iso)
}

function fmt(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function fmtTime(iso: string): string {
  if (!iso.includes('T')) return ''
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function gcalFetch(url: string, accessToken: string) {
  return fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
}

export async function fetchCalendarList(accessToken: string): Promise<GCalCalendar[]> {
  const res = await gcalFetch(
    'https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=reader',
    accessToken,
  )

  if (!res.ok) {
    console.warn('Calendar list error:', res.status, await res.text())
    return [{ id: 'primary', summary: '내 캘린더', primary: true }]
  }

  const data = await res.json()
  return (data.items ?? []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    summary: (item.summary as string) ?? '(이름 없음)',
    primary: item.primary as boolean | undefined,
    backgroundColor: item.backgroundColor as string | undefined,
  }))
}

export async function fetchGoogleCalendarEvents(
  accessToken: string,
  calendarId: string,
  year: number,
  month: number,
): Promise<GCalFetchResult> {
  const timeMin = new Date(year, month, 1).toISOString()
  const timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  })

  const res = await gcalFetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    accessToken,
  )

  if (!res.ok) {
    const errText = await res.text()
    console.warn('Google Calendar API error:', res.status, errText)
    return { events: [], error: `API ${res.status}: 일정을 불러올 수 없습니다` }
  }

  const data = await res.json()
  const items: GCalEvent[] = []

  for (const item of data.items ?? []) {
    const start = item.start?.dateTime ?? item.start?.date ?? ''
    const end = item.end?.dateTime ?? item.end?.date ?? ''
    const allDay = !item.start?.dateTime

    if (!start) continue

    const startDate = toLocalDate(start)
    items.push({
      id: item.id,
      title: item.summary ?? '(제목 없음)',
      date: fmt(startDate),
      timeStart: allDay ? '' : fmtTime(start),
      timeEnd: allDay ? '' : fmtTime(end),
      allDay,
      location: item.location ?? undefined,
      htmlLink: item.htmlLink ?? undefined,
    })
  }

  return { events: items }
}
