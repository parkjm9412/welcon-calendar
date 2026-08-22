import { useState, useEffect, useCallback } from 'react'
import { activeEmployees } from '@/data/employees'
import { fetchGoogleCalendarEvents } from '@/lib/googleCalendar'
import type { GCalEvent } from '@/lib/googleCalendar'
import { fetchWebSchedules, createCalendarEvent } from '@/lib/calendarEvents'
import type { EventFormData } from '@/lib/eventFormat'
import EventFormModal from './EventFormModal'
import { useIsMobile } from '@/hooks/useIsMobile'

const YEAR = 2026
const MONTH = 7 // August (0-indexed)

interface CalEvent {
  title: string
  type: string
  time?: string
  owner: string
  date?: string
}

const allEvents: Record<string, CalEvent[]> = {
  '2026-8-3':  [{ title: '전사 워크숍', type: 'company', owner: 'all' }],
  '2026-8-4':  [{ title: '전사 워크숍', type: 'company', owner: 'all' }],
  '2026-8-10': [{ title: '2분기 결산', type: 'important', owner: 'all' }],
  '2026-8-14': [{ title: '하반기 킥오프', type: 'company', owner: 'all' }],
  '2026-8-16': [
    { title: '주간 스탠드업', type: 'meeting', time: '09:00', owner: 'all' },
    { title: '전략 보고', type: 'important', time: '10:30', owner: '이수현' },
    { title: '신규 프로젝트 킥오프', type: 'meeting', time: '14:00', owner: '김지원' },
    { title: '외부 클라이언트 미팅', type: 'personal', time: '15:00', owner: '박준혁' },
    { title: '인사팀 면담', type: 'personal', time: '16:00', owner: '김지원' },
    { title: '디자인 리뷰', type: 'meeting', time: '14:00', owner: '최유나' },
  ],
  '2026-8-17': [
    { title: '주간 스탠드업', type: 'meeting', time: '09:00', owner: 'all' },
    { title: '협력사 미팅', type: 'personal', time: '11:00', owner: '이수현' },
    { title: '행사 자재 운반', type: 'personal', time: '09:00', owner: '박준혁' },
    { title: '개발팀 협업', type: 'meeting', time: '14:00', owner: '정민준' },
  ],
  '2026-8-18': [
    { title: '마케팅 기획 검토', type: 'meeting', time: '10:00', owner: '박준혁' },
    { title: '외부 세미나', type: 'personal', time: '14:00', owner: '최유나' },
    { title: '코드 리뷰', type: 'meeting', time: '15:00', owner: '정민준' },
  ],
  '2026-8-19': [
    { title: '임원 보고', type: 'important', time: '10:00', owner: '이수현' },
    { title: '신입사원 연수 이동', type: 'company', time: '14:00', owner: 'all' },
    { title: '주간 보고 작성', type: 'personal', time: '16:00', owner: '한소연' },
  ],
  '2026-8-20': [
    { title: '팀 점심 회식', type: 'personal', time: '12:00', owner: 'all' },
    { title: '성과 검토 면담', type: 'important', time: '15:00', owner: '한소연' },
  ],
  '2026-8-21': [
    { title: '팀 점심', type: 'personal', time: '12:00', owner: '김지원' },
    { title: 'UX 리서치 발표', type: 'meeting', time: '14:00', owner: '최유나' },
  ],
  '2026-8-24': [
    { title: '주간 스탠드업', type: 'meeting', time: '09:00', owner: 'all' },
    { title: '법인카드 정산', type: 'personal', time: '10:00', owner: '한소연' },
    { title: '채용 면접 참여', type: 'important', time: '14:00', owner: '이수현' },
  ],
  '2026-8-25': [
    { title: '파트너사 미팅', type: 'personal', time: '10:00', owner: '박준혁' },
    { title: '스프린트 회고', type: 'meeting', time: '15:00', owner: '정민준' },
  ],
  '2026-8-26': [{ title: '하반기 목표 설정', type: 'meeting', time: '14:00', owner: 'all' }],
  '2026-8-28': [
    { title: '리뷰 미팅', type: 'meeting', time: '10:00', owner: '이수현' },
    { title: '개인 역량 개발 세미나', type: 'personal', time: '13:00', owner: '김지원' },
  ],
  '2026-8-31': [
    { title: '월말 마감', type: 'important', time: '18:00', owner: 'all' },
    { title: '9월 일정 계획', type: 'meeting', time: '15:00', owner: '이수현' },
  ],
}

