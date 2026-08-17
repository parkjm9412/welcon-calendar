import { supabase } from './supabase'

export interface SyncLog {
  id: string
  started_at: string
  completed_at?: string
  total_events: number
  status: 'running' | 'completed' | 'failed'
  results: Array<{
    success: boolean
    employeeEmail: string
    employeeName: string
    eventsCount: number
    error?: string
  }>
}

export async function syncAllCalendars(): Promise<SyncLog> {
  console.log('🔄 캘린더 동기화 시작...')

  try {
    // Supabase Edge Function 호출
    const { data, error } = await supabase.functions.invoke('sync-calendars')

    if (error) {
      console.error('❌ Edge Function 호출 실패:', error)
      throw new Error(error.message || '동기화 실패')
    }

    if (!data.success) {
      throw new Error(data.error || '동기화 실패')
    }

    console.log(`✅ 캘린더 동기화 완료: ${data.log.total_events}개 이벤트`)
    return data.log as SyncLog
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('❌ 캘린더 동기화 실패:', errorMsg)
    throw new Error(`캘린더 동기화 실패: ${errorMsg}`)
  }
}

// 최근 동기화 로그 조회
export async function getLatestSyncLog() {
  const { data, error } = await supabase
    .from('calendar_sync_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Sync log 조회 실패:', error)
    return null
  }
  return data
}

// 동기화 로그 조회
export async function getSyncLogs(limit = 10) {
  const { data, error } = await supabase
    .from('calendar_sync_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Sync logs 조회 실패:', error)
    return []
  }
  return data ?? []
}
