import Papa from 'papaparse'
import type { Complex, PricePoint, Unit } from './types'

const SPREADSHEET_ID = '1aJrXXy9P29U93reIW_V_nlPzu3axy5IGnXOmO5ETTNE'
// Первый лист — доступен без gid
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`
// /gviz/tq?tqx=out:csv поддерживает выбор листа по имени через &sheet=
// (в отличие от /export?format=csv, который игнорирует параметр sheet)
const PRICE_HISTORY_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Price%20History`
const UNITS_CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Units`

/**
 * Колонки листа (первая строка):
 * ID | Name | Developer | District | Price_AMD | Tax_Refund | Status |
 * Yield | Latitude | Longitude | Presentation_Link
 */

/**
 * Extract Google Drive FILE_ID from any Drive URL format.
 * Returns null for folder links or unrecognized formats.
 */
function extractDriveFileId(url: string): string | null {
  if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) return null
  if (url.includes('/folders/')) return null  // folder, not a file

  // /file/d/FILE_ID/...
  const filePath = url.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/)
  if (filePath) return filePath[1]

  // ?id=FILE_ID or &id=FILE_ID
  const idParam = url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/)
  if (idParam) return idParam[1]

  return null
}

/**
 * Convert any Google Drive share link to a browser-renderable thumbnail URL.
 * - File links  → https://drive.google.com/thumbnail?id=FILE_ID&sz=w1200
 * - Folder links → null (caller should store as media_folder)
 * - Non-Drive   → returned as-is
 */
function convertDriveUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  if (!trimmed.includes('drive.google.com') && !trimmed.includes('docs.google.com')) {
    return trimmed // non-Drive URL → keep as-is
  }

  if (trimmed.includes('/folders/')) return null // folder link → skip

  const fileId = extractDriveFileId(trimmed)
  if (fileId) {
    // thumbnail endpoint: works without redirect, reliable in <img> tags
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`
  }

  return null // unrecognized Drive URL → skip
}

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

  // Parse Main_Images: comma-separated URLs, convert Drive file links
  const rawImages = row['main_images']?.trim() ?? ''
  const rawUrls = rawImages
    .split(',')
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0 && s !== '-' && s !== '—')

  // Folder links inside Main_Images (used as media_folder fallback)
  const folderFromImages = rawUrls.find(u => u.includes('drive.google.com') && u.includes('/folders/'))

  // Convert each URL: Drive file links → uc?export=view, folder links → null (skip)
  const images = rawUrls
    .map(convertDriveUrl)
    .filter((u): u is string => u !== null)

  // First image for backward-compat `image` field
  const firstImage = images[0] ?? undefined

  const mediaFolder = row['media_folder_link']?.trim() || folderFromImages || undefined

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
    description:  row['description']?.trim() || row['описание']?.trim() || '',
    presentation: row['presentation_link']?.trim()   || undefined,
    image:        firstImage,
    images:       images.length > 0 ? images        : undefined,
    media_folder: mediaFolder,
    // Extended fields
    unit_type:    row['unit_type']?.trim()          || undefined,
    min_area:     row['min_area']?.trim()           || undefined,
    payment_plan: row['payment_plan']?.trim()       || undefined,
    subway_station: row['subway_station']?.trim()   || undefined,
    infrastructure: row['infrastructure']?.trim()   || undefined,
    commission:   row['commission']?.trim()         || undefined,
    contact:      row['contact']?.trim()            || undefined,
    website:      row['website']?.trim()            || undefined,
    developer_logo:        row['developer_logo']?.trim()        || undefined,
    developer_description: row['developer_description']?.trim() || undefined,
  }
}

async function fetchPriceHistory(): Promise<Record<string, PricePoint[]>> {
  const url = process.env.GOOGLE_SHEET_PRICE_HISTORY_CSV_URL ?? PRICE_HISTORY_CSV_URL
  try {
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) {
      console.warn('[googleSheets] Price History fetch failed:', res.status)
      return {}
    }
    const csvText = await res.text()
    const { data } = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim().toLowerCase().replace(/[\s,()]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, ''),
    })
    const map: Record<string, PricePoint[]> = {}
    for (const row of data) {
      const projectId = row['project_id']?.trim()
      const date = row['date']?.trim()
      const price = parseNum(row['price_per_m2'])
      if (!projectId || !date || !price) continue
      if (!map[projectId]) map[projectId] = []
      map[projectId].push({ month: date, price })
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.month.localeCompare(b.month))
    }
    console.log(`[googleSheets] Price History: ${Object.keys(map).length} проектов, ключи: ${Object.keys(map).join(', ')}`)
    return map
  } catch (err) {
    console.warn('[googleSheets] Price History exception:', err)
    return {}
  }
}

export async function fetchUnits(): Promise<Unit[]> {
  const url = process.env.GOOGLE_SHEET_UNITS_CSV_URL ?? UNITS_CSV_URL
  try {
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) {
      console.warn('[googleSheets] Units fetch failed:', res.status)
      return []
    }
    const csvText = await res.text()
    const { data } = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim().toLowerCase().replace(/[\s,()]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, ''),
    })
    return data
      .map(row => {
        const project_id = row['project_id']?.trim()
        const type = row['type']?.trim()
        const area_m2 = parseNum(row['area_m2'])
        const price_usd = parseNum(row['price_usd'])
        const status = row['status']?.trim()
        if (!project_id || !type) return null
        return { project_id, type, area_m2, price_usd, status } as Unit
      })
      .filter((u): u is Unit => u !== null)
  } catch (err) {
    console.warn('[googleSheets] Units exception:', err)
    return []
  }
}

export async function fetchComplexesFromSheets(): Promise<Complex[]> {
  const csvUrl = process.env.GOOGLE_SHEET_CSV_URL ?? CSV_URL

  const [response, priceHistory] = await Promise.all([
    fetch(csvUrl, { next: { revalidate: 60 } }),
    fetchPriceHistory(),
  ])
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
    .map(c => {
      const key = Object.keys(priceHistory).find(k => k === c.name)
        ?? Object.keys(priceHistory).find(k => k.toLowerCase() === c.name.toLowerCase())
      const history = key ? priceHistory[key] : []
      return history.length > 0 ? { ...c, history } : c
    })

  console.log(`[googleSheets] Загружено ${complexes.length} объектов из таблицы`)
  return complexes
}
