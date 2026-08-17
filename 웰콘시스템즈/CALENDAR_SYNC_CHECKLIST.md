# 📅 구글 캘린더 동기화 - 최종 체크리스트

## ✅ 구현 완료 항목

### 1. 백엔드 (Supabase Edge Function)
- ✅ `supabase/functions/sync-calendars/index.ts` 생성
  - Google Calendar API 호출 로직
  - 모든 직원 캘린더 수집
  - Supabase에 일정 저장
  - 동기화 로그 기록

### 2. 프론트엔드 (React)
- ✅ `src/lib/googleCalendarSync.ts` 수정
  - Edge Function 호출 로직
  - 클라이언트 UI 지원
  
- ✅ `src/components/AdminCalendarSync.tsx` 생성
  - 동기화 상태 표시
  - 수동 동기화 버튼
  - 동기화 이력 조회
  - 통계 대시보드

- ✅ `src/components/Admin.tsx` 수정
  - 캘린더 동기화 탭 추가
  - Admin 패널에 통합

### 3. 데이터베이스
- ✅ `src/lib/database.ts` 함수 추가
  - `getSyncLogs()` - 동기화 이력 조회
  - `getLatestSyncLog()` - 최신 로그 조회

### 4. 설정 가이드
- ✅ `CALENDAR_SYNC_SETUP.md` - 완벽한 설정 가이드

---

## 🚀 다음 단계 (지금 해야 할 것)

### 1단계: Supabase 테이블 생성 ⚠️ **필수**

**Supabase SQL 에디터 실행:**

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

-- schedules 테이블 수정
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS sync_log_id TEXT;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_schedules_source_owner ON schedules(source, owner);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON calendar_sync_logs(status);
```

### 2단계: Supabase Secrets 설정 ⚠️ **필수**

**Supabase 대시보드:**
1. `Settings` → `Secrets` 클릭
2. `GOOGLE_PRIVATE_KEY` 추가 (전체 JSON)
3. `GOOGLE_CLIENT_EMAIL` 추가

👉 [CALENDAR_SYNC_SETUP.md](./CALENDAR_SYNC_SETUP.md)의 "1️⃣ Supabase Secrets 설정" 참고

### 3단계: Edge Function 배포 ⚠️ **필수**

**방법 1: 대시보드에서**
- Supabase 대시보드 → `Edge Functions`
- `Create a new function` → `sync-calendars`
- 자동 배포됨

**방법 2: CLI에서**
```bash
cd 프로젝트경로/웰콘시스템즈
supabase functions deploy sync-calendars
```

### 4단계: 테스트 ✨

**Admin 페이지에서:**
1. Admin 접속
2. `📅 캘린더 동기화` 탭 선택
3. `🚀 지금 동기화` 클릭
4. 진행 상황 모니터링

---

## 📊 동기화 흐름

```
Admin UI (클릭)
    ↓
Edge Function RPC 호출
    ↓
Google Calendar API (각 직원)
    ↓
Supabase schedules 테이블 저장
    ↓
동기화 로그 기록
    ↓
Admin UI 업데이트
```

---

## 🎯 동기화된 데이터

각 직원의 구글 캘린더 이벤트가 `schedules` 테이블에 저장됩니다:

```
id: "google-event-id"
title: "회의"
type: "personal"
date: "2026-08-17"
time_start: "14:00"
time_end: "15:00"
owner: "박상덕"
source: "google"  ← 구글에서 가져온 것
sync_log_id: "sync-1723845600000"
```

---

## 🔐 보안

✅ **Private Key 보호**
- Supabase Secrets에만 저장
- 프론트엔드에 노출 안 됨

✅ **Edge Function (서버리스)**
- 백엔드에서 안전하게 실행
- CORS 문제 없음

✅ **도메인 관리자 권한**
- Domain-wide delegation 설정됨
- 직원들의 개별 OAuth 불필요

---

## 💡 팁

### 자동 동기화 설정 (선택)
Edge Function의 `Schedule` 탭에서:
- `0 1 * * *` = 매일 새벽 1시 동기화
- `0 */2 * * *` = 2시간마다 동기화

### 동기화 로그 확인
```typescript
const logs = await getSyncLogs(5)  // 최근 5개 조회
logs.forEach(log => {
  console.log(`${log.started_at}: ${log.total_events}개`)
})
```

---

## ⚠️ 주의사항

1. **Secrets 설정 후 Edge Function 재배포 필수**
   - Secrets 변경 → 함수 자동 재시작 아님
   - 수동으로 재배포 필요

2. **처음 동기화는 시간이 걸릴 수 있음**
   - 13명 × 월간 이벤트 수
   - 1-2분 정도 예상

3. **기존 구글 캘린더 이벤트는 매번 갱신됨**
   - 중복 저장 안 됨
   - `source='google'`인 기존 이벤트 제거 후 저장

---

## ✨ 완료!

모든 구현이 완료되었습니다! 🎉

**이제 해야 할 일:**
1. Supabase SQL 테이블 생성
2. Supabase Secrets 설정
3. Edge Function 배포
4. Admin 페이지에서 테스트

👉 문제 발생 시 `CALENDAR_SYNC_SETUP.md`의 "🆘 문제 해결" 참고
