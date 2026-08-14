import { supabase } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !password) {
      return Response.json(
        { message: '이름과 비밀번호는 필수입니다' },
        { status: 400 }
      )
    }

    const id = crypto.randomUUID()

    const { data, error } = await supabase
      .from('employees')
      .insert([
        {
          id,
          name,
          email: email || '',
          password,
          color_index: Math.floor(Math.random() * 13),
          role: 'user',
        },
      ])
      .select()

    if (error) {
      console.error('Error adding employee:', error)
      return Response.json({ message: '오류 발생' }, { status: 500 })
    }

    return Response.json({
      message: '직원이 추가되었습니다',
      employee: data?.[0],
    })
  } catch (error) {
    console.error('POST 에러:', error)
    return Response.json({ message: '오류 발생' }, { status: 500 })
  }
}
