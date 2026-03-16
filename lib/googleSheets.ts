import Papa from 'papaparse'
import type { Complex, PricePoint } from './types'

/**
 * Ожидаемые заголовки колонок в CSV (первая строка):
 *
 * id | name | developer | district | price_amd | price_usd | status |
 * tax_refund | yield | last_updated | lat | lng | presentation |
 * description | image | history
 *
 * history — JSON-строка: [{"month":"Jan","price":1200000}, ...]
 *           или формат:   Jan:1200000,Feb:1280000
 * tax_refund — TRUE / FALSE (или true/false, да/нет)
 */

function parseBoolean(val: string | undefined): boolean {
  if (!val) return false
  const v = val.trim().toLowerCase()
  return v === 'true' || v === '1' || v === 'да' || v === 'yes'
}

function parseHistory(val: string | undefined): PricePoint[] {
  if (!val) return []
  try {
    const parsed = JSON.parse(val)
    if (Array.isArray(parsed)) return parsed as PricePoint[]
  } catch {
    // не JSON — пробуем формат "Jan:1200000,Feb:1280000"
    return val.split(',').map(seg => {
      const [month, price] = seg.split(':')
      return { month: month?.trim() ?? '', price: Number(price) || 0 }
    }).filter(p => p.month)
  }
  return []
}

function rowToComplex(row: Record<string, string>): Complex | null {
  const id   = row['id']?.trim()
  const name = row['name']?.trim()
  if (!id || !name) return null   // пустая строка — пропускаем

  return {
    id,
    name,
    developer:    row['developer']?.trim()    ?? '',
    district:     row['district']?.trim()     ?? '',
    price_amd:    Number(row['price_amd'])    || 0,
    price_usd:    Number(row['price_usd'])    || 0,
    status:       row['status']?.trim()       ?? '',
    tax_refund:   parseBoolean(row['tax_refund']),
    yield:        row['yield']?.trim()        ?? '0%',
    last_updated: row['last_updated']?.trim() ?? '',
    lat:          Number(row['lat'])          || 0,
    lng:          Number(row['lng'])          || 0,
    presentation: row['presentation']?.trim() || undefined,
    description:  row['description']?.trim()  ?? '',
    image:        row['image']?.trim()        || undefined,
    history:      parseHistory(row['history']),
  }
}

export async function fetchComplexesFromSheets(): Promise<Complex[]> {
  const csvUrl = process.env.GOOGLE_SHEET_CSV_URL

  if (!csvUrl) {
    throw new Error('Отсутствует переменная окружения: GOOGLE_SHEET_CSV_URL')
  }

  const response = await fetch(csvUrl, {
    next: { revalidate: 300 },   // Next.js кэш — не дёргаем Google каждый запрос
  })

  if (!response.ok) {
    throw new Error(`Не удалось загрузить CSV: ${response.status} ${response.statusText}`)
  }

  const csvText = await response.text()

  const { data, errors } = Papa.parse<Record<string, string>>(csvText, {
    header: true,          // первая строка — заголовки
    skipEmptyLines: true,
    transformHeader: h => h.trim().toLowerCase().replace(/\s+/g, '_'),
  })

  if (errors.length) {
    console.warn('[googleSheets] Предупреждения при парсинге CSV:', errors.slice(0, 3))
  }

  return data
    .map(rowToComplex)
    .filter((c): c is Complex => c !== null)
}
