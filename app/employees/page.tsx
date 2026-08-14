'use client'

export default function EmployeesPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <p>직원 페이지</p>
    </div>
  )
}
import { getEmployeeColor } from '@/lib/calendar-utils'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      const data = await response.json()
      setEmployees(data || [])
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    }
  }

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('이름과 이메일을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          color_index: employees.length % 13,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add employee')
      }

      setFormData({ name: '', email: '' })
      setIsAddModalOpen(false)
      await fetchEmployees()
    } catch (error) {
      console.error('Error adding employee:', error)
      alert('직원 추가에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentPage="employees" />

      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">팀원 관리</h1>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + 팀원 추가
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl">
            {/* Employee Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="bg-white rounded-lg shadow p-4 border-l-4"
                  style={{ borderColor: getEmployeeColor(employee.color_index) }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getEmployeeColor(employee.color_index) }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {employee.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{employee.email}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        가입: {new Date(employee.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {employees.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 mb-4">아직 팀원이 없습니다.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  첫 번째 팀원 추가
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">팀원 추가</h2>
            </div>

            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 김철수"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일 *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: chulsu@welconsystems.com"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '추가 중...' : '추가'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setFormData({ name: '', email: '' })
                  }}
                  disabled={loading}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
