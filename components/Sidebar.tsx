'use client'

import Link from 'next/link'

interface SidebarProps {
  currentPage: string
}

export default function Sidebar({ currentPage }: SidebarProps) {
  const navItems = [
    { label: '캘린더', href: '/', id: 'calendar' },
    { label: '팀원 관리', href: '/employees', id: 'employees' },
    { label: '설정', href: '/settings', id: 'settings' },
  ]

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">Welcon Calendar</h1>
        <p className="text-sm text-gray-400">팀 일정 관리</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`block px-4 py-2 rounded-lg transition-colors ${
              currentPage === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
          로그아웃
        </button>
      </div>
    </aside>
  )
}
