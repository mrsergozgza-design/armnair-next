import Papa from 'papaparse'
import type { Complex } from './types'

const CSV_URL = 'https://docs.google.com/spreadsheets/d/1scuCyAhUuHGh_XQVDbUWQEgdrP5lI1gzMUS4A9Uy8aE/export?format=csv&gid=0'

function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/[^a-zа-яёa-z0-9\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
}

function parseNum(val: string | undefined): number {
  if (!val) return 0
  return Number(val.replace(/[\s,]/g, '')) || 0
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function rowToComplex(row: Record<string, string>, index: number): Complex | null {
  const developer = row['developer']?.trim()
  const location  = row['location']?.trim()
  if (!developer && !location) return null

  const priceAmd  = parseNum(row['min_price_amd'])
  const priceUsd  = Math.round(priceAmd / 390)
  const unitType  = row['unit_type']?.trim() || undefined
  const payPlan   = row['payment_plan']?.trim() || undefined
  const website   = row['сайт,_ссылка']?.trim() || row['website']?.trim() || undefined

  const name = unitType
    ? `${developer} — ${unitType}`
    : developer ?? 'Unnamed'

  // Slight coordinate offset so markers don't stack exactly
  const latOffset = (index % 7 - 3) * 0.003
  const lngOffset = (Math.floor(index / 7) % 5 - 2) * 0.003

  return {
    id:           slugify(`${developer ?? ''}-${location ?? ''}-${unitType ?? ''}-${index}`),
    name,
    developer:    developer ?? '',
    district:     location  ?? '',
    price_amd:    priceAmd,
    price_usd:    priceUsd,
    status:       'Available',
    tax_refund:   false,
    yield:        payPlan ?? '—',
    last_updated: today(),
    lat:          40.1872 + latOffset,
    lng:          44.515  + lngOffset,
    history:      [],
    description:  row['преимущества']?.trim() ?? '',
    presentation: website,
    website,
    unit_type:    unitType,
    min_area:     row['min_total_area,_м2']?.trim() || undefined,
    payment_plan: payPlan,
    subway_station: row['subway_stancion']?.trim() || undefined,
    infrastructure: row['school/kindergarten/mall/university']?.trim() || undefined,
    commission:   row['commission,_%']?.trim() || undefined,
    contact:      row['контактное_лицо_(почта,_тел)']?.trim() || undefined,
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
    // Normalise header: lowercase, spaces/commas/brackets → underscores
    transformHeader: h => h.trim()
      .toLowerCase()
      .replace(/[\s,()]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, ''),
  })

  if (errors.length) {
    console.warn('[googleSheets] CSV parse warnings:', errors.slice(0, 3))
  }

  return data
    .map((row, i) => rowToComplex(row, i))
    .filter((c): c is Complex => c !== null)
}
