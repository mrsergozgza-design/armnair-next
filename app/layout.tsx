import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Mono, Outfit } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({ subsets:['latin'], weight:['300','400','500','600'], style:['normal','italic'], variable:'--font-serif' })
const dmMono    = DM_Mono({ subsets:['latin'], weight:['300','400','500'], variable:'--font-mono' })
const outfit    = Outfit({ subsets:['latin'], weight:['200','300','400','500'], variable:'--font-sans' })

export const metadata: Metadata = {
  title: 'ArmNair — Недвижимость Еревана',
  description: 'ArmNair — агрегатор жилых комплексов Еревана. Смотрите рынок недвижимости Армении насквозь.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${cormorant.variable} ${dmMono.variable} ${outfit.variable}`}>
        {children}
      </body>
    </html>
  )
}
