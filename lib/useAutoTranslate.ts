'use client'
import { useState, useEffect, useRef } from 'react'
import type { Lang } from './LanguageContext'

const CACHE_PREFIX = 'armnair_tx_v2_'  // v2: cache key includes sourceLang
const LANG_CODE: Record<Lang, string> = { en: 'en', ru: 'ru', am: 'hy' }
const CHUNK_MAX = 450  // MyMemory's safe per-request limit

function cacheKey(id: string, field: string, sourceLang: Lang, targetLang: Lang) {
  return `${CACHE_PREFIX}${id}_${field}_${sourceLang}_${targetLang}`
}

function readCache(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

function writeCache(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* quota exceeded */ }
}

/** Remove cached translations for specific fields/id across all target languages. */
export function clearTranslationCache(cacheId: string, fields: string[], sourceLang: Lang) {
  const targets: Lang[] = ['en', 'ru', 'am']
  for (const field of fields) {
    for (const tl of targets) {
      try { localStorage.removeItem(cacheKey(cacheId, field, sourceLang, tl)) } catch { /* ignore */ }
    }
  }
}

/** Split text into chunks ≤ CHUNK_MAX chars, breaking at sentence boundaries. */
function chunkText(text: string): string[] {
  if (text.length <= CHUNK_MAX) return [text]
  const chunks: string[] = []
  const sentences = text.split(/(?<=[.!?])\s+/)
  let current = ''
  for (const s of sentences) {
    if (current.length + s.length + 1 > CHUNK_MAX && current) {
      chunks.push(current.trim())
      current = s
    } else {
      current = current ? current + ' ' + s : s
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks.length ? chunks : [text.slice(0, CHUNK_MAX)]
}

// Brand names that must never be translated
const BRAND_PLACEHOLDER = 'XBRANDNAIRX'
const BRANDS_RE = /\bArmNair\b/g

function protectBrands(text: string): string {
  return text.replace(BRANDS_RE, BRAND_PLACEHOLDER)
}
function restoreBrands(text: string): string {
  return text.replace(/XBRANDNAIRX/g, 'ArmNair')
}

async function translateChunk(text: string, sourceLang: Lang, targetLang: Lang, signal?: AbortSignal): Promise<string> {
  const protected_ = protectBrands(text)
  const langPair = `${LANG_CODE[sourceLang]}|${LANG_CODE[targetLang]}`
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(protected_)}&langpair=${langPair}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  const result: string = json?.responseData?.translatedText
  if (!result || json?.responseStatus !== 200) throw new Error('No translation')
  const restored = restoreBrands(result)
  // Guard for short strings only: if translation is suspiciously longer, API likely added garbage
  if (text.length < 80 && restored.length > text.length + 3) return text
  return restored
}

/** Translate text, splitting into chunks if it exceeds the API limit. */
async function translateText(text: string, sourceLang: Lang, targetLang: Lang, signal?: AbortSignal): Promise<string> {
  if (!text || targetLang === sourceLang) return text
  const chunks = chunkText(text)
  if (chunks.length === 1) return translateChunk(text, sourceLang, targetLang, signal)
  const translated: string[] = []
  for (let i = 0; i < chunks.length; i++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    translated.push(await translateChunk(chunks[i], sourceLang, targetLang, signal))
    if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 120))
  }
  return translated.join(' ')
}

/** Auto-translate a single text field, with localStorage caching.
 *  - If targetLang === sourceLang → return original immediately.
 *  - If cached → return from cache.
 *  - Otherwise → call MyMemory API (with chunking for long texts) and cache result.
 *  - On error → return original text (graceful fallback).
 */
export function useAutoTranslate(
  text: string | undefined,
  targetLang: Lang,
  cacheId: string,
  field: string,
  sourceLang: Lang = 'en',
): string {
  const [translated, setTranslated] = useState<string>('')
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!text) { setTranslated(''); return }
    if (targetLang === sourceLang) { setTranslated(text); return }

    const key = cacheKey(cacheId, field, sourceLang, targetLang)
    const cached = readCache(key)
    if (cached) { setTranslated(cached); return }

    // Show original while translating
    setTranslated(text)

    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    translateText(text, sourceLang, targetLang, ctrl.signal)
      .then(result => {
        writeCache(key, result)
        setTranslated(result)
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setTranslated(text)
      })

    return () => { ctrl.abort() }
  }, [text, targetLang, sourceLang, cacheId, field])

  return translated || text || ''
}

/** Batch translate multiple fields at once.
 *  Returns an object with the same keys, translated.
 *  Fields are translated independently and cached individually.
 */
export function useAutoTranslateBatch(
  fields: Record<string, string | undefined>,
  targetLang: Lang,
  cacheId: string,
  sourceLang: Lang = 'en',
): Record<string, string> {
  const [result, setResult] = useState<Record<string, string>>({})
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const entries = Object.entries(fields).filter(([, v]) => v)

    if (targetLang === sourceLang) {
      const out: Record<string, string> = {}
      entries.forEach(([k, v]) => { out[k] = v ?? '' })
      setResult(out)
      return
    }

    // Load cached immediately
    const out: Record<string, string> = {}
    const missing: string[] = []
    entries.forEach(([k, v]) => {
      const key = cacheKey(cacheId, k, sourceLang, targetLang)
      const cached = readCache(key)
      if (cached) { out[k] = cached } else { out[k] = v ?? ''; missing.push(k) }
    })
    setResult({ ...out })

    if (missing.length === 0) return

    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    // Translate missing fields sequentially (to respect rate limits for chunked texts)
    ;(async () => {
      for (let i = 0; i < missing.length; i++) {
        if (ctrl.signal.aborted) return
        const k = missing[i]
        const v = fields[k]
        if (!v) continue
        try {
          const translated = await translateText(v, sourceLang, targetLang, ctrl.signal)
          const key = cacheKey(cacheId, k, sourceLang, targetLang)
          writeCache(key, translated)
          setResult(prev => ({ ...prev, [k]: translated }))
        } catch {
          // Fallback: keep original text, do not cache (includes AbortError)
        }
        if (i < missing.length - 1) {
          await new Promise(r => setTimeout(r, 200))
        }
      }
    })()

    return () => { ctrl.abort() }
  }, [targetLang, sourceLang, cacheId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Bypass stale state — return originals synchronously when no translation needed.
  // This prevents a flash of the previous language's translation during lang switches.
  if (targetLang === sourceLang) {
    const out: Record<string, string> = {}
    Object.entries(fields).forEach(([k, v]) => { if (v) out[k] = v })
    return out
  }
  return result
}
