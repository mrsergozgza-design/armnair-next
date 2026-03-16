'use client'
import { MapPin, Search, X } from 'lucide-react'
import { Complex } from '@/lib/types'

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
  const districts  = Array.from(new Set(data.map(c => c.district))).sort()
  const developers = Array.from(new Set(data.map(c => c.developer))).sort()
  const statuses   = Array.from(new Set(data.map(c => c.status))).sort()

  const set = (k: keyof Filters, v: string | number) => onFiltersChange({ ...filters, [k]: v })
  const reset = () => onFiltersChange({ district:'', developer:'', price:10000, tax:'', status:'', search:'' })
  const hasFilters = filters.district || filters.developer || filters.price < 10000 || filters.tax || filters.status || filters.search

  return (
    <div style={{
      position:'sticky', top:64, zIndex:40,
      background:'var(--filter-bg)',
      backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
      borderBottom:'1px solid var(--border-c)',
      transition:'background 0.25s, border-color 0.25s',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', padding:'0.6rem 2rem' }}>
        {/* City pill */}
        <div style={{
          display:'flex', alignItems:'center', gap:5,
          background:'rgba(42,157,143,0.10)', border:'1px solid rgba(42,157,143,0.28)',
          borderRadius:100, padding:'0.3rem 0.8rem',
          fontFamily:'var(--font-mono)', fontSize:'0.7rem', letterSpacing:'0.08em',
          color:'var(--teal)',
        }}>
          <MapPin size={11} />
          <span>Ереван</span>
        </div>

        <div style={{ width:1, height:20, background:'var(--border-c)' }} />

        {/* Search */}
        <div style={{
          display:'flex', alignItems:'center', gap:6,
          border:'1px solid var(--border-c)', borderRadius:100,
          padding:'0.3rem 0.75rem', background:'var(--input-bg)',
          minWidth:160, transition:'border-color 0.2s, background 0.25s',
        }}>
          <Search size={11} color="var(--t3)" />
          <input
            type="text" placeholder="Поиск..." value={filters.search}
            onChange={e => set('search', e.target.value)}
            style={{
              background:'none', border:'none', outline:'none',
              fontFamily:'var(--font-mono)', fontSize:'0.72rem',
              color:'var(--t2)', width:120, letterSpacing:'0.04em',
            }}
          />
          {filters.search && (
            <button onClick={() => set('search', '')} style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', color:'var(--t3)' }}>
              <X size={11} />
            </button>
          )}
        </div>

        <select className="pill-sel" value={filters.district} onChange={e => set('district', e.target.value)}>
          <option value="">Район</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select className="pill-sel" value={filters.developer} onChange={e => set('developer', e.target.value)}>
          <option value="">Застройщик</option>
          {developers.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select className="pill-sel" value={filters.price} onChange={e => set('price', Number(e.target.value))}>
          <option value={10000}>Цена: любая</option>
          <option value={2000}>до $2 000/м²</option>
          <option value={3500}>до $3 500/м²</option>
          <option value={5000}>до $5 000/м²</option>
          <option value={7500}>до $7 500/м²</option>
        </select>

        <select className="pill-sel" value={filters.status} onChange={e => set('status', e.target.value)}>
          <option value="">Статус</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select className="pill-sel" value={filters.tax} onChange={e => set('tax', e.target.value)}>
          <option value="">Нал. возврат</option>
          <option value="yes">Есть</option>
          <option value="no">Нет</option>
        </select>

        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:'var(--gold)', letterSpacing:'0.06em' }}>
            {resultCount} объект{resultCount === 1 ? '' : resultCount >= 2 && resultCount <= 4 ? 'а' : 'ов'}
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
              Сброс
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
