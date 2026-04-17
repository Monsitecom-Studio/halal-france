import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'Halal France — Annuaire des boucheries halal certifiées',
    template: '%s | Halal France',
  },
  description: 'Trouvez les meilleures boucheries halal certifiées près de chez vous. AVS, ARGML, Mosquée de Paris, ACMIF. 258+ boucheries référencées en France.',
  keywords: ['boucherie halal', 'halal france', 'certification halal', 'AVS', 'mosquée de paris'],
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
      <body className="bg-halal-cream text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
