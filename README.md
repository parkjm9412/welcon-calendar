# 🎉 Welcon Team Calendar

**13명 팀을 위한 웹 기반 팀 캘린더 관리 시스템**

Google Calendar 자동 동기화 기능이 포함된 완전한 일정 관리 솔루션입니다.

## ✨ 주요 기능

✅ **월/주 캘린더 뷰** - 직관적인 일정 확인  
✅ **직원 일정 통합 관리** - 13명 팀원 일정을 한눈에 보기  
✅ **색상별 구분** - 각 직원마다 고유 색상으로 표시  
✅ **일정 추가/수정/삭제** - 간편한 일정 관리  
✅ **Google Calendar 동기화** - 자동으로 구글 캘린더에 반영  
✅ **반응형 디자인** - PC/태블릿/모바일 모두 지원  
✅ **실시간 동기화** - 모든 변경사항 즉시 반영  

## 📊 화면 구성

```
┌─────────────────────────────────────────────────┐
│  Welcon Calendar                   ◀  오늘  ▶  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌────────────────────────┐  ┌──────────────┐  │
│  │                        │  │  팀원 (13명) │  │
│  │   캘린더 뷰            │  │              │  │
│  │  (월간/주간)           │  │  김철수 🔵   │  │
│  │                        │  │  이영희 🔴   │  │
│  │                        │  │  박민준 🟢   │  │
│  │                        │  │  ...         │  │
│  └────────────────────────┘  └──────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 🚀 빠른 시작 (3단계)

### 1️⃣ Supabase 설정 (2분)
```bash
# 1. https://supabase.com 회가입
# 2. 새 프로젝트 생성
# 3. supabase/schema.sql 파일의 SQL 실행
# 4. API 키를 .env.local에 복사
```

### 2️⃣ Google OAuth 설정 (5분)
```bash
# 1. https://console.cloud.google.com 접속
# 2. Google Calendar API 활성화
# 3. OAuth 2.0 자격증명 생성
# 4. Client ID/Secret을 .env.local에 복사
```

### 3️⃣ 앱 실행 (1분)
```bash
npm install
npm run dev
# http://localhost:3000 접속!
```

**자세한 설정 가이드는 [SETUP.md](./SETUP.md)를 참고하세요.**

## 📁 프로젝트 구조

```
welcon-calendar/
├── app/
│   ├── page.tsx              # 메인 캘린더 페이지
│   ├── layout.tsx            # 루트 레이아웃
│   ├── globals.css           # 전역 스타일
│   └── api/
│       ├── employees/        # 직원 관리 API
│       └── events/           # 일정 관리 API
├── components/
│   ├── Header.tsx            # 헤더
│   ├── Calendar.tsx          # 캘린더 뷰
│   ├── CalendarDay.tsx       # 날짜 셀
│   ├── EventModal.tsx        # 일정 추가/수정 모달
│   ├── EmployeeList.tsx      # 팀원 목록
│   └── Sidebar.tsx           # 사이드바
├── lib/
│   ├── supabase.ts           # Supabase 클라이언트
│   ├── google-calendar.ts    # Google Calendar API
│   └── calendar-utils.ts     # 캘린더 유틸리티
├── types/
│   └── index.ts              # TypeScript 타입 정의
├── supabase/
│   └── schema.sql            # 데이터베이스 스키마
├── .env.local                # 환경 변수 (설정 필요)
├── package.json
├── tsconfig.json
└── SETUP.md                  # 설정 가이드
```

## 🎯 직원 일정 추가 방법

### 기본 사용 흐름
```
1. 캘린더에서 날짜 클릭
   ↓
2. "일정 추가" 모달 열기
   ↓
3. 제목, 담당자, 날짜 입력
   ↓
4. "저장" 버튼 클릭
   ↓
5. ✅ 앱에 표시 + Google Calendar에 자동 동기화!
```

### 예시: 김철수 회의 일정 추가
```
제목: "분기별 목표 검토 회의"
담당자: 김철수
날짜: 2024-01-15
색상: 자동 (파란색)
↓
✅ 캘린더에 표시
✅ 김철수 Google Calendar에 추가
✅ 팀 모두에게 표시
```

## 🔄 Google Calendar 동기화

### 작동 방식
```
Welcon Calendar App
    ↓
    ├→ Supabase (데이터베이스)
    └→ Google Calendar API
        ↓
        직원의 Google Calendar에 자동 추가
