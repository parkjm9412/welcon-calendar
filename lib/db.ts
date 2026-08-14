import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// 직원 조회
export async function getEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('직원 조회 오류:', error)
    console.error('Error details:', JSON.stringify(error))
  }
  console.log('Got employees:', data)
  return data || []
}

// 직원 추가
export async function addEmployee(name: string, email: string, colorIndex: number) {
  const { data, error } = await supabase
    .from('employees')
    .insert([{ name, email, color_index: colorIndex }])
    .select()
    .single()

  if (error) {
    console.error('직원 추가 오류:', error)
    console.error('Error details:', JSON.stringify(error))
    return null
  }
  console.log('Added employee:', data)
  return data
}

// 직원 삭제
export async function deleteEmployee(id: string) {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('직원 삭제 오류:', error)
    return false
  }
  return true
}

// 직원 비밀번호 업데이트
export async function updateEmployeePassword(id: string, password: string) {
  const { error } = await supabase
    .from('employees')
    .update({ password })
    .eq('id', id)

  if (error) {
    console.error('비밀번호 업데이트 오류:', error)
    return false
  }
  return true
}

// 일정 조회
export async function getEvents(startDate?: string, endDate?: string) {
  let query = supabase.from('events').select('*')

  if (startDate) {
    query = query.gte('start_date', startDate)
  }

  if (endDate) {
    query = query.lte('end_date', endDate)
  }

  const { data, error } = await query.order('start_date', { ascending: true })

  if (error) {
    console.error('일정 조회 오류:', error)
    return []
  }
  return data || []
}

// 일정 추가
export async function addEvent(
  title: string,
  description: string | undefined,
  startDate: string,
  endDate: string,
  employeeId: string,
  allDay: boolean
) {
  const { data, error } = await supabase
    .from('events')
    .insert([
      {
        title,
        description: description || '',
        start_date: startDate,
        end_date: endDate,
        employee_id: employeeId,
        all_day: allDay,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('일정 추가 오류:', error)
    return null
  }
  return data
}

// 일정 수정
export async function updateEvent(
  id: string,
  title: string,
  description: string | undefined,
  startDate: string,
  endDate: string,
  employeeId: string,
  allDay: boolean
) {
  const { data, error } = await supabase
    .from('events')
    .update({
      title,
      description: description || '',
      start_date: startDate,
      end_date: endDate,
      employee_id: employeeId,
      all_day: allDay,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('일정 수정 오류:', error)
    return null
  }
  return data
}

// 일정 삭제
export async function deleteEvent(id: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('일정 삭제 오류:', error)
    return false
  }
  return true
}
