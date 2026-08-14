import fs from 'fs'
import path from 'path'

// Vercel 서버리스 환경에서는 /tmp 사용, 로컬에서는 data 디렉토리 사용
const dataDir = process.env.VERCEL
  ? '/tmp/welcon-data'
  : path.join(process.cwd(), 'data')
const employeesFile = path.join(dataDir, 'employees.json')
const eventsFile = path.join(dataDir, 'events.json')

// 디렉토리 생성
function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// UUID 생성 (라이브러리 없이)
function generateId(): string {
  return crypto.randomUUID()
}

// 파일에서 데이터 읽기
function readJsonFile(filePath: string, defaultValue: any = []) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
  }
  return defaultValue
}

// 파일에 데이터 쓰기
function writeJsonFile(filePath: string, data: any) {
  try {
    ensureDataDir()
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error)
  }
}

// 데이터베이스 초기화
export function initializeDatabase() {
  ensureDataDir()

  // Employees 파일 초기화
  const employees = readJsonFile(employeesFile, [])
  if (employees.length === 0) {
    const defaultEmployees = [
      { id: generateId(), name: '박종미', email: 'jongmi@welconsystems.com', color_index: -1, password: 'admin123', role: 'admin', created_at: new Date().toISOString() },
      { id: generateId(), name: '김철수', email: 'chulsu@welconsystems.com', color_index: 0, password: '1234', role: 'user', created_at: new Date().toISOString() },
      { id: generateId(), name: '이영희', email: 'younghee@welconsystems.com', color_index: 1, password: '1234', role: 'user', created_at: new Date().toISOString() },
      { id: generateId(), name: '박민준', email: 'minjun@welconsystems.com', color_index: 2, password: '1234', role: 'user', created_at: new Date().toISOString() },
      { id: generateId(), name: '최지은', email: 'jieun@welconsystems.com', color_index: 3, password: '1234', role: 'user', created_at: new Date().toISOString() },
      { id: generateId(), name: '정준호', email: 'junho@welconsystems.com', color_index: 4, password: '1234', role: 'user', created_at: new Date().toISOString() },
      { id: generateId(), name: '강미영', email: 'miyoung@welconsystems.com', color_index: 5, password: '1234', role: 'user', created_at: new Date().toISOString() },
      { id: generateId(), name: '이광순', email: 'kwangsoon@welconsystems.com', color_index: 6, password: '1234', role: 'user', created_at: new Date().toISOString() },
      { id: generateId(), name: '현수빈', email: 'subin@welconsystems.com', color_index: 7, password: '1234', role: 'user', created_at: new Date().toISOString() },
      { id: generateId(), name: '송민정', email: 'minjeong@welconsystems.com', color_index: 8, password: '1234', role: 'user', created_at: new Date().toISOString() },
      { id: generateId(), name: '한승준', email: 'seungjun@welconsystems.com', color_index: 9, password: '1234', role: 'user', created_at: new Date().toISOString() },
      { id: generateId(), name: '조세희', email: 'sehee@welconsystems.com', color_index: 10, password: '1234', role: 'user', created_at: new Date().toISOString() },
      { id: generateId(), name: '윤나영', email: 'nayoung@welconsystems.com', color_index: 11, password: '1234', role: 'user', created_at: new Date().toISOString() },
      { id: generateId(), name: '배지현', email: 'jihyun@welconsystems.com', color_index: 12, password: '1234', role: 'user', created_at: new Date().toISOString() },
    ]
    writeJsonFile(employeesFile, defaultEmployees)
  }

  // Events 파일 초기화
  if (!fs.existsSync(eventsFile)) {
    writeJsonFile(eventsFile, [])
  }

  console.log('✅ 데이터베이스 초기화 완료')
}

// 직원 조회
export function getEmployees() {
  return readJsonFile(employeesFile, [])
}

// 직원 추가
export function addEmployee(name: string, email: string, colorIndex: number) {
  const employees = readJsonFile(employeesFile, [])
  const newEmployee = {
    id: generateId(),
    name,
    email,
    color_index: colorIndex,
    created_at: new Date().toISOString(),
  }
  employees.push(newEmployee)
  writeJsonFile(employeesFile, employees)
  return newEmployee
}

// 일정 조회
export function getEvents(startDate?: string, endDate?: string) {
  let events = readJsonFile(eventsFile, [])

  if (startDate) {
    events = events.filter((e: any) => e.start_date >= startDate)
  }

  if (endDate) {
    events = events.filter((e: any) => e.end_date <= endDate)
  }

  return events.sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
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
  const events = readJsonFile(eventsFile, [])
  const now = new Date().toISOString()
  const newEvent = {
    id: generateId(),
    title,
    description: description || '',
    start_date: startDate,
    end_date: endDate,
    employee_id: employeeId,
    all_day: allDay,
    created_at: now,
    updated_at: now,
  }
  events.push(newEvent)
  writeJsonFile(eventsFile, events)
  return newEvent
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
  const events = readJsonFile(eventsFile, [])
  const index = events.findIndex((e: any) => e.id === id)

  if (index !== -1) {
    const now = new Date().toISOString()
    events[index] = {
      ...events[index],
      title,
      description: description || '',
      start_date: startDate,
      end_date: endDate,
      employee_id: employeeId,
      all_day: allDay,
      updated_at: now,
    }
    writeJsonFile(eventsFile, events)
    return events[index]
  }

  return null
}

// 일정 삭제
export function deleteEvent(id: string) {
  const events = readJsonFile(eventsFile, [])
  const filtered = events.filter((e: any) => e.id !== id)
  writeJsonFile(eventsFile, filtered)
}
