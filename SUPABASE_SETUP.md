# Supabase 데이터베이스 설정 가이드

현재 앱이 작동하려면 Supabase 데이터베이스에 테이블을 생성해야 합니다.

## 1단계: Supabase 대시보드 접속

https://app.supabase.com/project/ayviqkbjmmydnvszwwcs/sql 로 접속

## 2단계: SQL 에디터에서 다음 코드 실행

```sql
-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  color_index INTEGER DEFAULT 0,
  password TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  all_day BOOLEAN DEFAULT false,
  google_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS events_employee_id_idx ON events(employee_id);
CREATE INDEX IF NOT EXISTS events_start_date_idx ON events(start_date);
CREATE INDEX IF NOT EXISTS events_end_date_idx ON events(end_date);
CREATE INDEX IF NOT EXISTS events_date_range_idx ON events(start_date, end_date);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow all on employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on events" ON events FOR ALL USING (true) WITH CHECK (true);

-- Insert employees from Welcon Systems
INSERT INTO employees (name, email, color_index, role) VALUES
  ('박상덕', 'sdpark@welconsystems.com', 0, 'user'),
  ('박기덕', 'ican6070@welconsystems.com', 1, 'user'),
  ('신은철', 'ecshin@welconsystems.com', 2, 'user'),
  ('윤은정', 'yej@welconsystems.com', 3, 'user'),
  ('강충구', 'kcg@welconsystems.com', 4, 'user'),
  ('옥순권', 'sko@welconsystems.com', 5, 'user'),
  ('박종미', 'pjm@welconsystems.com', 6, 'admin'),
  ('신동관', 'shingun@welconsystems.com', 7, 'user'),
  ('김소연', 'ksy@welconsystems.com', 8, 'user'),
  ('강선호', 'ksh@welconsystems.com', 9, 'user'),
  ('박태수', 'pts5007@welconsystems.com', 10, 'user'),
  ('박석현', 'psh@welconsystems.com', 11, 'user'),
  ('김요한', 'kyh@welconsystems.com', 12, 'user')
ON CONFLICT DO NOTHING;
```

## 3단계: 완료

SQL 실행 후 https://welcon-calendar.vercel.app 에서 앱을 새로고침하면 직원들이 표시됩니다.
