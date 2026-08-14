'use client'

import { useEffect, useState } from 'react'

interface Employee {
  id: string
  name: string
  email: string
  password: string
  color_index: number
}

export default function AdminPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  // 관리자 확인 및 직원 목록 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        window.location.href = '/login'
        return
      }

      try {
        const userData = JSON.parse(userStr)
        if (userData.role !== 'admin') {
          window.location.href = '/'
          return
        }

        setIsAuthorized(true)
        fetchEmployees()
      } catch (e) {
        console.error('Failed to parse user:', e)
        window.location.href = '/login'
      }
    }
  }, [])

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

  // 체크박스 토글
  const handleToggleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((empId) => empId !== id))
    } else {
      setSelected([...selected, id])
    }
  }

  // 모두 선택
  const handleSelectAll = () => {
    if (selected.length === employees.length) {
      setSelected([])
    } else {
      setSelected(employees.map((emp) => emp.id))
    }
  }

  // 선택된 직원 일괄 삭제
  const handleBulkDelete = async () => {
    console.log('handleBulkDelete 호출됨, selected:', selected)
    if (selected.length === 0) {
      setMessage('❌ 삭제할 직원을 선택해주세요')
      return
    }

    console.log('확인 다이얼로그 표시 중...')
    if (!confirm(`${selected.length}명의 직원을 정말 삭제하시겠습니까?`)) {
      console.log('사용자가 취소함')
      return
    }
    console.log('삭제 진행 중...')

    setLoading(true)
    try {
      let successCount = 0
      for (const id of selected) {
        const url = `/api/admin/employees/${id}`
        console.log('DELETE 요청:', url)
        const res = await fetch(url, {
          method: 'DELETE',
        })
        console.log('응답 상태:', res.status)
        const data = await res.json()
        console.log('응답 데이터:', data)
        if (res.ok) {
          successCount++
        }
      }

      setMessage(`✅ ${successCount}명의 직원이 삭제되었습니다`)
      setSelected([])
      fetchEmployees()
    } catch (error) {
      setMessage('❌ 삭제 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
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

  if (!isAuthorized) {
    return <div className="flex items-center justify-center h-screen">확인 중...</div>
  }

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
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          {selected.length > 0 && (
            <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center justify-between">
              <span className="font-medium text-blue-900">
                {selected.length}명 선택됨
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? '삭제 중...' : '선택된 직원 삭제'}
              </button>
            </div>
          )}
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-center w-12">
                  <input
                    type="checkbox"
                    checked={selected.length > 0 && selected.length === employees.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left font-bold">색상</th>
                <th className="px-6 py-3 text-left font-bold">이름</th>
                <th className="px-6 py-3 text-left font-bold">이메일</th>
                <th className="px-6 py-3 text-left font-bold">비밀번호</th>
                <th className="px-6 py-3 text-left font-bold">작업</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp.id}
                  className={`border-b hover:bg-gray-50 ${
                    selected.includes(emp.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(emp.id)}
                      onChange={() => handleToggleSelect(emp.id)}
                      disabled={emp.role === 'admin'}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </td>
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
