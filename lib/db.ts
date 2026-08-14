import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

const dbPath = path.join(process.cwd(), 'data', 'calendar.db')

// 디렉토리 생성
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true })
}

export const db = new Database(dbPath)

// 테이블 생성
export function initializeDatabase() {
  // Employees 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      color_index INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `)

  // Events 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      all_day INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(employee_id) REFERENCES employees(id)
    )
  `)

  // 샘플 직원 데이터 추가 (처음 한 번만)
  const employeeCount = db
    .prepare('SELECT COUNT(*) as count FROM employees')
    .get() as { count: number }

  if (employeeCount.count === 0) {
    const employees = [
      { name: '박상덕', email: 'sdpark@welconsystems.com', color: 0 },
      { name: '박기덕', email: 'ican6070@welconsystems.com', color: 1 },
      { name: '신은철', email: 'ecshin@welconsystems.com', color: 2 },
      { name: '윤은정', email: 'yej@welconsystems.com', color: 3 },
      { name: '강충구', email: 'kcg@welconsystems.com', color: 4 },
      { name: '옥순권', email: 'sko@welconsystems.com', color: 5 },
      { name: '신동관', email: 'shingun@welconsystems.com', color: 6 },
      { name: '김소연', email: 'ksy@welconsystems.com', color: 7 },
      { name: '강선호', email: 'ksh@welconsystems.com', color: 8 },
      { name: '박태수', email: 'pts5007@welconsystems.com', color: 9 },
      { name: '박석현', email: 'psh@welconsystems.com', color: 10 },
      { name: '김요한', email: 'kyh@welconsystems.com', color: 11 },
    ]

    const insert = db.prepare(
      'INSERT INTO employees (id, name, email, color_index, created_at) VALUES (?, ?, ?, ?, ?)'
    )

    employees.forEach((emp) => {
      insert.run(uuidv4(), emp.name, emp.email, emp.color, new Date().toISOString())
    })
  }

  console.log('✅ 데이터베이스 초기화 완료')
}

// 직원 조회
export function getEmployees() {
  return db
    .prepare('SELECT * FROM employees ORDER BY created_at ASC')
    .all()
}

// 직원 추가
export function addEmployee(name: string, email: string, colorIndex: number) {
  const id = uuidv4()
  db.prepare(
    'INSERT INTO employees (id, name, email, color_index, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(id, name, email, colorIndex, new Date().toISOString())
  return { id, name, email, color_index: colorIndex, created_at: new Date().toISOString() }
}

// 일정 조회
export function getEvents(startDate?: string, endDate?: string) {
  let query = 'SELECT * FROM events WHERE 1=1'
  const params: string[] = []

  if (startDate) {
    query += ' AND start_date >= ?'
    params.push(startDate)
  }

  if (endDate) {
    query += ' AND end_date <= ?'
    params.push(endDate)
  }

  query += ' ORDER BY start_date ASC'

  return db.prepare(query).all(...params)
}

// 일정 추가
export function addEvent(
  title: string,
  description: string | undefined,
  startDate: string,
  endDate: string,
  employeeId: string,
  allDay: boolean
) {
  const id = uuidv4()
  const now = new Date().toISOString()
  db.prepare(
    'INSERT INTO events (id, title, description, start_date, end_date, employee_id, all_day, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, title, description || '', startDate, endDate, employeeId, allDay ? 1 : 0, now, now)

  return {
    id,
    title,
    description,
    start_date: startDate,
    end_date: endDate,
    employee_id: employeeId,
    all_day: allDay,
    created_at: now,
    updated_at: now,
  }
}

// 일정 수정
export function updateEvent(
  id: string,
  title: string,
  description: string | undefined,
  startDate: string,
  endDate: string,
  employeeId: string,
  allDay: boolean
) {
  const now = new Date().toISOString()
  db.prepare(
    'UPDATE events SET title = ?, description = ?, start_date = ?, end_date = ?, employee_id = ?, all_day = ?, updated_at = ? WHERE id = ?'
  ).run(title, description || '', startDate, endDate, employeeId, allDay ? 1 : 0, now, id)

  return {
    id,
    title,
    description,
    start_date: startDate,
    end_date: endDate,
    employee_id: employeeId,
    all_day: allDay,
    created_at: new Date().toISOString(),
    updated_at: now,
  }
}

// 일정 삭제
export function deleteEvent(id: string) {
  db.prepare('DELETE FROM events WHERE id = ?').run(id)
}
