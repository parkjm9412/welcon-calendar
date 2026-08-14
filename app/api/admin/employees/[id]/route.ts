import { clearEmployeesCache } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { password } = await request.json()
    const employees: any[] = getEmployees()
    const employee = employees.find((e: any) => e.id === id)

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
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('DELETE 요청:', id)

    const employees: any[] = getEmployees()
    console.log('현재 직원 수:', employees.length)

    const filtered = employees.filter((e: any) => e.id !== id)
    console.log('필터링 후 직원 수:', filtered.length)

    if (filtered.length === employees.length) {
      console.log('직원을 찾을 수 없음')
      return Response.json({ message: '직원을 찾을 수 없습니다' }, { status: 404 })
    }

    const dataDir = path.join(process.cwd(), 'data')
    const employeesFile = path.join(dataDir, 'employees.json')
    fs.writeFileSync(employeesFile, JSON.stringify(filtered, null, 2), 'utf-8')
    clearEmployeesCache() // 캐시 초기화
    console.log('삭제 완료:', id)

    return Response.json({ message: '직원이 삭제되었습니다' })
  } catch (error) {
    console.error('DELETE 에러:', error)
    return Response.json({ message: '오류 발생' }, { status: 500 })
  }
}
