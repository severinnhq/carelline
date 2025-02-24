import { Metadata } from 'next'
import { Sora } from 'next/font/google'
import { CountdownProvider } from '@/lib/CountdownContext'
import { LayoutWrapper } from '@/components/LayoutWrapper'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

// Initialize the Sora font
const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sora',
})

export const metadata: Metadata = {
  title: 'Every Second Counts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${sora.variable} font-sans`}>
      <head>
        <link
          rel="preload"
          href="/fonts/good-times.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <CountdownProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </CountdownProvider>
        <Analytics />
      </body>
    </html>
  )
}