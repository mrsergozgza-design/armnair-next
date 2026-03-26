'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ChevronLeft, TrendingUp, Phone, Download, Train, Trees, GraduationCap, ShoppingBag, Building2, Dumbbell, MapPin, Utensils, Car, ChevronDown, ChevronUp } from 'lucide-react'
import { Complex, Unit } from '@/lib/types'
import { fmtAmd, fmtDate, statusStyle, parseYield, priceGrowth } from '@/lib/utils'
import { useTheme } from './ThemeProvider'
import { useLang } from '@/lib/LanguageContext'
import { useT, useTStatus } from '@/lib/StaticTranslationProvider'
import { useAutoTranslateBatch } from '@/lib/useAutoTranslate'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Filler, Tooltip,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip)

const MiniMap = dynamic(() => import('./MiniMap'), { ssr: false })

export default function PropertyPageContent({ property: c }: { property: Complex }) {
  const { theme } = useTheme()
  const { lang } = useLang()
  const tr = useT()
  const tStatus = useTStatus()

  const cacheId = `page-${c.id}-${lang}`
  const translated = useAutoTranslateBatch(
    {
      developer_description: lang !== 'ru' ? c.developer_description : undefined,
      description: lang !== 'ru' ? c.description : undefined,
      unit_type: c.unit_type,
      subway_station: c.subway_station,
    },
    lang, cacheId, 'ru',
  )

  // Tax calculator state
  const [area, setArea] = useState(60)
  const [interestRate, setInterestRate] = useState(11)
  const [loanPct, setLoanPct] = useState(0.80)
  const [salary, setSalary] = useState(600000)
  const [developerExpanded, setDeveloperExpanded] = useState(false)

  // Units state
  const [units, setUnits] = useState<Unit[]>([])
  const [unitsTypeFilter, setUnitsTypeFilter] = useState('all')
  const fetchUnits = useCallback(async () => {
    try {
      const res = await fetch('/api/units')
      if (!res.ok) return
      const data = await res.json()
      setUnits((data.units as Unit[]).filter((u: Unit) => u.project_id === c.name))
    } catch { /* ignore */ }
  }, [c.name])
  useEffect(() => { fetchUnits() }, [fetchUnits])

  const ss = statusStyle(c.status)
  const growth = priceGrowth(c.history)
  const heroImages = c.images ?? (c.image ? [c.image] : [])
  const [heroIdx, setHeroIdx] = useState(0)

  // Tax calculator
  const INCOME_TAX_RATE = 0.20
  const MONTHLY_REFUND_CAP = 500_000
  const priceAmd = c.price_amd * area
  const loanStep = 1_000_000
  const loanMin = Math.ceil(priceAmd * 0.10 / loanStep) * loanStep
  const loanMax = Math.floor(priceAmd * 0.90 / loanStep) * loanStep
  const loanAmt = Math.min(loanMax, Math.max(loanMin, Math.round(loanPct * priceAmd / loanStep) * loanStep))
  const downPct = Math.round((1 - loanAmt / priceAmd) * 100)
  const monthlyInterest = (loanAmt * (interestRate / 100)) / 12
  const incomeTax = salary * INCOME_TAX_RATE
  const refundAmt = c.tax_refund ? Math.min(incomeTax, monthlyInterest, MONTHLY_REFUND_CAP) : 0
  const realPayment = monthlyInterest - refundAmt

  const chartData = {
    labels: c.history.map(h => h.month),
    datasets: [{
      label: '֏/м²', data: c.history.map(h => h.price),
      borderColor: '#A07820', backgroundColor: 'rgba(160,120,32,0.08)',
      borderWidth: 2, pointBackgroundColor: '#C9A96E',
      pointRadius: 4, pointHoverRadius: 6, fill: true, tension: 0.4,
    }],
  }
  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(30,30,30,0.9)', borderColor: 'rgba(160,120,32,0.3)', borderWidth: 1, titleColor: '#ffffff', bodyColor: '#ffffff', displayColors: false, callbacks: { title: (items: import('chart.js').TooltipItem<'line'>[]) => items[0] ? Number(items[0].raw).toLocaleString() + ' ֏' : '', label: (item: import('chart.js').TooltipItem<'line'>) => item.label } } },
    scales: {
      x: { grid: { color: 'rgba(160,120,32,0.1)' }, ticks: { color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : '#374151', font: { family: 'DM Mono', size: 10 } } },
      y: { grid: { color: 'rgba(160,120,32,0.1)' }, ticks: { color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : '#374151', font: { family: 'DM Mono', size: 10 } } },
    },
  }

  // Payment plan
  const paymentSegments = (() => {
    if (!c.payment_plan) return []
    const nums = c.payment_plan.split(/[\/\-\+,]/).map(s => parseInt(s.replace(/[^0-9]/g, ''))).filter(n => !isNaN(n) && n > 0)
    if (!nums.length) return []
    const total = nums.reduce((a, b) => a + b, 0)
    return nums.map(n => ({ value: n, pct: Math.round(n / total * 100) }))
  })()
  const PAY_LABELS = [
    [tr('pay.deposit'), tr('pay.balance')],
    [tr('pay.booking'), tr('pay.construction'), tr('pay.handover')],
    [tr('pay.booking'), tr('pay.stage1'), tr('pay.stage2'), tr('pay.handover')],
  ]
  const payLabels = PAY_LABELS[paymentSegments.length - 2] ?? paymentSegments.map((_, i) => `${tr('pay.stageN')} ${i + 1}`)
  const PAY_COLORS = ['#C9A96E', '#A07820', '#7A5C10', '#5A4508']
  const PAY_BG = ['rgba(201,169,110,0.12)', 'rgba(160,120,32,0.1)', 'rgba(122,92,16,0.08)', 'rgba(90,69,8,0.07)']

  // Infrastructure
  type InfraIcon = { node: React.ReactNode; label: string; time?: string }
  const infraItems: InfraIcon[] = (() => {
    if (!c.infrastructure) return []
    const KW: Array<{ keys: string[]; icon: React.ReactNode; label: string }> = [
      { keys: ['metro','subway','метро'], icon: <Train size={14} />, label: tr('infra.metro') },
      { keys: ['park','парк','сквер'],   icon: <Trees size={14} />, label: tr('infra.park') },
      { keys: ['school','школа'],        icon: <GraduationCap size={14} />, label: tr('infra.school') },
      { keys: ['mall','тц','торгов'],    icon: <ShoppingBag size={14} />, label: tr('infra.mall') },
      { keys: ['university','универ'],   icon: <Building2 size={14} />, label: tr('infra.university') },
      { keys: ['gym','fitness','фитнес'],icon: <Dumbbell size={14} />, label: tr('infra.gym') },
      { keys: ['restaurant','кафе','cafe'],icon: <Utensils size={14} />, label: tr('infra.restaurant') },
    ]
    return c.infrastructure.split(',').map(s => s.trim()).filter(Boolean).map(part => {
      const colonIdx = part.indexOf(':')
      const keyword = (colonIdx !== -1 ? part.slice(0, colonIdx) : part).trim().toLowerCase()
      const rawTime = colonIdx !== -1 ? part.slice(colonIdx + 1).trim() : undefined
      const time = rawTime ? rawTime.replace(/^(\d+)\s*(?:min|мин|m)$/i, `$1 ${tr('infra.min')}`).replace(/^(\d+)$/, `$1 ${tr('infra.min')}`) : undefined
      const match = KW.find(kw => kw.keys.some(k => keyword.includes(k)))
      return { node: match?.icon ?? <MapPin size={14} />, label: match?.label ?? part.replace(/:.*$/, '').trim(), time }
    })
  })()

  // Units derived
  const unitTypes = Array.from(new Set(units.map(u => u.type)))
  const filteredUnits = unitsTypeFilter === 'all' ? units : units.filter(u => u.type === unitsTypeFilter)
  const minUnitPrice = units.length ? Math.min(...units.map(u => u.price_usd)) : 0
  const maxUnitPrice = units.length ? Math.max(...units.map(u => u.price_usd)) : 0
  const minUnitArea  = units.length ? Math.min(...units.map(u => u.area_m2))  : 0
  const maxUnitArea  = units.length ? Math.max(...units.map(u => u.area_m2))  : 0
  const unitBarData = {
    labels: unitTypes,
    datasets: [{ data: unitTypes.map(t => units.filter(u => u.type === t).length), backgroundColor: '#b8942a', borderRadius: 2, barThickness: 12 }],
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--t1)' }}>

      {/* Back button */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.25rem 1.5rem 0' }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gold)',
          letterSpacing: '0.1em', textDecoration: 'none',
          transition: 'opacity 0.2s',
        }}>
          <ChevronLeft size={14} />
          {tr('catalog.home').replace('← ', '')}
        </Link>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 3rem' }}>

        {/* Hero image */}
        <div style={{ position: 'relative', height: 280, overflow: 'hidden', borderRadius: 4, marginTop: '1rem' }}>
          {heroImages.length > 0 ? (
            <>
              {heroImages.map((url, i) => (
                <img key={i} src={url} alt={c.name} loading={i === 0 ? 'eager' : 'lazy'}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)', opacity: i === heroIdx ? 1 : 0, transition: 'opacity 0.35s ease' }} />
              ))}
              {heroImages.length > 1 && (
                <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 5 }}>
                  {heroImages.map((_, i) => (
                    <button key={i} onClick={() => setHeroIdx(i)} style={{
                      width: i === heroIdx ? 20 : 7, height: 7, borderRadius: 4, border: 'none',
                      background: i === heroIdx ? '#C9A96E' : 'rgba(255,255,255,0.35)',
                      cursor: 'pointer', padding: 0, transition: 'width 0.2s, background 0.2s',
                    }} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--card)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(17,17,24,1) 0%, rgba(17,17,24,0.3) 50%, transparent 100%)' }} />

          {/* Badges */}
          <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6 }}>
            <div style={{ background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color, borderRadius: 2, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', padding: '3px 10px', letterSpacing: '0.06em' }}>
              {tStatus(c.status)}
            </div>
            {c.tax_refund && (
              <div style={{ background: 'rgba(42,157,143,0.8)', borderRadius: 2, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', padding: '3px 10px', color: '#fff', letterSpacing: '0.06em' }}>
                ВОЗВРАТ НАЛОГА
              </div>
            )}
          </div>

          {/* Name */}
          <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#9A9A9A', marginBottom: 4, letterSpacing: '0.08em' }}>{c.developer} · {c.district}</div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, margin: 0, color: '#F0EDE8', lineHeight: 1 }}>{c.name}</h1>
          </div>
        </div>

        {/* Media links */}
        {(c.media_folder || c.presentation) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderBottom: '1px solid rgba(139,105,20,0.15)', marginBottom: '1.5rem' }}>
            {c.media_folder && (
              <a href={c.media_folder} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'rgba(160,120,32,0.1)', borderBottom: c.presentation ? '1px solid rgba(139,105,20,0.15)' : 'none', color: '#C9A96E', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.1em', padding: '0.85rem 1.5rem' }}>
                <Download size={14} />{tr('modal.viewPhotos')}
              </a>
            )}
            {c.presentation && (
              <a href={c.presentation} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'linear-gradient(135deg, #C9A96E 0%, #A68238 50%, #8B6A28 100%)', color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', letterSpacing: '0.12em', padding: '1rem 1.5rem' }}>
                <Download size={16} />{tr('modal.downloadPres')}
              </a>
            )}
          </div>
        )}

        {/* Metrics strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid rgba(139,105,20,0.1)', marginBottom: '1.5rem' }}>
          {[
            { label: '$/м²',              value: `$${c.price_usd.toLocaleString()}` },
            { label: '֏/м²',              value: fmtAmd(c.price_amd) },
            { label: tr('modal.yield'),    value: c.yield },
            { label: tr('modal.taxRefund'),value: c.tax_refund ? tr('modal.yes') : tr('modal.no') },
          ].map((m, i) => (
            <div key={i} style={{ padding: '0.9rem 1.25rem', borderRight: i < 3 ? '1px solid rgba(139,105,20,0.1)' : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--tm)', letterSpacing: '0.1em', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, color: '#C9A96E' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

          {/* Left column */}
          <div style={{ padding: '0 1.5rem 1.5rem 0', borderRight: '1px solid rgba(139,105,20,0.1)' }}>

            {/* Description */}
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.12em', marginBottom: 8, textTransform: 'uppercase' }}>{tr('modal.description')}</h4>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--t2)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{translated.description || c.description}</p>

            {/* Info rows */}
            <div style={{ marginBottom: '1.5rem' }}>
              {[
                { label: tr('modal.updated'),   value: fmtDate(c.last_updated, lang) },
                { label: tr('modal.developer'), value: c.developer },
                { label: tr('modal.district'),  value: c.district },
                { label: tr('modal.status'),    value: tStatus(c.status) },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(139,105,20,0.08)', padding: '0.45rem 0' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.06em' }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--t2)' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Characteristics */}
            {(c.unit_type || c.min_area || c.subway_station || c.commission || c.contact || c.website) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.12em', marginBottom: 8, textTransform: 'uppercase' }}>{tr('modal.characteristics')}</h4>
                {[
                  c.unit_type      && { label: tr('modal.unitType'),   value: translated.unit_type || c.unit_type },
                  c.min_area       && { label: tr('modal.minArea'),    value: `${c.min_area} м²` },
                  c.subway_station && { label: tr('modal.subway'),     value: translated.subway_station || c.subway_station },
                  c.commission     && { label: tr('modal.commission'), value: `${c.commission}%` },
                  c.contact        && { label: tr('modal.contact'),    value: c.contact },
                ].filter(Boolean).map((row, i) => {
                  const r = row as { label: string; value: string }
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(139,105,20,0.08)', padding: '0.45rem 0' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.06em' }}>{r.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--t2)', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>{r.value}</span>
                    </div>
                  )
                })}
                {c.website && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(139,105,20,0.08)', padding: '0.45rem 0' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.06em' }}>{tr('modal.website')}</span>
                    <a href={c.website} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--gold)', textDecoration: 'none', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>
                      {c.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Payment Plan */}
            {paymentSegments.length >= 2 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.12em', marginBottom: 12, textTransform: 'uppercase' }}>Payment Plan</h4>
                <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', gap: 2, marginBottom: 10 }}>
                  {paymentSegments.map((seg, i) => (
                    <div key={i} style={{ flex: seg.value, background: PAY_COLORS[i % PAY_COLORS.length] }} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {paymentSegments.map((seg, i) => (
                    <div key={i} style={{ flex: '1 1 60px', background: PAY_BG[i % PAY_BG.length], border: `1px solid ${PAY_COLORS[i % PAY_COLORS.length]}30`, borderRadius: 6, padding: '7px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: PAY_COLORS[i % PAY_COLORS.length] }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: PAY_COLORS[i % PAY_COLORS.length], fontWeight: 600 }}>{seg.value}%</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--tm)', letterSpacing: '0.06em' }}>{payLabels[i]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tax Calculator */}
            <div style={{ background: 'rgba(160,120,32,0.05)', border: '1px solid rgba(160,120,32,0.12)', borderRadius: 4, padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#A07820', letterSpacing: '0.12em', marginBottom: 12, textTransform: 'uppercase' }}>{tr('tax.title')}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--tm)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{tr('tax.objParams')}</div>
              <div style={{ marginBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--t3)' }}>{tr('tax.area')}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: '#C9A96E' }}>{area} м² · {fmtAmd(priceAmd)}</span>
                </div>
                <input type="range" min={30} max={300} value={area} onChange={e => setArea(Number(e.target.value))} style={{ width: '100%', accentColor: '#A07820', cursor: 'pointer', marginBottom: 10 }} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--tm)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, marginTop: 4 }}>{tr('tax.mortgageParams')}</div>
              <div style={{ marginBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--t3)' }}>{tr('tax.loanAmount')}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: '#C9A96E' }}>{fmtAmd(loanAmt)} · {tr('tax.downPayment')} {downPct}%</span>
                </div>
                <input type="range" min={loanMin} max={loanMax} step={loanStep} value={loanAmt} onChange={e => setLoanPct(Number(e.target.value) / priceAmd)} style={{ width: '100%', accentColor: '#A07820', cursor: 'pointer', marginBottom: 10 }} />
              </div>
              <div style={{ marginBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--t3)' }}>{tr('tax.interestRate')}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: '#C9A96E' }}>{interestRate}% {tr('tax.perYear')}</span>
                </div>
                <input type="range" min={8} max={15} step={0.5} value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} style={{ width: '100%', accentColor: '#A07820', cursor: 'pointer', marginBottom: 10 }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--t3)' }}>{tr('tax.officialSalary')}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: '#C9A96E' }}>{fmtAmd(salary)}{tr('tax.perMonth')}</span>
                </div>
                <input type="range" min={200000} max={2000000} step={50000} value={salary} onChange={e => setSalary(Number(e.target.value))} style={{ width: '100%', accentColor: '#A07820', cursor: 'pointer' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--tm)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, paddingTop: 4, borderTop: '1px solid rgba(160,120,32,0.12)' }}>{tr('tax.results')}</div>
              {[
                { label: tr('tax.incomeTax'),  value: fmtAmd(Math.round(incomeTax)) + tr('tax.perMonth') },
                { label: tr('tax.monthlyInt'), value: fmtAmd(Math.round(monthlyInterest)) },
                { label: tr('tax.refundAmt'),  value: c.tax_refund ? fmtAmd(Math.round(refundAmt)) + tr('tax.perMonth') : tr('modal.no'), color: c.tax_refund ? '#2A9D8F' : 'var(--tm)' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.32rem 0', borderBottom: '1px solid rgba(160,120,32,0.06)', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--tm)' }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: row.color ?? 'var(--t2)', textAlign: 'right', flexShrink: 0 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.45rem 0', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--t2)', fontWeight: 700 }}>{tr('tax.realPayment')}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#C9A96E', fontWeight: 700, flexShrink: 0 }}>{fmtAmd(Math.round(realPayment))}{tr('tax.perMonth')}</span>
              </div>
              {c.tax_refund && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, padding: '0.6rem 0.75rem', background: 'rgba(160,120,32,0.12)', border: '1px solid rgba(160,120,32,0.3)', borderRadius: 3, gap: 12 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#C9A96E', letterSpacing: '0.04em' }}>{tr('tax.annualBenefit')}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#C9A96E', fontWeight: 600, flexShrink: 0 }}>{fmtAmd(Math.round(refundAmt * 12))}</span>
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.57rem', color: 'var(--tm)', marginTop: 12, lineHeight: 1.6, opacity: 0.75 }}>{tr('tax.disclaimer')}</div>
            </div>

            {/* Units */}
            {units.length > 0 && (
              <div>
                <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>{tr('units.title')}</h4>
                <div style={{ border: '1px solid rgba(139,105,20,0.12)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', background: 'rgba(160,120,32,0.08)', borderBottom: '1px solid rgba(139,105,20,0.12)' }}>
                    {[tr('units.type'), tr('units.area'), tr('units.floor'), tr('units.price')].map((h, i) => (
                      <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--tm)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.45rem 0.6rem' }}>{h}</div>
                    ))}
                  </div>
                  <div style={{ height: 350, overflowY: 'auto' }}>
                    {filteredUnits.map((u, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', borderBottom: i < filteredUnits.length - 1 ? '1px solid rgba(139,105,20,0.07)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(160,120,32,0.03)' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--t2)', padding: '0.42rem 0.6rem' }}>{u.type}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--t2)', padding: '0.42rem 0.6rem' }}>{u.area_m2} м²</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--t2)', padding: '0.42rem 0.6rem' }}>{u.floor ?? '—'}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--t2)', padding: '0.42rem 0.6rem' }}>${u.price_usd.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Type filter pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                  {['all', ...unitTypes].map(t => {
                    const active = unitsTypeFilter === t
                    return (
                      <button key={t} onClick={() => setUnitsTypeFilter(t)} style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.06em',
                        padding: '3px 10px', borderRadius: 20, cursor: 'pointer',
                        border: active ? '1px solid rgba(201,169,110,0.6)' : '1px solid rgba(139,105,20,0.25)',
                        background: active ? 'rgba(160,120,32,0.2)' : 'transparent',
                        color: active ? '#C9A96E' : 'var(--tm)',
                      }}>
                        {t === 'all' ? tr('units.filterAll') : t}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ padding: '0 0 1.5rem 1.5rem' }}>

            {/* Price chart */}
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.12em', marginBottom: 12, textTransform: 'uppercase' }}>{tr('modal.priceChart')}</h4>
            <div style={{ height: 160, marginBottom: 8 }}>
              <Line data={chartData} options={chartOptions as never} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1.5rem' }}>
              <TrendingUp size={13} color={growth >= 0 ? '#2A9D8F' : '#E76F51'} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: growth >= 0 ? '#2A9D8F' : '#E76F51' }}>
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}{tr('modal.overPeriod')}
              </span>
            </div>

            {/* Map */}
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>{tr('modal.onMap')}</h4>
            <div style={{ height: 180, marginBottom: '1.5rem', border: '1px solid rgba(139,105,20,0.15)', overflow: 'hidden' }}>
              <MiniMap lat={c.lat} lng={c.lng} name={c.name} theme={theme} />
            </div>

            {/* Developer */}
            {(c.developer_logo || c.developer_description) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>{tr('modal.aboutDeveloper')}</h4>
                <div style={{ background: 'var(--card)', border: '1px solid rgba(139,105,20,0.12)', borderRadius: 8, padding: '0.9rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: c.developer_description ? 10 : 0 }}>
                    {c.developer_logo && (
                      <img src={c.developer_logo} alt={c.developer} style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 6, background: 'rgba(255,255,255,0.06)', padding: 4, flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 400, color: 'var(--t1)', lineHeight: 1.2 }}>{c.developer}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.57rem', color: 'var(--tm)', letterSpacing: '0.08em', marginTop: 3 }}>{tr('modal.developer_label')}</div>
                    </div>
                  </div>
                  {c.developer_description && (() => {
                    const MAX = 180
                    const isLong = c.developer_description.length > MAX
                    const text = translated.developer_description || c.developer_description || ''
                    return (
                      <div>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--t3)', lineHeight: 1.65, margin: 0 }}>
                          {developerExpanded || !isLong ? text : text.slice(0, MAX) + '…'}
                        </p>
                        {isLong && (
                          <button onClick={() => setDeveloperExpanded(v => !v)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#A07820', letterSpacing: '0.08em', marginTop: 7, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {developerExpanded ? tr('modal.collapse') : tr('modal.readMore')}
                            {developerExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                          </button>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* Infrastructure */}
            {infraItems.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>{tr('modal.nearbyInfra')}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {infraItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--card)', border: '1px solid rgba(139,105,20,0.12)', borderRadius: 6, padding: '6px 11px' }}>
                      <span style={{ color: '#A07820', flexShrink: 0, display: 'flex' }}>{item.node}</span>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--t2)', lineHeight: 1 }}>{item.label}</div>
                        {item.time && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
                            <Car size={11} color="var(--tm)" />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--tm)' }}>{item.time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Units right panel */}
            {units.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: 350, marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--card)', border: '1px solid rgba(139,105,20,0.12)', borderRadius: 4, padding: '0.7rem 0.85rem', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#A07820', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>{tr('units.summary')}</div>
                  {[
                    { label: tr('units.total'),      value: String(units.length) },
                    { label: tr('units.priceRange'), value: `$${(minUnitPrice / 1000).toFixed(0)}K — $${(maxUnitPrice / 1000).toFixed(0)}K` },
                    { label: tr('units.areaRange'),  value: `${minUnitArea} — ${maxUnitArea} м²` },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.28rem 0', borderBottom: i < 2 ? '1px solid rgba(139,105,20,0.07)' : 'none', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--tm)' }}>{row.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--t2)', textAlign: 'right' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <Bar data={unitBarData} options={{
                    indexAxis: 'y' as const,
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(30,30,30,0.9)', bodyColor: '#fff', displayColors: false } },
                    scales: {
                      x: { display: false, grid: { display: false } },
                      y: { grid: { display: false }, ticks: { color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : '#374151', font: { family: 'DM Mono', size: 11 } } },
                    },
                  } as never} />
                </div>
              </div>
            )}

            {/* CTA */}
            <a href="https://wa.me/971528892559" target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'rgba(160,120,32,0.15)', border: '1px solid rgba(160,120,32,0.4)',
                color: '#C9A96E', textDecoration: 'none',
                fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                letterSpacing: '0.1em', padding: '0.75rem',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.15)')}
            >
              <Phone size={14} />
              {tr('modal.getConsult')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
