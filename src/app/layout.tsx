import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const viewport: Viewport = {
  themeColor: '#1a6b3c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'Halal France — Annuaire des boucheries halal certifiées',
    template: '%s | Halal France',
  },
  description: 'Trouvez les meilleures boucheries halal certifiées près de chez vous. AVS, ARGML, Mosquée de Paris, ACMIF. 258+ boucheries référencées en France.',
  keywords: ['boucherie halal', 'halal france', 'certification halal', 'AVS', 'mosquée de paris'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Halal France',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'Halal France',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="bg-halal-cream text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
