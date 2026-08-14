import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Welcon Team Calendar',
  description: 'Team calendar management system',
}

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
