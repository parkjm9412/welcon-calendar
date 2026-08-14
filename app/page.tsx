'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Calendar from '@/components/Calendar'
import EventModal from '@/components/EventModal'
import EmployeeList from '@/components/EmployeeList'
import Sidebar from '@/components/Sidebar'
import { CalendarEvent, Employee } from '@/types'

export default function Home() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [employees, setEmployees] = useState<Employee[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // 로그인 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        router.push('/login')
        return
      }
    }
  }, [router])

  // Fetch employees and events on mount and when date changes
  useEffect(() => {
    fetchData()
  }, [currentDate])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchEmployees(), fetchEvents()])
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      const data = await response.json()
      setEmployees(data || [])
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    }
  }

  const fetchEvents = async () => {
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const startDate = new Date(year, month, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

      const response = await fetch(
        `/api/events?startDate=${startDate}&endDate=${endDate}`
      )
      const data = await response.json()
      setEvents(data || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedEvent(null)
    setIsModalOpen(true)
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setSelectedDate(null)
    setIsModalOpen(true)
  }

  const handleSaveEvent = async (eventData: any) => {
    try {
      const method = eventData.id ? 'PUT' : 'POST'
      const response = await fetch('/api/events', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        throw new Error('Failed to save event')
      }

      // Refresh events
      await fetchEvents()
    } catch (error) {
      console.error('Error saving event:', error)
      alert('일정 저장에 실패했습니다.')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events?id=${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      // Refresh events
      await fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('일정 삭제에 실패했습니다.')
    }
  }

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentPage="calendar" />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-3">
              <Calendar
                events={events}
                employees={employees}
                currentDate={currentDate}
                onDayClick={handleDayClick}
                onEventClick={handleEventClick}
              />
            </div>

            {/* Sidebar with employee list */}
            <div>
              <EmployeeList employees={employees} />
            </div>
          </div>
        </div>
      </main>

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        selectedDate={selectedDate}
        employees={employees}
        event={selectedEvent}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedEvent(null)
          setSelectedDate(null)
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  )
}
