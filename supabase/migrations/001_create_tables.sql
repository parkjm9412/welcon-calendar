-- 직원 테이블
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  site TEXT DEFAULT '본사',
  dept TEXT NOT NULL,
  role TEXT DEFAULT '팀원',
  rank TEXT DEFAULT '사원',
  status TEXT DEFAULT 'active', -- active, inactive, leave
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
  status TEXT DEFAULT 'running', -- running, completed, failed
  results JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
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
  synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
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
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 공지사항
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  tag TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  date TEXT NOT NULL,
  author TEXT NOT NULL,
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 일정
CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- company, important, meeting, personal
  date TEXT NOT NULL,
  time_start TEXT NOT NULL,
  time_end TEXT NOT NULL,
  owner TEXT DEFAULT 'all',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_employee ON calendar_events(employee_email);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON calendar_sync_logs(started_at DESC);
