import { getEmployees, addEmployee, writeJsonFile } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !password) {
      return Response.json(
        { message: '이름과 비밀번호는 필수입니다' },
        { status: 400 }
      )
    }

    const employees = getEmployees()
    const colorIndex = employees.length % 13

    // addEmployee 함수를 확장해서 password 포함
    const newEmployee = {
      id: require('crypto').randomUUID(),
      name,
      email: email || '',
      password,
      color_index: colorIndex,
      created_at: new Date().toISOString(),
    }

    employees.push(newEmployee)

    const dataDir = path.join(process.cwd(), 'data')
    const employeesFile = path.join(dataDir, 'employees.json')
    fs.writeFileSync(employeesFile, JSON.stringify(employees, null, 2), 'utf-8')

    return Response.json({
      message: '직원이 추가되었습니다',
      employee: newEmployee,
    })
  } catch (error) {
    return Response.json({ message: '오류 발생' }, { status: 500 })
  }
}
