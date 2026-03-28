'use client'
import { useEffect, useRef, useState } from 'react'
import { MapPin, Search, X } from 'lucide-react'
import { Complex } from '@/lib/types'
import { useLang } from '@/lib/LanguageContext'
import { useT, useTStatus, useTDistrict } from '@/lib/StaticTranslationProvider'
import { useIsMobile } from '@/lib/useIsMobile'
import { statusKey } from '@/lib/translations'

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

interface DropdownOption { value: string | number; label: string; _active?: boolean }

function Dropdown({ options, onChange, isMobile }: {
  options: DropdownOption[]
  onChange: (v: string | number) => void
  isMobile: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = options.find(o => o._active) ?? options[0]
  const isActive = !!options.find(o => o._active)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: isActive ? 'rgba(184,148,42,0.1)' : 'var(--input-bg)',
          border: `1px solid ${isActive ? 'rgba(184,148,42,0.4)' : 'var(--border-c)'}`,
          borderRadius: 20,
          padding: isMobile ? '0.28rem 0.6rem' : '0.3rem 0.75rem',
          fontFamily: 'var(--font-mono)',
          fontSize: isMobile ? '0.62rem' : '0.72rem',
          color: isActive ? 'var(--gold)' : 'var(--t2)',
          cursor: 'pointer',
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
          transition: 'border-color 0.2s, background 0.2s',
        }}
      >
        <span>{current.label}</span>
        <svg
          width="9" height="6" viewBox="0 0 10 6"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}
        >
          <path d="M5 6L0 0h10z" fill="#b8942a" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 5px)', left: 0,
          background: 'var(--card)', border: '1px solid var(--border-c)',
          borderRadius: 10, minWidth: '100%', zIndex: 200,
          boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}>
          {options.map((opt, i) => (
            <div
              key={i}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              style={{
                padding: '0.42rem 0.9rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: opt._active ? 'var(--gold)' : 'var(--t2)',
                background: opt._active ? 'rgba(184,148,42,0.08)' : 'transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(184,148,42,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.background = opt._active ? 'rgba(184,148,42,0.08)' : 'transparent')}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

type Option = DropdownOption

export default function FilterBar({ filters, onFiltersChange, resultCount, data }: FilterBarProps) {
  const isMobile = useIsMobile()
  const { lang } = useLang()
  const tr = useT()
  const tStatus = useTStatus()
  const tDistrict = useTDistrict()
  const districts  = Array.from(new Set(data.map(c => c.district))).sort()
  const developers = Array.from(new Set(data.map(c => c.developer))).sort()
  // Deduplicate statuses by normalized key (e.g. "Underconstruction" and "Under Construction" → same entry)
  const statuses = Array.from(
    data.reduce((map, c) => {
      const k = statusKey(c.status)
      if (!map.has(k)) map.set(k, c.status)
      return map
    }, new Map<string, string>()).values()
  ).sort()

  const set = (k: keyof Filters, v: string | number) => onFiltersChange({ ...filters, [k]: v })
  const reset = () => onFiltersChange({ district:'', developer:'', price:9_999_999, tax:'', status:'', search:'' })
  const hasFilters = filters.district || filters.developer || filters.price < 9_999_999 || filters.tax || filters.status || filters.search

  const objLabel = () => {
    if (lang !== 'ru') return `${resultCount} ${tr('filter.objects')}`
    if (resultCount === 1) return `${resultCount} ${tr('filter.objects')}`
    if (resultCount >= 2 && resultCount <= 4) return `${resultCount} ${tr('filter.objects2')}`
    return `${resultCount} ${tr('filter.objectsN')}`
  }

  const districtOpts: Option[] = [
    { value: '', label: tr('filter.district'), _active: false },
    ...districts.map(d => ({ value: d, label: tDistrict(d), _active: filters.district === d })),
  ]

  const developerOpts: Option[] = [
    { value: '', label: tr('filter.developer'), _active: false },
    ...developers.map(d => ({ value: d, label: d, _active: filters.developer === d })),
  ]

  const priceOpts: Option[] = [
    { value: 9_999_999, label: tr('filter.price'),    _active: false },
    { value: 50_000,    label: tr('filter.price50'),  _active: filters.price === 50_000 },
    { value: 100_000,   label: tr('filter.price100'), _active: filters.price === 100_000 },
    { value: 200_000,   label: tr('filter.price200'), _active: filters.price === 200_000 },
    { value: 500_000,   label: tr('filter.price500'), _active: filters.price === 500_000 },
  ]

  const statusOpts: Option[] = [
    { value: '', label: tr('filter.status'), _active: false },
    ...statuses.map(s => ({ value: s, label: tStatus(s), _active: filters.status === s })),
  ]

  const taxOpts: Option[] = [
    { value: '',    label: tr('filter.taxRefund'), _active: false },
    { value: 'yes', label: tr('filter.taxYes'),   _active: filters.tax === 'yes' },
    { value: 'no',  label: tr('filter.taxNo'),    _active: filters.tax === 'no' },
  ]

  return (
    <div style={{
      position:'sticky', top:64, zIndex:40,
      background:'var(--filter-bg)',
      backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
      borderBottom:'1px solid var(--border-c)',
      transition:'background 0.25s, border-color 0.25s',
    }}>
      <div key={lang} className="animate-fade" style={{ display:'flex', alignItems:'center', gap: isMobile ? 5 : 8, flexWrap:'wrap', padding: isMobile ? '0.5rem 0.75rem' : '0.6rem 2rem' }}>
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

        <Dropdown options={districtOpts}  onChange={v => set('district', v)}  isMobile={isMobile} />
        <Dropdown options={developerOpts} onChange={v => set('developer', v)} isMobile={isMobile} />
        <Dropdown options={priceOpts}     onChange={v => set('price', v)}     isMobile={isMobile} />
        <Dropdown options={statusOpts}    onChange={v => set('status', v)}    isMobile={isMobile} />
        <Dropdown options={taxOpts}       onChange={v => set('tax', v)}       isMobile={isMobile} />

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
