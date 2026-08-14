'use client'

import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      window.location.href = '/login'
    } else {
      window.location.href = '/admin'
    }
  }, [])

  return (
    <div className="flex items-center justify-center h-screen">
      <p>리다이렉트 중...</p>
    </div>
  )
}