```

### 동기화되는 정보
- 📅 일정 제목
- 👤 담당자
- 📌 시작일/종료일
- 📝 설명 (옵션)
- 🎨 색상

## 🛠️ 기술 스택

| 레이어 | 기술 |
|--------|------|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Database** | Supabase (PostgreSQL) |
| **Calendar API** | Google Calendar API v3 |
| **Authentication** | Supabase Auth + Google OAuth 2.0 |
| **Deployment** | Vercel / 자체 서버 |

## 📊 데이터 구조

### employees (직원)
```sql
CREATE TABLE employees (
  id: UUID
  name: TEXT           -- "김철수"
  email: TEXT          -- "chulsu@welconsystems.com"
  color_index: INTEGER -- 0-12 (색상)
  created_at: TIMESTAMP
)
```

### events (일정)
```sql
CREATE TABLE events (
  id: UUID
  title: TEXT          -- "분기 회의"
  employee_id: UUID    -- 담당자
  start_date: TIMESTAMP
  end_date: TIMESTAMP
  all_day: BOOLEAN
  google_event_id: TEXT -- Google Calendar 연동
  created_at: TIMESTAMP
)
```

## 🎨 색상 팔레트 (13명)

```
🔵 파란색    🔴 빨강    🟢 녹색     🟡 주황
🟣 보라색    🔷 핑크    🌊 청록색   🟠 주황계
🔷 시안      🟣 인디고  🟢 라임     🔷 마젠타
🌊 시안다크
```

## 🚀 배포하기

### Vercel (권장)
```bash
# 1. https://vercel.com 회가입
# 2. GitHub와 연결
# 3. 환경 변수 설정
# 4. 자동 배포!
```

### 자체 서버
```bash
npm run build
npm start
```

## 🔒 보안

✅ PostgreSQL 암호화  
✅ Row Level Security (RLS) 정책  
✅ OAuth 2.0 인증  
✅ API 키 환경 변수 관리  
✅ HTTPS 지원  

## 📱 브라우저 지원

- ✅ Chrome (최신 버전)
- ✅ Safari (최신 버전)
- ✅ Firefox (최신 버전)
- ✅ Edge (최신 버전)
- ✅ 모바일 브라우저

## 🤝 팀원 역할

- **관리자**: 전체 일정 조회 및 관리
- **팀원**: 자신의 일정 추가/수정
- **조회자**: 모든 일정 조회 (읽기 전용)

## 📞 FAQ

**Q: 구글 캘린더에 일정이 안 떴어요**
A: 설정 가이드의 Google Calendar API 설정 부분을 다시 확인해주세요.

**Q: 직원을 추가할 수 없어요**
A: Supabase 데이터베이스 연결을 확인하세요. (.env.local 파일)

**Q: 모바일에서 잘 안 보여요**
A: 브라우저 줌 레벨을 조정하거나, 화면 회전을 시도해보세요.

## 📝 개발 로그

- ✅ Next.js 14 프로젝트 초기화
- ✅ Supabase 데이터베이스 설계
- ✅ Google Calendar API 통합
- ✅ UI 컴포넌트 구현
- ✅ 일정 CRUD 기능
- ✅ 실시간 동기화
- ✅ 반응형 디자인

## 🎯 향후 계획

- 📧 이메일 알림
- 📱 모바일 앱
- 🎤 회의실 예약
- 📊 일정 통계
- 🔔 Slack 통합
- 📅 iCal 내보내기

## 📞 지원

문제가 있으면 다음을 확인하세요:
1. [SETUP.md](./SETUP.md) - 설정 가이드
2. 브라우저 개발자 도구 (F12) - Console 탭
3. Supabase 대시보드 - 로그 확인

---

**만들기 완료! 🎉**

이제 캘린더 앱을 실행하세요: `npm run dev`
