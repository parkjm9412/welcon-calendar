#!/bin/bash

# GitHub Secrets 자동 설정 스크립트
# 사전 요구사항: GitHub CLI (gh) 설치 및 인증

OWNER="parkjm9412"
REPO="welcon-calendar"

echo "🔐 GitHub Secrets 자동 설정"
echo ""

# GitHub CLI 확인
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI가 설치되지 않았습니다."
    echo ""
    echo "설치 방법:"
    echo "  macOS: brew install gh"
    echo "  Windows: choco install gh"
    echo "  Linux: sudo apt install gh"
    echo ""
    echo "또는: https://github.com/cli/cli/releases"
    exit 1
fi

echo "✅ GitHub CLI 설치됨"
echo ""

# GitHub 인증 확인
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub에 인증되지 않았습니다."
    echo "인증을 진행합니다..."
    gh auth login
fi

echo "✅ GitHub 인증됨"
echo ""

# Secrets 설정
echo "Secrets을 설정합니다..."
echo ""

# 1. SUPABASE_ACCESS_TOKEN
echo "1️⃣  SUPABASE_ACCESS_TOKEN"
echo "   Supabase 대시보드 → Account Settings → Access Tokens에서 생성"
read -p "   토큰을 입력하세요: " SUPABASE_TOKEN

gh secret set SUPABASE_ACCESS_TOKEN --body "$SUPABASE_TOKEN" --repo $OWNER/$REPO
if [ $? -eq 0 ]; then
    echo "   ✅ 설정됨"
else
    echo "   ❌ 설정 실패"
    exit 1
fi
echo ""

# 2. GOOGLE_CLIENT_EMAIL
echo "2️⃣  GOOGLE_CLIENT_EMAIL"
GOOGLE_EMAIL="welcon-calendar-sync@welcon-505703.iam.gserviceaccount.com"
echo "   값: $GOOGLE_EMAIL"

gh secret set GOOGLE_CLIENT_EMAIL --body "$GOOGLE_EMAIL" --repo $OWNER/$REPO
if [ $? -eq 0 ]; then
    echo "   ✅ 설정됨"
else
    echo "   ❌ 설정 실패"
    exit 1
fi
echo ""

# 3. GOOGLE_PRIVATE_KEY
echo "3️⃣  GOOGLE_PRIVATE_KEY"
echo "   .env.supabase 파일의 GOOGLE_PRIVATE_KEY 전체를 붙여넣으세요"
echo "   (끝나면 엔터 2번 누르세요)"

# 멀티라인 입력 처리
GOOGLE_KEY=""
while IFS= read -r line; do
    if [ -z "$line" ]; then
        break
    fi
    GOOGLE_KEY+="$line"
    GOOGLE_KEY+=$'\n'
done

gh secret set GOOGLE_PRIVATE_KEY --body "$GOOGLE_KEY" --repo $OWNER/$REPO
if [ $? -eq 0 ]; then
    echo "   ✅ 설정됨"
else
    echo "   ❌ 설정 실패"
    exit 1
fi
echo ""

# 설정 확인
echo "설정된 Secrets 확인..."
gh secret list --repo $OWNER/$REPO

echo ""
echo "✅ 모든 Secrets이 설정되었습니다!"
echo ""
echo "다음 단계:"
echo "  1. GitHub Actions가 자동으로 실행됩니다"
echo "  2. Actions 탭에서 'Deploy Supabase Secrets' 상태 확인"
echo "  3. 초록 체크마크 ✅ 가 보이면 완료!"
