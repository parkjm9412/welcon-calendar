import { useState } from 'react'
import { activeEmployees } from '@/data/employees'
import { useIsMobile } from '@/hooks/useIsMobile'

const today = new Date(2026, 7, 16) // Aug 16, 2026

const scheduleItems = [
  { time: '09:00', end: '10:00', title: '주간 팀 스탠드업', type: 'meeting', room: '3층 회의실 A' },
  { time: '10:30', end: '11:30', title: '2026 하반기 전략 보고', type: 'important', room: '본부장실' },
  { time: '12:00', end: '13:00', title: '점심 · 외부 미팅', type: 'personal', room: '외부' },
  { time: '14:00', end: '15:00', title: '신규 프로젝트 킥오프', type: 'meeting', room: '5층 컨퍼런스룸' },
  { time: '16:00', end: '16:30', title: '인사팀 면담', type: 'personal', room: '인사팀' },
  { time: '17:30', end: '18:00', title: '일일 업무 마감 보고', type: 'meeting', room: '온라인' },
]

const announcements = [
  {
    id: 1,
    tag: '공지',
    title: '2026년 하반기 정기 인사 발령 안내',
    date: '8월 15일',
    read: false,
  },
  { id: 2, tag: '복지', title: '사내 카페테리아 메뉴 개편 및 운영시간 변경', date: '8월 14일', read: false },
  { id: 3, tag: '보안', title: '정보보안 의무 교육 이수 기한 안내 (~ 8/31)', date: '8월 12일', read: true },
  { id: 4, tag: '시설', title: '지하 주차장 공사로 인한 차량 진입 제한 안내', date: '8월 10일', read: true },
]

const presenceStatus = ['in', 'in', 'in', 'remote', 'in', 'out', 'in', 'in', 'remote', 'in', 'in', 'in', 'in']
const teamPresence = activeEmployees.map((e, i) => ({
  name: e.name,
  role: e.role,
  status: presenceStatus[i] ?? 'in',
  dept: `${e.site} · ${e.dept}`,
}))

const tagColor: Record<string, string> = {
  '공지': '#2f6bff',
  '복지': '#0ca678',
  '보안': '#ef4444',
  '시설': '#f59e0b',
}

const typeColor: Record<string, { bg: string; text: string; bar: string }> = {
  meeting: { bg: '#dbe9ff', text: '#1a4bbd', bar: '#2f6bff' },
  important: { bg: '#fef3c7', text: '#92400e', bar: '#f59e0b' },
  personal: { bg: '#d1fae5', text: '#065f46', bar: '#0ca678' },
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  in: { label: '출근', color: '#0ca678', bg: '#d1fae5' },
  out: { label: '휴가', color: '#8c9ab8', bg: '#f1f3f7' },
  remote: { label: '재택', color: '#2f6bff', bg: '#dbe9ff' },
}

const weekDays = ['일', '월', '화', '수', '목', '금', '토']
const dayOfWeek = weekDays[today.getDay()]

