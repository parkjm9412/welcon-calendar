'use client'

import { Employee } from '@/types'
import { getEmployeeColor } from '@/lib/calendar-utils'

interface EmployeeListProps {
  employees: Employee[]
  onAddEmployee?: () => void
}

export default function EmployeeList({ employees, onAddEmployee }: EmployeeListProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">팀원 ({employees.length}명)</h2>
        {onAddEmployee && (
          <button
            onClick={onAddEmployee}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            추가
          </button>
        )}
      </div>

      <div className="space-y-2">
        {employees.length === 0 ? (
          <p className="text-gray-500 text-sm">팀원이 없습니다.</p>
        ) : (
          employees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getEmployeeColor(employee.color_index) }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                <p className="text-xs text-gray-500">{employee.email}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
