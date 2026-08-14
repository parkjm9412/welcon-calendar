import { getEmployees, initializeDatabase } from '@/lib/db'

export async function POST(request: Request) {
  try {
    // 데이터베이스 초기화 (반드시 먼저)
    initializeDatabase()

    let { name, password } = await request.json()

    console.log('로그인 요청:', { name, password })

    if (!name || !password) {
      console.log('이름 또는 비밀번호 없음')
      return Response.json(
        { message: '이름과 비밀번호를 입력해주세요' },
        { status: 400 }
      )
    }

    // 한글 이름만 추출 (로그인 페이지와 동일한 로직)
    const cleanName = name
      .replace(/\([^)]*\)/g, '') // (관리자) 같은 괄호 제거
      .replace(/[^가-힣]/g, '') // 한글만 남김
      .trim()
    console.log('정리된 이름:', { original: name, cleaned: cleanName })

    const employees: any[] = getEmployees()
    console.log('직원 목록 개수:', employees.length)
    console.log('직원 목록:', employees.map((e: any) => ({ id: e.id, name: e.name })))

    const employee = employees.find((e: any) => e.name === cleanName)
    console.log('찾은 직원:', employee)

    if (!employee) {
      console.log('직원 찾음 실패:', cleanName)
      return Response.json(
        { message: '직원을 찾을 수 없습니다' },
        { status: 401 }
      )
    }

    // 비밀번호 확인
    if (employee.password !== password) {
      console.log('비밀번호 불일치:', { expected: employee.password, provided: password })
      return Response.json(
        { message: '비밀번호가 잘못되었습니다' },
        { status: 401 }
      )
    }

    console.log('로그인 성공:', employee.name)

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
    console.error('로그인 에러:', error)
    return Response.json({ message: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
