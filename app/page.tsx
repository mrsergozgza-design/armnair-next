'use client'
import { useState, useEffect, useMemo } from 'react'
import { Complex } from '@/lib/types'
import { FALLBACK } from '@/lib/data'
import { useFavorites } from '@/lib/useFavorites'
import { useCompare } from '@/lib/useCompare'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import FilterBar from '@/components/FilterBar'
import StatsRow from '@/components/StatsRow'
import SplitPanel from '@/components/SplitPanel'
import PropertyModal from '@/components/PropertyModal'
import ConsultModal from '@/components/ConsultModal'
import ComparisonModal from '@/components/ComparisonModal'
import AnalyticsPage from '@/components/analytics/AnalyticsPage'
import CatalogPage from '@/components/CatalogPage'

interface Filters {
  district: string; developer: string; price: number
  tax: string; status: string; search: string
}

const DEFAULT_FILTERS: Filters = { district:'', developer:'', price:9_999_999, tax:'', status:'', search:'' }

export default function Home() {
  const [data, setData]         = useState<Complex[]>([])
  const [filters, setFilters]   = useState<Filters>(DEFAULT_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [consultOpen, setConsultOpen] = useState(false)
  const [mapFocusId, setMapFocusId] = useState<string | null>(null)
  const [page, setPage]         = useState<'home' | 'analytics' | 'catalog'>('home')
  const [favOnly, setFavOnly]       = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)
  const { favorites, toggle: toggleFav, count: favCount } = useFavorites()
  const { compareIds, toggle: toggleCompare, remove: removeCompare, clear: clearCompare, count: compareCount } = useCompare()

  useEffect(() => {
    fetch('/api/properties')
      .then(r => r.ok ? r.json() : null)
      .then(j => setData(j?.complexes ?? FALLBACK))
      .catch(() => setData(FALLBACK))
  }, [])

  const filtered = useMemo(() => data.filter(c => {
    if (favOnly && !favorites.has(c.id)) return false
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
  }), [data, filters, favOnly, favorites])

  const selectedComplex = useMemo(
    () => selectedId ? (data.find(c => c.id === selectedId) ?? null) : null,
    [selectedId, data]
  )

  const compareComplexes = useMemo(
    () => compareIds.map(id => data.find(c => c.id === id)).filter(Boolean) as typeof data,
    [compareIds, data]
  )

  const handleNav = (p: 'home' | 'analytics' | 'catalog', anchor?: string) => {
    setPage(p)
    if (anchor) setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior:'smooth', block:'start' }), 60)
  }

  return (
    <>
      <Navbar activePage={page} onNav={handleNav} favCount={favCount} favOnly={favOnly} onFavFilter={() => setFavOnly(v => !v)} compareCount={compareCount} onOpenCompare={() => setCompareOpen(true)} />

      {page === 'analytics'
        ? <AnalyticsPage data={data} onOpenModal={setSelectedId} onBack={() => setPage('home')} />
        : page === 'catalog'
        ? <CatalogPage data={data} onOpenModal={setSelectedId} onBack={() => setPage('home')} favorites={favorites} onToggleFavorite={toggleFav} favOnly={favOnly} onClearFavOnly={() => setFavOnly(false)} compareIds={compareIds} onToggleCompare={toggleCompare} />
        : <>
            <Hero />
            <FilterBar filters={filters} onFiltersChange={setFilters} resultCount={filtered.length} data={data} />
            <StatsRow data={data} />
            <SplitPanel id="split-panel" complexes={filtered} onCardClick={setSelectedId} mapFocusId={mapFocusId} onMapFocusDone={() => setMapFocusId(null)} favorites={favorites} onToggleFavorite={toggleFav} favOnly={favOnly} onClearFavOnly={() => setFavOnly(false)} compareIds={compareIds} onToggleCompare={toggleCompare} />
            <footer style={{
              borderTop:'1px solid var(--border-c)',
              background:'var(--bg)',
              padding:'1.5rem 2rem',
              display:'flex', alignItems:'center', justifyContent:'space-between',
              transition:'background 0.25s, border-color 0.25s',
            }}>
              <span style={{ fontFamily:'var(--font-serif)', fontSize:'1.25rem', color:'var(--gold)', fontWeight:400 }}>
                ArmNair
              </span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--tm)', letterSpacing:'0.08em' }}>
                © 2026 ArmNair · Ереван · Армения
              </span>
            </footer>
          </>
      }

      <PropertyModal
        complex={selectedComplex}
        onClose={() => setSelectedId(null)}
        onOpenContact={() => setConsultOpen(true)}
        isFavorite={selectedId ? favorites.has(selectedId) : false}
        onToggleFavorite={() => selectedId && toggleFav(selectedId)}
        inCompare={selectedId ? compareIds.includes(selectedId) : false}
        onToggleCompare={() => selectedId && toggleCompare(selectedId)}
        onOpenMap={(id: string) => {
          setSelectedId(null)
          setMapFocusId(id)
          setTimeout(() => document.getElementById('right-panel')?.scrollIntoView({ behavior:'smooth' }), 100)
        }}
      />
      <ConsultModal open={consultOpen} onClose={() => setConsultOpen(false)} />
      {compareOpen && compareComplexes.length > 0 && (
        <ComparisonModal
          complexes={compareComplexes}
          onRemove={removeCompare}
          onClear={() => { clearCompare(); setCompareOpen(false) }}
          onClose={() => setCompareOpen(false)}
          onOpenModal={id => { setCompareOpen(false); setSelectedId(id) }}
        />
      )}
    </>
  )
}
