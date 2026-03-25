'use client'
import { MapPin, Search, X } from 'lucide-react'
import { Complex } from '@/lib/types'
import { useLang } from '@/lib/LanguageContext'
import { useT, useTStatus, useTDistrict } from '@/lib/StaticTranslationProvider'
import { useIsMobile } from '@/lib/useIsMobile'

interface Filters {
  district: string; developer: string; price: number
  tax: string; status: string; search: string
}
interface FilterBarProps {
  filters: Filters
  onFiltersChange: (f: Filters) => void
  resultCount: number
  data: Complex[]
}

export default function FilterBar({ filters, onFiltersChange, resultCount, data }: FilterBarProps) {
  const isMobile = useIsMobile()
  const { lang } = useLang()
  const tr = useT()
  const tStatus = useTStatus()
  const tDistrict = useTDistrict()
  const districts  = Array.from(new Set(data.map(c => c.district))).sort()
  const developers = Array.from(new Set(data.map(c => c.developer))).sort()
  const statuses   = Array.from(new Set(data.map(c => c.status))).sort()

  const set = (k: keyof Filters, v: string | number) => onFiltersChange({ ...filters, [k]: v })
  const reset = () => onFiltersChange({ district:'', developer:'', price:9_999_999, tax:'', status:'', search:'' })
  const hasFilters = filters.district || filters.developer || filters.price < 9_999_999 || filters.tax || filters.status || filters.search

  const objLabel = () => {
    if (lang !== 'ru') return `${resultCount} ${tr('filter.objects')}`
    if (resultCount === 1) return `${resultCount} ${tr('filter.objects')}`
    if (resultCount >= 2 && resultCount <= 4) return `${resultCount} ${tr('filter.objects2')}`
    return `${resultCount} ${tr('filter.objectsN')}`
  }

  return (
    <div style={{
      position:'sticky', top:64, zIndex:40,
      background:'var(--filter-bg)',
      backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
      borderBottom:'1px solid var(--border-c)',
      transition:'background 0.25s, border-color 0.25s',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap: isMobile ? 5 : 8, flexWrap:'wrap', padding: isMobile ? '0.5rem 0.75rem' : '0.6rem 2rem' }}>
        {/* City pill */}
        <div style={{
          display:'flex', alignItems:'center', gap:5,
          background:'rgba(42,157,143,0.10)', border:'1px solid rgba(42,157,143,0.28)',
          borderRadius:100, padding:'0.3rem 0.8rem',
          fontFamily:'var(--font-mono)', fontSize:'0.7rem', letterSpacing:'0.08em',
          color:'var(--teal)',
        }}>
          <MapPin size={11} />
          <span>{tr('filter.city')}</span>
        </div>

        <div style={{ width:1, height:20, background:'var(--border-c)' }} />

        {/* Search */}
        <div style={{
          display:'flex', alignItems:'center', gap:6,
          border:'1px solid var(--border-c)', borderRadius:100,
          padding:'0.3rem 0.75rem', background:'var(--input-bg)',
          minWidth: isMobile ? 100 : 160, transition:'border-color 0.2s, background 0.25s',
        }}>
          <Search size={11} color="var(--t3)" />
          <input
            id="filter-search-input" type="text" placeholder={tr('filter.search')} value={filters.search}
            onChange={e => set('search', e.target.value)}
            style={{
              background:'none', border:'none', outline:'none',
              fontFamily:'var(--font-mono)', fontSize: isMobile ? '0.62rem' : '0.72rem',
              color:'var(--t2)', width: isMobile ? 70 : 120, letterSpacing:'0.04em',
            }}
          />
          {filters.search && (
            <button onClick={() => set('search', '')} style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', color:'var(--t3)' }}>
              <X size={11} />
            </button>
          )}
        </div>

        <select className="pill-sel" value={filters.district} onChange={e => set('district', e.target.value)}>
          <option value="">{tr('filter.district')}</option>
          {districts.map(d => <option key={d} value={d}>{tDistrict(d)}</option>)}
        </select>

        <select className="pill-sel" value={filters.developer} onChange={e => set('developer', e.target.value)}>
          <option value="">{tr('filter.developer')}</option>
          {developers.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select className="pill-sel" value={filters.price} onChange={e => set('price', Number(e.target.value))}>
          <option value={9_999_999}>{tr('filter.price')}</option>
          <option value={50_000}>{tr('filter.price50')}</option>
          <option value={100_000}>{tr('filter.price100')}</option>
          <option value={200_000}>{tr('filter.price200')}</option>
          <option value={500_000}>{tr('filter.price500')}</option>
        </select>

        <select className="pill-sel" value={filters.status} onChange={e => set('status', e.target.value)}>
          <option value="">{tr('filter.status')}</option>
          {statuses.map(s => <option key={s} value={s}>{tStatus(s)}</option>)}
        </select>

        <select className="pill-sel" value={filters.tax} onChange={e => set('tax', e.target.value)}>
          <option value="">{tr('filter.taxRefund')}</option>
          <option value="yes">{tr('filter.taxYes')}</option>
          <option value="no">{tr('filter.taxNo')}</option>
        </select>

        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:'var(--gold)', letterSpacing:'0.06em' }}>
            {objLabel()}
          </span>
          {hasFilters && (
            <button onClick={reset} style={{
              fontFamily:'var(--font-mono)', fontSize:'0.65rem', letterSpacing:'0.08em',
              color:'var(--t3)', background:'none', border:'1px solid var(--border-c)',
              borderRadius:100, padding:'0.25rem 0.8rem', cursor:'pointer', transition:'color 0.2s, border-color 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color='var(--gold)'; e.currentTarget.style.borderColor='var(--gold)' }}
              onMouseLeave={e => { e.currentTarget.style.color='var(--t3)'; e.currentTarget.style.borderColor='var(--border-c)' }}
            >
              {tr('filter.reset')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
