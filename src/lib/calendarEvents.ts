import { supabase } from './supabase'
import {
  buildGoogleEventBody,
  formatEventTitle,
  toScheduleDate,
  type EventFormData,
} from './eventFormat'

export interface WebSchedule {
  id: string
  title: string
  type: string
  date: string
  time_start: string
  time_end: string
  owner: string
  location?: string
  memo?: string
  google_event_id?: string
  source?: string
  created_by?: string
}

export async function fetchWebSchedules(
  year: number,
  month: number,
): Promise<WebSchedule[]> {
  const prefix = `${year}-${month + 1}-`
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('source', 'web')
    .like('date', `${prefix}%`)

  if (error) {
    console.warn('웹 일정 조회 실패:', error.message)
    return []
  }
  return (data ?? []) as WebSchedule[]
}

export async function createCalendarEvent(
  data: EventFormData,
): Promise<{ schedule: WebSchedule; googleSynced: boolean; googleError?: string }> {
  const id = `web-${Date.now()}`
  const formattedTitle = formatEventTitle(data.eventType, data.title)

  let googleEventId: string | undefined
  let googleSynced = false
  let googleError: string | undefined

  try {
    const { data: fnData, error: fnError } = await supabase.functions.invoke(
      'create-calendar-event',
      { body: buildGoogleEventBody(data) },
    )

    if (fnError) {
      googleError = fnError.message
    } else if (fnData?.success && fnData?.eventId) {
      googleEventId = fnData.eventId
      googleSynced = true
    } else if (fnData?.error) {
      googleError = fnData.error
    }
  } catch (e) {
    googleError = e instanceof Error ? e.message : String(e)
  }

  const schedule: WebSchedule = {
    id,
    title: formattedTitle,
    type: data.eventType,
    date: toScheduleDate(data.startDate),
    time_start: data.allDay ? '' : data.startTime,
    time_end: data.allDay ? '' : data.endTime,
    owner: data.owner,
    location: data.location,
    memo: data.memo,
    google_event_id: googleEventId,
    source: 'web',
    created_by: data.createdBy,
  }

  const { error: insertError } = await supabase.from('schedules').insert({
    id: schedule.id,
    title: schedule.title,
    type: schedule.type,
    date: schedule.date,
    time_start: schedule.time_start,
    time_end: schedule.time_end,
    owner: schedule.owner,
    location: schedule.location ?? null,
    memo: schedule.memo ?? null,
    google_event_id: googleEventId ?? null,
    source: 'web',
    created_by: data.createdBy ?? null,
    all_day: data.allDay,
  })

  if (insertError) {
    throw new Error(`일정 저장 실패: ${insertError.message}`)
  }

  return { schedule, googleSynced, googleError }
}
