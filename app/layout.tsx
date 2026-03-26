import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Mono, Outfit, Noto_Sans_Armenian } from 'next/font/google'
import ThemeProvider from '@/components/ThemeProvider'
import LanguageProvider from '@/lib/LanguageContext'
import StaticTranslationProvider from '@/lib/StaticTranslationProvider'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'], weight: ['300','400','500','600'],
  style: ['normal','italic'], variable: '--font-serif',
})
const dmMono = DM_Mono({
  subsets: ['latin'], weight: ['300','400','500'], variable: '--font-mono',
})
const outfit = Outfit({
  subsets: ['latin'], weight: ['200','300','400','500'], variable: '--font-sans',
})
const notoArmenian = Noto_Sans_Armenian({
  subsets: ['armenian'], weight: ['300','400','500'], variable: '--font-armenian',
})

export const metadata: Metadata = {
  title: 'ArmNair — Real Estate Yerevan',
  description: 'ArmNair — Yerevan residential complex aggregator. Up-to-date data on the Armenian real estate market.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme/lang */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var t = localStorage.getItem('armnair-theme') || 'light';
            if (t === 'dark') document.documentElement.classList.add('dark');
          })()
        `}} />
      </head>
      <body className={`${cormorant.variable} ${dmMono.variable} ${outfit.variable} ${notoArmenian.variable}`}>
        <LanguageProvider>
          <StaticTranslationProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </StaticTranslationProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
