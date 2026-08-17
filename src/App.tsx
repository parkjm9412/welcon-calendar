import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { setupDatabase } from '@/lib/setupDatabase'
import { useIsMobile } from './hooks/useIsMobile'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Dashboard from './components/Dashboard'
import Calendar from './components/Calendar'
import VehicleReservation from './components/VehicleReservation'
import Admin from './components/Admin'

export type TabType = 'dashboard' | 'calendar' | 'vehicle' | 'admin'

interface UserInfo {
  name: string
  email: string
  accessToken?: string
}

export default function App() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [authChecked, setAuthChecked] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    // OAuth 리다이렉트 후 세션 복원 및 도메인 검증
    const initAuth = async () => {
      // 데이터베이스 초기화
      await setupDatabase()

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const email = session.user.email ?? ''
        setUser({
          name: session.user.user_metadata?.full_name ?? email.split('@')[0],
          email,
          accessToken: session.provider_token ?? undefined,
        })
      }
      setAuthChecked(true)
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const email = session.user.email ?? ''
        setUser({
          name: session.user.user_metadata?.full_name ?? email.split('@')[0],
          email,
          accessToken: session.provider_token ?? undefined,
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // 세션 확인 전 빈 화면
  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f1f3d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 24, height: 24, border: '2px solid rgba(200,16,46,0.3)', borderTopColor: '#C8102E', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={(name, email) => setUser({ name, email })} />
  }

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f0f2f7' }}>
        {/* 모바일 상단 헤더 */}
        <div style={{ backgroundColor: '#0f1f3d', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#253d6b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 12, color: '#7aa8ff' }}>
              {user.name[0]}
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 13, color: '#e8edf5' }}>{user.name}</div>
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#4a6494' }}>{user.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#4a6494' }}>
            로그아웃
          </button>
        </div>

        {/* 콘텐츠 */}
        <main style={{ flex: 1, overflow: 'auto', padding: '20px 16px 90px' }}>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'calendar' && <Calendar accessToken={user.accessToken} userName={user.name} />}
          {activeTab === 'vehicle' && <VehicleReservation />}
          {activeTab === 'admin' && <Admin />}
        </main>

        {/* 하단 탭바 */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f7' }}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} user={user} />
      <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'calendar' && <Calendar accessToken={user.accessToken} userName={user.name} />}
        {activeTab === 'vehicle' && <VehicleReservation />}
        {activeTab === 'admin' && <Admin />}
      </main>
    </div>
  )
}
