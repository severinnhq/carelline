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
  title: 'Minden másodperc számít',
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
        {/* Favicon Links */}
        <link rel="icon" type="image/png" href="/favicon16.png" sizes="16x16" />
        <link rel="icon" type="image/png" href="/favicon32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/favicon64.png" sizes="64x64" />
        <link rel="icon" type="image/png" href="/favicon96.png" sizes="96x96" />
        <link rel="icon" type="image/png" href="/favicon128.png" sizes="128x128" />
        <link rel="icon" type="image/png" href="/favicon192.png" sizes="192x192" />
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
