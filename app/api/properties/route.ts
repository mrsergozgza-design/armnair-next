import { NextResponse } from 'next/server'
import { fetchComplexesFromSheets } from '@/lib/googleSheets'
import { FALLBACK } from '@/lib/data'

export const revalidate = 60

export async function GET() {
  try {
    const complexes = await fetchComplexesFromSheets()
    if (complexes.length === 0) {
      console.warn('[/api/properties] Таблица пустая — используем FALLBACK')
      return NextResponse.json({ complexes: FALLBACK, source: 'fallback-empty' })
    }
    return NextResponse.json({ complexes })
  } catch (err) {
    console.error('[/api/properties] Ошибка:', err)
    return NextResponse.json({ complexes: FALLBACK, source: 'fallback-error' })
  }
}
