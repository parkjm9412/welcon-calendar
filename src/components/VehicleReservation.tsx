import { useState } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

interface Vehicle {
  id: string
  name: string
  plate: string
  type: string
  seats: number
  status: 'available' | 'reserved' | 'maintenance'
  image: string
}

interface Reservation {
  id: string
  vehicleId: string
  vehicleName: string
  requester: string
  dept: string
  date: string
  timeStart: string
  timeEnd: string
  purpose: string
  status: 'approved' | 'pending' | 'cancelled'
}

const vehicles: Vehicle[] = [
  {
    id: 'v1',
    name: '기아 니로 HEV',
    plate: '12가 3456',
    type: '하이브리드 SUV',
    seats: 5,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1775748343252-d95ed58216ae?w=400&h=200&fit=crop&auto=format',
  },
  {
    id: 'v2',
    name: '기아 레이',
    plate: '34나 7890',
    type: '경차',
    seats: 4,
    status: 'reserved',
    image: 'https://images.unsplash.com/photo-1628066961967-de52104e87a4?w=400&h=200&fit=crop&auto=format',
  },
]

const initialReservations: Reservation[] = [
  {
    id: 'r1',
    vehicleId: 'v2',
    vehicleName: '기아 레이',
    requester: '이수현',
    dept: '전략기획팀',
    date: '2026-08-16',
    timeStart: '10:00',
    timeEnd: '13:00',
    purpose: '외부 미팅 (강남 클라이언트)',
    status: 'approved',
  },
  {
    id: 'r2',
    vehicleId: 'v1',
    vehicleName: '기아 니로 HEV',
    requester: '박준혁',
    dept: '마케팅팀',
    date: '2026-08-17',
    timeStart: '09:00',
    timeEnd: '11:00',
    purpose: '행사 자재 운반',
    status: 'pending',
  },
]

const statusConfig = {
  available: { label: '사용가능', color: '#0ca678', bg: '#d1fae5' },
  reserved: { label: '예약됨', color: '#f59e0b', bg: '#fef3c7' },
  maintenance: { label: '정비중', color: '#ef4444', bg: '#fee2e2' },
}

const resStatusConfig = {
  approved: { label: '승인', color: '#0ca678', bg: '#d1fae5' },
  pending: { label: '대기', color: '#f59e0b', bg: '#fef3c7' },
  cancelled: { label: '취소', color: '#8c9ab8', bg: '#f1f3f7' },
}

interface FormState {
  vehicleId: string
  date: string
  timeStart: string
  timeEnd: string
  purpose: string
}

