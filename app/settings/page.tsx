'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setUserId(user.id)
    }
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('❌ 모든 필드를 입력해주세요')
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage('❌ 새 비밀번호가 일치하지 않습니다')
      return
    }

    if (newPassword.length < 4) {
      setMessage('❌ 비밀번호는 4자 이상이어야 합니다')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword,
        }),
      })

      if (res.ok) {
        setMessage('✅ 비밀번호가 변경되었습니다')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const error = await res.json()
        setMessage(`❌ ${error.message || '비밀번호 변경 실패'}`)
      }
    } catch (error) {
      setMessage('❌ 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentPage="settings" />

      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl space-y-6">
            {/* Password Change */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <h2 className="text-lg font-bold text-gray-900 mb-4">🔐 비밀번호 변경</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    현재 비밀번호
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="현재 비밀번호"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    새 비밀번호
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="새 비밀번호"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    새 비밀번호 확인
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="새 비밀번호 확인"
                  />
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="ml-2 text-sm text-gray-700">비밀번호 표시</span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? '변경 중...' : '비밀번호 변경'}
                </button>

                {message && <p className="text-sm font-medium">{message}</p>}
              </form>
            </div>
            {/* General Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">일반 설정</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    팀 이름
                  </label>
                  <input
                    type="text"
                    defaultValue="Welcon"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    팀 설명
                  </label>
                  <textarea
                    defaultValue="Web 개발팀"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Google Calendar Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Google Calendar</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="font-medium text-gray-900">Google Calendar 동기화</p>
                    <p className="text-sm text-gray-600">
                      일정을 자동으로 Google Calendar에 추가합니다
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    연결
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">알림 설정</h2>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="ml-2 text-gray-700">이메일 알림 활성화</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="ml-2 text-gray-700">일정 변경 시 알림</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="ml-2 text-gray-700">하루 전 알림</span>
                </label>
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">테마</h2>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input type="radio" name="theme" defaultChecked className="w-4 h-4" />
                  <span className="ml-2 text-gray-700">밝은 테마</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="theme" className="w-4 h-4" />
                  <span className="ml-2 text-gray-700">어두운 테마</span>
                </label>
              </div>
            </div>

            {/* API Keys (Development) */}
            <div className="bg-white rounded-lg shadow p-6 border border-yellow-200 bg-yellow-50">
              <h2 className="text-lg font-bold text-gray-900 mb-4">개발자 정보</h2>
              <div className="space-y-4 text-sm text-gray-700">
                <p>📖 더 자세한 설정 방법은 <strong>SETUP.md</strong> 문서를 확인하세요.</p>
                <p>🔑 API 키는 <strong>.env.local</strong> 파일에 설정해야 합니다.</p>
                <p>📞 문제가 있으면 개발팀에 문의해주세요.</p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-2">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                저장
              </button>
              <button className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">
                취소
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
