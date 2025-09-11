import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import React from 'react'
import ToastContainer from '../src/components/Toast'
import ProgressBar from '../src/components/ProgressBar'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: '네이버 쇼핑 순위 검색기',
  description: '네이버 쇼핑에서 상품 순위를 검색하고 비교하는 도구',
  keywords: ['네이버', '쇼핑', '순위', '검색', 'API', '분석'],
  authors: [{ name: '네이버 쇼핑 순위 검색기' }],
  creator: '네이버 쇼핑 순위 검색기',
  publisher: '네이버 쇼핑 순위 검색기',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://naver-ranking.vercel.app'),
  openGraph: {
    title: '네이버 쇼핑 순위 검색기',
    description: '네이버 쇼핑에서 상품 순위를 검색하고 비교하는 도구',
    url: 'https://naver-ranking.vercel.app',
    siteName: '네이버 쇼핑 순위 검색기',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '네이버 쇼핑 순위 검색기',
    description: '네이버 쇼핑에서 상품 순위를 검색하고 비교하는 도구',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="네이버 쇼핑 순위 검색기" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <ProgressBar />
          <ToastContainer />
          {children}
        </div>
      </body>
    </html>
  )
}