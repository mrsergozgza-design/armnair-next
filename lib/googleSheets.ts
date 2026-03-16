import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import type { Complex, PricePoint } from './types'

/**
 * Ожидаемые колонки в Google Sheets (первая строка — заголовки):
 *
 * id | name | developer | district | price_amd | price_usd | status |
 * tax_refund | yield | last_updated | lat | lng | presentation |
 * description | image | history
 *
 * history — JSON-строка: [{"month":"Jan","price":1200000}, ...]
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToComplex(row: Record<string, any>): Complex | null {
  const id = row['id']?.toString().trim()
  const name = row['name']?.toString().trim()
  if (!id || !name) return null           // строка без id/name — пропускаем

  return {
    id,
    name,
    developer:    row['developer']?.toString().trim()    ?? '',
    district:     row['district']?.toString().trim()     ?? '',
    price_amd:    Number(row['price_amd'])               || 0,
    price_usd:    Number(row['price_usd'])               || 0,
    status:       row['status']?.toString().trim()       ?? '',
    tax_refund:   parseBoolean(row['tax_refund']?.toString()),
    yield:        row['yield']?.toString().trim()        ?? '0%',
    last_updated: row['last_updated']?.toString().trim() ?? '',
    lat:          Number(row['lat'])                     || 0,
    lng:          Number(row['lng'])                     || 0,
    presentation: row['presentation']?.toString().trim() || undefined,
    description:  row['description']?.toString().trim()  ?? '',
    image:        row['image']?.toString().trim()        || undefined,
    history:      parseHistory(row['history']?.toString()),
  }
}

export async function fetchComplexesFromSheets(): Promise<Complex[]> {
  const email      = process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const sheetId    = process.env.GOOGLE_SHEET_ID

  if (!email || !privateKey || !sheetId) {
    throw new Error(
      'Отсутствуют переменные окружения: GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID'
    )
  }

  const auth = new JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })

  const doc = new GoogleSpreadsheet(sheetId, auth)
  await doc.loadInfo()

  const sheet = doc.sheetsByIndex[0]
  const rows  = await sheet.getRows()

  const complexes = rows
    .map(row => rowToComplex(row.toObject()))
    .filter((c): c is Complex => c !== null)

  return complexes
}
