import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0'
import { JWT } from 'https://esm.sh/google-auth-library@9.14.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Employee {
  id: string
  name: string
  email: string
  site: string
  dept: string
  role: string
  rank: string
  status: 'active' | 'inactive' | 'leave'
  isAdmin: boolean
}

interface SyncResult {
  success: boolean
  employeeEmail: string
  employeeName: string
  eventsCount: number
  error?: string
}

interface SyncLog {
  id: string
  started_at: string
  completed_at?: string
  total_events: number
  status: 'running' | 'completed' | 'failed'
  results: SyncResult[]
}

serve(async (req: Request) => {
  // CORS preflight 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    // 직원 목록 가져오기
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('status', 'active')

    if (empError) {
      throw new Error(`직원 조회 실패: ${empError.message}`)
    }

    const syncLogId = `sync-${Date.now()}`
    const startedAt = new Date().toISOString()

    // Sync log 시작
    await supabase
      .from('calendar_sync_logs')
      .insert({
        id: syncLogId,
        started_at: startedAt,
        status: 'running',
        total_events: 0,
        results: [],
      })

    const results: SyncResult[] = []
    let totalEvents = 0

    // Google Service Account 설정
    const privateKey = Deno.env.get('GOOGLE_PRIVATE_KEY')
    const clientEmail = Deno.env.get('GOOGLE_CLIENT_EMAIL')

    if (!privateKey || !clientEmail) {
      throw new Error('Google credentials not configured')
    }

    // JWT 클라이언트 생성
    const auth = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/admin.directory.user.readonly',
      ],
      subject: 'admin@welconsystems.com',
    })

    // 각 직원의 캘린더 동기화
    for (const employee of employees) {
      try {
        const token = await auth.getAccessToken()
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

        console.log(`📅 ${employee.name} 캘린더 동기화 중...`)

        // Google Calendar API 호출
        const calendarRes = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(employee.email)}/events?` +
          `timeMin=${startOfMonth.toISOString()}&` +
          `timeMax=${endOfMonth.toISOString()}&` +
          `singleEvents=true&orderBy=startTime&maxResults=250`,
          {
            headers: {
              'Authorization': `Bearer ${token.token}`,
            },
          }
        )

        if (!calendarRes.ok) {
          const errorText = await calendarRes.text()
          console.warn(`⚠️ ${employee.name} 캘린더 조회 실패:`, calendarRes.status, errorText)
          results.push({
            success: false,
            employeeEmail: employee.email,
            employeeName: employee.name,
            eventsCount: 0,
            error: `API Error: ${calendarRes.status}`,
          })
          continue
        }

        const calendarData = await calendarRes.json()
        const events = calendarData.items ?? []

        const schedules = []
        for (const event of events) {
          const start = event.start?.dateTime ?? event.start?.date ?? ''
          if (!start) continue

          const startDate = new Date(start)
          const endDate = new Date(event.end?.dateTime ?? event.end?.date ?? start)

          schedules.push({
            id: `google-${event.id}`,
            title: event.summary ?? '(제목 없음)',
            type: 'personal',
            date: `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`,
            time_start: event.start?.dateTime
              ? `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`
              : '',
            time_end: event.end?.dateTime
              ? `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`
              : '',
            owner: employee.name,
            source: 'google',
            sync_log_id: syncLogId,
          })
        }

        // Supabase에 저장
        if (schedules.length > 0) {
          // 기존 구글 캘린더 이벤트 삭제
          await supabase
            .from('schedules')
            .delete()
            .eq('owner', employee.name)
            .eq('source', 'google')

          // 새 이벤트 저장
          const { error: insertError } = await supabase
            .from('schedules')
            .insert(schedules)

          if (insertError) {
            console.error(`❌ ${employee.name} 저장 실패:`, insertError)
            results.push({
              success: false,
              employeeEmail: employee.email,
              employeeName: employee.name,
              eventsCount: 0,
              error: insertError.message,
            })
          } else {
            console.log(`✅ ${employee.name}: ${schedules.length}개 저장`)
            results.push({
              success: true,
              employeeEmail: employee.email,
              employeeName: employee.name,
              eventsCount: schedules.length,
            })
            totalEvents += schedules.length
          }
        } else {
          results.push({
            success: true,
            employeeEmail: employee.email,
            employeeName: employee.name,
            eventsCount: 0,
          })
        }
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error(`❌ ${employee.name} 동기화 실패:`, errorMsg)
        results.push({
          success: false,
          employeeEmail: employee.email,
          employeeName: employee.name,
          eventsCount: 0,
          error: errorMsg,
        })
      }
    }

    // Sync log 완료
    const completedAt = new Date().toISOString()
    const { data: logData } = await supabase
      .from('calendar_sync_logs')
      .update({
        completed_at: completedAt,
        status: 'completed',
        total_events: totalEvents,
        results,
      })
      .eq('id', syncLogId)
      .select()
      .single()

    console.log(`✅ 동기화 완료: ${totalEvents}개 이벤트`)

    return new Response(
      JSON.stringify({
        success: true,
        message: '캘린더 동기화 완료',
        log: logData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('❌ 동기화 오류:', errorMsg)

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMsg,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
