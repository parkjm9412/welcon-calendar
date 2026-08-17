# ⚡ 최대한 자동화된 설정 (최소 입력)

## 🔥 3단계만 하세요

### Step 1️⃣: Supabase SQL 실행 (30초)

1. Supabase 대시보드 로그인
2. **SQL Editor** 클릭
3. 아래 파일 복사:
   ```
   프로젝트폴더/supabase-init.sql
   ```
4. SQL Editor에 붙여넣고 **실행**

---

### Step 2️⃣: GitHub CLI 자동 인증 (1분)

**PowerShell/Terminal에서:**

```bash
# 1. GitHub CLI 설치 확인
gh --version

# 2. GitHub 자동 인증 (브라우저가 열립니다)
gh auth login
# → GitHub.com 선택
# → HTTPS 선택
# → 브라우저에서 허용 클릭
```

---

### Step 3️⃣: 자동 Secrets 설정 스크립트

**이 파일을 실행하세요:**

**PowerShell (Windows):**
```powershell
# 1. 이 명령어 복사
$supabaseToken = Read-Host "Supabase Access Token"
$googleKey = Read-Host "Google Private Key (JSON 전체)"

# 2. 자동 설정
gh secret set SUPABASE_ACCESS_TOKEN --body $supabaseToken --repo parkjm9412/welcon-calendar
gh secret set GOOGLE_CLIENT_EMAIL --body "welcon-calendar-sync@welcon-505703.iam.gserviceaccount.com" --repo parkjm9412/welcon-calendar
gh secret set GOOGLE_PRIVATE_KEY --body $googleKey --repo parkjm9412/welcon-calendar
```

**또는 이 한 줄로:**

```bash
gh secret set SUPABASE_ACCESS_TOKEN --body "YOUR_TOKEN" && \
gh secret set GOOGLE_CLIENT_EMAIL --body "welcon-calendar-sync@welcon-505703.iam.gserviceaccount.com" && \
gh secret set GOOGLE_PRIVATE_KEY --body "YOUR_KEY" \
--repo parkjm9412/welcon-calendar
```

---

## 📊 필요한 값 2개만

### 1. Supabase Access Token
```
위치: Supabase 대시보드
      → 프로필 → Account Settings
      → Access Tokens
      → Generate new token
      → 이름: "GitHub Actions"
```

### 2. Google Private Key
```
파일: 프로젝트폴더/웰콘시스템즈/.env.supabase
내용: GOOGLE_PRIVATE_KEY={"type":"service_account",...}
      = 다음의 전체 JSON 복사
```

---

## ✅ 완료 후

1. GitHub Actions가 자동으로 실행됨
2. Admin 페이지의 📅 캘린더 동기화 탭에서 사용 가능

---

## 💡 시간 정리

```
SQL 실행:        30초
CLI 설치/인증:   1분
Secrets 설정:    1분
────────────
총 소요: 2.5분 🚀
```

**이제 정말 간단합니다!** 💪
