# Welcon Team Calendar - 설정 가이드

## 📋 사전 요구사항

- Node.js 18+ (https://nodejs.org/)
- npm 또는 yarn
- Google Cloud Account
- Supabase Account (https://supabase.com/)

## 🚀 빠른 시작

### 1단계: Supabase 설정

1. **Supabase 프로젝트 생성**
   - https://app.supabase.com에 접속
   - "New Project" 클릭
   - 프로젝트명: `welcon-calendar`
   - 비밀번호 설정
   - Region: Asia Pacific (Tokyo) 선택
   - Create 클릭

2. **데이터베이스 테이블 생성**
   - Supabase 대시보드에서 SQL Editor 클릭
   - 새 쿼리 생성
   - `supabase/schema.sql` 파일의 내용을 복사해서 붙여넣기
   - "Run" 클릭

3. **API 키 복사**
   - Settings → API에서 다음을 복사:
     - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
     - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - service_role key (Server-side) → `SUPABASE_SERVICE_ROLE_KEY`

### 2단계: Google Calendar API 설정

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/
   - 새 프로젝트 생성: "Welcon Calendar"

2. **APIs 활성화**
   - "APIs & Services" → "Library"
   - "Google Calendar API" 검색
   - "Enable" 클릭

3. **OAuth 2.0 자격증명 생성**
   - "APIs & Services" → "Credentials"
   - "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://yourdomain.com` (배포 시)
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/callback`
     - `https://yourdomain.com/auth/callback` (배포 시)
   - "Create" 클릭
   - Client ID와 Client Secret 복사

### 3단계: 환경 변수 설정

`.env.local` 파일 편집:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Calendar
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Server-side
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/auth/callback
```

### 4단계: 의존성 설치 및 실행

```bash
# npm 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

## 📊 직원 추가

1. 캘린더 앱 접속
2. 오른쪽 사이드바 "팀원" 영역의 "추가" 버튼 클릭
3. 직원 정보 입력 후 저장

## 📅 일정 추가

1. 캘린더에서 원하는 날짜 클릭
2. 일정 추가 모달 열기
3. 제목, 담당자, 날짜 입력
4. "저장" 클릭
5. 자동으로 Google Calendar에도 동기화됨

## 🔄 구글 캘린더 연동

현재 API 연동 구조는 다음과 같습니다:

- **앱 → Google Calendar**: 앱에서 생성한 일정이 자동으로 직원의 Google Calendar에 추가
- **Google Calendar → 앱**: Google Calendar의 일정도 앱에서 조회 가능

### 설정 단계

1. 각 직원이 Google 계정으로 로그인 필요
2. "Google 로그인" 버튼을 통해 권한 승인
3. 이후 자동으로 Google Calendar와 동기화

## 🚀 배포

### Vercel 배포 (권장)

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 환경 변수 설정
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_REDIRECT_URI=https://yourdomain.vercel.app/auth/callback
```

### 자체 서버 배포

```bash
# 빌드
npm run build

# 시작
npm start
```

## 🔒 보안 체크리스트

- [ ] Supabase RLS (Row Level Security) 정책 검토
- [ ] API 키를 .env.local에만 저장 (절대 코드에 하드코딩하지 말 것)
- [ ] Google OAuth 리다이렉트 URI가 정확함
- [ ] HTTPS 사용 (배포 시)
- [ ] Supabase 정책에서 공개 액세스 범위 조정

## 📞 트러블슈팅

### "Supabase 연결 오류"
- `.env.local` 파일의 URL과 키 확인
- Supabase 프로젝트 상태 확인

### "Google Calendar 동기화 안됨"
- Google Cloud Console에서 Calendar API 활성화 확인
- OAuth 자격증명 설정 확인
- 리다이렉트 URI가 정확한지 확인

### "직원이 보이지 않음"
- Supabase SQL Editor에서 `SELECT * FROM employees;` 실행해서 데이터 확인
- 브라우저 개발자 도구 Console에서 오류 메시지 확인

## 📖 기술 스택

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Calendar API**: Google Calendar API v3
- **Auth**: Supabase Auth + Google OAuth 2.0

## 📝 라이선스

이 프로젝트는 Welcon Systems의 내부 프로젝트입니다.
