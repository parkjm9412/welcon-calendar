# 📅 구글 캘린더 자동 동기화 설정 가이드

## ✅ 완료된 작업
- ✅ Google Workspace Service Account 생성
- ✅ Domain-wide delegation 권한 설정
- ✅ Supabase Edge Function 작성
- ✅ Admin UI 구현

---

## 🚀 설정 단계

### 1️⃣ Supabase Secrets 설정

**Supabase 대시보드에서:**

1. `Settings` → `Secrets` 메뉴로 이동
2. 새 Secret 추가:

```
GOOGLE_PRIVATE_KEY = [아래의 전체 JSON 문자열]
```

**값:** `.env.supabase` 파일의 `GOOGLE_PRIVATE_KEY` 전체 JSON (로컬에서 확인)

> ⚠️ **보안**: 실제 Private Key는 GitHub에 커밋하지 않습니다. 대신 `.env.supabase`는 `.gitignore`에 추가되어 있습니다.

3. 두 번째 Secret 추가:

```
GOOGLE_CLIENT_EMAIL = welcon-calendar-sync@welcon-505703.iam.gserviceaccount.com
```

### 2️⃣ Supabase SQL 테이블 생성

**Supabase SQL 에디터에서 다음을 실행:**

```sql
-- 동기화 로그 테이블
CREATE TABLE IF NOT EXISTS calendar_sync_logs (
  id TEXT PRIMARY KEY,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  total_events INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running',
  results JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- schedules 테이블에 컬럼 추가
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS sync_log_id TEXT;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_schedules_source_owner ON schedules(source, owner);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON calendar_sync_logs(status);
```

### 3️⃣ Edge Function 배포

**Supabase 대시보드에서:**

1. `Edge Functions` 메뉴로 이동
2. `Create a new function` 클릭
3. 함수명: `sync-calendars`
4. 코드는 자동으로 배포됩니다 (이미 `supabase/functions/sync-calendars/index.ts`에 작성됨)

**또는 CLI로 배포:**

```bash
cd welcon-Calendar/웰콘시스템즈
supabase functions deploy sync-calendars
```

---

## 🎯 사용 방법

### 관리자 패널에서:

1. **Admin 페이지** 접속
2. **📅 캘린더 동기화** 탭 선택
3. **🚀 지금 동기화** 버튼 클릭
4. 진행 상황 확인 및 로그 보기

### API 호출 (프로그래매틱):

```typescript
import { syncAllCalendars } from '@/lib/googleCalendarSync'

// 동기화 실행
const log = await syncAllCalendars()
console.log(`${log.total_events}개 이벤트 동기화됨`)
```

---

## 🔄 자동 동기화 설정 (선택사항)

Supabase 대시보드의 `Edge Functions`에서 `sync-calendars` 함수의 스케줄을 설정할 수 있습니다:

- **매일 새벽 1시 동기화**: `0 1 * * *`
- **매 시간 동기화**: `0 * * * *`
- **평일 9시에만 동기화**: `0 9 * * 1-5`

---

## ✨ 주요 기능

✅ **자동 동기화**
- 모든 직원의 구글 캘린더 자동 수집
- 중복 제거 및 기존 데이터 업데이트

✅ **관리자 UI**
- 동기화 상태 실시간 확인
- 이벤트 수 통계
- 동기화 이력 조회

✅ **보안**
- Service Account Private Key는 Supabase Secrets에만 저장
- 프론트엔드에서는 노출 안 됨

---

## 🆘 문제 해결

### "Edge Function 배포 안 됨"
- Supabase CLI 업데이트: `npm install -g supabase`
- `supabase functions deploy sync-calendars`

### "Secrets 설정 후 동기화 안 됨"
- Secrets이 Edge Function에 전달되려면 재배포 필요
- Supabase 대시보드에서 함수 재배포

### "권한 오류 (403)"
- Google Workspace에서 Domain-wide delegation 재확인
- Client ID가 올바른지 확인

---

## 📊 데이터 구조

### calendar_sync_logs 테이블

```typescript
{
  id: "sync-1723845600000",
  started_at: "2026-08-17T15:00:00Z",
  completed_at: "2026-08-17T15:02:30Z",
  total_events: 87,
  status: "completed",
  results: [
    {
      success: true,
      employeeName: "박상덕",
      employeeEmail: "sdpark@welconsystems.com",
      eventsCount: 8
    },
    // ... 더 많은 직원들
  ]
}
```

---

**✅ 설정 완료!** 🎉

관리자 패널에서 캘린더 동기화를 시작할 수 있습니다!