export default function Dashboard() {
  const [readIds, setReadIds] = useState<Set<number>>(new Set([3, 4]))
  const isMobile = useIsMobile()

  const markRead = (id: number) => setReadIds((prev) => new Set(prev).add(id))
  const unreadCount = announcements.filter((a) => !readIds.has(a.id)).length

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? 20 : 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 11,
                color: '#8c9ab8',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              2026년 8월 16일 {dayOfWeek}요일
            </div>
            <h1
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: 28,
                color: '#0f1f3d',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              안녕하세요, 김지원 대리님
            </h1>
          </div>
          <div
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 11,
              color: '#8c9ab8',
              textAlign: 'right',
            }}
          >
            <div>오늘 일정 {scheduleItems.length}건</div>
            <div style={{ color: unreadCount > 0 ? '#ef4444' : '#8c9ab8', marginTop: 2 }}>
              미읽 공지 {unreadCount}건
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? 10 : 14,
          marginBottom: isMobile ? 16 : 24,
        }}
      >
        {[
          { label: '오늘 일정', value: scheduleItems.length.toString(), unit: '건', color: '#2f6bff', bg: '#dbe9ff' },
          { label: '이번 주 근무', value: '3', unit: '일 차', color: '#0ca678', bg: '#d1fae5' },
          {
            label: '잔여 연차',
            value: '11.5',
            unit: '일',
            color: '#f59e0b',
            bg: '#fef3c7',
          },
          { label: '미처리 업무', value: '4', unit: '건', color: '#ef4444', bg: '#fee2e2' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: '18px 20px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                color: '#8c9ab8',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              {stat.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700,
                  fontSize: 28,
                  color: stat.color,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                  fontSize: 13,
                  color: '#8c9ab8',
                }}
              >
                {stat.unit}
              </span>
            </div>
            <div
              style={{
                marginTop: 10,
                height: 3,
                borderRadius: 2,
                backgroundColor: stat.bg,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: '60%',
                  backgroundColor: stat.color,
                  borderRadius: 2,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: isMobile ? 14 : 20 }}>
        {/* Left: Schedule + Announcements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Today's Schedule */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '18px 24px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #f0f2f7',
              }}
            >
              <h2
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: 15,
                  color: '#0f1f3d',
                  margin: 0,
                }}
              >
                오늘 일정
              </h2>
              <span
                style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 10,
                  color: '#8c9ab8',
                  letterSpacing: '0.04em',
                }}
              >
                {today.getMonth() + 1}/{today.getDate()}
              </span>
            </div>
            <div style={{ padding: '8px 16px 16px' }}>
              {scheduleItems.map((item, i) => {
                const tc = typeColor[item.type]
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'stretch',
                      gap: 14,
                      padding: '10px 8px',
                      borderRadius: 8,
                      cursor: 'default',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLDivElement).style.backgroundColor = '#f8fafd'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: 11,
                        color: '#8c9ab8',
                        width: 42,
                        flexShrink: 0,
                        paddingTop: 2,
                      }}
                    >
                      {item.time}
                    </div>
                    <div
                      style={{
                        width: 3,
                        borderRadius: 2,
                        backgroundColor: tc.bar,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 500,
                          fontSize: 13,
                          color: '#1e2d4d',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontFamily: 'DM Mono, monospace',
                          fontSize: 10,
                          color: '#8c9ab8',
                          marginTop: 2,
                        }}
                      >
                        {item.time}–{item.end} · {item.room}
                      </div>
                    </div>
                    <div
                      style={{
                        backgroundColor: tc.bg,
                        color: tc.text,
                        fontFamily: 'DM Mono, monospace',
                        fontSize: 9,
                        fontWeight: 500,
                        padding: '2px 7px',
                        borderRadius: 4,
                        alignSelf: 'center',
                        flexShrink: 0,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {item.type === 'meeting' ? '회의' : item.type === 'important' ? '중요' : '개인'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Announcements */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '18px 24px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #f0f2f7',
              }}
            >
              <h2
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: 15,
                  color: '#0f1f3d',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                사내 공지
                {unreadCount > 0 && (
                  <span
                    style={{
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 9,
                      padding: '2px 6px',
                      borderRadius: 10,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </h2>
              <span
                style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 10,
                  color: '#2f6bff',
                  cursor: 'pointer',
                }}
              >
                전체보기
              </span>
            </div>
            <div style={{ padding: '8px 16px 16px' }}>
              {announcements.map((a) => {
                const isRead = readIds.has(a.id)
                return (
                  <div
                    key={a.id}
                    onClick={() => markRead(a.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '11px 8px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'background 0.12s',
                      opacity: isRead ? 0.55 : 1,
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLDivElement).style.backgroundColor = '#f8fafd'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: tagColor[a.tag] + '18',
                        color: tagColor[a.tag],
                        fontFamily: 'DM Mono, monospace',
                        fontSize: 9,
                        padding: '2px 7px',
                        borderRadius: 4,
                        flexShrink: 0,
                        fontWeight: 500,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {a.tag}
                    </span>
                    <span
                      style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: isRead ? 400 : 500,
                        fontSize: 13,
                        color: '#1e2d4d',
                        flex: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {a.title}
                    </span>
                    <span
                      style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: 10,
                        color: '#c0ccdd',
                        flexShrink: 0,
                      }}
                    >
                      {a.date}
                    </span>
                    {!isRead && (
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: '#2f6bff',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Team presence + mini calendar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Team Presence */}
          <div
            style={{
              backgroundColor: '#0f1f3d',
              borderRadius: 12,
              overflow: 'hidden',
              color: '#fff',
            }}
          >
            <div
              style={{
                padding: '18px 20px 14px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: 15,
                  color: '#e8edf5',
                  margin: 0,
                }}
              >
                팀원 현황
              </h2>
              <span
                style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#4a6494' }}
              >
                전략기획팀
              </span>
            </div>
            <div style={{ padding: '8px 12px 14px' }}>
              {teamPresence.map((member) => {
                const sc = statusConfig[member.status]
                return (
                  <div
                    key={member.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px',
                      borderRadius: 8,
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLDivElement).style.backgroundColor =
                        'rgba(255,255,255,0.05)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        backgroundColor: '#253d6b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 600,
                        fontSize: 12,
                        color: '#7aa8ff',
                        flexShrink: 0,
                      }}
                    >
                      {member.name[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: 'Outfit, sans-serif',
                          fontWeight: 500,
                          fontSize: 13,
                          color: '#e8edf5',
                        }}
                      >
                        {member.name}
                      </div>
                      <div
                        style={{
                          fontFamily: 'DM Mono, monospace',
                          fontSize: 9,
                          color: '#4a6494',
                        }}
                      >
                        {member.role}
                      </div>
                    </div>
                    <span
                      style={{
                        backgroundColor: sc.bg,
                        color: sc.color,
                        fontFamily: 'DM Mono, monospace',
                        fontSize: 9,
                        padding: '2px 8px',
                        borderRadius: 4,
                        flexShrink: 0,
                        fontWeight: 500,
                      }}
                    >
                      {sc.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Vehicle Status */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '18px 20px 14px',
                borderBottom: '1px solid #f0f2f7',
              }}
            >
              <h2
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: 15,
                  color: '#0f1f3d',
                  margin: 0,
                }}
              >
                차량 현황
              </h2>
            </div>
            <div style={{ padding: '12px 16px 16px' }}>
              {[
                { name: '니로 HEV · 12가3456', status: '사용가능', color: '#0ca678', bg: '#d1fae5' },
                { name: '레이 · 34나7890', status: '예약됨', color: '#f59e0b', bg: '#fef3c7' },
              ].map((v) => (
                <div
                  key={v.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 4px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 11,
                      color: '#4a6494',
                    }}
                  >
                    {v.name}
                  </span>
                  <span
                    style={{
                      backgroundColor: v.bg,
                      color: v.color,
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 9,
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontWeight: 500,
                    }}
                  >
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
