# ⚡ GitHub Secrets 빠른 설정 가이드

## 🚀 30초 안에 설정하기

### 방법 1️⃣: GitHub CLI (가장 빠름 - 추천)

**Step 1: GitHub CLI 설치**
```bash
# Windows (PowerShell 관리자 권한)
winget install GitHub.cli

# macOS
brew install gh

# Linux
sudo apt install gh
```

**Step 2: 인증**
```bash
gh auth login
```

**Step 3: Secrets 설정**
```bash
# Supabase Access Token 설정
gh secret set SUPABASE_ACCESS_TOKEN --body "YOUR_TOKEN_HERE" --repo parkjm9412/welcon-calendar

# Google Client Email 설정
gh secret set GOOGLE_CLIENT_EMAIL --body "welcon-calendar-sync@welcon-505703.iam.gserviceaccount.com" --repo parkjm9412/welcon-calendar

# Google Private Key 설정 (전체 JSON)
gh secret set GOOGLE_PRIVATE_KEY --body "$(Get-Content .env.supabase)" --repo parkjm9412/welcon-calendar
```

---

### 방법 2️⃣: GitHub 웹사이트 (수동)

1. **GitHub 리포지토리 접속**
   ```
   https://github.com/parkjm9412/welcon-calendar
   ```

2. **Settings 클릭**
   ```
   Settings → Secrets and variables → Actions
   ```

3. **New repository secret 클릭**

4. **첫 번째 Secret 추가**
   ```
   Name: SUPABASE_ACCESS_TOKEN
   Value: (Supabase 대시보드에서 생성한 토큰 붙여넣기)
   ```

5. **두 번째 Secret 추가**
   ```
   Name: GOOGLE_CLIENT_EMAIL
   Value: welcon-calendar-sync@welcon-505703.iam.gserviceaccount.com
   ```

6. **세 번째 Secret 추가**
   ```
   Name: GOOGLE_PRIVATE_KEY
   Value: (.env.supabase 파일의 GOOGLE_PRIVATE_KEY 값 전체 붙여넣기)
   ```

---

## 📝 필요한 값들

### SUPABASE_ACCESS_TOKEN
**Where to get it:**
1. Supabase 대시보드 접속
2. 프로필 아이콘 → **Account Settings**
3. **Access Tokens** 탭
4. **Generate new token** 클릭
   - Name: `GitHub Actions`
5. 토큰 복사

### GOOGLE_CLIENT_EMAIL
```
welcon-calendar-sync@welcon-505703.iam.gserviceaccount.com
```
(그대로 복사하세요)

### GOOGLE_PRIVATE_KEY
**파일에서 찾기:**
```
프로젝트폴더/웰콘시스템즈/.env.supabase
```

파일 내용:
```
GOOGLE_PRIVATE_KEY={"type":"service_account",...}
```

`=` 다음의 전체 JSON을 복사하세요.

---

## ✅ 설정 확인

**GitHub에서 확인:**
1. 리포지토리 → **Actions** 탭
2. **Deploy Supabase Secrets** 워크플로우 찾기
3. 초록 체크마크 ✅ 보이면 성공!

---

## 🎯 설정 완료 후

**자동으로 실행되는 것:**
1. ✅ Supabase Secrets 설정
2. ✅ Edge Function (sync-calendars) 배포
3. ✅ Admin 패널에서 캘린더 동기화 사용 가능

---

## 🆘 문제 해결

### "GitHub CLI 명령어를 찾을 수 없음"
→ GitHub CLI 재설치 또는 Path 재설정 필요

### "gh auth login에서 실패"
→ 브라우저가 자동으로 열립니다. GitHub 로그인 진행

### "Secret 설정 중 오류"
→ 토큰이 올바른지 확인
→ Repository 접근 권한 확인

### "GitHub Actions가 실행 안 됨"
→ Secrets 설정 후 5분 정도 대기
→ 리포지토리 Workflows 섹션 확인

---

## 🔒 보안 팁

✅ **Private Key는 절대 공유하지 마세요**
✅ **GitHub Secrets은 암호화되어 저장됩니다**
✅ **Access Token은 정기적으로 갱신하세요**

---

**완료되면 Admin 페이지의 📅 캘린더 동기화 탭에서 사용 가능합니다!** 🎉
