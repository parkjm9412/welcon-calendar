import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import CompanyLogo from './CompanyLogo'

interface Props {
  onLogin: (name: string, email: string) => void
}

export default function Login({ onLogin: _onLogin }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href,
          scopes: 'openid email profile https://www.googleapis.com/auth/calendar.readonly',
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })
      if (error) {
        setError('로그인 오류: ' + error.message)
        setLoading(false)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError('오류가 발생했습니다: ' + msg)
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f1f3d',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background dot grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at center, rgba(200,16,46,0.12) 1px, transparent 1.2px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'absolute', top: '8%', left: '12%', width: 360, height: 360, borderRadius: '50%', backgroundColor: '#C8102E', opacity: 0.06, filter: 'blur(90px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '12%', right: '10%', width: 280, height: 280, borderRadius: '50%', backgroundColor: '#F26522', opacity: 0.05, filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', width: 440, maxWidth: '92vw' }}>
        {/* Logo header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '16px 32px',
              marginBottom: 14,
            }}
          >
            <CompanyLogo variant="white" height={34} />
          </div>
          <div
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 10,
              color: 'rgba(255,255,255,0.28)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            웰콘시스템즈 임직원 전용
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 18,
            padding: '40px 40px 36px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
          }}
        >
          {/* Title */}
          <div style={{ marginBottom: 28 }}>
            <h1
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: 22,
                color: '#1a1a1a',
                margin: '0 0 10px',
                letterSpacing: '-0.02em',
              }}
            >
              로그인
            </h1>
            <p
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 13,
                color: '#8c9ab8',
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              Welcon Systems 임직원만 접속 가능합니다.
              <br />
              반드시{' '}
              <span
                style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 11,
                  backgroundColor: '#fff4f0',
                  color: '#C8102E',
                  padding: '1px 7px',
                  borderRadius: 4,
                  fontWeight: 500,
                }}
              >
                @welconsystems.com
              </span>{' '}
              계정 전용입니다.
            </p>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#f0f2f7' }} />
            <span
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 9,
                color: '#c0ccdd',
                letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
              }}
            >
              Google Workspace 계정 전용
            </span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#f0f2f7' }} />
          </div>

          {/* Google login button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '14px 20px',
              borderRadius: 10,
              border: '1.5px solid #e2e8f0',
              backgroundColor: loading ? '#fafafa' : '#ffffff',
              cursor: loading ? 'default' : 'pointer',
              transition: 'all 0.15s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                const el = e.currentTarget as HTMLButtonElement
                el.style.borderColor = '#C8102E'
                el.style.boxShadow = '0 2px 14px rgba(200,16,46,0.1)'
              }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.borderColor = '#e2e8f0'
              el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    border: '2px solid #e2e8f0',
                    borderTopColor: '#C8102E',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: 14, color: '#8c9ab8' }}>
                  Google로 이동 중...
                </span>
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>
                  Google Workspace로 로그인
                </span>
              </>
            )}
          </button>

          {error && (
            <div
              style={{
                marginTop: 14,
                backgroundColor: '#fff4f4',
                border: '1px solid #fca5a5',
                borderRadius: 8,
                padding: '10px 14px',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 12,
                color: '#b91c1c',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>⚠</span> {error}
            </div>
          )}

          {/* Security notice */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: '1px solid #f0f2f7',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 12, color: '#d0d5e0', flexShrink: 0, marginTop: 1 }}>🔒</span>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 11, color: '#c0ccdd', margin: 0, lineHeight: 1.6 }}>
              이 시스템은 Welcon Systems 임직원 전용입니다. 무단 접속 시 법적 책임이 따를 수 있습니다.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'rgba(255,255,255,0.15)' }}>
            © 2026 Welcon Systems Co., Ltd. · CS팀 박종미 팀장
          </span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
