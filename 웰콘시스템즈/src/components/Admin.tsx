import { useState, useEffect } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { employees as defaultEmployees } from '@/data/employees'
import type { Employee as EmpType } from '@/data/employees'
import {
  getEmployees, upsertEmployee, deleteEmployee,
  getVehicleReservations, updateReservationStatus,
  getAnnouncements, upsertAnnouncement, deleteAnnouncement,
  getSchedules, upsertSchedule, deleteSchedule,
  getSyncLogs,
} from '@/lib/database'
import { syncAllCalendars, getLatestSyncLog } from '@/lib/googleCalendarSync'
import { AdminCalendarSync } from './AdminCalendarSync'

type AdminTab = 'employees' | 'vehicles' | 'announcements' | 'schedules' | 'calendar'

// ─── 데이터 ───────────────────────────────────────────────
type Employee = EmpType

interface VehicleReq {
  id: string
  vehicleName: string
  plate: string
  requester: string
  dept: string
  date: string
  timeStart: string
  timeEnd: string
  purpose: string
  status: 'pending' | 'approved' | 'rejected'
}

interface Announcement {
  id: string
  tag: string
  title: string
  body: string
  date: string
  author: string
  pinned: boolean
}

interface Schedule {
  id: string
  title: string
  type: string
  date: string
  timeStart: string
  timeEnd: string
  owner: string
}

const initEmployees: Employee[] = defaultEmployees

const initVehicleReqs: VehicleReq[] = [
  { id: 'r1', vehicleName: '기아 니로 HEV', plate: '12가 3456', requester: '박준혁', dept: '마케팅팀', date: '2026-08-17', timeStart: '09:00', timeEnd: '11:00', purpose: '행사 자재 운반', status: 'pending' },
  { id: 'r2', vehicleName: '기아 레이', plate: '34나 7890', requester: '이수현', dept: '전략기획팀', date: '2026-08-16', timeStart: '10:00', timeEnd: '13:00', purpose: '외부 미팅 (강남 클라이언트)', status: 'approved' },
  { id: 'r3', vehicleName: '기아 니로 HEV', plate: '12가 3456', requester: '최유나', dept: '디자인팀', date: '2026-08-19', timeStart: '14:00', timeEnd: '17:00', purpose: '클라이언트 시안 발표', status: 'pending' },
  { id: 'r4', vehicleName: '기아 레이', plate: '34나 7890', requester: '정민준', dept: '개발팀', date: '2026-08-20', timeStart: '09:00', timeEnd: '12:00', purpose: '서버 장비 수령', status: 'rejected' },
]

const initAnnouncements: Announcement[] = [
  { id: 'a1', tag: '공지', title: '2026년 하반기 정기 인사 발령 안내', body: '2026년 하반기 정기 인사 발령 내용을 공지합니다. 자세한 사항은 인사팀에 문의하세요.', date: '2026-08-15', author: '인사팀', pinned: true },
  { id: 'a2', tag: '복지', title: '사내 카페테리아 메뉴 개편 및 운영시간 변경', body: '9월 1일부터 카페테리아 메뉴가 개편되며 운영시간이 변경됩니다.', date: '2026-08-14', author: '총무팀', pinned: false },
  { id: 'a3', tag: '보안', title: '정보보안 의무 교육 이수 기한 안내 (~ 8/31)', body: '8월 31일까지 정보보안 의무 교육을 이수해주시기 바랍니다.', date: '2026-08-12', author: 'IT 인프라팀', pinned: false },
]

const initSchedules: Schedule[] = [
  { id: 's1', title: '전사 워크숍', type: 'company', date: '2026-08-03', timeStart: '09:00', timeEnd: '18:00', owner: 'all' },
  { id: 's2', title: '하반기 킥오프', type: 'company', date: '2026-08-14', timeStart: '10:00', timeEnd: '12:00', owner: 'all' },
  { id: 's3', title: '하반기 목표 설정', type: 'meeting', date: '2026-08-26', timeStart: '14:00', timeEnd: '16:00', owner: 'all' },
  { id: 's4', title: '월말 마감', type: 'important', date: '2026-08-31', timeStart: '18:00', timeEnd: '19:00', owner: 'all' },
]

