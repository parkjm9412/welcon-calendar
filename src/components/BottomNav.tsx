import type { TabType } from '../App'

interface Props {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: 'dashboard', label: '대시보드', icon: '▦' },
  { id: 'calendar',  label: '캘린더',   icon: '◫' },
  { id: 'vehicle',   label: '차량예약',  icon: '◉' },
  { id: 'admin',     label: '관리자',   icon: '⬡' },
]

export default function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      backgroundColor: '#0f1f3d',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {tabs.map((tab) => {
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '10px 0 12px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            {active && (
              <div style={{
                position: 'absolute',
                top: 0, left: '25%', right: '25%',
                height: 2,
                backgroundColor: tab.id === 'admin' ? '#C8102E' : '#2f6bff',
                borderRadius: '0 0 2px 2px',
              }} />
            )}
            <span style={{ fontSize: 16, color: active ? (tab.id === 'admin' ? '#ff8080' : '#7aa8ff') : '#2d4170', lineHeight: 1 }}>
              {tab.icon}
            </span>
            <span style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 10,
              fontWeight: active ? 600 : 400,
              color: active ? (tab.id === 'admin' ? '#ff8080' : '#7aa8ff') : '#2d4170',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
