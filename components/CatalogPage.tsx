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

const DEFAULT_FILTERS: Filters = { district:'', developer:'', price:9_999_999, tax:'', status:'', search:'' }

type SortKey = 'default' | 'price_asc' | 'price_desc' | 'yield_desc'

interface Props {
  data: Complex[]
  onOpenModal: (id: string) => void
  onBack: () => void
  favorites?: Set<string>
  onToggleFavorite?: (id: string) => void
  favOnly?: boolean
  onClearFavOnly?: () => void
  compareIds?: string[]
  onToggleCompare?: (id: string) => void
  onShareFavorites?: () => void
}

export default function CatalogPage({ data, onOpenModal, onBack, favorites, onToggleFavorite, favOnly = false, onClearFavOnly, compareIds, onToggleCompare, onShareFavorites }: Props) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortKey>('default')

  const filtered = useMemo(() => {
    let result = data.filter(c => {
      if (favOnly && !favorites?.has(c.id))                       return false
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
  }, [data, filters, sort, favOnly, favorites])

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

      {/* Share favorites button */}
      {favOnly && favorites && favorites.size > 0 && (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 2rem 0.5rem' }}>
          <button
            onClick={onShareFavorites}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(37,211,102,0.08)',
              border: '1px solid rgba(37,211,102,0.3)',
              borderRadius: 4, padding: '0.7rem 1.25rem',
              color: '#25D366',
              fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,211,102,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(37,211,102,0.08)')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            ОТПРАВИТЬ ПОДБОРКУ В WHATSAPP
          </button>
        </div>
      )}

      {/* Grid */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 2rem 4rem' }}>
        {filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: 380, gap: 16,
          }}>
            <span style={{ fontSize: '3rem', opacity: 0.25 }}>{favOnly ? '♡' : '◻'}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--t3)', textAlign: 'center' }}>
              {favOnly ? 'В вашем списке избранного пока ничего нет' : 'Нет объектов по выбранным фильтрам'}
            </span>
            <button
              onClick={() => { setFilters(DEFAULT_FILTERS); onClearFavOnly?.() }}
              style={{
                marginTop: 8,
                fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.1em',
                padding: '0.6rem 1.5rem', cursor: 'pointer',
                background: 'rgba(160,120,32,0.1)',
                border: '1px solid rgba(160,120,32,0.45)',
                color: 'var(--gold-b)',
                borderRadius: 2,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.22)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.1)')}
            >
              ПОКАЗАТЬ ВСЕ ОБЪЕКТЫ
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {filtered.map(c => (
              <PropertyCard
                key={c.id} complex={c}
                onClick={() => onOpenModal(c.id)}
                isFavorite={favorites?.has(c.id)}
                onToggleFavorite={() => onToggleFavorite?.(c.id)}
                inCompare={compareIds?.includes(c.id)}
                onToggleCompare={() => onToggleCompare?.(c.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