const empStatusCfg = {
  active:   { label: '재직', color: '#0ca678', bg: '#d1fae5' },
  inactive: { label: '퇴직', color: '#8c9ab8', bg: '#f1f3f7' },
  leave:    { label: '휴직', color: '#f59e0b', bg: '#fef3c7' },
}
const reqStatusCfg = {
  pending:  { label: '대기', color: '#f59e0b', bg: '#fef3c7' },
  approved: { label: '승인', color: '#0ca678', bg: '#d1fae5' },
  rejected: { label: '반려', color: '#ef4444', bg: '#fee2e2' },
}
const tagColors: Record<string, string> = { '공지': '#C8102E', '복지': '#0ca678', '보안': '#f59e0b', '시설': '#8b5cf6', '기타': '#8c9ab8' }
const typeLabels: Record<string, string> = { company: '전사', important: '중요', meeting: '팀내', personal: '개인' }
const typeColors: Record<string, string> = { company: '#2f6bff', important: '#f59e0b', meeting: '#8b5cf6', personal: '#0ca678' }

const TAGS = ['공지', '복지', '보안', '시설', '기타']
const TYPES = ['company', 'important', 'meeting']
const DEPTS = ['전략기획팀', '마케팅팀', '디자인팀', '개발팀', '인사팀', '총무팀']

