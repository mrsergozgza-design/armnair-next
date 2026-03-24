'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export type Lang = 'en' | 'ru' | 'am'

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  mounted: boolean
}

const Ctx = createContext<LangCtx>({ lang: 'ru', setLang: () => {}, mounted: false })
export const useLang = () => useContext(Ctx)

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ru')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = (localStorage.getItem('armnair-lang') as Lang) ?? 'ru'
    setLangState(saved)
    document.documentElement.setAttribute('data-lang', saved)
    setMounted(true)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('armnair-lang', l)
    document.documentElement.setAttribute('data-lang', l)
  }

  return <Ctx.Provider value={{ lang, setLang, mounted }}>{children}</Ctx.Provider>
}
