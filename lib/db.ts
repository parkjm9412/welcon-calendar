import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// 직원 조회
export async function getEmployees() {
  const { data, error } = await supabase.from('employees').select('*')
  if (error) {
    console.error('Error fetching employees:', error)
    return []
  }
  return data || []
}

// 직원 추가
export async function addEmployee(name: string, email: string, password: string) {
  const id = crypto.randomUUID()
  const { data, error } = await supabase
    .from('employees')
    .insert([{ id, name, email, password, role: 'user', color_index: Math.floor(Math.random() * 13) }])
    .select()

  if (error) {
    console.error('Error adding employee:', error)
    return null
  }
  return data?.[0] || null
}

// 일정 조회
export async function getEvents() {
  const { data, error } = await supabase.from('events').select('*')
  if (error) {
    console.error('Error fetching events:', error)
    return []
  }
  return data || []
}

// 일정 추가
export async function addEvent(
  title: string,
  description: string,
  startDate: string,
  endDate: string,
  employeeId: string,
  allDay: boolean
) {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('events')
    .insert([{ id, title, description, start_date: startDate, end_date: endDate, employee_id: employeeId, all_day: allDay, created_at: now, updated_at: now }])
    .select()

  if (error) {
    console.error('Error adding event:', error)
    return null
  }
  return data?.[0] || null
}

// 일정 수정
export async function updateEvent(
  id: string,
  title: string,
  description: string,
  startDate: string,
  endDate: string,
  employeeId: string,
  allDay: boolean
) {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('events')
    .update({ title, description, start_date: startDate, end_date: endDate, employee_id: employeeId, all_day: allDay, updated_at: now })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating event:', error)
    return null
  }
  return data?.[0] || null
}

// 일정 삭제
export async function deleteEvent(id: string) {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) {
    console.error('Error deleting event:', error)
  }
}

// 초기 데이터 추가 (한 번만 실행)
export async function initializeDatabase() {
  const { data, error } = await supabase.from('employees').select('count')

  if (!error && (!data || data.length === 0)) {
    const employees = [
      { id: 'admin-001', name: '박종미', email: 'jongmi@welconsystems.com', color_index: -1, password: 'admin123', role: 'admin' },
      { id: '1', name: '김철수', email: 'chulsu@welconsystems.com', color_index: 0, password: '1234', role: 'user' },
      { id: '2', name: '이영희', email: 'younghee@welconsystems.com', color_index: 1, password: '1234', role: 'user' },
      { id: '3', name: '박민준', email: 'minjun@welconsystems.com', color_index: 2, password: '1234', role: 'user' },
      { id: '4', name: '최지은', email: 'jieun@welconsystems.com', color_index: 3, password: '1234', role: 'user' },
      { id: '5', name: '정준호', email: 'junho@welconsystems.com', color_index: 4, password: '1234', role: 'user' },
      { id: '6', name: '강미영', email: 'miyoung@welconsystems.com', color_index: 5, password: '1234', role: 'user' },
      { id: '7', name: '이광순', email: 'kwangsoon@welconsystems.com', color_index: 6, password: '1234', role: 'user' },
      { id: '8', name: '현수빈', email: 'subin@welconsystems.com', color_index: 7, password: '1234', role: 'user' },
      { id: '9', name: '송민정', email: 'minjeong@welconsystems.com', color_index: 8, password: '1234', role: 'user' },
      { id: '10', name: '한승준', email: 'seungjun@welconsystems.com', color_index: 9, password: '1234', role: 'user' },
      { id: '11', name: '조세희', email: 'sehee@welconsystems.com', color_index: 10, password: '1234', role: 'user' },
      { id: '12', name: '윤나영', email: 'nayoung@welconsystems.com', color_index: 11, password: '1234', role: 'user' },
      { id: '13', name: '배지현', email: 'jihyun@welconsystems.com', color_index: 12, password: '1234', role: 'user' },
    ]

    await supabase.from('employees').insert(employees)
  }
}
