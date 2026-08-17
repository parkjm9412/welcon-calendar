export interface GCalEvent {
  id: string
  title: string
  date: string       // 'YYYY-M-D'
  timeStart: string  // 'HH:MM'
  timeEnd: string
  type: 'personal'
  owner: string
  allDay?: boolean
}

function toLocalDate(iso: string): Date {
  // handles both date-only ('2026-08-16') and datetime ISO strings
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

export async function fetchGoogleCalendarEvents(
  accessToken: string,
  ownerName: string,
  year: number,
  month: number,        // 0-indexed
): Promise<GCalEvent[]> {
  const timeMin = new Date(year, month, 1).toISOString()
  const timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '200',
  })

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )

  if (!res.ok) {
    console.warn('Google Calendar API error:', res.status, await res.text())
    return []
  }

  const data = await res.json()
  const items: GCalEvent[] = []

  for (const item of data.items ?? []) {
    const start = item.start?.dateTime ?? item.start?.date ?? ''
    const end   = item.end?.dateTime   ?? item.end?.date   ?? ''
    const allDay = !item.start?.dateTime

    if (!start) continue

    const startDate = toLocalDate(start)
    items.push({
      id: item.id,
      title: item.summary ?? '(제목 없음)',
      date: fmt(startDate),
      timeStart: allDay ? '' : fmtTime(start),
      timeEnd:   allDay ? '' : fmtTime(end),
      type: 'personal',
      owner: ownerName,
      allDay,
    })
  }

  return items
}
