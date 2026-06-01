import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CMBA — Calgary Minor Basketball Association',
  description: 'Official league management platform for Calgary Minor Basketball Association',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
