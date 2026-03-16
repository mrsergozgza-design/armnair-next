'use client'
import { useState, useMemo } from 'react'
import { Complex } from '@/lib/types'
import { fmtAmd, statusStyle, freshLabel, priceGrowth, parseYield } from '@/lib/utils'
import FilterBar from './FilterBar'
import PropertyCard from './PropertyCard'
import { ArrowUpDown } from 'lucide-react'

interface Filters {
  district: string; developer: string; price: number
  tax: string; status: string; search: string
}

const DEFAULT_FILTERS: Filters = { district:'', developer:'', price:10000, tax:'', status:'', search:'' }

type SortKey = 'default' | 'price_asc' | 'price_desc' | 'yield_desc'

interface Props {
  data: Complex[]
  onOpenModal: (id: string) => void
  onBack: () => void
}

export default function CatalogPage({ data, onOpenModal, onBack }: Props) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortKey>('default')

  const filtered = useMemo(() => {
    let result = data.filter(c => {
      if (filters.district  && c.district  !== filters.district)  return false
      if (filters.developer && c.developer !== filters.developer) return false
      if (c.price_usd > filters.price)                            return false
      if (filters.tax === 'yes' && !c.tax_refund)                 return false
      if (filters.tax === 'no'  &&  c.tax_refund)                 return false
      if (filters.status && c.status !== filters.status)          return false
      if (filters.search) {
        const hay = (c.name + ' ' + c.district + ' ' + c.developer).toLowerCase()
        if (!hay.includes(filters.search.toLowerCase())) return false
      }
      return true
    })
    if (sort === 'price_asc')  result = [...result].sort((a,b) => a.price_usd - b.price_usd)
    if (sort === 'price_desc') result = [...result].sort((a,b) => b.price_usd - a.price_usd)
    if (sort === 'yield_desc') result = [...result].sort((a,b) => parseYield(b.yield) - parseYield(a.yield))
    return result
  }, [data, filters, sort])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 64 }}>
      {/* Filter bar */}
      <FilterBar filters={filters} onFiltersChange={setFilters} resultCount={filtered.length} data={data} />

      {/* Page header */}
      <div style={{
        maxWidth: 1400, margin: '0 auto', padding: '1.5rem 2rem 0.75rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
              color: 'var(--t3)', letterSpacing: '0.08em',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--t3)')}
          >
            ← Главная
          </button>
          <span style={{ color: 'var(--tm)' }}>/</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gold)' }}>Каталог</span>
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArrowUpDown size={12} color="var(--t3)" />
          <select
            className="pill-sel"
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
          >
            <option value="default">По умолчанию</option>
            <option value="price_asc">Цена ↑</option>
            <option value="price_desc">Цена ↓</option>
            <option value="yield_desc">Доходность ↓</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 2rem 4rem' }}>
        {filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: 300, color: 'var(--tm)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', gap: 8,
          }}>
            <span style={{ fontSize: '2.5rem', opacity: 0.3 }}>◻</span>
            <span>Нет объектов по выбранным фильтрам</span>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {filtered.map(c => (
              <PropertyCard key={c.id} complex={c} onClick={() => onOpenModal(c.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
