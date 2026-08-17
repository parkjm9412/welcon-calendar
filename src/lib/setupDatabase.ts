import { supabase } from './supabase'

export async function setupDatabase() {
  try {
    console.log('📊 Supabase 데이터베이스 초기화 중...')

    // 테이블 생성 SQL
    const createTablesSql = `
      -- 직원 테이블
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        site TEXT DEFAULT '본사',
        dept TEXT NOT NULL,
        role TEXT DEFAULT '팀원',
        rank TEXT DEFAULT '사원',
        status TEXT DEFAULT 'active',
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- 캘린더 동기화 로그
      CREATE TABLE IF NOT EXISTS calendar_sync_logs (
        id TEXT PRIMARY KEY,
        started_at TIMESTAMP NOT NULL,
        completed_at TIMESTAMP,
        total_events INTEGER DEFAULT 0,
        status TEXT DEFAULT 'running',
        results JSONB DEFAULT '[]'::jsonb
      );

      -- 캘린더 이벤트
      CREATE TABLE IF NOT EXISTS calendar_events (
        id TEXT PRIMARY KEY,
        employee_email TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        location TEXT,
        event_id TEXT,
        calendar_id TEXT,
        synced_at TIMESTAMP DEFAULT NOW()
      );

      -- 차량 예약
      CREATE TABLE IF NOT EXISTS vehicle_reservations (
        id TEXT PRIMARY KEY,
        vehicle_name TEXT NOT NULL,
        plate TEXT NOT NULL,
        requester TEXT NOT NULL,
        dept TEXT NOT NULL,
        date TEXT NOT NULL,
        time_start TEXT NOT NULL,
        time_end TEXT NOT NULL,
        purpose TEXT NOT NULL,
        status TEXT DEFAULT 'pending'
      );

      -- 공지사항
      CREATE TABLE IF NOT EXISTS announcements (
        id TEXT PRIMARY KEY,
        tag TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        date TEXT NOT NULL,
        author TEXT NOT NULL,
        pinned BOOLEAN DEFAULT FALSE
      );

      -- 일정
      CREATE TABLE IF NOT EXISTS schedules (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        time_start TEXT NOT NULL,
        time_end TEXT NOT NULL,
        owner TEXT DEFAULT 'all'
      );
    `

    // Supabase Admin API를 사용해서 테이블 생성
    const { error } = await supabase.rpc('create_tables', {
      sql: createTablesSql
    }).catch(() => {
      // RPC가 없으면, SQL을 직접 실행 시도
      return supabase.from('_tables').select('count').limit(1)
    })

    if (error) {
      console.warn('⚠️ 테이블 생성 중 경고:', error.message)
      // 에러가 있어도 계속 진행 (테이블이 이미 있을 수 있음)
    }

    // 기본 직원 데이터 확인 및 생성
    const { data: employees } = await supabase
      .from('employees')
      .select('id')
      .limit(1)

    if (!employees || employees.length === 0) {
      console.log('👥 기본 직원 데이터 생성 중...')

      const defaultEmployees = [
        { id: 'e1', name: '박종미', email: 'pjm@welconsystems.com', dept: '전략기획팀', role: '팀장', rank: '과장', status: 'active', is_admin: true, site: '본사' },
        { id: 'e2', name: '이수현', email: 'sh@welconsystems.com', dept: '전략기획팀', role: '팀원', rank: '사원', status: 'active', is_admin: false, site: '본사' },
        { id: 'e3', name: '박준혁', email: 'jh@welconsystems.com', dept: '마케팅팀', role: '팀원', rank: '사원', status: 'active', is_admin: false, site: '본사' },
        { id: 'e4', name: '최유나', email: 'yn@welconsystems.com', dept: '디자인팀', role: '팀원', rank: '사원', status: 'active', is_admin: false, site: '본사' },
        { id: 'e5', name: '정민준', email: 'mj@welconsystems.com', dept: '개발팀', role: '팀원', rank: '사원', status: 'active', is_admin: false, site: '본사' },
      ]

      const { error: insertError } = await supabase
        .from('employees')
        .insert(defaultEmployees)

      if (insertError) {
        console.error('❌ 직원 데이터 생성 실패:', insertError)
      } else {
        console.log('✅ 기본 직원 데이터 생성 완료')
      }
    }

    console.log('✅ Supabase 데이터베이스 초기화 완료')
    return true
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error)
    return false
  }
}
