import { supabase } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { password } = await request.json()

    const { data: employee, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !employee) {
      return Response.json({ message: '직원을 찾을 수 없습니다' }, { status: 404 })
    }

    const { error: updateError } = await supabase
      .from('employees')
      .update({ password })
      .eq('id', id)

    if (updateError) {
      return Response.json({ message: '오류 발생' }, { status: 500 })
    }

    return Response.json({ message: '비밀번호가 변경되었습니다' })
  } catch (error) {
    console.error('PUT 에러:', error)
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

    const { data: employee, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !employee) {
      console.log('직원을 찾을 수 없음')
      return Response.json({ message: '직원을 찾을 수 없습니다' }, { status: 404 })
    }

    // 관리자는 삭제 불가
    if (employee.role === 'admin') {
      console.log('관리자는 삭제할 수 없습니다')
      return Response.json({ message: '관리자는 삭제할 수 없습니다' }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('DELETE 에러:', deleteError)
      return Response.json({ message: '오류 발생' }, { status: 500 })
    }

    console.log('삭제 완료:', id)
    return Response.json({ message: '직원이 삭제되었습니다' }, { status: 200 })
  } catch (error) {
    console.error('DELETE 에러:', error)
    return Response.json({ message: '오류 발생' }, { status: 500 })
  }
}
