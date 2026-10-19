import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

const notoSans = localFont({
  src: './fonts/NotoSans.ttf',
  display: 'swap',
  variable: '--font-noto-sans',
  weight: '400 700',
})
const notoSansThai = localFont({
  src: './fonts/NotoSansThai.ttf',
  display: 'swap',
  variable: '--font-noto-sans-thai',
  weight: '400 700',
})
const notoSansMono = localFont({
  src: './fonts/NotoSansMono.ttf',
  display: 'swap',
  variable: '--font-noto-sans-mono',
  weight: '400 700',
})

export const metadata: Metadata = {
  title: 'ReadLead · 阅先 — นิยายจีนออนไลน์',
  description: 'แพลตฟอร์มอ่านนิยายจีน มังงะ และ Audiobook คุณภาพสูง',
}

export default function RootLayout({
  children,
  auth,
}: {
  children: React.ReactNode
  auth: React.ReactNode
}) {
  return (
    <html lang="th" className={`${notoSans.variable} ${notoSansThai.variable} ${notoSansMono.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-background">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          {auth}
        </Providers>
      </body>
    </html>
  )
}
