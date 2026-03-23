'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
interface ThemeCtx { theme: Theme; toggle: () => void; mounted: boolean }

const Ctx = createContext<ThemeCtx>({ theme: 'light', toggle: () => {}, mounted: false })
export const useTheme = () => useContext(Ctx)

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = (localStorage.getItem('armnair-theme') as Theme) ?? 'light'
    setTheme(saved)
    document.documentElement.classList.toggle('dark', saved === 'dark')
    setMounted(true)
  }, [])

  const toggle = () => {
    setTheme(t => {
      const next: Theme = t === 'light' ? 'dark' : 'light'
      localStorage.setItem('armnair-theme', next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      return next
    })
  }

  return <Ctx.Provider value={{ theme, toggle, mounted }}>{children}</Ctx.Provider>
}