// ─── 컴포넌트 ─────────────────────────────────────────────
export default function Admin() {
  const isMobile = useIsMobile()
  const [tab, setTab] = useState<AdminTab>('employees')
  const [employees, setEmployees] = useState<Employee[]>(initEmployees)
  const [vehicleReqs, setVehicleReqs] = useState<VehicleReq[]>(initVehicleReqs)
  const [announcements, setAnnouncements] = useState<Announcement[]>(initAnnouncements)
  const [schedules, setSchedules] = useState<Schedule[]>(initSchedules)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // modal states
  const [empModal, setEmpModal] = useState<Employee | null | 'new'>(null)
  const [annModal, setAnnModal] = useState<Announcement | null | 'new'>(null)
  const [schModal, setSchModal] = useState<Schedule | null | 'new'>(null)

  // Supabase 데이터 로드
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [emps, reqs, anns, schs] = await Promise.all([
          getEmployees(),
          getVehicleReservations(),
          getAnnouncements(),
          getSchedules(),
        ])
        if (emps.length) setEmployees(emps)
        if (reqs.length) setVehicleReqs(reqs.map((r: Record<string, unknown>) => ({
          id: r.id as string, vehicleName: r.vehicle_name as string, plate: r.plate as string,
          requester: r.requester as string, dept: r.dept as string, date: r.date as string,
          timeStart: r.time_start as string, timeEnd: r.time_end as string,
          purpose: r.purpose as string, status: r.status as VehicleReq['status'],
        })))
        if (anns.length) setAnnouncements(anns.map((a: Record<string, unknown>) => ({
          id: a.id as string, tag: a.tag as string, title: a.title as string,
          body: a.body as string, date: a.date as string, author: a.author as string,
          pinned: a.pinned as boolean,
        })))
        if (schs.length) setSchedules(schs.map((s: Record<string, unknown>) => ({
          id: s.id as string, title: s.title as string, type: s.type as string,
          date: s.date as string, timeStart: s.time_start as string,
          timeEnd: s.time_end as string, owner: s.owner as string,
        })))
      } catch (e) {
        setError('데이터를 불러오지 못했습니다. Supabase 테이블을 확인해주세요.')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#8c9ab8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>관리자</div>
          {loading && <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#8c9ab8', backgroundColor: '#f0f2f7', padding: '2px 8px', borderRadius: 10 }}>불러오는 중...</span>}
          {!loading && !error && <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#0ca678', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: 10 }}>● Supabase 연결됨</span>}
        </div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: isMobile ? 22 : 28, color: '#0f1f3d', margin: 0, letterSpacing: '-0.02em' }}>
          관리자 페이지
        </h1>
        {error && <div style={{ marginTop: 8, padding: '10px 14px', backgroundColor: '#fee2e2', borderRadius: 8, fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#b91c1c' }}>⚠ {error}</div>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, backgroundColor: '#ffffff', padding: 4, borderRadius: 10, border: '1px solid #e2e8f0', overflowX: isMobile ? 'auto' : 'visible', width: isMobile ? '100%' : 'fit-content' }}>
        {([
          { id: 'employees', label: '직원 관리' },
          { id: 'vehicles', label: '차량 승인' },
          { id: 'announcements', label: '공지사항' },
          { id: 'schedules', label: '일정 등록' },
          { id: 'calendar', label: '📅 캘린더 동기화' },
        ] as { id: AdminTab; label: string }[]).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: isMobile ? '8px 14px' : '8px 18px', borderRadius: 7, border: 'none', cursor: 'pointer', flexShrink: 0,
              fontFamily: 'Outfit, sans-serif', fontWeight: tab === t.id ? 600 : 400, fontSize: isMobile ? 12 : 13,
              backgroundColor: tab === t.id ? '#0f1f3d' : 'transparent',
              color: tab === t.id ? '#ffffff' : '#6b82a8',
              transition: 'all 0.13s',
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* ── 직원 관리 ── */}
      {tab === 'employees' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#8c9ab8' }}>총 {employees.length}명</span>
            <button onClick={() => setEmpModal('new')} style={addBtnStyle}>+ 직원 추가</button>
          </div>
          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {employees.map(emp => {
                const sc = empStatusCfg[emp.status]
                return (
                  <div key={emp.id} style={{ backgroundColor: '#ffffff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 14, color: '#0f1f3d' }}>{emp.name}</div>
                        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#8c9ab8', marginTop: 2 }}>{emp.email}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <span style={{ ...badgeStyle, backgroundColor: sc.bg, color: sc.color }}>{sc.label}</span>
                        {emp.isAdmin && <span style={{ ...badgeStyle, backgroundColor: '#dbe9ff', color: '#2f6bff' }}>관리자</span>}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#4a6494', marginBottom: 10 }}>{emp.site} · {emp.dept} · {emp.role} · {emp.rank}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setEmpModal(emp)} style={editBtnStyle}>편집</button>
                      <button onClick={async () => { await deleteEmployee(emp.id); setEmployees(prev => prev.filter(e => e.id !== emp.id)) }} style={delBtnStyle}>삭제</button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
          <div style={cardStyle}>
            <div style={{ ...tableHeaderStyle, gridTemplateColumns: '1.2fr 1.8fr 0.7fr 1.2fr 1fr 0.8fr 0.8fr 1fr 80px' }}>
              {['이름', '이메일', '사업장', '부서', '직책', '직급', '상태', '권한', ''].map(h => (
                <div key={h} style={thStyle}>{h}</div>
              ))}
            </div>
            {employees.map(emp => {
              const sc = empStatusCfg[emp.status]
              return (
                <div key={emp.id}
                  style={{ ...tableRowStyle, gridTemplateColumns: '1.2fr 1.8fr 0.7fr 1.2fr 1fr 0.8fr 0.8fr 1fr 80px' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f8fafd'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'}
                >
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: 13, color: '#1e2d4d' }}>{emp.name}</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8' }}>{emp.email}</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8' }}>{emp.site}</div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#4a6494' }}>{emp.dept}</div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#4a6494' }}>{emp.role}</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#8c9ab8' }}>{emp.rank}</div>
                  <span style={{ ...badgeStyle, backgroundColor: sc.bg, color: sc.color }}>{sc.label}</span>
                  <span style={{ ...badgeStyle, backgroundColor: emp.isAdmin ? '#dbe9ff' : '#f1f3f7', color: emp.isAdmin ? '#2f6bff' : '#8c9ab8' }}>
                    {emp.isAdmin ? '관리자' : '일반'}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => setEmpModal(emp)} style={editBtnStyle}>편집</button>
                    <button onClick={async () => { await deleteEmployee(emp.id); setEmployees(prev => prev.filter(e => e.id !== emp.id)) }} style={delBtnStyle}>삭제</button>
                  </div>
                </div>
              )
            })}
          </div>
          )}
        </div>
      )}

      {/* ── 차량 예약 승인 ── */}
      {tab === 'vehicles' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            {(['pending', 'approved', 'rejected'] as const).map(s => {
              const sc = reqStatusCfg[s]
              const cnt = vehicleReqs.filter(r => r.status === s).length
              return (
                <div key={s} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ ...badgeStyle, backgroundColor: sc.bg, color: sc.color }}>{sc.label}</span>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, color: '#0f1f3d' }}>{cnt}</span>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8' }}>건</span>
                </div>
              )
            })}
          </div>
          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {vehicleReqs.map(req => {
                const sc = reqStatusCfg[req.status]
                return (
                  <div key={req.id} style={{ backgroundColor: '#ffffff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 13, color: '#0f1f3d' }}>{req.vehicleName}</div>
                        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#c0ccdd', marginTop: 2 }}>{req.plate}</div>
                      </div>
                      <span style={{ ...badgeStyle, backgroundColor: sc.bg, color: sc.color }}>{sc.label}</span>
                    </div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#4a6494', marginBottom: 4 }}>{req.requester} · {req.dept}</div>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8', marginBottom: 4 }}>{req.date} · {req.timeStart}–{req.timeEnd}</div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#8c9ab8', marginBottom: 10 }}>{req.purpose}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {req.status === 'pending' && (
                        <>
                          <button onClick={async () => { await updateReservationStatus(req.id, 'approved'); setVehicleReqs(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' as const } : r)) }} style={{ ...editBtnStyle, borderColor: '#0ca678', color: '#0ca678' }}>승인</button>
                          <button onClick={async () => { await updateReservationStatus(req.id, 'rejected'); setVehicleReqs(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected' as const } : r)) }} style={delBtnStyle}>반려</button>
                        </>
                      )}
                      {req.status !== 'pending' && (
                        <button onClick={async () => { await updateReservationStatus(req.id, 'pending'); setVehicleReqs(prev => prev.map(r => r.id === req.id ? { ...r, status: 'pending' as const } : r)) }} style={editBtnStyle}>초기화</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
          <div style={cardStyle}>
            <div style={{ ...tableHeaderStyle, gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr 1.5fr 2fr 0.8fr 100px' }}>
              {['차량', '신청자', '부서', '날짜', '시간', '목적', '상태', '처리'].map(h => (
                <div key={h} style={thStyle}>{h}</div>
              ))}
            </div>
            {vehicleReqs.map(req => {
              const sc = reqStatusCfg[req.status]
              return (
                <div key={req.id}
                  style={{ ...tableRowStyle, gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr 1.5fr 2fr 0.8fr 100px' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f8fafd'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'}
                >
                  <div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: 12, color: '#1e2d4d' }}>{req.vehicleName}</div>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#c0ccdd' }}>{req.plate}</div>
                  </div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#4a6494' }}>{req.requester}</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8' }}>{req.dept}</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#4a6494' }}>{req.date}</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#8c9ab8' }}>{req.timeStart}–{req.timeEnd}</div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#8c9ab8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{req.purpose}</div>
                  <span style={{ ...badgeStyle, backgroundColor: sc.bg, color: sc.color }}>{sc.label}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {req.status === 'pending' && (
                      <>
                        <button onClick={async () => { await updateReservationStatus(req.id, 'approved'); setVehicleReqs(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' as const } : r)) }}
                          style={{ ...editBtnStyle, borderColor: '#0ca678', color: '#0ca678' }}>승인</button>
                        <button onClick={async () => { await updateReservationStatus(req.id, 'rejected'); setVehicleReqs(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected' as const } : r)) }}
                          style={delBtnStyle}>반려</button>
                      </>
                    )}
                    {req.status !== 'pending' && (
                      <button onClick={async () => { await updateReservationStatus(req.id, 'pending'); setVehicleReqs(prev => prev.map(r => r.id === req.id ? { ...r, status: 'pending' as const } : r)) }}
                        style={editBtnStyle}>초기화</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          )}
        </div>
      )}

      {/* ── 공지사항 관리 ── */}
      {tab === 'announcements' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#8c9ab8' }}>총 {announcements.length}건</span>
            <button onClick={() => setAnnModal('new')} style={addBtnStyle}>+ 공지 작성</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {announcements.map(ann => (
              <div key={ann.id} style={{ ...cardStyle, padding: '18px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ backgroundColor: (tagColors[ann.tag] || '#8c9ab8') + '18', color: tagColors[ann.tag] || '#8c9ab8', fontFamily: 'DM Mono, monospace', fontSize: 9, padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>{ann.tag}</span>
                      {ann.pinned && <span style={{ backgroundColor: '#fff4f0', color: '#C8102E', fontFamily: 'DM Mono, monospace', fontSize: 9, padding: '2px 8px', borderRadius: 4 }}>📌 고정</span>}
                      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#c0ccdd' }}>{ann.date} · {ann.author}</span>
                    </div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 14, color: '#0f1f3d', marginBottom: 4 }}>{ann.title}</div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#8c9ab8', lineHeight: 1.6 }}>{ann.body}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={async () => { const updated = { ...ann, pinned: !ann.pinned }; await upsertAnnouncement({ id: updated.id, pinned: updated.pinned }); setAnnouncements(prev => prev.map(a => a.id === ann.id ? updated : a)) }}
                      style={{ ...editBtnStyle, borderColor: ann.pinned ? '#C8102E' : '#e2e8f0', color: ann.pinned ? '#C8102E' : '#8c9ab8' }}>
                      {ann.pinned ? '고정해제' : '고정'}
                    </button>
                    <button onClick={() => setAnnModal(ann)} style={editBtnStyle}>편집</button>
                    <button onClick={async () => { await deleteAnnouncement(ann.id); setAnnouncements(prev => prev.filter(a => a.id !== ann.id)) }} style={delBtnStyle}>삭제</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 일정 등록 ── */}
      {tab === 'schedules' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#8c9ab8' }}>전사 공통 일정 {schedules.length}건</span>
            <button onClick={() => setSchModal('new')} style={addBtnStyle}>+ 일정 추가</button>
          </div>
          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {schedules.map(sch => (
                <div key={sch.id} style={{ backgroundColor: '#ffffff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 13, color: '#0f1f3d' }}>{sch.title}</div>
                    <span style={{ ...badgeStyle, backgroundColor: typeColors[sch.type] + '18', color: typeColors[sch.type] }}>{typeLabels[sch.type]}</span>
                  </div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8', marginBottom: 10 }}>{sch.date} · {sch.timeStart}–{sch.timeEnd} · {sch.owner === 'all' ? '전체' : sch.owner}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setSchModal(sch)} style={editBtnStyle}>편집</button>
                    <button onClick={async () => { await deleteSchedule(sch.id); setSchedules(prev => prev.filter(s => s.id !== sch.id)) }} style={delBtnStyle}>삭제</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <div style={cardStyle}>
            <div style={{ ...tableHeaderStyle, gridTemplateColumns: '2fr 1fr 1.2fr 1.5fr 1fr 80px' }}>
              {['일정명', '유형', '날짜', '시간', '대상', ''].map(h => <div key={h} style={thStyle}>{h}</div>)}
            </div>
            {schedules.map(sch => (
              <div key={sch.id}
                style={{ ...tableRowStyle, gridTemplateColumns: '2fr 1fr 1.2fr 1.5fr 1fr 80px' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f8fafd'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent'}
              >
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: 13, color: '#1e2d4d' }}>{sch.title}</div>
                <span style={{ ...badgeStyle, backgroundColor: typeColors[sch.type] + '18', color: typeColors[sch.type] }}>{typeLabels[sch.type]}</span>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#4a6494' }}>{sch.date}</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#8c9ab8' }}>{sch.timeStart}–{sch.timeEnd}</div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8' }}>{sch.owner === 'all' ? '전체' : sch.owner}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => setSchModal(sch)} style={editBtnStyle}>편집</button>
                  <button onClick={async () => { await deleteSchedule(sch.id); setSchedules(prev => prev.filter(s => s.id !== sch.id)) }} style={delBtnStyle}>삭제</button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* ── 캘린더 동기화 ── */}
      {tab === 'calendar' && <AdminCalendarSync />}

      {/* ── 직원 모달 ── */}
      {empModal && (
        <Modal title={empModal === 'new' ? '직원 추가' : '직원 편집'} onClose={() => setEmpModal(null)}>
          <EmpForm
            initial={empModal === 'new' ? null : empModal}
            onSave={async (data) => {
              const id = empModal === 'new' ? `e${Date.now()}` : (empModal as Employee).id
              const record = { ...data, id }
              await upsertEmployee(record as Record<string, unknown>)
              if (empModal === 'new') {
                setEmployees(prev => [...prev, record as Employee])
              } else {
                setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...data } : e))
              }
              setEmpModal(null)
            }}
          />
        </Modal>
      )}

      {/* ── 공지 모달 ── */}
      {annModal && (
        <Modal title={annModal === 'new' ? '공지 작성' : '공지 편집'} onClose={() => setAnnModal(null)}>
          <AnnForm
            initial={annModal === 'new' ? null : annModal}
            onSave={async (data) => {
              const id = annModal === 'new' ? `a${Date.now()}` : (annModal as Announcement).id
              const date = annModal === 'new' ? new Date().toISOString().slice(0, 10) : (annModal as Announcement).date
              const record = { ...data, id, date }
              await upsertAnnouncement(record as Record<string, unknown>)
              if (annModal === 'new') {
                setAnnouncements(prev => [record as Announcement, ...prev])
              } else {
                setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...data } : a))
              }
              setAnnModal(null)
            }}
          />
        </Modal>
      )}

      {/* ── 일정 모달 ── */}
      {schModal && (
        <Modal title={schModal === 'new' ? '일정 추가' : '일정 편집'} onClose={() => setSchModal(null)}>
          <SchForm
            initial={schModal === 'new' ? null : schModal}
            onSave={async (data) => {
              const id = schModal === 'new' ? `s${Date.now()}` : (schModal as Schedule).id
              const record = { id, title: data.title, type: data.type, date: data.date, time_start: data.timeStart, time_end: data.timeEnd, owner: data.owner }
              await upsertSchedule(record as Record<string, unknown>)
              if (schModal === 'new') {
                setSchedules(prev => [...prev, { ...data, id }])
              } else {
                setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...data } : s))
              }
              setSchModal(null)
            }}
          />
        </Modal>
      )}
    </div>
  )
}

// ─── Modal wrapper ────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const isMobile = useIsMobile()
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,31,61,0.5)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 200 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: isMobile ? '16px 16px 0 0' : 14, width: isMobile ? '100%' : 480, maxWidth: isMobile ? '100%' : '92vw', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ backgroundColor: '#0f1f3d', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 16, color: '#e8edf5' }}>{title}</span>
          <button onClick={onClose} style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', color: '#8c9ab8', cursor: 'pointer', fontSize: 14 }}>×</button>
        </div>
        <div style={{ padding: '24px', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  )
}

// ─── 직원 폼 ─────────────────────────────────────────────
function EmpForm({ initial, onSave }: { initial: Employee | null; onSave: (d: Omit<Employee, 'id'>) => void }) {
  const [f, setF] = useState({
    name: initial?.name ?? '', email: initial?.email ?? '',
    site: initial?.site ?? '본사',
    dept: initial?.dept ?? DEPTS[0], role: initial?.role ?? '팀원',
    rank: initial?.rank ?? '사원', status: initial?.status ?? 'active' as Employee['status'],
    isAdmin: initial?.isAdmin ?? false,
  })
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(f) }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Row label="이름"><input required value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} style={inputStyle} /></Row>
      <Row label="이메일"><input required value={f.email} onChange={e => setF(p => ({ ...p, email: e.target.value }))} style={inputStyle} /></Row>
      <Row label="부서">
        <select value={f.dept} onChange={e => setF(p => ({ ...p, dept: e.target.value }))} style={inputStyle}>
          {DEPTS.map(d => <option key={d}>{d}</option>)}
        </select>
      </Row>
      <Row label="직책"><input value={f.role} onChange={e => setF(p => ({ ...p, role: e.target.value }))} style={inputStyle} /></Row>
      <Row label="직급"><input value={f.rank} onChange={e => setF(p => ({ ...p, rank: e.target.value }))} style={inputStyle} /></Row>
      <Row label="상태">
        <select value={f.status} onChange={e => setF(p => ({ ...p, status: e.target.value as Employee['status'] }))} style={inputStyle}>
          <option value="active">재직</option>
          <option value="inactive">퇴직</option>
          <option value="leave">휴직</option>
        </select>
      </Row>
      <Row label="관리자 권한">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={f.isAdmin} onChange={e => setF(p => ({ ...p, isAdmin: e.target.checked }))} />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#4a6494' }}>관리자로 설정</span>
        </label>
      </Row>
      <button type="submit" style={submitBtnStyle}>저장</button>
    </form>
  )
}

// ─── 공지 폼 ─────────────────────────────────────────────
function AnnForm({ initial, onSave }: { initial: Announcement | null; onSave: (d: Omit<Announcement, 'id' | 'date'>) => void }) {
  const [f, setF] = useState({
    tag: initial?.tag ?? '공지', title: initial?.title ?? '',
    body: initial?.body ?? '', author: initial?.author ?? '',
    pinned: initial?.pinned ?? false,
  })
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(f) }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Row label="태그">
        <select value={f.tag} onChange={e => setF(p => ({ ...p, tag: e.target.value }))} style={inputStyle}>
          {TAGS.map(t => <option key={t}>{t}</option>)}
        </select>
      </Row>
      <Row label="제목"><input required value={f.title} onChange={e => setF(p => ({ ...p, title: e.target.value }))} style={inputStyle} /></Row>
      <Row label="내용"><textarea required rows={4} value={f.body} onChange={e => setF(p => ({ ...p, body: e.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} /></Row>
      <Row label="작성자"><input required value={f.author} onChange={e => setF(p => ({ ...p, author: e.target.value }))} style={inputStyle} /></Row>
      <Row label="상단 고정">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={f.pinned} onChange={e => setF(p => ({ ...p, pinned: e.target.checked }))} />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#4a6494' }}>고정 공지로 설정</span>
        </label>
      </Row>
      <button type="submit" style={submitBtnStyle}>저장</button>
    </form>
  )
}

// ─── 일정 폼 ─────────────────────────────────────────────
function SchForm({ initial, onSave }: { initial: Schedule | null; onSave: (d: Omit<Schedule, 'id'>) => void }) {
  const [f, setF] = useState({
    title: initial?.title ?? '', type: initial?.type ?? 'company',
    date: initial?.date ?? '2026-08-16', timeStart: initial?.timeStart ?? '09:00',
    timeEnd: initial?.timeEnd ?? '18:00', owner: initial?.owner ?? 'all',
  })
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(f) }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Row label="일정명"><input required value={f.title} onChange={e => setF(p => ({ ...p, title: e.target.value }))} style={inputStyle} /></Row>
      <Row label="유형">
        <select value={f.type} onChange={e => setF(p => ({ ...p, type: e.target.value }))} style={inputStyle}>
          {TYPES.map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}
        </select>
      </Row>
      <Row label="날짜"><input type="date" required value={f.date} onChange={e => setF(p => ({ ...p, date: e.target.value }))} style={inputStyle} /></Row>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Row label="시작"><input type="time" value={f.timeStart} onChange={e => setF(p => ({ ...p, timeStart: e.target.value }))} style={inputStyle} /></Row>
        <Row label="종료"><input type="time" value={f.timeEnd} onChange={e => setF(p => ({ ...p, timeEnd: e.target.value }))} style={inputStyle} /></Row>
      </div>
      <Row label="대상">
        <select value={f.owner} onChange={e => setF(p => ({ ...p, owner: e.target.value }))} style={inputStyle}>
          <option value="all">전체 직원</option>
          {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </Row>
      <button type="submit" style={submitBtnStyle}>저장</button>
    </form>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

// ─── 공통 스타일 ─────────────────────────────────────────
const cardStyle: React.CSSProperties = { backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }
const tableHeaderStyle: React.CSSProperties = { display: 'grid', padding: '10px 20px', backgroundColor: '#f8fafd', borderBottom: '1px solid #f0f2f7' }
const tableRowStyle: React.CSSProperties = { display: 'grid', padding: '13px 20px', borderBottom: '1px solid #f0f2f7', alignItems: 'center', transition: 'background 0.1s', cursor: 'default' }
const thStyle: React.CSSProperties = { fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8', letterSpacing: '0.04em', textTransform: 'uppercase' }
const badgeStyle: React.CSSProperties = { fontFamily: 'DM Mono, monospace', fontSize: 9, fontWeight: 500, padding: '2px 8px', borderRadius: 4, display: 'inline-block', whiteSpace: 'nowrap' }
const addBtnStyle: React.CSSProperties = { backgroundColor: '#0f1f3d', color: '#ffffff', fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: 13, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }
const editBtnStyle: React.CSSProperties = { backgroundColor: 'transparent', border: '1px solid #e2e8f0', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#4a6494' }
const delBtnStyle: React.CSSProperties = { backgroundColor: 'transparent', border: '1px solid #fca5a5', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#ef4444' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#1e2d4d', backgroundColor: '#f8fafd', outline: 'none', boxSizing: 'border-box' }
const submitBtnStyle: React.CSSProperties = { backgroundColor: '#0f1f3d', color: '#ffffff', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 14, padding: '11px 0', borderRadius: 8, border: 'none', cursor: 'pointer', width: '100%', marginTop: 4 }
