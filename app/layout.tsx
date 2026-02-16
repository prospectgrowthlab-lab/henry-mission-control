import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Henry Mission Control',
  description: 'OpenClaw Agent Henry - Mission Control Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
