import { useState, useEffect } from 'react'
import { syncAllCalendars } from '@/lib/googleCalendarSync'
import { getSyncLogs, getLatestSyncLog } from '@/lib/database'

interface SyncLog {
  id: string
  started_at: string
  completed_at?: string
  total_events: number
  status: 'running' | 'completed' | 'failed'
  results: Array<{
    success: boolean
    employeeEmail: string
    employeeName: string
    eventsCount: number
    error?: string
  }>
}

export function AdminCalendarSync() {
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([])
  const [latestLog, setLatestLog] = useState<SyncLog | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')

  // 동기화 로그 로드
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const logs = await getSyncLogs(5)
        setSyncLogs(logs)
        const latest = await getLatestSyncLog()
        setLatestLog(latest)
      } catch (e) {
        console.error('로그 로드 실패:', e)
      }
    }
    loadLogs()
  }, [])

  // 수동 동기화
  const handleSync = async () => {
    setSyncing(true)
    setError('')
    try {
      const log = await syncAllCalendars()
      setLatestLog(log)
      setSyncLogs(prev => [log, ...prev.slice(0, 4)])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
      console.error('동기화 오류:', e)
    } finally {
      setSyncing(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const formatDuration = (start: string, end?: string) => {
    if (!end) return '진행 중...'
    const s = new Date(start).getTime()
    const e = new Date(end).getTime()
    const ms = e - s
    const sec = Math.floor(ms / 1000)
    if (sec < 60) return `${sec}초`
    const min = Math.floor(sec / 60)
    return `${min}분 ${sec % 60}초`
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 16, color: '#0f1f3d', margin: '0 0 12px 0' }}>
          📅 구글 캘린더 동기화
        </h2>
        <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#6b82a8', margin: 0, marginBottom: 16 }}>
          모든 직원의 구글 캘린더를 자동으로 동기화합니다.
        </p>

        {/* 최신 동기화 상태 */}
        {latestLog && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 14, color: '#0f1f3d', marginBottom: 4 }}>
                  마지막 동기화: {formatDate(latestLog.started_at)}
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#8c9ab8' }}>
                  {latestLog.status === 'running' ? '동기화 중...' : `소요 시간: ${formatDuration(latestLog.started_at, latestLog.completed_at)}`}
                </div>
              </div>
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: latestLog.status === 'completed' ? '#d1fae5' : latestLog.status === 'failed' ? '#fee2e2' : '#fef3c7',
                color: latestLog.status === 'completed' ? '#0ca678' : latestLog.status === 'failed' ? '#dc2626' : '#b45309',
              }}>
                {latestLog.status === 'completed' ? '✅ 완료' : latestLog.status === 'failed' ? '❌ 실패' : '⏳ 진행 중'}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div style={{ backgroundColor: '#f8fafd', borderRadius: 8, padding: 12 }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8', marginBottom: 4 }}>전체 이벤트</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, color: '#2f6bff' }}>
                  {latestLog.total_events}
                </div>
              </div>
              <div style={{ backgroundColor: '#f8fafd', borderRadius: 8, padding: 12 }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8', marginBottom: 4 }}>성공</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, color: '#0ca678' }}>
                  {latestLog.results?.filter(r => r.success).length ?? 0}
                </div>
              </div>
              <div style={{ backgroundColor: '#f8fafd', borderRadius: 8, padding: 12 }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#8c9ab8', marginBottom: 4 }}>실패</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, color: '#ef4444' }}>
                  {latestLog.results?.filter(r => !r.success).length ?? 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 동기화 버튼 */}
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: syncing ? '#8c9ab8' : '#2f6bff',
            color: '#ffffff',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            cursor: syncing ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: syncing ? 0.6 : 1,
          }}
        >
          {syncing ? '🔄 동기화 중...' : '🚀 지금 동기화'}
        </button>

        {error && (
          <div style={{ marginTop: 12, padding: '12px 14px', backgroundColor: '#fee2e2', borderRadius: 8, fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#dc2626' }}>
            ❌ {error}
          </div>
        )}
      </div>

      {/* 동기화 이력 */}
      <div>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 14, color: '#0f1f3d', marginBottom: 12 }}>
          📋 동기화 이력
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {syncLogs.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#8c9ab8', fontFamily: 'Outfit, sans-serif' }}>
              동기화 기록이 없습니다
            </div>
          ) : (
            syncLogs.map(log => (
              <div key={log.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 13, color: '#0f1f3d' }}>
                      {formatDate(log.started_at)}
                    </div>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#8c9ab8', marginTop: 2 }}>
                      {log.status === 'completed'
                        ? `소요 시간: ${formatDuration(log.started_at, log.completed_at)}`
                        : log.status === 'failed'
                        ? '실패'
                        : '진행 중'}
                    </div>
                  </div>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    backgroundColor: log.status === 'completed' ? '#d1fae5' : log.status === 'failed' ? '#fee2e2' : '#fef3c7',
                    color: log.status === 'completed' ? '#0ca678' : log.status === 'failed' ? '#dc2626' : '#b45309',
                  }}>
                    {log.status === 'completed' ? '✅ 완료' : log.status === 'failed' ? '❌ 실패' : '⏳ 진행 중'}
                  </div>
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#6b82a8' }}>
                  📊 {log.total_events}개 이벤트 · 성공: {log.results?.filter(r => r.success).length ?? 0} · 실패: {log.results?.filter(r => !r.success).length ?? 0}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
