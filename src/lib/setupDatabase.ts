import { supabase } from './supabase'

export async function setupDatabase() {
  try {
    console.log('📊 기본 데이터 초기화 중...')

    // 기본 직원 데이터 확인
    const { data: employees, error: checkError } = await supabase
      .from('employees')
      .select('id')
      .limit(1)

    if (checkError) {
      console.warn('⚠️ 직원 테이블 확인 실패:', checkError.message)
      return false
    }

    // 직원 데이터가 없으면 생성
    if (!employees || employees.length === 0) {
      console.log('👥 기본 직원 데이터 생성 중...')

      const defaultEmployees = [
        { id: 'e1', name: '박종미', email: 'pjm@welconsystems.com', dept: '전략기획팀', role: '팀장', rank: '과장', status: 'active', is_admin: true, site: '본사' },
        { id: 'e2', name: '이수현', email: 'sh@welconsystems.com', dept: '전략기획팀', role: '팀원', rank: '사원', status: 'active', is_admin: false, site: '본사' },
        { id: 'e3', name: '박준혁', email: 'jh@welconsystems.com', dept: '마케팅팀', role: '팀원', rank: '사원', status: 'active', is_admin: false, site: '본사' },
        { id: 'e4', name: '최유나', email: 'yn@welconsystems.com', dept: '디자인팀', role: '팀원', rank: '사원', status: 'active', is_admin: false, site: '본사' },
        { id: 'e5', name: '정민준', email: 'mj@welconsystems.com', dept: '개발팀', role: '팀원', rank: '사원', status: 'active', is_admin: false, site: '본사' },
        { id: 'e6', name: '김현준', email: 'hj@welconsystems.com', dept: '개발팀', role: '팀원', rank: '사원', status: 'active', is_admin: false, site: '본사' },
        { id: 'e7', name: '이미진', email: 'mj2@welconsystems.com', dept: '마케팅팀', role: '팀원', rank: '대리', status: 'active', is_admin: false, site: '본사' },
      ]

      const { error: insertError } = await supabase
        .from('employees')
        .insert(defaultEmployees)

      if (insertError) {
        console.warn('⚠️ 직원 데이터 생성 경고:', insertError.message)
      } else {
        console.log('✅ 기본 직원 데이터 생성 완료')
      }
    } else {
      console.log('✅ 기본 직원 데이터 이미 존재')
    }

    console.log('✅ 데이터베이스 초기화 완료')
    return true
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error)
    return false
  }
}
