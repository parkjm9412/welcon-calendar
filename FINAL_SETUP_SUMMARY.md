# 🎉 구글 캘린더 자동 동기화 - 최종 설정 가이드

## 📊 완성된 내용

✅ **모든 코드 작성 완료**
- Supabase Edge Function
- React Admin UI 컴포넌트
- GitHub Actions 자동화 워크플로우

✅ **GitHub에 푸시 완료**
```
Commit: a9df3a1
feat: Add Google Calendar auto-sync with Supabase Edge Functions
```

---

## ⏰ 남은 단계 (5분)

### Step 1️⃣: Supabase SQL 테이블 생성 (1분)

**Supabase 대시보드 → SQL Editor에서 실행:**

```sql
CREATE TABLE IF NOT EXISTS calendar_sync_logs (
  id TEXT PRIMARY KEY,
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  total_events INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running',
  results JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE schedules ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS sync_log_id TEXT;

CREATE INDEX IF NOT EXISTS idx_schedules_source_owner ON schedules(source, owner);
```

---

### Step 2️⃣: GitHub Secrets 설정 (3분)

**가장 빠른 방법: GitHub CLI**

```bash
# 1. GitHub CLI 설치 (이미 있으면 스킵)
winget install GitHub.cli  # Windows
# 또는
brew install gh  # macOS

# 2. 인증
gh auth login

# 3. Secrets 설정
gh secret set SUPABASE_ACCESS_TOKEN --body "YOUR_TOKEN" --repo parkjm9412/welcon-calendar
gh secret set GOOGLE_CLIENT_EMAIL --body "welcon-calendar-sync@welcon-505703.iam.gserviceaccount.com" --repo parkjm9412/welcon-calendar
gh secret set GOOGLE_PRIVATE_KEY --body "$(Get-Content .env.supabase)" --repo parkjm9412/welcon-calendar
```

**또는 웹사이트에서:** [빠른 가이드](./GITHUB_SECRETS_QUICK_SETUP.md) 참고

---

### Step 3️⃣: GitHub Actions 실행 (1분)

**자동 실행:**
- 다음 main push 시 자동 실행

**수동 실행:**
```
GitHub → Actions → Deploy Supabase Secrets → Run workflow
```

---

## 🎯 설정이 완료되면

**Admin 페이지에서:**
1. 📅 **캘린더 동기화** 탭 선택
2. 🚀 **지금 동기화** 버튼 클릭
3. ✅ 모든 직원의 구글 캘린더 자동 동기화!

---

## 📁 생성된 파일들

```
✅ supabase/functions/sync-calendars/index.ts
   → Edge Function (백엔드 동기화 로직)

✅ src/components/AdminCalendarSync.tsx
   → Admin UI (동기화 상태 표시)

✅ src/lib/googleCalendarSync.ts
   → 클라이언트 함수

✅ .github/workflows/deploy-supabase-secrets.yml
   → GitHub Actions 자동화

✅ CALENDAR_SYNC_SETUP.md
   → 상세 설정 가이드

✅ CALENDAR_SYNC_CHECKLIST.md
   → 체크리스트

✅ GITHUB_SECRETS_QUICK_SETUP.md
   → GitHub Secrets 빠른 설정

✅ setup-secrets.sh
   → Bash 스크립트 (Linux/macOS)
```

---

## 🔄 자동 동기화 흐름

```
Admin UI 클릭
    ↓
Edge Function RPC 호출
    ↓
Google Calendar API 호출 (모든 직원)
    ↓
Supabase 동기화 로그 저장
    ↓
Admin UI 결과 표시
```

---

## 📊 동기화되는 데이터

각 직원의 구글 캘린더 이벤트:
- 제목
- 날짜/시간
- 모든 직원의 캘린더 통합

저장 위치: **Supabase `schedules` 테이블**

---

## 💾 필요한 값들

### 1. SUPABASE_ACCESS_TOKEN
**생성 방법:**
1. Supabase 대시보드
2. 프로필 → Account Settings
3. Access Tokens → Generate new token
4. Name: "GitHub Actions"

### 2. GOOGLE_CLIENT_EMAIL
```
welcon-calendar-sync@welcon-505703.iam.gserviceaccount.com
```
(그대로 복사)

### 3. GOOGLE_PRIVATE_KEY
**파일:** `웰콘시스템즈/.env.supabase`

내용 형식:
```
GOOGLE_PRIVATE_KEY={"type":"service_account",...}
```

`=` 다음 전체 JSON 복사

---

## ✨ 주요 기능

✅ **자동 동기화**
- 모든 직원 캘린더 자동 수집
- 중복 제거 및 업데이트

✅ **관리자 대시보드**
- 실시간 동기화 상태
- 이벤트 수 통계
- 동기화 이력 조회

✅ **보안**
- Private Key는 Supabase Secrets에만 저장
- 프론트엔드 노출 안 됨
- GitHub Secrets 암호화

✅ **자동화**
- GitHub Actions로 배포 자동화
- 환경별 설정 분리
- 에러 로깅

---

## 🚀 시작하기

**3단계만 하면 됩니다:**

1. **Supabase SQL 실행** ← 1분
2. **GitHub Secrets 설정** ← 3분  
3. **GitHub Actions 실행** ← 1분

**총 소요 시간: 5분**

---

## 📚 더 알아보기

- [Supabase Edge Functions](./CALENDAR_SYNC_SETUP.md)
- [GitHub Secrets 설정](./GITHUB_SECRETS_QUICK_SETUP.md)
- [상세 체크리스트](./CALENDAR_SYNC_CHECKLIST.md)

---

## 🎓 기술 스택

- **백엔드**: Supabase Edge Functions (Deno)
- **프론트엔드**: React 19 + Vite
- **데이터베이스**: Supabase PostgreSQL
- **인증**: Google Workspace Service Account
- **자동화**: GitHub Actions
- **API**: Google Calendar v3

---

## 🆘 문제 발생 시

**Q: Supabase SQL이 안 됨**
→ SQL Editor 열기 → 쿼리 하나씩 실행

**Q: GitHub Secrets 설정 안 됨**
→ Personal Access Token 권한 확인 (repo 필수)

**Q: 동기화 안 됨**
→ GitHub Actions 로그 확인
→ Secrets이 올바른지 재확인

---

## 🎉 완료!

모든 설정이 완료되면 Admin 페이지의 **📅 캘린더 동기화** 탭에서 사용할 수 있습니다!

---

**Questions?** 문서를 다시 읽어보거나, GitHub Issues를 열어주세요.
