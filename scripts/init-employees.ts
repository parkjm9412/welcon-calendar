import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ayviqkbjmmydnvszwwcs.supabase.co'
const supabaseKey = 'sb_publishable_Fv4d8Lm6qXF-c1TMHH-Wew_gIJ1Ilau'

const supabase = createClient(supabaseUrl, supabaseKey)

const employees = [
  { name: '박상덕', email: 'sdpark@welconsystems.com', password: '1234', color_index: 0, role: 'user' },
  { name: '박기덕', email: 'ican6070@welconsystems.com', password: '1234', color_index: 1, role: 'user' },
  { name: '신은철', email: 'ecshin@welconsystems.com', password: '1234', color_index: 2, role: 'user' },
  { name: '윤은정', email: 'yej@welconsystems.com', password: '1234', color_index: 3, role: 'user' },
  { name: '강충구', email: 'kcg@welconsystems.com', password: '1234', color_index: 4, role: 'user' },
  { name: '옥순권', email: 'sko@welconsystems.com', password: '1234', color_index: 5, role: 'user' },
  { name: '박종미', email: 'pjm@welconsystems.com', password: 'admin123', color_index: -1, role: 'admin' },
  { name: '신동관', email: 'shingun@welconsystems.com', password: '1234', color_index: 6, role: 'user' },
  { name: '김소연', email: 'ksy@welconsystems.com', password: '1234', color_index: 7, role: 'user' },
  { name: '강선호', email: 'ksh@welconsystems.com', password: '1234', color_index: 8, role: 'user' },
  { name: '박태수', email: 'pts5007@welconsystems.com', password: '1234', color_index: 9, role: 'user' },
  { name: '박석현', email: 'psh@welconsystems.com', password: '1234', color_index: 10, role: 'user' },
  { name: '김요한', email: 'kyh@welconsystems.com', password: '1234', color_index: 11, role: 'user' },
]

async function initializeEmployees() {
  try {
    // 1. 기존 직원 데이터 삭제
    console.log('🗑️  기존 데이터 삭제 중...')
    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .neq('role', 'admin') // admin 제외

    if (deleteError) {
      console.error('삭제 오류:', deleteError)
    } else {
      console.log('✅ 기존 직원 데이터 삭제 완료')
    }

    // 2. 모든 데이터 삭제 후 다시 추가 (더 확실함)
    console.log('🗑️  모든 데이터 삭제 중...')
    await supabase.from('employees').delete().gte('id', '0')

    // 3. 새로운 직원 추가
    console.log('➕ 새로운 직원 추가 중...')
    const { error: insertError, data } = await supabase
      .from('employees')
      .insert(
        employees.map((emp, idx) => ({
          id: `emp-${idx.toString().padStart(3, '0')}`,
          name: emp.name,
          email: emp.email,
          password: emp.password,
          color_index: emp.color_index,
          role: emp.role,
        }))
      )
      .select()

    if (insertError) {
      console.error('❌ 추가 오류:', insertError)
    } else {
      console.log(`✅ ${data?.length || 0}명의 직원 추가 완료!`)
      console.log('추가된 직원:')
      data?.forEach((emp: any) => {
        console.log(`  - ${emp.name} (${emp.email})`)
      })
    }
  } catch (error) {
    console.error('오류 발생:', error)
  }
}

initializeEmployees()
