import { NextResponse } from 'next/server'
import { fetchUnits } from '@/lib/googleSheets'

export const revalidate = 60

export async function GET() {
  try {
    const units = await fetchUnits()
    return NextResponse.json({ units })
  } catch (err) {
    console.error('[/api/units] Ошибка:', err)
    return NextResponse.json({ units: [] })
  }
}
