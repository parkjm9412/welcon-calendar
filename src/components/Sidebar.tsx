import type { TabType } from '../App'
import CompanyLogo from './CompanyLogo'

interface Props {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  onLogout: () => void
  user: { name: string; email: string }
}

const navItems: { id: TabType; label: string; icon: string; adminOnly?: boolean }[] = [
  { id: 'dashboard', label: '오늘 대시보드', icon: '▦' },
  { id: 'calendar', label: '캘린더', icon: '◫' },
  { id: 'vehicle', label: '법인 차량 예약', icon: '◉' },
  { id: 'admin', label: '관리자', icon: '⬡', adminOnly: true },
]

export default function Sidebar({ activeTab, onTabChange, onLogout, user }: Props) {
  return (
    <aside
      style={{
        width: 220,
        minHeight: '100vh',
        backgroundColor: '#0f1f3d',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '22px 20px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <CompanyLogo variant="white" height={28} />
        <div
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: 9,
            color: '#4a6494',
            marginTop: 6,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          임직원 인트라넷
        </div>
      </div>

      {/* User */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              backgroundColor: '#253d6b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              fontSize: 13,
              color: '#7aa8ff',
              flexShrink: 0,
            }}
          >
            {user.name[0]}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 500,
                fontSize: 13,
                color: '#e8edf5',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user.name}
            </div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#4a6494', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {navItems.map((item) => {
          if (item.adminOnly) {
            return (
              <div key="admin-divider">
                <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)', margin: '8px 4px 12px' }} />
                <button
                  onClick={() => onTabChange(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    marginBottom: 4, transition: 'all 0.15s ease',
                    backgroundColor: activeTab === item.id ? '#1a1a3a' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (activeTab !== item.id) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(200,16,46,0.08)' }}
                  onMouseLeave={(e) => { if (activeTab !== item.id) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
                >
                  <span style={{ fontSize: 13, color: activeTab === item.id ? '#ff6b6b' : '#6b3a3a', lineHeight: 1 }}>{item.icon}</span>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: activeTab === item.id ? 600 : 400, fontSize: 13, color: activeTab === item.id ? '#ffaaaa' : '#6b3a3a' }}>{item.label}</span>
                  {activeTab === item.id && <div style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', backgroundColor: '#C8102E' }} />}
                </button>
              </div>
            )
          }
          return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              marginBottom: 4,
              transition: 'all 0.15s ease',
              backgroundColor: activeTab === item.id ? '#1a3157' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== item.id) {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  'rgba(255,255,255,0.05)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== item.id) {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
              }
            }}
          >
            <span
              style={{
                fontSize: 15,
                color: activeTab === item.id ? '#7aa8ff' : '#4a6494',
                lineHeight: 1,
              }}
            >
              {item.icon}
            </span>
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: activeTab === item.id ? 600 : 400,
                fontSize: 13,
                color: activeTab === item.id ? '#e8edf5' : '#6b82a8',
              }}
            >
              {item.label}
            </span>
            {activeTab === item.id && (
              <div
                style={{
                  marginLeft: 'auto',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  backgroundColor: '#2f6bff',
                }}
              />
            )}
          </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: '8px 12px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            transition: 'background 0.15s',
            marginBottom: 8,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
        >
          <span style={{ fontSize: 13, color: '#4a6494' }}>⎋</span>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: '#4a6494', fontWeight: 400 }}>로그아웃</span>
        </button>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#2d4170', paddingLeft: 12 }}>
          v2.4.1 · 2026
        </div>
      </div>
    </aside>
  )
}
