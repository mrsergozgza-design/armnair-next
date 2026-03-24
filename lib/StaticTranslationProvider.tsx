'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useLang } from './LanguageContext'
import T, { t, statusKey, districtKey } from './translations'

const CACHE_PREFIX = 'armnair_ui_am_v4_'

type TrFn = (key: string) => string

const Ctx = createContext<TrFn>((key) => key)

export function useT(): TrFn {
  return useContext(Ctx)
}

export function useTStatus(): (status: string) => string {
  const tr = useT()
  return useCallback((status: string) => tr(statusKey(status)) || status, [tr])
}

export function useTDistrict(): (district: string) => string {
  const tr = useT()
  return useCallback((district: string) => tr(districtKey(district)) || district, [tr])
}

const BRAND_PLACEHOLDER = 'XBRANDNAIRX'

function protectBrands(text: string): string {
  return text.replace(/\bArmNair\b/g, BRAND_PLACEHOLDER)
}
function restoreBrands(text: string): string {
  return text.replace(/XBRANDNAIRX/g, 'ArmNair')
}

async function translateText(text: string): Promise<string> {
  const protected_ = protectBrands(text)
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(protected_)}&langpair=en|hy`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Translation failed')
  const data = await res.json()
  const translated = restoreBrands(data.responseData?.translatedText ?? text)
  // MyMemory sometimes returns Latin transliteration for short strings — use English fallback in that case
  const hasArmenian = /[\u0531-\u058F]/.test(translated)
  return hasArmenian ? translated : restoreBrands(text)
}

export default function StaticTranslationProvider({ children }: { children: React.ReactNode }) {
  const { lang } = useLang()
  const [amCache, setAmCache] = useState<Record<string, string>>({})

  useEffect(() => {
    if (lang !== 'am') return

    // Load existing cache from localStorage
    const cached: Record<string, string> = {}
    const allKeys = Object.keys(T)
    const missing: string[] = []

    for (const key of allKeys) {
      // Skip keys with manually pre-set Armenian values (am !== en means already translated)
      const entry = T[key]
      if (entry && entry.am !== entry.en) continue
      const stored = localStorage.getItem(CACHE_PREFIX + key)
      if (stored) {
        cached[key] = stored
      } else {
        missing.push(key)
      }
    }

    setAmCache(cached)

    if (missing.length === 0) return

    let cancelled = false

    async function translateBatch() {
      for (let i = 0; i < missing.length; i += 3) {
        if (cancelled) return
        const batch = missing.slice(i, i + 3)

        await Promise.all(batch.map(async (key) => {
          const enText = T[key]?.en ?? key
          try {
            const translated = await translateText(enText)
            if (!cancelled) {
              localStorage.setItem(CACHE_PREFIX + key, translated)
              setAmCache(prev => ({ ...prev, [key]: translated }))
            }
          } catch {
            // fallback to English — do not cache so we retry next time
          }
        }))

        if (i + 3 < missing.length && !cancelled) {
          await new Promise(r => setTimeout(r, 150))
        }
      }
    }

    translateBatch()

    return () => { cancelled = true }
  }, [lang])

  const tr = useCallback((key: string): string => {
    if (lang === 'am') {
      return amCache[key] ?? t(key, 'am')
    }
    return t(key, lang)
  }, [lang, amCache])

  return <Ctx.Provider value={tr}>{children}</Ctx.Provider>
}
