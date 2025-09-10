import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import React from 'react'
import ToastContainer from '../src/components/Toast'
import ProgressBar from '../src/components/ProgressBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '네이버 쇼핑 순위 검색기',
  description: '네이버 쇼핑에서 상품 순위를 검색하고 비교하는 도구',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <ProgressBar />
          <ToastContainer />
          {children}
        </div>
      </body>
    </html>
  )
}
