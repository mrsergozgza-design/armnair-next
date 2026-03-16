import Papa from 'papaparse'
import type { Complex } from './types'

// Первый лист — доступен без gid
const CSV_URL = 'https://docs.google.com/spreadsheets/d/1aJrXXy9P29U93reIW_V_nlPzu3axy5IGnXOmO5ETTNE/export?format=csv'

/**
 * Колонки листа (первая строка):
 * ID | Name | Developer | District | Price_AMD | Tax_Refund | Status |
 * Yield | Latitude | Longitude | Presentation_Link
 */

function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
}

function parseNum(val: string | undefined): number {
  if (!val) return 0
  return Number(val.replace(/[\s,]/g, '')) || 0
}

function parseBool(val: string | undefined): boolean {
  if (!val) return false
  const v = val.trim().toLowerCase()
  return v === 'да' || v === 'true' || v === '1' || v === 'yes'
}

// "Arabkir (A. Hakobyan St.)" → "Arabkir"
function baseDistrict(val: string): string {
  return val.split('(')[0].trim()
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function rowToComplex(row: Record<string, string>): Complex | null {
  const name      = row['name']?.trim()
  const developer = row['developer']?.trim()
  if (!name && !developer) return null

  const priceAmd  = parseNum(row['price_amd'])
  const priceUsd  = Math.round(priceAmd / 390)
  const lat       = parseFloat(row['latitude']  || '') || 0
  const lng       = parseFloat(row['longitude'] || '') || 0
  const rawId     = row['id']?.trim()
  const district  = baseDistrict(row['district'] ?? '')

  return {
    id:           rawId ? slugify(`${rawId}-${name ?? ''}`) : slugify(`${name ?? ''}-${district}`),
    name:         name         ?? developer ?? 'Unnamed',
    developer:    developer    ?? '',
    district,
    price_amd:    priceAmd,
    price_usd:    priceUsd,
    status:       row['status']?.trim()              ?? 'Available',
    tax_refund:   parseBool(row['tax_refund']),
    yield:        row['yield']?.trim()               ?? '—',
    last_updated: today(),
    lat,
    lng,
    history:      [],
    description:  '',
    presentation: row['presentation_link']?.trim()   || undefined,
    // Extended fields not in this sheet — undefined by default
  }
}

export async function fetchComplexesFromSheets(): Promise<Complex[]> {
  const csvUrl = process.env.GOOGLE_SHEET_CSV_URL ?? CSV_URL

  const response = await fetch(csvUrl, { next: { revalidate: 60 } })
  if (!response.ok) {
    throw new Error(`CSV fetch failed: ${response.status} ${response.statusText}`)
  }

  const csvText = await response.text()

  const { data, errors } = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim()
      .toLowerCase()
      .replace(/[\s,()]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, ''),
  })

  if (errors.length) {
    console.warn('[googleSheets] CSV parse warnings:', errors.slice(0, 3))
  }

  const complexes = data
    .map(rowToComplex)
    .filter((c): c is Complex => c !== null)

  console.log(`[googleSheets] Загружено ${complexes.length} объектов из таблицы`)
  return complexes
}
