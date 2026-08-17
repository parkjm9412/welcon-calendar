import { supabase } from './supabase'

// ─── 직원 ─────────────────────────────────────────────────
export async function getEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('id, name, email, site, dept, role, rank, status, is_admin')
    .order('id')
  if (error) throw error
  // DB 컬럼 → 앱 필드 매핑
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    name: r.name as string,
    email: r.email as string,
    site: (r.site as string) ?? '',
    dept: (r.dept as string) ?? '',
    role: (r.role as string) ?? '',
    rank: (r.rank as string) ?? '',
    status: ((r.status as string) ?? 'active') as 'active' | 'inactive' | 'leave',
    isAdmin: (r.is_admin as boolean) ?? false,
  }))
}

export async function upsertEmployee(emp: Record<string, unknown>) {
  // 앱 필드 → DB 컬럼 매핑
  const row = {
    id: emp.id,
    name: emp.name,
    email: emp.email,
    site: emp.site,
    dept: emp.dept,
    role: emp.role,
    rank: emp.rank,
    status: emp.status,
    is_admin: emp.isAdmin,
  }
  const { error } = await supabase.from('employees').upsert(row)
  if (error) throw error
}

export async function deleteEmployee(id: string) {
  const { error } = await supabase.from('employees').delete().eq('id', id)
  if (error) throw error
}

// ─── 차량 예약 ────────────────────────────────────────────
export async function getVehicleReservations() {
  const { data, error } = await supabase
    .from('vehicle_reservations')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function insertReservation(res: Record<string, unknown>) {
  const { data, error } = await supabase.from('vehicle_reservations').insert(res).select().single()
  if (error) throw error
  return data
}

export async function updateReservationStatus(id: string, status: string) {
  const { error } = await supabase.from('vehicle_reservations').update({ status }).eq('id', id)
  if (error) throw error
}

// ─── 공지사항 ─────────────────────────────────────────────
export async function getAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function upsertAnnouncement(ann: Record<string, unknown>) {
  const { error } = await supabase.from('announcements').upsert(ann)
  if (error) throw error
}

export async function deleteAnnouncement(id: string) {
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) throw error
}

// ─── 일정 ─────────────────────────────────────────────────
export async function getSchedules() {
  const { data, error } = await supabase.from('schedules').select('*').order('date')
  if (error) throw error
  return data ?? []
}

export async function upsertSchedule(sch: Record<string, unknown>) {
  const { error } = await supabase.from('schedules').upsert(sch)
  if (error) throw error
}

export async function deleteSchedule(id: string) {
  const { error } = await supabase.from('schedules').delete().eq('id', id)
  if (error) throw error
}

// ─── 캘린더 동기화 로그 ────────────────────────────────────
export async function getSyncLogs(limit = 10) {
  const { data, error } = await supabase
    .from('calendar_sync_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function getLatestSyncLog() {
  const { data, error } = await supabase
    .from('calendar_sync_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Sync log 조회 실패:', error)
    return null
  }
  return data ?? null
}
