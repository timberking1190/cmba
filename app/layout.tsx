import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { SplashScreen } from '@/components/ui/SplashScreen'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'CMBA — Calgary Minor Basketball', template: '%s | CMBA' },
  description: 'Official league management platform for Calgary Minor Basketball Association — schedules, standings, scores, and education.',
  keywords: ['Calgary', 'basketball', 'minor basketball', 'CMBA', 'youth sports'],
  authors: [{ name: 'Calgary Minor Basketball Association' }],
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'CMBA' },
  formatDetection: { telephone: true, email: true, address: true },
  openGraph: { type: 'website', locale: 'en_CA', siteName: 'CMBA', title: 'CMBA — Calgary Minor Basketball' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [{ color: '#CC0000' }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA">
      <head>
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//vdlpmjmpaalesmddwabo.supabase.co" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="icon" type="image/png" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>
        {/* Skip navigation — WCAG 2.4.1 */}
        <a href="#main-content" className="skip-link">Skip to main content</a>

        {/* Splash — mobile only, once per session */}
        <SplashScreen />

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
