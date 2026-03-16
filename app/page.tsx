'use client'
import { useState, useEffect } from 'react'
import { Complex } from '@/lib/types'
import { FALLBACK } from '@/lib/data'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import FilterBar from '@/components/FilterBar'
import StatsRow from '@/components/StatsRow'
import SplitPanel from '@/components/SplitPanel'
import PropertyModal from '@/components/PropertyModal'
import ConsultModal from '@/components/ConsultModal'
import AnalyticsPage from '@/components/analytics/AnalyticsPage'

interface Filters {
  district: string
  developer: string
  price: number
  tax: string
  status: string
  search: string
}

export default function Home() {
  const [data, setData] = useState<Complex[]>([])
  const [filtered, setFiltered] = useState<Complex[]>([])
  const [filters, setFilters] = useState<Filters>({ district: '', developer: '', price: 10000, tax: '', status: '', search: '' })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [consultOpen, setConsultOpen] = useState(false)
  const [page, setPage] = useState<'home' | 'analytics'>('home')

  useEffect(() => {
    fetch('/data.json')
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        setData(j?.complexes ?? j ?? FALLBACK)
      })
      .catch(() => setData(FALLBACK))
  }, [])

  useEffect(() => {
    const out = data.filter(c => {
      if (filters.district && c.district !== filters.district) return false
      if (filters.developer && c.developer !== filters.developer) return false
      if (c.price_usd > filters.price) return false
      if (filters.tax === 'yes' && !c.tax_refund) return false
      if (filters.tax === 'no' && c.tax_refund) return false
      if (filters.status && c.status !== filters.status) return false
      if (filters.search) {
        const hay = (c.name + ' ' + c.district + ' ' + c.developer).toLowerCase()
        if (!hay.includes(filters.search.toLowerCase())) return false
      }
      return true
    })
    setFiltered(out)
  }, [data, filters])

  const selectedComplex = selectedId ? data.find(c => c.id === selectedId) ?? null : null

  return (
    <>
      <Navbar
        activePage={page}
        onNav={(p, anchor) => {
          setPage(p)
          if (anchor) {
            setTimeout(() => {
              document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 60)
          }
        }}
      />
      {page === 'analytics'
        ? <AnalyticsPage data={data} onOpenModal={setSelectedId} onBack={() => setPage('home')} />
        : <>
            <Hero />
            <FilterBar filters={filters} onFiltersChange={setFilters} resultCount={filtered.length} data={data} />
            <StatsRow data={data} />
            <SplitPanel id="split-panel" complexes={filtered} onCardClick={setSelectedId} />
            {/* Footer */}
            <footer style={{
              borderTop: '1px solid rgba(139,105,20,0.1)',
              background: '#09090F',
              padding: '1.5rem 2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#A07820', fontWeight: 400 }}>
                ArmNair
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#555560', letterSpacing: '0.08em' }}>
                © 2026 ArmNair · Ереван · Армения
              </span>
            </footer>
          </>
      }
      <PropertyModal
        complex={selectedComplex}
        onClose={() => setSelectedId(null)}
        onOpenContact={() => setConsultOpen(true)}
        onOpenMap={() => {
          setSelectedId(null)
          setTimeout(() => {
            document.getElementById('right-panel')?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        }}
      />
      <ConsultModal open={consultOpen} onClose={() => setConsultOpen(false)} />
    </>
  )
}
