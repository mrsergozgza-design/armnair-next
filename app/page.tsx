'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Complex } from '@/lib/types'
import { FALLBACK } from '@/lib/data'
import { useFavorites } from '@/lib/useFavorites'
import { useCompare } from '@/lib/useCompare'
import { useLang } from '@/lib/LanguageContext'
import { useT } from '@/lib/StaticTranslationProvider'
import { useToast } from '@/lib/ToastContext'
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
import MobileTabBar from '@/components/MobileTabBar'

interface Filters {
  district: string; developer: string; price: number
  tax: string; status: string; search: string
}

const DEFAULT_FILTERS: Filters = { district:'', developer:'', price:9_999_999, tax:'', status:'', search:'' }

export default function Home() {
  const { lang } = useLang()
  const tr = useT()
  const { showToast } = useToast()
  const [data, setData]         = useState<Complex[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters]   = useState<Filters>(DEFAULT_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [consultOpen, setConsultOpen] = useState(false)
  const [mobileMapTrigger, setMobileMapTrigger] = useState(0)
  const [mapFocusId, setMapFocusId] = useState<string | null>(null)
  const [pendingPropertyId, setPendingPropertyId] = useState<string | null>(null)
  const [page, setPage]         = useState<'home' | 'analytics' | 'catalog'>('home')
  const [scrolled, setScrolled]     = useState(false)
  const [favOnly, setFavOnly]       = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)
  const [collectionMode, setCollectionMode] = useState(false)
  const [collectionIds, setCollectionIds]   = useState<string[]>([])
  const { favorites, toggle: toggleFav, count: favCount } = useFavorites()
  const { compareIds, toggle: toggleCompare, remove: removeCompare, clear: clearCompare, count: compareCount } = useCompare()

  useEffect(() => {
    fetch('/api/properties')
      .then(r => r.ok ? r.json() : null)
      .then(j => { setData(j?.complexes ?? FALLBACK); setIsLoading(false) })
      .catch(() => { setData(FALLBACK); setIsLoading(false) })
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Read ?property= from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('property')
    if (id) setPendingPropertyId(id)
  }, [])

  // Open modal once data is loaded and a pending property id is set
  useEffect(() => {
    if (pendingPropertyId && data.length > 0) {
      setSelectedId(pendingPropertyId)
      setPendingPropertyId(null)
    }
  }, [data, pendingPropertyId])

  // Sync ?property= param with open modal
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (selectedId) {
      url.searchParams.set('property', selectedId)
      window.history.pushState(null, '', url.toString())
    } else if (url.searchParams.has('property')) {
      url.searchParams.delete('property')
      window.history.replaceState(null, '', url.toString())
    }
  }, [selectedId])

  // Detect ?shared=... in URL → collection mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ids = params.get('shared')
    if (ids) {
      const idList = ids.split(',').filter(Boolean)
      setCollectionIds(idList)
      setCollectionMode(true)
    }
  }, [])

  const exitCollectionMode = () => {
    setCollectionMode(false)
    setCollectionIds([])
    window.history.replaceState({}, '', window.location.pathname)
  }

  const handleShareFavorites = () => {
    const ids = Array.from(favorites).join(',')
    if (!ids) return
    const shareUrl = `${window.location.origin}/?shared=${ids}`
    const text = lang === 'ru'
      ? `Здравствуйте! Специально для вас подготовлена персональная подборка объектов недвижимости в Ереване от ArmNair:\n${shareUrl}`
      : `Hello! A personal selection of Yerevan real estate from ArmNair:\n${shareUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const filtered = useMemo(() => {
    // Collection mode: show only the IDs from the share link
    if (collectionMode && collectionIds.length > 0) {
      return data.filter(c => collectionIds.includes(c.id))
    }
    return data.filter(c => {
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
    })
  }, [data, filters, favOnly, favorites, collectionMode, collectionIds])

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
      <MobileTabBar activePage={page} onNav={handleNav} favCount={favCount} favOnly={favOnly} onFavFilter={() => setFavOnly(v => !v)} compareCount={compareCount} onOpenCompare={() => setCompareOpen(true)} />

      {/* Collection mode banner */}
      {collectionMode && (
        <div style={{
          position: 'sticky', top: 64, zIndex: 900,
          background: 'linear-gradient(90deg, rgba(160,120,32,0.18) 0%, rgba(160,120,32,0.08) 100%)',
          borderBottom: '1px solid rgba(160,120,32,0.35)',
          padding: '0.6rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#C9A96E', fontSize: '0.9rem' }}>✦</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#C9A96E', letterSpacing: '0.1em' }}>
              {tr('page.collection')} · {collectionIds.length} {
                lang === 'ru'
                  ? (collectionIds.length === 1 ? tr('page.item') : collectionIds.length < 5 ? tr('page.items2') : tr('page.items5'))
                  : tr('page.item')
              }
            </span>
          </div>
          <button
            onClick={exitCollectionMode}
            style={{
              background: 'none', border: '1px solid rgba(160,120,32,0.35)',
              color: 'var(--t3)', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em',
              padding: '3px 10px', borderRadius: 2,
              transition: 'all 0.2s', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#C9A96E'; e.currentTarget.style.borderColor = '#C9A96E' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--t3)'; e.currentTarget.style.borderColor = 'rgba(160,120,32,0.35)' }}
          >
            {tr('page.seeAll')}
          </button>
        </div>
      )}

      {page === 'analytics'
        ? <AnalyticsPage data={data} onOpenModal={setSelectedId} onBack={() => setPage('home')} />
        : page === 'catalog'
        ? <CatalogPage data={data} isLoading={isLoading} onOpenModal={setSelectedId} onBack={() => setPage('home')} favorites={favorites} onToggleFavorite={toggleFav} favOnly={favOnly} onClearFavOnly={() => setFavOnly(false)} compareIds={compareIds} onToggleCompare={toggleCompare} onShareFavorites={handleShareFavorites} />
        : <>
            <Hero />
            <FilterBar filters={filters} onFiltersChange={setFilters} resultCount={filtered.length} data={data} />
            <StatsRow data={data} />
            <SplitPanel id="split-panel" complexes={filtered} isLoading={isLoading} openMobileMap={mobileMapTrigger} onCardClick={setSelectedId} mapFocusId={mapFocusId} onMapFocusDone={() => setMapFocusId(null)} favorites={favorites} onToggleFavorite={toggleFav} favOnly={favOnly} onClearFavOnly={() => setFavOnly(false)} compareIds={compareIds} onToggleCompare={toggleCompare} onShareFavorites={handleShareFavorites} />
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
                {tr('page.footer')}
              </span>
            </footer>
          </>
      }

      <PropertyModal
        complex={selectedComplex}
        onClose={() => setSelectedId(null)}
        onOpenContact={() => setConsultOpen(true)}
        isFavorite={selectedId ? favorites.has(selectedId) : false}
        onToggleFavorite={() => {
          if (!selectedId) return
          const wasFav = favorites.has(selectedId)
          toggleFav(selectedId)
          showToast(tr(wasFav ? 'toast.removedFromFavorites' : 'toast.addedToFavorites'))
        }}
        inCompare={selectedId ? compareIds.includes(selectedId) : false}
        onToggleCompare={() => {
          if (!selectedId) return
          toggleCompare(selectedId)
          if (!compareIds.includes(selectedId)) showToast(tr('toast.addedToCompare'))
        }}
        onOpenMap={(id: string) => {
          setSelectedId(null)
          setMapFocusId(id)
          const isMobile = window.innerWidth < 768
          const delay = page !== 'home' ? 250 : 100
          if (page !== 'home') setPage('home')
          setTimeout(() => {
            if (isMobile) {
              setMobileMapTrigger(t => t + 1)
              document.getElementById('split-panel')?.scrollIntoView({ behavior: 'smooth' })
            } else {
              document.getElementById('right-panel')?.scrollIntoView({ behavior: 'smooth' })
            }
          }, delay)
        }}
      />
      <ConsultModal open={consultOpen} onClose={() => setConsultOpen(false)} propertyName={selectedComplex?.name} />

      {/* Back to top button */}
      <button
        aria-label={tr('page.backToTop')}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed', bottom: 80, right: 16, zIndex: 500,
          width: 40, height: 40, borderRadius: '50%',
          background: '#b8942a', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          opacity: scrolled ? 1 : 0,
          pointerEvents: scrolled ? 'auto' : 'none',
          transition: 'opacity 0.25s',
        }}
      >
        <span style={{ color: '#fff', fontSize: '1.1rem', lineHeight: 1, marginTop: -2 }}>↑</span>
      </button>
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
