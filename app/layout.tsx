import type { Metadata } from 'next'
import { initializeDatabase } from '@/lib/db'
import './globals.css'

export const metadata: Metadata = {
  title: 'Welcon Team Calendar',
  description: 'Team calendar management system',
}

// 서버 시작 시 데이터베이스 초기화
initializeDatabase()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  )
}
