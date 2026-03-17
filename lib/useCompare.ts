'use client'
import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'armnair_compare'
const MAX_COMPARE = 4

export function useCompare() {
  const [compareIds, setCompareIds] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setCompareIds(JSON.parse(stored) as string[])
    } catch {}
  }, [])

  const toggle = useCallback((id: string) => {
    setCompareIds(prev => {
      let next: string[]
      if (prev.includes(id)) {
        next = prev.filter(x => x !== id)
      } else if (prev.length >= MAX_COMPARE) {
        return prev
      } else {
        next = [...prev, id]
      }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const remove = useCallback((id: string) => {
    setCompareIds(prev => {
      const next = prev.filter(x => x !== id)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const clear = useCallback(() => {
    setCompareIds([])
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  return { compareIds, toggle, remove, clear, count: compareIds.length, maxReached: compareIds.length >= MAX_COMPARE }
}
