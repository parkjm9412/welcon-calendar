import { getEmployees } from '@/lib/db'

export async function POST(request: Request) {
  try {
    let { name, password } = await request.json()

    if (!name || !password) {
      return Response.json(
        { message: '이름과 비밀번호를 입력해주세요' },
        { status: 400 }
      )
    }

    // emoji 제거
    name = name.replace(/[^a-zA-Z0-9가-힣\s]/g, '').trim()

    const employees = getEmployees()
    const employee = employees.find((e) => e.name === name)

    if (!employee) {
      return Response.json(
        { message: '직원을 찾을 수 없습니다' },
        { status: 401 }
      )
    }

    // 비밀번호 확인 (간단한 방식)
    if (employee.password !== password) {
      return Response.json(
        { message: '비밀번호가 잘못되었습니다' },
        { status: 401 }
      )
    }

    return Response.json({
      message: '로그인 성공',
      employee: {
        id: employee.id,
        name: employee.name,
        color: employee.color_index,
        role: employee.role || 'user'
      },
    })
  } catch (error) {
    return Response.json({ message: '오류 발생' }, { status: 500 })
  }
}
