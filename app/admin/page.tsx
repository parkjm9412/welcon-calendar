'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Employee {
  id: string
  name: string
  email: string
  password: string
  color_index: number
}

export default function AdminPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // 관리자 확인 및 직원 목록 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        router.push('/login')
        return
      }

      try {
        const userData = JSON.parse(userStr)
        if (userData.role !== 'admin') {
          router.push('/')
          return
        }

        fetchEmployees()
      } catch (e) {
        console.error('Failed to parse user:', e)
        router.push('/login')
      }
    }
  }, [router])

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees')
      const data = await res.json()
      setEmployees(data)
    } catch (error) {
      setMessage('직원 목록을 불러올 수 없습니다')
    }
  }

  // 직원 추가
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newPassword) {
      setMessage('이름과 비밀번호를 입력해주세요')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
        }),
      })

      if (res.ok) {
        setMessage('✅ 직원이 추가되었습니다')
        setNewName('')
        setNewEmail('')
        setNewPassword('')
        fetchEmployees()
      } else {
        setMessage('❌ 추가 실패')
      }
    } catch (error) {
      setMessage('오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  // 직원 삭제
  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/admin/employees/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMessage('✅ 직원이 삭제되었습니다')
        fetchEmployees()
      }
    } catch (error) {
      setMessage('❌ 삭제 실패')
    }
  }

  // 비밀번호 변경
  const handlePasswordChange = async (id: string) => {
    const newPwd = prompt('새 비밀번호 입력:')
    if (!newPwd) return

    try {
      const res = await fetch(`/api/admin/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPwd }),
      })

      if (res.ok) {
        setMessage('✅ 비밀번호가 변경되었습니다')
        fetchEmployees()
      }
    } catch (error) {
      setMessage('❌ 변경 실패')
    }
  }

  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-cyan-500',
    'bg-orange-500',
    'bg-lime-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-emerald-500',
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🔐 관리자 페이지</h1>

        {/* 직원 추가 폼 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">직원 추가</h2>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="이름"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="px-4 py-2 border rounded"
              />
              <input
                type="email"
                placeholder="이메일"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="px-4 py-2 border rounded"
              />
              <input
                type="text"
                placeholder="비밀번호"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="px-4 py-2 border rounded"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '추가 중...' : '추가'}
            </button>
          </form>
          {message && (
            <p className="mt-4 text-sm font-medium">{message}</p>
          )}
        </div>

        {/* 직원 목록 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-bold">색상</th>
                <th className="px-6 py-3 text-left font-bold">이름</th>
                <th className="px-6 py-3 text-left font-bold">이메일</th>
                <th className="px-6 py-3 text-left font-bold">비밀번호</th>
                <th className="px-6 py-3 text-left font-bold">작업</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div
                      className={`w-6 h-6 rounded ${
                        colors[emp.color_index]
                      }`}
                    ></div>
                  </td>
                  <td className="px-6 py-4 font-medium">{emp.name}</td>
                  <td className="px-6 py-4 text-gray-600">{emp.email}</td>
                  <td className="px-6 py-4 font-mono text-sm">{emp.password}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => handlePasswordChange(emp.id)}
                      className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                    >
                      비밀번호 변경
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-gray-600 text-sm mt-6">
          💡 팁: 각 직원의 비밀번호를 개별 설정하여 보안을 높일 수 있습니다
        </p>
      </div>
    </div>
  )
}
