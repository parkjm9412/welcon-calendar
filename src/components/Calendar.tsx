import { useState, useEffect, useCallback } from 'react'
import {
  fetchGoogleCalendarEvents,
  fetchCalendarList,
  getDefaultCalendarId,
  type GCalEvent,
  type GCalCalendar,
} from '@/lib/googleCalendar'
import { useIsMobile } from '@/hooks/useIsMobile'

const today = new Date()
const weekDayLabels = ['일', '월', '화', '수', '목', '금', '토']
const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${month + 1}-${day}`
}

interface Props {
  accessToken?: string
  onReconnect?: () => void
}

export default function Calendar({ accessToken, onReconnect }: Props) {
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate())
  const [events, setEvents] = useState<GCalEvent[]>([])
  const [calendars, setCalendars] = useState<GCalCalendar[]>([])
  const [calendarId, setCalendarId] = useState(getDefaultCalendarId())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isMobile = useIsMobile()

  const loadCalendars = useCallback(async () => {
    if (!accessToken) return
    const list = await fetchCalendarList(accessToken)
    setCalendars(list)
    const defaultId = getDefaultCalendarId()
    if (list.some((c) => c.id === defaultId)) {
      setCalendarId(defaultId)
    } else if (list.length > 0) {
      setCalendarId(list.find((c) => c.primary)?.id ?? list[0].id)
    }
  }, [accessToken])

  const loadEvents = useCallback(async () => {
    if (!accessToken) {
      setEvents([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await fetchGoogleCalendarEvents(accessToken, calendarId, viewYear, viewMonth)
      setEvents(result.events)
      if (result.error) setError(result.error)
    } catch (e) {
      setError(e instanceof Error ? e.message : '일정 로드 실패')
    } finally {
      setLoading(false)
    }
  }, [accessToken, calendarId, viewYear, viewMonth])

  useEffect(() => { loadCalendars() }, [loadCalendars])
  useEffect(() => { loadEvents() }, [loadEvents])

  const eventsByDate: Record<string, GCalEvent[]> = {}
  for (const ev of events) {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = []
    eventsByDate[ev.date].push(ev)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth)
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedEvents = selectedDay
    ? eventsByDate[dateKey(viewYear, viewMonth, selectedDay)] ?? []
    : []

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
    setSelectedDay(null)
  }
  const goToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedDay(today.getDate())
  }

  const isToday = (day: number) =>
    viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate()

  const selectedCal = calendars.find((c) => c.id === calendarId)

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#8c9ab8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Google Calendar
          </div>
          {accessToken ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: loading ? '#fef3c7' : '#d1fae5', borderRadius: 10, padding: '2px 10px' }}>
              {loading
                ? <span style={{ width: 8, height: 8, border: '1.5px solid #fcd34d', borderTopColor: '#f59e0b', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                : <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0ca678', display: 'inline-block' }} />
              }
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: loading ? '#92400e' : '#065f46' }}>
                {loading ? '불러오는 중...' : '연동됨'}
              </span>
            </div>
          ) : (
            <div style={{ backgroundColor: '#fef3c7', borderRadius: 10, padding: '2px 10px' }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#92400e' }}>미연동</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 28, color: '#0f1f3d', margin: 0 }}>
            {viewYear}년 {monthNames[viewMonth]}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {accessToken && calendars.length > 0 && (
              <select
                value={calendarId}
                onChange={(e) => setCalendarId(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 13,
                  color: '#1e2d4d',
                  maxWidth: 220,
                }}
              >
                {calendars.map((c) => (
                  <option key={c.id} value={c.id}>{c.summary}{c.primary ? ' (기본)' : ''}</option>
                ))}
              </select>
            )}
            <button onClick={goToday} style={btnStyle}>오늘</button>
            {!accessToken && onReconnect && (
              <button onClick={onReconnect} style={{ ...btnStyle, backgroundColor: '#C8102E', color: '#fff', border: 'none' }}>
                Google Calendar 연결
              </button>
            )}
          </div>
        </div>
      </div>

      {!accessToken && (
        <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '32px 24px', textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 16, color: '#0f1f3d', marginBottom: 8 }}>
            Google Calendar를 연결해주세요
          </div>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#8c9ab8', margin: '0 0 20px' }}>
            로그인 시 캘린더 권한을 허용하면 웹에서 일정을 볼 수 있습니다.
          </p>
          {onReconnect && (
            <button onClick={onReconnect} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', backgroundColor: '#C8102E', color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              Google Calendar 연결
            </button>
          )}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#fff4f4', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#b91c1c' }}>
          {error}
          {onReconnect && (
            <button onClick={onReconnect} style={{ marginLeft: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid #fca5a5', backgroundColor: '#fff', cursor: 'pointer', fontSize: 12 }}>
              다시 연결
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: isMobile ? 14 : 20, alignItems: 'start' }}>
        {/* Calendar grid */}
        <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', opacity: accessToken ? 1 : 0.4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px 12px', borderBottom: '1px solid #f0f2f7' }}>
            <button onClick={prevMonth} style={navBtnStyle}>‹</button>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 15, color: '#0f1f3d' }}>
              {viewYear}.{String(viewMonth + 1).padStart(2, '0')}
            </span>
            <button onClick={nextMonth} style={navBtnStyle}>›</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f0f2f7' }}>
            {weekDayLabels.map((d, i) => (
              <div key={d} style={{ padding: '10px 0', textAlign: 'center', fontFamily: 'DM Mono, monospace', fontSize: 10, color: i === 0 ? '#ef4444' : i === 6 ? '#2f6bff' : '#8c9ab8' }}>
                {d}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {cells.map((day, i) => {
              if (day === null) {
                return <div key={`e${i}`} style={{ minHeight: 80, borderRight: (i + 1) % 7 === 0 ? 'none' : '1px solid #f0f2f7', borderBottom: '1px solid #f0f2f7', backgroundColor: '#fafbfc' }} />
              }
              const key = dateKey(viewYear, viewMonth, day)
              const dayEvs = eventsByDate[key] ?? []
              const dow = (firstDow + day - 1) % 7
              const selected = day === selectedDay

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  style={{
                    minHeight: 80,
                    padding: 6,
                    borderRight: (i + 1) % 7 === 0 ? 'none' : '1px solid #f0f2f7',
                    borderBottom: '1px solid #f0f2f7',
                    cursor: 'pointer',
                    backgroundColor: selected ? '#f0f5ff' : 'transparent',
                  }}
                >
                  <div style={{ width: 24, height: 24, borderRadius: isToday(day) ? '50%' : 4, backgroundColor: isToday(day) ? '#0f1f3d' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: isToday(day) ? 600 : 400, color: isToday(day) ? '#fff' : dow === 0 ? '#ef4444' : dow === 6 ? '#2f6bff' : '#1e2d4d' }}>
                      {day}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayEvs.slice(0, 2).map((ev) => (
                      <div key={ev.id} style={{ backgroundColor: '#2f6bff18', borderLeft: '2px solid #2f6bff', padding: '2px 4px', borderRadius: '0 3px 3px 0', fontFamily: 'Outfit, sans-serif', fontSize: 10, fontWeight: 500, color: '#2f6bff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.title}
                      </div>
                    ))}
                    {dayEvs.length > 2 && (
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#8c9ab8' }}>+{dayEvs.length - 2}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f0f2f7', backgroundColor: selectedDay ? '#0f1f3d' : '#f8fafd' }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: selectedDay ? '#4a6494' : '#c0ccdd', marginBottom: 4 }}>
              {selectedCal?.summary ?? '캘린더'}
            </div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 14, color: selectedDay ? '#e8edf5' : '#c0ccdd' }}>
              {selectedDay ? `${viewMonth + 1}월 ${selectedDay}일 · ${selectedEvents.length}건` : '날짜를 선택하세요'}
            </div>
          </div>
          <div style={{ padding: '12px 16px 16px', minHeight: 120 }}>
            {selectedDay && selectedEvents.length === 0 && (
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#c0ccdd', textAlign: 'center', paddingTop: 20 }}>일정 없음</div>
            )}
            {selectedEvents.map((ev, i) => (
              <div key={ev.id} style={{ padding: '10px 4px', borderBottom: i < selectedEvents.length - 1 ? '1px solid #f0f2f7' : 'none' }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: 13, color: '#1e2d4d' }}>{ev.title}</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8', marginTop: 4 }}>
                  {ev.allDay ? '하루 종일' : `${ev.timeStart}${ev.timeEnd ? ` – ${ev.timeEnd}` : ''}`}
                </div>
                {ev.location && (
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, color: '#6b82a8', marginTop: 3 }}>{ev.location}</div>
                )}
                {ev.htmlLink && (
                  <a href={ev.htmlLink} target="_blank" rel="noreferrer" style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#2f6bff', marginTop: 4, display: 'inline-block' }}>
                    Google에서 보기 →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const navBtnStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 12px', cursor: 'pointer',
  backgroundColor: 'transparent', fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#4a6494',
}

const btnStyle: React.CSSProperties = {
  padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
  backgroundColor: '#fff', fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#4a6494', cursor: 'pointer',
}
