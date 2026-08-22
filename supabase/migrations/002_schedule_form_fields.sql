-- 웹 양식 일정 등록용 추가 컬럼
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS memo TEXT;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS google_event_id TEXT;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS all_day BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_schedules_source_date ON schedules(source, date);
