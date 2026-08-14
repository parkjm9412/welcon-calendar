import { getEmployees } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { password } = await request.json()
    const employees = getEmployees()
    const employee = employees.find((e) => e.id === params.id)

    if (!employee) {
      return Response.json({ message: '직원을 찾을 수 없습니다' }, { status: 404 })
    }

    employee.password = password
    const dataDir = path.join(process.cwd(), 'data')
    const employeesFile = path.join(dataDir, 'employees.json')
    fs.writeFileSync(employeesFile, JSON.stringify(employees, null, 2), 'utf-8')

    return Response.json({ message: '비밀번호가 변경되었습니다' })
  } catch (error) {
    return Response.json({ message: '오류 발생' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const employees = getEmployees()
    const filtered = employees.filter((e) => e.id !== params.id)

    if (filtered.length === employees.length) {
      return Response.json({ message: '직원을 찾을 수 없습니다' }, { status: 404 })
    }

    const dataDir = path.join(process.cwd(), 'data')
    const employeesFile = path.join(dataDir, 'employees.json')
    fs.writeFileSync(employeesFile, JSON.stringify(filtered, null, 2), 'utf-8')

    return Response.json({ message: '직원이 삭제되었습니다' })
  } catch (error) {
    return Response.json({ message: '오류 발생' }, { status: 500 })
  }
}
