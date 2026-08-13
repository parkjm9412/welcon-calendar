export interface Employee {
  id: string
  name: string
  email: string
  color_index: number
  created_at: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_date: string
  end_date: string
  employee_id: string
  all_day: boolean
  google_event_id?: string
  created_at: string
  updated_at: string
}

export interface EmployeeWithColor extends Employee {
  color: string
}

export interface DayEvents {
  [key: string]: CalendarEvent[]
}

export interface User {
  id: string
  email: string
  name: string
  is_admin: boolean
}
