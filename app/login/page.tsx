'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 한글 이름만 추출 (괄호 제거 → 한글만 추출)
      const cleanName = name
        .replace(/\([^)]*\)/g, '') // (관리자) 같은 괄호 제거
        .replace(/[^가-힣]/g, '') // 한글만 남김
        .trim()
      console.log('로그인 시도:', { original: name, cleanName, password })

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, password }),
      })

      console.log('응답 상태:', res.status)

      const data = await res.json()
      console.log('응답 데이터:', data)

      if (res.ok && data.employee) {
        console.log('로그인 성공:', data.employee)
        localStorage.setItem('user', JSON.stringify(data.employee))
        console.log('localStorage 저장 확인:', localStorage.getItem('user'))
        router.push('/')
      } else {
        const errorMsg = data.message || '로그인 실패했습니다'
        console.log('로그인 실패:', errorMsg)
        setError(errorMsg)
      }
    } catch (err) {
      console.error('로그인 오류:', err)
      setError('네트워크 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const employees = [
    '🔐 박종미 (관리자)',
    '김철수',
    '이영희',
    '박민준',
    '최지은',
    '정준호',
    '강미영',
    '이광순',
    '현수빈',
    '송민정',
    '한승준',
    '조세희',
    '윤나영',
    '배지현',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2">🗓️</h1>
          <h2 className="text-2xl font-bold text-gray-900">Welcon Calendar</h2>
          <p className="text-gray-600 mt-2">팀원 일정 관리 시스템</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              직원 선택
            </label>
            <select
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">선택하세요</option>
              {employees.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="비밀번호"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <label htmlFor="showPassword" className="text-sm text-gray-600 cursor-pointer">
                비밀번호 표시
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name || !password}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">📝 로그인 정보:</p>
          <p className="text-xs text-gray-600 mb-1">
            <strong>관리자:</strong> <code className="bg-white px-2 py-1 rounded text-blue-600">admin123</code>
          </p>
          <p className="text-xs text-gray-600">
            <strong>직원:</strong> <code className="bg-white px-2 py-1 rounded text-blue-600">1234</code>
          </p>
        </div>
      </div>
    </div>
  )
}
