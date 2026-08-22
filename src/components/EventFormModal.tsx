import { useState, useEffect } from 'react'
import { activeEmployees } from '@/data/employees'
import { EVENT_TYPES, type EventFormData, type EventType } from '@/lib/eventFormat'

interface Props {
  isOpen: boolean
  defaultDate?: string // YYYY-MM-DD
  defaultOwner?: string
  createdBy?: string
  createdByName?: string
  onClose: () => void
  onSubmit: (data: EventFormData) => Promise<{ googleSynced: boolean; googleError?: string }>
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  fontFamily: 'Outfit, sans-serif',
  fontSize: 13,
  color: '#1e2d4d',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'DM Mono, monospace',
  fontSize: 10,
  color: '#8c9ab8',
  letterSpacing: '0.04em',
  marginBottom: 6,
  textTransform: 'uppercase',
}

export default function EventFormModal({
  isOpen,
  defaultDate,
  defaultOwner,
  createdBy,
  createdByName,
  onClose,
  onSubmit,
}: Props) {
  const today = defaultDate ?? new Date().toISOString().split('T')[0]

  const [eventType, setEventType] = useState<EventType>('meeting')
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [allDay, setAllDay] = useState(false)
  const [owner, setOwner] = useState(defaultOwner ?? activeEmployees[0]?.name ?? '')
  const [location, setLocation] = useState('')
  const [memo, setMemo] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultMsg, setResultMsg] = useState('')

  useEffect(() => {
    if (isOpen) {
      setStartDate(defaultDate ?? today)
      setEndDate(defaultDate ?? today)
      if (defaultOwner) setOwner(defaultOwner)
      setResultMsg('')
    }
  }, [isOpen, defaultDate, defaultOwner, today])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }
    if (!owner) {
      alert('담당자를 선택해주세요.')
      return
    }

    setLoading(true)
    setResultMsg('')
    try {
      const { googleSynced, googleError } = await onSubmit({
        eventType,
        title: title.trim(),
        startDate,
        endDate,
        startTime,
        endTime,
        allDay,
        owner,
        location: location.trim() || undefined,
        memo: memo.trim() || undefined,
        createdBy,
        createdByName,
      })

      if (googleSynced) {
        setResultMsg('✅ 일정이 등록되었고 Google Calendar에 반영되었습니다.')
      } else {
        setResultMsg(
          `✅ 일정이 저장되었습니다.${googleError ? ` (Google Calendar: ${googleError})` : ' (Google Calendar 연동 대기 중)'}`,
        )
      }

      setTimeout(() => {
        onClose()
        setTitle('')
        setLocation('')
        setMemo('')
        setResultMsg('')
      }, 1200)
    } catch (err) {
      alert(err instanceof Error ? err.message : '일정 등록에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15,31,61,0.55)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 14,
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid #f0f2f7',
            backgroundColor: '#0f1f3d',
            borderRadius: '14px 14px 0 0',
          }}
        >
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#4a6494', letterSpacing: '0.06em', marginBottom: 4 }}>
            STANDARD FORM
          </div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 18, color: '#e8edf5', margin: 0 }}>
            일정 등록
          </h2>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#4a6494', margin: '6px 0 0' }}>
            모든 직원이 동일한 양식으로 등록합니다
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          <div style={{ display: 'grid', gap: 16 }}>
            {/* 유형 */}
            <div>
              <label style={labelStyle}>일정 유형 *</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                style={inputStyle}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* 제목 */}
            <div>
              <label style={labelStyle}>제목 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: OO 프로젝트 킥오프"
                style={inputStyle}
                required
              />
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#c0ccdd', marginTop: 4 }}>
                저장 시 [{EVENT_TYPES.find(t => t.value === eventType)?.label}] 접두사가 자동 추가됩니다
              </div>
            </div>

            {/* 담당자 */}
            <div>
              <label style={labelStyle}>담당자 *</label>
              <select value={owner} onChange={(e) => setOwner(e.target.value)} style={inputStyle} required>
                {activeEmployees.map((emp) => (
                  <option key={emp.id} value={emp.name}>{emp.name} · {emp.dept}</option>
                ))}
              </select>
            </div>

            {/* 하루 종일 */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
              <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#4a6494' }}>하루 종일</span>
            </label>

            {/* 날짜 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>시작일 *</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>종료일 *</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} required />
              </div>
            </div>

            {/* 시간 */}
            {!allDay && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>시작 시간</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>종료 시간</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={inputStyle} />
                </div>
              </div>
            )}

            {/* 장소 */}
            <div>
              <label style={labelStyle}>장소 / 화상 링크</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="회의실 A / https://meet.google.com/..."
                style={inputStyle}
              />
            </div>

            {/* 메모 */}
            <div>
              <label style={labelStyle}>메모</label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
                placeholder="추가 설명"
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>

          {resultMsg && (
            <div style={{ marginTop: 16, padding: '10px 14px', backgroundColor: '#d1fae5', borderRadius: 8, fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#065f46' }}>
              {resultMsg}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 8,
                border: 'none',
                backgroundColor: loading ? '#94a3b8' : '#C8102E',
                color: '#fff',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: 14,
                cursor: loading ? 'default' : 'pointer',
              }}
            >
              {loading ? '등록 중...' : '일정 등록'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                backgroundColor: '#fff',
                color: '#4a6494',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 14,
                cursor: loading ? 'default' : 'pointer',
              }}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
