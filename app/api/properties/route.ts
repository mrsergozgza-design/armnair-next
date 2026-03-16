import { NextResponse } from 'next/server'
import { fetchComplexesFromSheets } from '@/lib/googleSheets'
import { FALLBACK } from '@/lib/data'

// Кэшируем ответ на 5 минут — не долбим Google Sheets на каждый запрос
export const revalidate = 300

export async function GET() {
  try {
    const complexes = await fetchComplexesFromSheets()
    return NextResponse.json({ complexes }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
    })
  } catch (err) {
    // Если Google Sheets недоступны — отдаём FALLBACK данные
    console.error('[/api/properties] Ошибка получения данных из Google Sheets:', err)
    return NextResponse.json(
      { complexes: FALLBACK, source: 'fallback' },
      { status: 200 }               // 200, чтобы фронт не ломался
    )
  }
}
