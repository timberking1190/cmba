import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'CMBA — Calgary Minor Basketball', template: '%s | CMBA' },
  description: 'Official league management platform for Calgary Minor Basketball Association — schedules, standings, scores, and education.',
  keywords: ['Calgary', 'basketball', 'minor basketball', 'CMBA', 'youth sports', 'schedule', 'standings'],
  authors: [{ name: 'Calgary Minor Basketball Association' }],
  creator: 'Boost Innovation',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CMBA',
  },
  formatDetection: { telephone: true, email: true, address: true },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    siteName: 'CMBA',
    title: 'CMBA — Calgary Minor Basketball',
    description: 'Schedules, standings, scores and education for Calgary Minor Basketball.',
  },
  twitter: { card: 'summary_large_image', title: 'CMBA — Calgary Minor Basketball' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#CC0000' },
    { media: '(prefers-color-scheme: light)', color: '#CC0000' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA">
      <head>
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//jsjmomgghnyngguqydzt.supabase.co" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Preload critical font */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          as="style"
        />

        {/* Apple touch icon */}
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="icon" type="image/png" href="/logo.png" />

        {/* iOS splash screen meta */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Prevent phone number detection interfering with design */}
        <meta name="format-detection" content="telephone=no" />

        {/* MS tile */}
        <meta name="msapplication-TileColor" content="#CC0000" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body>
        {children}
        <Script id="register-sw" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').catch(() => {});
            });
          }
        `}</Script>
      </body>
    </html>
  )
}
