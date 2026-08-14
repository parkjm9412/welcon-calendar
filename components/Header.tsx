'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getMonthName } from '@/lib/calendar-utils'

interface HeaderProps {
  currentDate: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

interface User {
  id: string
  name: string
  role?: string
}

export default function Header({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: HeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          setUser(JSON.parse(userStr))
        } catch (e) {
          console.error('Failed to parse user:', e)
        }
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            📅 {currentDate.getFullYear()}년 {getMonthName(currentDate.getMonth())}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* 로그인 상태 표시 */}
          <div className="text-sm text-gray-600 px-3 py-2 bg-gray-100 rounded-lg">
            {user ? (
              <span>
                👤 <strong>{user.name}</strong>
                {user.role === 'admin' && ' 🔐'}
              </span>
            ) : (
              <span>로그인 중...</span>
            )}
          </div>

          {/* 관리자 메뉴 */}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              ⚙️ 팀원 관리
            </Link>
          )}

          {/* 캘린더 네비게이션 */}
          <button
            onClick={onToday}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            오늘
          </button>
          <button
            onClick={onPrevMonth}
            className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            onClick={onNextMonth}
            className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            aria-label="Next month"
          >
            →
          </button>

          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  )
}
