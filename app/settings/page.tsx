'use client'

import Sidebar from '@/components/Sidebar'

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentPage="settings" />

      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl space-y-6">
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
