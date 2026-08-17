# GitHub Secrets 자동 설정 스크립트
# 사용법: powershell -ExecutionPolicy Bypass -File setup-github-secrets.ps1

param(
    [string]$GithubToken = "",
    [string]$Owner = "parkjm9412",
    [string]$Repo = "welcon-calendar"
)

# 색상 정의
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow
$Blue = [System.ConsoleColor]::Blue

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor $Blue
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $Yellow
}

Write-Host "🔐 GitHub Secrets 자동 설정 스크립트" -ForegroundColor $Blue
Write-Host ""

# GitHub Token 확인
if (-not $GithubToken) {
    Write-Warning "GitHub Personal Access Token이 필요합니다."
    Write-Info "1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)"
    Write-Info "2. Generate new token 클릭"
    Write-Info "3. 권한: repo, admin:repo_hook 선택"
    Write-Info "4. Generate 후 토큰 복사"
    Write-Host ""
    $GithubToken = Read-Host "GitHub Personal Access Token을 입력하세요"

    if (-not $GithubToken) {
        Write-Error "Token이 입력되지 않았습니다."
        exit 1
    }
}

$headers = @{
    "Authorization" = "Bearer $GithubToken"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

Write-Info "설정할 Secrets:"
$secrets = @{
    "SUPABASE_ACCESS_TOKEN" = (Read-Host "SUPABASE_ACCESS_TOKEN을 입력하세요")
    "GOOGLE_CLIENT_EMAIL" = "welcon-calendar-sync@welcon-505703.iam.gserviceaccount.com"
    "GOOGLE_PRIVATE_KEY" = (Read-Host "GOOGLE_PRIVATE_KEY 전체를 입력하세요 (또는 복사 + Ctrl+Shift+V)")
}

Write-Host ""
Write-Host "설정할 Secrets 목록:"
foreach ($key in $secrets.Keys) {
    $value = $secrets[$key]
    $displayValue = if ($value.Length -gt 50) { $value.Substring(0, 50) + "..." } else { $value }
    Write-Host "  • $key : $displayValue"
}

Write-Host ""
$confirm = Read-Host "이 정보로 설정하시겠습니까? (Y/n)"
if ($confirm -ne "" -and $confirm -ne "Y" -and $confirm -ne "y") {
    Write-Error "취소되었습니다."
    exit 0
}

# 각 Secret 설정
foreach ($secretName in $secrets.Keys) {
    $secretValue = $secrets[$secretName]

    Write-Info "$secretName 설정 중..."

    try {
        $body = @{
            "encrypted_value" = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($secretValue))
            "visibility" = "private"
        } | ConvertTo-Json

        $uri = "https://api.github.com/repos/$Owner/$Repo/actions/secrets/$secretName"

        # GitHub API를 통해 secret 생성
        # 실제로는 public key로 암호화해야 함
        # 이를 위해 먼저 repo의 public key를 가져와야 함

        $pubKeyUri = "https://api.github.com/repos/$Owner/$Repo/actions/secrets/public-key"
        $pubKeyResponse = Invoke-RestMethod -Uri $pubKeyUri -Headers $headers -Method Get

        if ($pubKeyResponse) {
            # libsodium을 사용한 암호화가 필요하지만,
            # 간단히 API 호출로만 처리

            Write-Info "⚠️  Secret 암호화에는 libsodium이 필요합니다."
            Write-Info "대신 GitHub CLI를 사용하시기 바랍니다:"
            Write-Host ""
            Write-Host "gh secret set $secretName --body `"$secretValue`" --repo $Owner/$Repo" -ForegroundColor $Yellow
        }
    } catch {
        Write-Error "Secret 설정 중 오류: $_"
    }
}

Write-Host ""
Write-Warning "GitHub CLI를 사용하여 자동으로 설정하는 것을 권장합니다."
Write-Host ""
Write-Host "GitHub CLI 설치 후 다음 명령어를 실행하세요:" -ForegroundColor $Yellow
Write-Host "  gh secret set SUPABASE_ACCESS_TOKEN --body 'YOUR_TOKEN_HERE' --repo parkjm9412/welcon-calendar"
Write-Host "  gh secret set GOOGLE_CLIENT_EMAIL --body 'welcon-calendar-sync@welcon-505703.iam.gserviceaccount.com' --repo parkjm9412/welcon-calendar"
Write-Host "  gh secret set GOOGLE_PRIVATE_KEY --body (Get-Content .env.supabase) --repo parkjm9412/welcon-calendar"
