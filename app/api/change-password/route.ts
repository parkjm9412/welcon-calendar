import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

export async function PUT(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await request.json()

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { message: '필수 정보를 입력해주세요' },
        { status: 400 }
      )
    }

    // 1. 현재 비밀번호 확인
    const { data: employee, error: fetchError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !employee) {
      return NextResponse.json(
        { message: '직원을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 2. 현재 비밀번호 검증
    if (employee.password !== currentPassword) {
      return NextResponse.json(
        { message: '현재 비밀번호가 일치하지 않습니다' },
        { status: 401 }
      )
    }

    // 3. 새 비밀번호로 업데이트
    const { error: updateError } = await supabase
      .from('employees')
      .update({ password: newPassword })
      .eq('id', userId)

    if (updateError) {
      return NextResponse.json(
        { message: '비밀번호 변경에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: '비밀번호가 변경되었습니다' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
