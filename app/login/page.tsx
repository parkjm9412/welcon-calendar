'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      })

      const data = await res.json()

      if (res.ok) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.employee))
          setTimeout(() => {
            router.push('/')
          }, 100)
        }
      } else {
        setError(data.message || '로그인 실패')
      }
    } catch (err) {
      setError('오류가 발생했습니다')
      console.error(err)
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
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
          🗓️ Welcon Calendar
        </h1>
        <p className="text-center text-gray-600 mb-8">팀원 일정 관리 시스템</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              직원 선택
            </label>
            <select
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                {showPassword ? '숨기기' : '표시'}
              </button>
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
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700 font-medium mb-2">📝 로그인 정보:</p>
          <p className="text-sm text-gray-600">
            <strong>관리자:</strong> admin123
          </p>
          <p className="text-sm text-gray-600">
            <strong>직원:</strong> 1234
          </p>
        </div>
      </div>
    </div>
  )
}