export default function VehicleReservation() {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const isMobile = useIsMobile()
  const [form, setForm] = useState<FormState>({
    vehicleId: '',
    date: '2026-08-16',
    timeStart: '09:00',
    timeEnd: '11:00',
    purpose: '',
  })

  const openForm = (vehicleId?: string) => {
    setForm((f) => ({ ...f, vehicleId: vehicleId || '' }))
    setShowForm(true)
    setSubmitted(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = vehicles.find((v) => v.id === form.vehicleId)
    if (!v) return
    const newRes: Reservation = {
      id: `r${Date.now()}`,
      vehicleId: form.vehicleId,
      vehicleName: v.name,
      requester: '김지원',
      dept: '전략기획팀',
      date: form.date,
      timeStart: form.timeStart,
      timeEnd: form.timeEnd,
      purpose: form.purpose,
      status: 'pending',
    }
    setReservations((prev) => [newRes, ...prev])
    setSubmitted(true)
    setShowForm(false)
  }

  const cancelReservation = (id: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' as const } : r)),
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
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
            법인 차량 예약
          </div>
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 28,
              color: '#0f1f3d',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            차량 예약 시스템
          </h1>
        </div>
        <button
          onClick={() => openForm()}
          style={{
            backgroundColor: '#0f1f3d',
            color: '#ffffff',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 500,
            fontSize: 13,
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1a3157'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0f1f3d'
          }}
        >
          + 예약하기
        </button>
      </div>

      {submitted && (
        <div
          style={{
            backgroundColor: '#d1fae5',
            border: '1px solid #6ee7b7',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 20,
            fontFamily: 'Outfit, sans-serif',
            fontSize: 13,
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>✓</span> 예약 신청이 완료되었습니다. 관리자 승인 후 확정됩니다.
        </div>
      )}

      {/* Vehicle cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 10 : 16, marginBottom: isMobile ? 18 : 28 }}>
        {vehicles.map((v) => {
          const sc = statusConfig[v.status]
          const isSelected = selectedVehicle === v.id
          return (
            <div
              key={v.id}
              onClick={() => setSelectedVehicle(isSelected ? null : v.id)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 12,
                border: `1.5px solid ${isSelected ? '#0f1f3d' : '#e2e8f0'}`,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                boxShadow: isSelected ? '0 0 0 3px rgba(15,31,61,0.08)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSelected)
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#c0ccdd'
              }}
              onMouseLeave={(e) => {
                if (!isSelected)
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'
              }}
            >
              <div
                style={{
                  height: 110,
                  overflow: 'hidden',
                  backgroundColor: '#f0f2f7',
                  position: 'relative',
                }}
              >
                <img
                  src={v.image}
                  alt={v.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: sc.bg,
                    color: sc.color,
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 9,
                    fontWeight: 500,
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  {sc.label}
                </div>
              </div>
              <div style={{ padding: '12px 14px' }}>
                <div
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    fontSize: 13,
                    color: '#0f1f3d',
                    marginBottom: 4,
                  }}
                >
                  {v.name}
                </div>
                <div
                  style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10,
                    color: '#8c9ab8',
                    marginBottom: 10,
                  }}
                >
                  {v.plate} · {v.type} · {v.seats}인승
                </div>
                {v.status === 'available' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openForm(v.id)
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: '#0f1f3d',
                      color: '#ffffff',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 500,
                      fontSize: 11,
                      padding: '6px 0',
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#253d6b'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0f1f3d'
                    }}
                  >
                    예약하기
                  </button>
                )}
                {v.status !== 'available' && (
                  <div
                    style={{
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 10,
                      color: '#c0ccdd',
                      textAlign: 'center',
                      paddingTop: 4,
                    }}
                  >
                    {v.status === 'maintenance' ? '정비 중 예약 불가' : '현재 예약됨'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Reservation form modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,31,61,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false)
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: isMobile ? '14px 14px 0 0' : 14,
              width: isMobile ? '100%' : 480,
              maxWidth: '100vw',
              overflow: 'hidden',
              position: isMobile ? 'fixed' : 'relative',
              bottom: isMobile ? 0 : 'auto',
              left: isMobile ? 0 : 'auto',
              right: isMobile ? 0 : 'auto',
            }}
          >
            <div
              style={{
                backgroundColor: '#0f1f3d',
                padding: '20px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10,
                    color: '#4a6494',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: 4,
                  }}
                >
                  NEW RESERVATION
                </div>
                <div
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    fontSize: 17,
                    color: '#e8edf5',
                  }}
                >
                  차량 예약 신청
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  color: '#8c9ab8',
                  cursor: 'pointer',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 28px 28px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Vehicle select */}
                <div>
                  <label style={labelStyle}>차량 선택</label>
                  <select
                    required
                    value={form.vehicleId}
                    onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="">차량을 선택하세요</option>
                    {vehicles
                      .filter((v) => v.status === 'available')
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.plate})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label style={labelStyle}>사용 날짜</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                {/* Time */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>출발 시간</label>
                    <input
                      type="time"
                      required
                      value={form.timeStart}
                      onChange={(e) => setForm((f) => ({ ...f, timeStart: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>반납 시간</label>
                    <input
                      type="time"
                      required
                      value={form.timeEnd}
                      onChange={(e) => setForm((f) => ({ ...f, timeEnd: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label style={labelStyle}>사용 목적</label>
                  <textarea
                    required
                    rows={3}
                    value={form.purpose}
                    onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                    placeholder="예: 외부 미팅, 행사 참여, 자재 운반 등"
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      minHeight: 80,
                      lineHeight: 1.5,
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    backgroundColor: '#0f1f3d',
                    color: '#ffffff',
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    fontSize: 14,
                    padding: '12px 0',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#253d6b'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0f1f3d'
                  }}
                >
                  예약 신청
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reservation list */}
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
            borderBottom: '1px solid #f0f2f7',
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
              color: '#0f1f3d',
              margin: 0,
            }}
          >
            예약 현황
          </h2>
          <span
            style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8' }}
          >
            총 {reservations.filter((r) => r.status !== 'cancelled').length}건
          </span>
        </div>

        {/* 모바일: 카드형 / 데스크톱: 테이블 */}
        {isMobile ? (
          <div style={{ padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reservations.map((r) => {
              const sc = resStatusConfig[r.status]
              return (
                <div key={r.id} style={{ backgroundColor: '#f8fafd', borderRadius: 10, padding: '14px', border: '1px solid #f0f2f7', opacity: r.status === 'cancelled' ? 0.45 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 13, color: '#0f1f3d' }}>{r.vehicleName}</div>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8', marginTop: 2 }}>{r.date} · {r.timeStart}–{r.timeEnd}</div>
                    </div>
                    <span style={{ backgroundColor: sc.bg, color: sc.color, fontFamily: 'DM Mono, monospace', fontSize: 9, padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>{sc.label}</span>
                  </div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#4a6494', marginBottom: 4 }}>{r.requester} · {r.dept}</div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#8c9ab8' }}>{r.purpose}</div>
                  {r.status === 'pending' && r.requester === '김지원' && (
                    <button onClick={() => cancelReservation(r.id)} style={{ marginTop: 10, backgroundColor: 'transparent', border: '1px solid #fca5a5', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#ef4444' }}>취소</button>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr 2fr 1fr 80px', padding: '10px 24px', backgroundColor: '#f8fafd', borderBottom: '1px solid #f0f2f7' }}>
          {['차량', '신청자', '부서', '날짜', '사용목적', '상태', ''].map((h) => (
            <div key={h} style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</div>
          ))}
        </div>
        {reservations.map((r) => {
          const sc = resStatusConfig[r.status]
          return (
            <div key={r.id}
              style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr 2fr 1fr 80px', padding: '14px 24px', borderBottom: '1px solid #f0f2f7', alignItems: 'center', transition: 'background 0.1s', opacity: r.status === 'cancelled' ? 0.4 : 1 }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f8fafd' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent' }}
            >
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: 13, color: '#1e2d4d' }}>{r.vehicleName}</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8', marginTop: 1 }}>{r.timeStart}–{r.timeEnd}</div>
              </div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#4a6494' }}>{r.requester}</div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8' }}>{r.dept}</div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#4a6494' }}>{r.date}</div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#8c9ab8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 8 }}>{r.purpose}</div>
              <span style={{ backgroundColor: sc.bg, color: sc.color, fontFamily: 'DM Mono, monospace', fontSize: 9, padding: '2px 8px', borderRadius: 4, fontWeight: 500, display: 'inline-block' }}>{sc.label}</span>
              <div>
                {r.status === 'pending' && r.requester === '김지원' && (
                  <button onClick={() => cancelReservation(r.id)} style={{ backgroundColor: 'transparent', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#8c9ab8' }}>취소</button>
                )}
              </div>
            </div>
          )
        })}
          </>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'DM Mono, monospace',
  fontSize: 10,
  color: '#8c9ab8',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  fontFamily: 'Outfit, sans-serif',
  fontSize: 13,
  color: '#1e2d4d',
  outline: 'none',
  backgroundColor: '#f8fafd',
  transition: 'border-color 0.15s',
}
