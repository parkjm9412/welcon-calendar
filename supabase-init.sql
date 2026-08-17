-- 📅 구글 캘린더 동기화 - Supabase 초기 설정
-- Supabase 대시보드 → SQL Editor에서 이 전체를 복사해서 실행하세요

-- 1️⃣ 동기화 로그 테이블 생성
CREATE TABLE IF NOT EXISTS calendar_sync_logs (
  id TEXT PRIMARY KEY,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  total_events INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running',
  results JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2️⃣ schedules 테이블에 컬럼 추가
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS sync_log_id TEXT;

-- 3️⃣ 성능 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_schedules_source_owner ON schedules(source, owner);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON calendar_sync_logs(status);

-- ✅ 완료! 이제 GitHub Secrets을 설정하면 됩니다
