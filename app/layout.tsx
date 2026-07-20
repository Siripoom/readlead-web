import type { Metadata } from 'next'
import { Noto_Sans, Noto_Sans_Mono, Noto_Sans_Thai } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

const notoSans = Noto_Sans({
  variable: '--font-noto-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})
const notoSansThai = Noto_Sans_Thai({
  variable: '--font-noto-sans-thai',
  subsets: ['thai'],
  weight: ['400', '500', '600', '700'],
})
const notoSansMono = Noto_Sans_Mono({
  variable: '--font-noto-sans-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
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
