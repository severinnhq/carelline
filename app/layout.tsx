import { Metadata } from 'next'
import { Sora } from 'next/font/google'
import localFont from 'next/font/local'
import { CountdownProvider } from '@/lib/CountdownContext'
import { LayoutWrapper } from '@/components/LayoutWrapper'
import { Analytics } from '@vercel/analytics/react'
import Script from 'next/script'
import './globals.css'

// Initialize the Sora font for body text
const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sora',
})

// Initialize the Geist font for headings
const geist = localFont({
  src: [
    {
      path: "../public/fonts/Geist-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Geist-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Geist-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Geist-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist",
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
    <html lang="en" className={`${sora.variable} ${geist.variable} font-sans`}>
      <head>
        <link rel="preload" href="/fonts/good-times.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* Favicon Links */}
        <link rel="icon" type="image/png" href="/favicon16.png" sizes="16x16" />
        <link rel="icon" type="image/png" href="/favicon32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/favicon64.png" sizes="64x64" />
        <link rel="icon" type="image/png" href="/favicon96.png" sizes="96x96" />
        <link rel="icon" type="image/png" href="/favicon128.png" sizes="128x128" />
        <link rel="icon" type="image/png" href="/favicon192.png" sizes="192x192" />
        
        {/* Google Analytics Measurement Tag */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-J473T9YXMD`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-J473T9YXMD');
          `}
        </Script>
      </head>
      <body className="font-sora">
        <CountdownProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </CountdownProvider>
        <Analytics />
        
        {/* Meta Pixel Noscript */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=9200175736698365&ev=PageView&noscript=1"
          />
        </noscript>
      </body>
    </html>
  )
}