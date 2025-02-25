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

        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '9200175736698365');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body>
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