const empColors = ['#2f6bff','#8b5cf6','#f59e0b','#0ca678','#ec4899','#ef4444','#06b6d4','#84cc16','#f97316','#a855f7','#14b8a6','#eab308','#6366f1']

const employees = [
  { name: '전체', value: 'all', color: '#0f1f3d' },
  ...activeEmployees.map((e, i) => ({
    name: e.name,
    value: e.name,
    color: empColors[i % empColors.length],
  })),
]

const typeColor: Record<string, string> = {
  company:   '#2f6bff',
  important: '#f59e0b',
  meeting:   '#8b5cf6',
  personal:  '#0ca678',
  trip:      '#06b6d4',
  vacation:  '#84cc16',
  deadline:  '#ef4444',
  other:     '#6366f1',
}

const typeLabel: Record<string, string> = {
  company:   '전사',
  important: '중요',
  meeting:   '미팅',
  personal:  '개인',
  trip:      '출장',
  vacation:  '휴가',
  deadline:  '납기',
  other:     '기타',
}

const weekDayLabels = ['일', '월', '화', '수', '목', '금', '토']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

interface Props {
  accessToken?: string
  userName?: string
  userEmail?: string
}

export default function Calendar({ accessToken, userName, userEmail }: Props) {
  const [selectedDay, setSelectedDay] = useState<number | null>(16)
  const [viewMonth, setViewMonth] = useState(MONTH)
  const [viewYear, setViewYear] = useState(YEAR)
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [gcalEvents, setGcalEvents] = useState<GCalEvent[]>([])
  const [webEvents, setWebEvents] = useState<CalEvent[]>([])
  const [gcalLoading, setGcalLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [formDefaultDate, setFormDefaultDate] = useState<string>()
  const isMobile = useIsMobile()

  const loadGCal = useCallback(async (year: number, month: number) => {
    if (!accessToken || !userName) return
    setGcalLoading(true)
    try {
      const events = await fetchGoogleCalendarEvents(accessToken, userName, year, month)
      setGcalEvents(events)
    } catch (e) {
      console.warn('Google Calendar fetch error:', e)
    } finally {
      setGcalLoading(false)
    }
  }, [accessToken, userName])

  const loadWebSchedules = useCallback(async (year: number, month: number) => {
    try {
      const schedules = await fetchWebSchedules(year, month)
      setWebEvents(
        schedules.map((s) => ({
          title: s.title,
          type: s.type,
          time: s.time_start || undefined,
          owner: s.owner,
          date: s.date,
        })),
      )
    } catch (e) {
      console.warn('웹 일정 로드 실패:', e)
    }
  }, [])

  useEffect(() => {
    loadGCal(viewYear, viewMonth)
    loadWebSchedules(viewYear, viewMonth)
  }, [loadGCal, loadWebSchedules, viewYear, viewMonth])

  const handleCreateEvent = async (data: EventFormData) => {
    const result = await createCalendarEvent(data)
    await loadWebSchedules(viewYear, viewMonth)
    return { googleSynced: result.googleSynced, googleError: result.googleError }
  }

  const openFormForDay = (day: number) => {
    const d = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setFormDefaultDate(d)
    setFormOpen(true)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth)

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  // Google Calendar + 웹 등록 일정을 allEvents 구조에 병합
  const mergedEvents: Record<string, CalEvent[]> = { ...allEvents }
  for (const ev of gcalEvents) {
    if (!mergedEvents[ev.date]) mergedEvents[ev.date] = []
    if (!mergedEvents[ev.date].find(e => e.title === ev.title && e.owner === ev.owner)) {
      mergedEvents[ev.date] = [...mergedEvents[ev.date], ev]
    }
  }
  for (const ev of webEvents) {
    if (!ev.date) continue
    if (!mergedEvents[ev.date]) mergedEvents[ev.date] = []
    if (!mergedEvents[ev.date].find(e => e.title === ev.title && e.owner === ev.owner)) {
      mergedEvents[ev.date] = [...mergedEvents[ev.date], ev]
    }
  }

  function getFilteredEvents(key: string): CalEvent[] {
    const evs = mergedEvents[key] || []
    if (selectedEmployee === 'all') return evs
    return evs.filter((e) => e.owner === 'all' || e.owner === selectedEmployee)
  }

  const selectedKey = selectedDay ? `${viewYear}-${viewMonth + 1}-${selectedDay}` : null
  const selectedEvents = selectedKey ? getFilteredEvents(selectedKey) : []

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
    setSelectedDay(null)
  }

  const emp = employees.find((e) => e.value === selectedEmployee)!

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#8c9ab8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            직원 캘린더
          </div>
          {accessToken && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: '#d1fae5', borderRadius: 10, padding: '2px 10px' }}>
              {gcalLoading
                ? <span style={{ width: 8, height: 8, border: '1.5px solid #6ee7b7', borderTopColor: '#0ca678', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                : <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0ca678', display: 'inline-block' }} />
              }
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#065f46' }}>
                Google Calendar {gcalLoading ? '동기화 중...' : '연동됨'}
              </span>
            </div>
          )}
          {!accessToken && (
            <div style={{ backgroundColor: '#fef3c7', borderRadius: 10, padding: '2px 10px' }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#92400e' }}>Google Calendar 미연동</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 28, color: '#0f1f3d', margin: 0, letterSpacing: '-0.02em' }}>
            {viewYear}년 {monthNames[viewMonth]}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                const d = selectedDay
                  ? `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
                  : undefined
                setFormDefaultDate(d)
                setFormOpen(true)
              }}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#C8102E',
                color: '#fff',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              + 일정 등록
            </button>
          {/* Employee filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: isMobile ? 'nowrap' : 'wrap', overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? 4 : 0 }}>
            {employees.map((e) => {
              const active = selectedEmployee === e.value
              return (
                <button
                  key={e.value}
                  onClick={() => setSelectedEmployee(e.value)}
                  style={{
                    padding: '5px 13px',
                    borderRadius: 20,
                    border: `1.5px solid ${active ? e.color : '#e2e8f0'}`,
                    backgroundColor: active ? e.color : '#ffffff',
                    color: active ? '#ffffff' : '#6b82a8',
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: active ? 600 : 400,
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'all 0.13s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {e.name}
                </button>
              )
            })}
          </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: isMobile ? 14 : 20, alignItems: 'start' }}>
        {/* Calendar grid */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {/* Nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px 12px', borderBottom: '1px solid #f0f2f7' }}>
            <button onClick={prevMonth} style={navBtnStyle}>‹</button>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 15, color: '#0f1f3d' }}>
              {viewYear}.{String(viewMonth + 1).padStart(2, '0')}
            </span>
            <button onClick={nextMonth} style={navBtnStyle}>›</button>
          </div>

          {/* Days header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f0f2f7' }}>
            {weekDayLabels.map((d, i) => (
              <div key={d} style={{ padding: '10px 0', textAlign: 'center', fontFamily: 'DM Mono, monospace', fontSize: 10, color: i === 0 ? '#ef4444' : i === 6 ? '#2f6bff' : '#8c9ab8', letterSpacing: '0.04em' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {cells.map((day, i) => {
              if (day === null) {
                return (
                  <div key={`e${i}`} style={{ minHeight: 84, borderRight: (i + 1) % 7 === 0 ? 'none' : '1px solid #f0f2f7', borderBottom: '1px solid #f0f2f7', backgroundColor: '#fafbfc' }} />
                )
              }
              const key = `${viewYear}-${viewMonth + 1}-${day}`
              const dayEvs = getFilteredEvents(key)
              const isToday = viewYear === YEAR && viewMonth === MONTH && day === 16
              const isSelected = day === selectedDay
              const dow = (firstDow + day - 1) % 7

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  onDoubleClick={() => openFormForDay(day)}
                  style={{
                    minHeight: 84,
                    padding: '7px',
                    borderRight: (i + 1) % 7 === 0 ? 'none' : '1px solid #f0f2f7',
                    borderBottom: '1px solid #f0f2f7',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                    backgroundColor: isSelected ? '#f0f5ff' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f8fafd' }}
                  onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent' }}
                >
                  <div style={{ width: 24, height: 24, borderRadius: isToday ? '50%' : 4, backgroundColor: isToday ? '#0f1f3d' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: isToday ? 600 : 400, color: isToday ? '#ffffff' : dow === 0 ? '#ef4444' : dow === 6 ? '#2f6bff' : '#1e2d4d' }}>
                      {day}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayEvs.slice(0, 2).map((ev, ei) => {
                      const barColor = selectedEmployee !== 'all' && ev.owner === selectedEmployee
                        ? (employees.find(e => e.value === selectedEmployee)?.color ?? typeColor[ev.type])
                        : typeColor[ev.type]
                      return (
                        <div key={ei} style={{ backgroundColor: barColor + '18', borderLeft: `2px solid ${barColor}`, padding: '2px 4px', borderRadius: '0 3px 3px 0', fontFamily: 'Outfit, sans-serif', fontSize: 10, fontWeight: 500, color: barColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ev.title}
                        </div>
                      )
                    })}
                    {dayEvs.length > 2 && (
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#8c9ab8', paddingLeft: 2 }}>
                        +{dayEvs.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Legend */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 20px' }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
              일정 유형
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(typeColor).map(([type, color]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#4a6494' }}>{typeLabel[type]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected day detail */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f0f2f7', backgroundColor: selectedDay ? '#0f1f3d' : '#f8fafd' }}>
              {selectedEmployee !== 'all' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: emp.color }} />
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#4a6494', letterSpacing: '0.04em' }}>
                    {emp.name} 님의 일정
                  </span>
                </div>
              )}
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: selectedDay ? '#4a6494' : '#c0ccdd', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>
                {viewMonth + 1}월 {selectedDay ?? '—'}일
              </div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 14, color: selectedDay ? '#e8edf5' : '#c0ccdd' }}>
                {selectedDay ? (selectedEvents.length > 0 ? `일정 ${selectedEvents.length}건` : '일정 없음') : '날짜를 선택하세요'}
              </div>
            </div>
            <div style={{ padding: '12px 16px 16px', minHeight: 100 }}>
              {selectedEvents.length === 0 && selectedDay && (
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#c0ccdd', textAlign: 'center', paddingTop: 16 }}>
                  등록된 일정이 없습니다
                </div>
              )}
              {selectedEvents.map((ev, i) => {
                const isOwn = ev.owner === selectedEmployee && selectedEmployee !== 'all'
                const dotColor = isOwn ? emp.color : typeColor[ev.type]
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 4px', borderBottom: i < selectedEvents.length - 1 ? '1px solid #f0f2f7' : 'none' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0, marginTop: 4 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: 13, color: '#1e2d4d' }}>
                        {ev.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        {ev.time && (
                          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8' }}>{ev.time}</span>
                        )}
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: dotColor }}>{typeLabel[ev.type]}</span>
                        {ev.owner !== 'all' && selectedEmployee === 'all' && (
                          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#c0ccdd' }}>· {ev.owner}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <EventFormModal
        isOpen={formOpen}
        defaultDate={formDefaultDate}
        defaultOwner={selectedEmployee !== 'all' ? selectedEmployee : userName}
        createdBy={userEmail}
        createdByName={userName}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreateEvent}
      />
    </div>
  )
}

const navBtnStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  padding: '4px 12px',
  cursor: 'pointer',
  backgroundColor: 'transparent',
  fontFamily: 'DM Mono, monospace',
  fontSize: 12,
  color: '#4a6494',
}
