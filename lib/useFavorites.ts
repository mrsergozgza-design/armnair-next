'use client'
import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'armnair_favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setFavorites(new Set(JSON.parse(stored) as string[]))
    } catch {}
  }, [])

  const toggle = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])) } catch {}
      return next
    })
  }, [])

  const clear = useCallback(() => {
    setFavorites(new Set())
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  return { favorites, toggle, clear, count: favorites.size }
}
