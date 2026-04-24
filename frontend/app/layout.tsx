import type { Metadata } from 'next'
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const syne = Syne({ 
  subsets: ["latin"],
  variable: '--font-syne',
  weight: ['700', '800']
})

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600']
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains',
  weight: ['400', '500']
})

export const metadata: Metadata = {
  title: 'TrustGuard AI — Dark Pattern Detection & UI Ethics Auditing',
  description: 'AI-powered dark pattern detection and UI ethics auditing platform. Scan any UI screenshot or live URL to surface manipulation tactics with severity scores and ethical fix suggestions.',
}

export const viewport = {
  themeColor: '#04070F',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} bg-bg-void`}>
      <body className="font-body antialiased text-text-primary">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0D1425',
              color: '#ffffff',
              borderRadius: '6px',
              border: '1px solid #334155',
              fontFamily: 'var(--font-dm-sans)',
            },
            success: {
              style: { border: '1px solid #34D399' },
            },
            error: {
              style: { border: '1px solid #F87171' },
            },
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
