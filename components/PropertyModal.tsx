'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { X, Download, TrendingUp, Phone, MessageCircle, Heart, GitCompare, Link2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Train, Trees, GraduationCap, ShoppingBag, Building2, Dumbbell, MapPin, Utensils, Car } from 'lucide-react'
import { Complex, Unit } from '@/lib/types'
import { fmtAmd, fmtDate, statusStyle, parseYield, priceGrowth } from '@/lib/utils'
import { useTheme } from './ThemeProvider'
import { useIsMobile } from '@/lib/useIsMobile'
import { useLang } from '@/lib/LanguageContext'
import { useT, useTStatus } from '@/lib/StaticTranslationProvider'
import { useToast } from '@/lib/ToastContext'
import { useAutoTranslateBatch } from '@/lib/useAutoTranslate'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip)

const MiniMap = dynamic(() => import('./MiniMap'), { ssr: false })

interface PropertyModalProps {
  complex: Complex | null
  onClose: () => void
  onOpenContact: () => void
  onOpenMap: (id: string) => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
  inCompare?: boolean
  onToggleCompare?: () => void
}

export default function PropertyModal({ complex: c, onClose, onOpenContact, onOpenMap, isFavorite = false, onToggleFavorite, inCompare = false, onToggleCompare }: PropertyModalProps) {
  const { theme } = useTheme()
  const isMobile = useIsMobile()
  const { lang } = useLang()
  const tr = useT()
  const tStatus = useTStatus()
  const { showToast } = useToast()

  const cacheId = `modal-${c?.id ?? '__none__'}-${lang}`

  // Auto-translate dynamic text fields (source data is Russian from Google Sheets)
  // cacheId already encodes both property id and lang — translations are cached per property+lang.
  // description/developer_description are already in Russian — skip API when lang === 'ru'
  const translated = useAutoTranslateBatch(
    {
      developer_description: lang !== 'ru' ? c?.developer_description : undefined,
      description: lang !== 'ru' ? c?.description : undefined,
      unit_type: c?.unit_type,
      subway_station: c?.subway_station,
    },
    lang,
    cacheId,
    'ru'
  )
  const [units, setUnits] = useState<Unit[]>([])
  const [unitsTypeFilter, setUnitsTypeFilter] = useState('all')

  const fetchUnitsForProperty = useCallback(async (name: string) => {
    try {
      const res = await fetch('/api/units')
      if (!res.ok) return
      const data = await res.json()
      const filtered = (data.units as Unit[]).filter(u => u.project_id === name)
      setUnits(filtered)
    } catch {
      // silently ignore
    }
  }, [])

  const [area, setArea] = useState(60)
  const [interestRate, setInterestRate] = useState(11)
  const [loanPct, setLoanPct] = useState(0.80)
  const [salary, setSalary] = useState(600000)
  const [calcCurrency, setCalcCurrency] = useState<'AMD' | 'USD'>('AMD')
  const [usdRate, setUsdRate] = useState(390)
  const [mounted, setMounted] = useState(false)
  const [heartAnim, setHeartAnim] = useState(false)
  const [heroIdx, setHeroIdx] = useState(0)
  const [developerExpanded, setDeveloperExpanded] = useState(false)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  // Drag-to-close (mobile)
  const [dragY, setDragY] = useState(0)
  const dragStartY = useRef(0)
  const isDragging = useRef(false)

  useEffect(() => {
    if (c) {
      setMounted(true)
      setDeveloperExpanded(false)
      setUnits([])
      setUnitsTypeFilter('all')
      document.body.classList.add('modal-open')
      fetchUnitsForProperty(c.name)
    } else {
      setMounted(false)
      document.body.classList.remove('modal-open')
    }
    return () => { document.body.classList.remove('modal-open') }
  }, [c, fetchUnitsForProperty])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    fetch('/api/currency')
      .then(r => r.json())
      .then(d => { if (d.rate) setUsdRate(d.rate) })
      .catch(() => {})
  }, [])

  if (!c) return null

  // ── Units derived data (computed at component level for use in both columns) ──
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

  const ss = statusStyle(c.status)
  const yld = parseYield(c.yield)
  const growth = priceGrowth(c.history)
  const heroImages = c.images ?? (c.image ? [c.image] : [])

  // Tax calculator
  const INCOME_TAX_RATE = 0.20
  const MONTHLY_REFUND_CAP = 500_000

  const fmtCalc = (amdVal: number) => {
    if (calcCurrency === 'USD') {
      const usd = Math.round(amdVal / usdRate)
      return usd >= 1000 ? `$${(usd / 1000).toFixed(1)}K` : `$${usd.toLocaleString()}`
    }
    return fmtAmd(amdVal)
  }

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
      label: '֏/м²',
      data: c.history.map(h => h.price),
      borderColor: '#A07820',
      backgroundColor: 'rgba(160,120,32,0.08)',
      borderWidth: 2,
      pointBackgroundColor: '#C9A96E',
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: true,
      tension: 0.4,
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(30,30,30,0.9)', borderColor: 'rgba(160,120,32,0.3)', borderWidth: 1, titleColor: '#ffffff', bodyColor: '#ffffff', displayColors: false, callbacks: { title: (items: import('chart.js').TooltipItem<'line'>[]) => items[0] ? Number(items[0].raw).toLocaleString() + ' ֏' : '', label: (item: import('chart.js').TooltipItem<'line'>) => item.label } } },
    scales: {
      x: { grid: { color: 'rgba(160,120,32,0.1)' }, ticks: { color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : '#374151', font: { family: 'DM Mono', size: 10 } } },
      y: { grid: { color: 'rgba(160,120,32,0.1)' }, ticks: { color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : '#374151', font: { family: 'DM Mono', size: 10 } } },
    },
  }

  // ── Payment Plan parsing ──────────────────────────────────────────────
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
  const payLabels = PAY_LABELS[paymentSegments.length - 2] ?? paymentSegments.map((_, i) => `Этап ${i + 1}`)
  const PAY_COLORS = ['#C9A96E', '#A07820', '#7A5C10', '#5A4508']
  const PAY_BG     = ['rgba(201,169,110,0.12)', 'rgba(160,120,32,0.1)', 'rgba(122,92,16,0.08)', 'rgba(90,69,8,0.07)']

  // ── Infrastructure parsing ────────────────────────────────────────────
  type InfraIcon = { node: React.ReactNode; label: string; time?: string }
  const infraItems: InfraIcon[] = (() => {
    if (!c.infrastructure) return []
    const KW: Array<{ keys: string[]; icon: React.ReactNode; label: string }> = [
      { keys: ['metro','subway','метро','подземка'],        icon: <Train size={14} />,       label: tr('infra.metro') },
      { keys: ['park','парк','сквер','garden','сад'],       icon: <Trees size={14} />,       label: tr('infra.park') },
      { keys: ['school','школа','kindergarten','детск'],    icon: <GraduationCap size={14} />, label: tr('infra.school') },
      { keys: ['mall','тц','торгов','shopping','market'],   icon: <ShoppingBag size={14} />, label: tr('infra.mall') },
      { keys: ['university','универ','вуз','college'],      icon: <Building2 size={14} />,   label: tr('infra.university') },
      { keys: ['gym','fitness','фитнес','спорт'],           icon: <Dumbbell size={14} />,    label: tr('infra.gym') },
      { keys: ['restaurant','кафе','cafe','еда','food'],    icon: <Utensils size={14} />,    label: tr('infra.restaurant') },
    ]
    return c.infrastructure.split(',').map(s => s.trim()).filter(Boolean).map(part => {
      // Format: "metro:20m" or "metro: 20 min" or just "metro"
      const colonIdx = part.indexOf(':')
      const keyword = (colonIdx !== -1 ? part.slice(0, colonIdx) : part).trim().toLowerCase()
      const rawTime = colonIdx !== -1 ? part.slice(colonIdx + 1).trim() : undefined
      // Normalize time: "20m" → "20 мин", "20min" → "20 мин", "20 мин" → "20 мин", bare number → "N мин"
      const time = rawTime
        ? rawTime.replace(/^(\d+)\s*(?:min|мин|m)$/i, `$1 ${tr('infra.min')}`).replace(/^(\d+)$/, `$1 ${tr('infra.min')}`)
        : undefined
      const match = KW.find(kw => kw.keys.some(k => keyword.includes(k)))
      return { node: match?.icon ?? <MapPin size={14} />, label: match?.label ?? part.replace(/:.*$/, '').trim(), time }
    })
  })()

  const metrics = [
    { label: '$/м²',                        value: `$${c.price_usd.toLocaleString()}` },
    { label: '֏/м²',                        value: fmtAmd(c.price_amd) },
    { label: tr('modal.yield'),        value: c.yield },
    { label: tr('modal.taxRefund'),    value: c.tax_refund ? tr('modal.yes') : tr('modal.no') },
  ]

  // CTA buttons (reused in both desktop right-col and mobile sticky footer)
  const ctaButtons = (
    <>
      <button
        onClick={onOpenContact}
        style={{
          background: 'rgba(160,120,32,0.15)',
          border: '1px solid rgba(160,120,32,0.4)',
          color: '#C9A96E', cursor: 'pointer',
          fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
          letterSpacing: '0.1em', padding: '0.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.2s', width: '100%',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(160,120,32,0.25)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(160,120,32,0.15)' }}
      >
        <Phone size={14} />
        {tr('modal.getConsult')}
      </button>
    </>
  )

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : '1rem',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          maxWidth: isMobile ? '100%' : 900,
          width: '100%',
          background: 'var(--surface)',
          border: isMobile ? 'none' : '1px solid rgba(139,105,20,0.2)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
          maxHeight: isMobile ? '92dvh' : '90vh',
          borderRadius: isMobile ? '16px 16px 0 0' : 2,
          transform: mounted
            ? `translateY(${dragY}px)`
            : isMobile ? 'translateY(60px)' : 'translateY(24px)',
          transition: isDragging.current ? 'none' : 'transform 0.3s ease',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Drag handle (mobile) + header controls */}
        <div
          style={{
            flexShrink: 0,
            background: 'var(--surface)',
            borderBottom: isMobile ? '1px solid var(--border-c)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: isMobile ? '10px 1rem 8px' : '0',
            position: 'relative',
            userSelect: 'none',
          }}
          onTouchStart={isMobile ? e => {
            dragStartY.current = e.touches[0].clientY
            isDragging.current = true
          } : undefined}
          onTouchMove={isMobile ? e => {
            const dy = e.touches[0].clientY - dragStartY.current
            if (dy > 0) setDragY(dy)
          } : undefined}
          onTouchEnd={isMobile ? () => {
            isDragging.current = false
            if (dragY > 90) { onClose(); setDragY(0) }
            else setDragY(0)
          } : undefined}
        >
          {isMobile && (
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(160,120,32,0.3)' }} />
          )}

          {/* Close */}
          <button onClick={onClose} style={{
            position: 'absolute', top: isMobile ? 8 : 14, right: 14, zIndex: 10,
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(139,105,20,0.2)',
            borderRadius: '50%', width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#C9A96E',
          }}>
            <X size={15} />
          </button>

          {/* Share */}
          <button
            onClick={() => {
              const slug = c.name.toLowerCase().replace(/\s+/g, '-')
              const url = `${window.location.origin}/property/${slug}`
              navigator.clipboard.writeText(url).then(() => showToast(tr('toast.linkCopied')))
            }}
            title="Скопировать ссылку"
            style={{
              position: 'absolute', top: isMobile ? 8 : 14, right: 134, zIndex: 10,
              background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(139,105,20,0.2)',
              borderRadius: '50%', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.2s',
            }}
          >
            <Link2 size={14} color="#C9A96E" />
          </button>

          {/* Compare */}
          <button onClick={onToggleCompare} title={inCompare ? 'Убрать из сравнения' : 'Добавить к сравнению'} style={{
            position: 'absolute', top: isMobile ? 8 : 14, right: 94, zIndex: 10,
            background: inCompare ? 'rgba(160,120,32,0.25)' : 'rgba(0,0,0,0.5)',
            border: inCompare ? '1px solid rgba(201,169,110,0.5)' : '1px solid rgba(139,105,20,0.2)',
            borderRadius: '50%', width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.2s',
          }}>
            <GitCompare size={14} color="#C9A96E" />
          </button>

          {/* Favorite */}
          <button
            onClick={() => { setHeartAnim(true); onToggleFavorite?.() }}
            onAnimationEnd={() => setHeartAnim(false)}
            className={heartAnim ? 'heart-pop' : ''}
            title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            style={{
              position: 'absolute', top: isMobile ? 8 : 14, right: 54, zIndex: 10,
              background: isFavorite ? 'rgba(201,169,110,0.18)' : 'rgba(0,0,0,0.5)',
              border: isFavorite ? '1px solid rgba(201,169,110,0.5)' : '1px solid rgba(139,105,20,0.2)',
              borderRadius: '50%', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            <Heart size={15} fill={isFavorite ? '#C9A96E' : 'none'} color="#C9A96E" />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>

          {/* Hero image / slider */}
          <div style={{ position: 'relative', height: isMobile ? 200 : 260, overflow: 'hidden', flexShrink: 0 }}>
            {heroImages.length > 0 ? (
              <>
                {heroImages.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={c.name}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    style={{
                      position: 'absolute', inset: 0, width: '100%', height: '100%',
                      objectFit: 'cover', filter: 'brightness(0.5)',
                      opacity: i === heroIdx ? 1 : 0,
                      transition: 'opacity 0.35s ease',
                    }}
                  />
                ))}
                {heroImages.length > 1 && (
                  <>
                    <button onClick={() => setHeroIdx(i => (i - 1 + heroImages.length) % heroImages.length)} style={{
                      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '50%', width: 36, height: 36,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#fff', zIndex: 5,
                    }}>
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => setHeroIdx(i => (i + 1) % heroImages.length)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '50%', width: 36, height: 36,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#fff', zIndex: 5,
                    }}>
                      <ChevronRight size={18} />
                    </button>
                    <div style={{
                      position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
                      display: 'flex', gap: 6, zIndex: 5,
                    }}>
                      {heroImages.map((_, i) => (
                        <button key={i} onClick={() => setHeroIdx(i)} style={{
                          width: i === heroIdx ? 20 : 7, height: 7, borderRadius: 4, border: 'none',
                          background: i === heroIdx ? '#C9A96E' : 'rgba(255,255,255,0.35)',
                          cursor: 'pointer', padding: 0,
                          transition: 'width 0.2s, background 0.2s',
                        }} />
                      ))}
                    </div>
                  </>
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

            {/* Name + developer */}
            <div style={{ position: 'absolute', bottom: 20, left: 24, right: 60 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#9A9A9A', marginBottom: 4, letterSpacing: '0.08em' }}>{c.developer} · {c.district}</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: isMobile ? '1.6rem' : '2.2rem', fontWeight: 400, margin: 0, color: '#F0EDE8', lineHeight: 1 }}>{c.name}</h2>
            </div>
          </div>

          {/* Документы и медиа */}
          {(c.media_folder || c.presentation) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderBottom: '1px solid rgba(139,105,20,0.15)' }}>
              {c.media_folder && (
                <a href={c.media_folder} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    background: 'rgba(160,120,32,0.1)',
                    borderBottom: c.presentation ? '1px solid rgba(139,105,20,0.15)' : 'none',
                    color: '#C9A96E', textDecoration: 'none',
                    fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                    letterSpacing: '0.1em', padding: '0.85rem 1.5rem',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.18)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.1)')}
                >
                  <Download size={14} />
                  {tr('modal.viewPhotos')}
                </a>
              )}
              {c.presentation && (
                <a href={c.presentation} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    background: 'linear-gradient(135deg, #C9A96E 0%, #A68238 50%, #8B6A28 100%)',
                    color: '#fff', textDecoration: 'none',
                    fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
                    letterSpacing: '0.12em', padding: '1rem 1.5rem',
                    boxShadow: '0 4px 24px rgba(166,130,56,0.3)',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                  <Download size={16} />
                  {tr('modal.downloadPres')}
                </a>
              )}
            </div>
          )}

          {/* Metrics strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            borderBottom: '1px solid rgba(139,105,20,0.1)',
          }}>
            {metrics.map((m, i) => (
              <div key={i} style={{
                padding: isMobile ? '0.7rem 0.75rem' : '0.9rem 1.25rem',
                borderRight: (isMobile ? i % 2 !== 1 : i < 3) ? '1px solid rgba(139,105,20,0.1)' : 'none',
                borderBottom: isMobile && i < 2 ? '1px solid rgba(139,105,20,0.1)' : 'none',
                textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--tm)', letterSpacing: '0.1em', marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: isMobile ? '1.1rem' : '1.4rem', fontWeight: 400, color: '#C9A96E' }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* 2-col or 1-col layout */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 0 }}>

            {/* Left column */}
            <div style={{ padding: isMobile ? '1rem' : '1.5rem', borderRight: isMobile ? 'none' : '1px solid rgba(139,105,20,0.1)' }}>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.12em', marginBottom: 8, textTransform: 'uppercase' }}>{tr('modal.description')}</h4>
              {(() => {
                const descText = translated.description || c.description || ''
                const LINE_HEIGHT = 1.7
                const FONT_SIZE = 0.9
                const LINES = 4
                const maxH = `${LINE_HEIGHT * FONT_SIZE * LINES}rem`
                return (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{
                      fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--t2)', lineHeight: LINE_HEIGHT, margin: 0,
                      overflow: 'hidden',
                      maxHeight: descriptionExpanded ? 'none' : maxH,
                    }}>
                      {descText}
                    </p>
                    {descText.length > 0 && (
                      <button
                        onClick={() => setDescriptionExpanded(v => !v)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#A07820', letterSpacing: '0.08em', marginTop: 7, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {descriptionExpanded ? tr('modal.collapse') : tr('modal.readMore')}
                        {descriptionExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      </button>
                    )}
                  </div>
                )
              })()}

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
                      <a href={c.website} target="_blank" rel="noopener noreferrer"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--gold)', textDecoration: 'none', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>
                        {c.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* ── Payment Plan block ── */}
              {paymentSegments.length >= 2 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.12em', marginBottom: 12, textTransform: 'uppercase' }}>
                    Payment Plan
                  </h4>
                  {/* Segmented bar */}
                  <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', gap: 2, marginBottom: 10 }}>
                    {paymentSegments.map((seg, i) => (
                      <div key={i} style={{ flex: seg.value, background: PAY_COLORS[i % PAY_COLORS.length], transition: 'flex 0.4s ease' }} />
                    ))}
                  </div>
                  {/* Segment cards */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {paymentSegments.map((seg, i) => (
                      <div key={i} style={{
                        flex: '1 1 60px',
                        background: PAY_BG[i % PAY_BG.length],
                        border: `1px solid ${PAY_COLORS[i % PAY_COLORS.length]}30`,
                        borderRadius: 6, padding: '7px 10px',
                        display: 'flex', flexDirection: 'column', gap: 2,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: PAY_COLORS[i % PAY_COLORS.length], flexShrink: 0 }} />
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: PAY_COLORS[i % PAY_COLORS.length], fontWeight: 600 }}>{seg.value}%</span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.56rem', color: 'var(--tm)', letterSpacing: '0.06em' }}>
                          {payLabels[i] ?? `${tr('pay.stageN')} ${i + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tax calculator */}
              <div style={{ background: 'rgba(160,120,32,0.05)', border: '1px solid rgba(160,120,32,0.12)', borderRadius: 4, padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#A07820', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    {tr('tax.title')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--tm)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{tr('calc.currency')}</span>
                    {(['AMD', 'USD'] as const).map(cur => (
                      <button key={cur} onClick={() => setCalcCurrency(cur)}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', padding: '2px 8px', borderRadius: 2, border: '1px solid rgba(160,120,32,0.4)', cursor: 'pointer', letterSpacing: '0.06em',
                          background: calcCurrency === cur ? '#A07820' : 'transparent',
                          color: calcCurrency === cur ? '#fff' : 'var(--tm)',
                        }}>
                        {cur}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--tm)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{tr('tax.objParams')}</div>
                <div style={{ marginBottom: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--t3)' }}>{tr('tax.area')}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: '#C9A96E' }}>{area} м²  ·  {fmtCalc(priceAmd)}</span>
                  </div>
                  <input type="range" min={30} max={300} value={area}
                    onChange={e => setArea(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#A07820', cursor: 'pointer', marginBottom: 10 }} />
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--tm)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, marginTop: 4 }}>{tr('tax.mortgageParams')}</div>

                <div style={{ marginBottom: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--t3)' }}>{tr('tax.loanAmount')}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: '#C9A96E' }}>{fmtCalc(loanAmt)} · {tr('tax.downPayment')} {downPct}%</span>
                  </div>
                  <input type="range" min={loanMin} max={loanMax} step={loanStep} value={loanAmt}
                    onChange={e => setLoanPct(Number(e.target.value) / priceAmd)}
                    style={{ width: '100%', accentColor: '#A07820', cursor: 'pointer', marginBottom: 10 }} />
                </div>

                <div style={{ marginBottom: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--t3)' }}>{tr('tax.interestRate')}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: '#C9A96E' }}>{interestRate}% {tr('tax.perYear')}</span>
                  </div>
                  <input type="range" min={8} max={15} step={0.5} value={interestRate}
                    onChange={e => setInterestRate(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#A07820', cursor: 'pointer', marginBottom: 10 }} />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--t3)' }}>{tr('tax.officialSalary')}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: '#C9A96E' }}>{fmtCalc(salary)}{tr('tax.perMonth')}</span>
                  </div>
                  <input type="range" min={200000} max={2000000} step={50000} value={salary}
                    onChange={e => setSalary(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#A07820', cursor: 'pointer' }} />
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--tm)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, paddingTop: 4, borderTop: '1px solid rgba(160,120,32,0.12)' }}>{tr('tax.results')}</div>
                {[
                  { label: tr('tax.incomeTax'),  value: fmtCalc(Math.round(incomeTax)) + tr('tax.perMonth') },
                  { label: tr('tax.monthlyInt'), value: fmtCalc(Math.round(monthlyInterest)) },
                  { label: tr('tax.refundAmt'),  value: c.tax_refund ? fmtCalc(Math.round(refundAmt)) + tr('tax.perMonth') : tr('modal.no'), color: c.tax_refund ? '#2A9D8F' : 'var(--tm)' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.32rem 0', borderBottom: '1px solid rgba(160,120,32,0.06)', gap: 12 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--tm)' }}>{row.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: row.color ?? 'var(--t2)', textAlign: 'right', flexShrink: 0 }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.45rem 0', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--t2)', fontWeight: 700 }}>{tr('tax.realPayment')}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#C9A96E', fontWeight: 700, flexShrink: 0 }}>{fmtCalc(Math.round(realPayment))}{tr('tax.perMonth')}</span>
                </div>
                {c.tax_refund && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, padding: '0.6rem 0.75rem', background: 'rgba(160,120,32,0.12)', border: '1px solid rgba(160,120,32,0.3)', borderRadius: 3, gap: 12 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#C9A96E', letterSpacing: '0.04em' }}>{tr('tax.annualBenefit')}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#C9A96E', fontWeight: 600, flexShrink: 0 }}>{fmtCalc(Math.round(refundAmt * 12))}</span>
                  </div>
                )}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.57rem', color: 'var(--tm)', marginTop: 12, lineHeight: 1.6, opacity: 0.75 }}>
                  {tr('tax.disclaimer')}
                </div>
              </div>

              {/* ── Available Units block ── */}
              {units.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>
                    {tr('units.title')}
                  </h4>
                  <div style={{ border: '1px solid rgba(139,105,20,0.12)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', background: 'rgba(160,120,32,0.08)', borderBottom: '1px solid rgba(139,105,20,0.12)' }}>
                      {[tr('units.type'), tr('units.area'), tr('units.floor'), tr('units.price')].map((h, i) => (
                        <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--tm)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.45rem 0.6rem' }}>
                          {h}
                        </div>
                      ))}
                    </div>
                    <div style={{ height: 350, overflowY: 'auto' }}>
                      {filteredUnits.map((u, i) => (
                        <div key={i} style={{
                          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
                          borderBottom: i < filteredUnits.length - 1 ? '1px solid rgba(139,105,20,0.07)' : 'none',
                          background: i % 2 === 0 ? 'transparent' : 'rgba(160,120,32,0.03)',
                        }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--t2)', padding: '0.42rem 0.6rem' }}>{u.type}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--t2)', padding: '0.42rem 0.6rem' }}>{u.area_m2} м²</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--t2)', padding: '0.42rem 0.6rem' }}>{u.floor ?? '—'}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--t2)', padding: '0.42rem 0.6rem' }}>${u.price_usd.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div style={{ padding: isMobile ? '1rem' : '1.5rem', borderTop: isMobile ? '1px solid rgba(139,105,20,0.1)' : 'none' }}>
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

              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>{tr('modal.onMap')}</h4>
              <div onClick={() => onOpenMap(c.id)} title="Открыть на карте"
                style={{ height: 180, marginBottom: '1.5rem', border: '1px solid rgba(139,105,20,0.15)', overflow: 'hidden', cursor: 'pointer' }}>
                <MiniMap lat={c.lat} lng={c.lng} name={c.name} theme={theme} />
              </div>

              {/* ── Developer block ── */}
              {(c.developer_logo || c.developer_description) && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>
                    {tr('modal.aboutDeveloper')}
                  </h4>
                  <div style={{ background: 'var(--card)', border: '1px solid rgba(139,105,20,0.12)', borderRadius: 8, padding: '0.9rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: c.developer_description ? 10 : 0 }}>
                      {c.developer_logo && (
                        <img
                          src={c.developer_logo} alt={c.developer}
                          style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 6, background: 'rgba(255,255,255,0.06)', padding: 4, flexShrink: 0 }}
                        />
                      )}
                      <div>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 400, color: 'var(--t1)', lineHeight: 1.2 }}>{c.developer}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.57rem', color: 'var(--tm)', letterSpacing: '0.08em', marginTop: 3 }}>{tr('modal.developer_label')}</div>
                      </div>
                    </div>
                    {c.developer_description && (() => {
                      const MAX = 180
                      const isLong = c.developer_description.length > MAX
                      return (
                        <div>
                          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'var(--t3)', lineHeight: 1.65, margin: 0 }}>
                            {(() => {
                              const text = translated.developer_description || c.developer_description || ''
                              return developerExpanded || !isLong ? text : text.slice(0, MAX) + '…'
                            })()}
                          </p>
                          {isLong && (
                            <button
                              onClick={() => setDeveloperExpanded(v => !v)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#A07820', letterSpacing: '0.08em', marginTop: 7, padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                            >
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

              {/* ── Infrastructure block ── */}
              {infraItems.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>
                    {tr('modal.nearbyInfra')}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {infraItems.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        background: 'var(--card)',
                        border: '1px solid rgba(139,105,20,0.12)',
                        borderRadius: 6, padding: '6px 11px',
                      }}>
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

              {/* ── Units: summary + filter + chart (desktop right col) ── */}
              {units.length > 0 && !isMobile && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', height: 350 }}>

                  {/* Summary */}
                  <div style={{ background: 'var(--card)', border: '1px solid rgba(139,105,20,0.12)', borderRadius: 4, padding: '0.7rem 0.85rem', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#A07820', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                      {tr('units.summary')}
                    </div>
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

                  {/* Type filter */}
                  <div style={{ flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--tm)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                      {tr('units.distribution')}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {['all', ...unitTypes].map(t => {
                        const active = unitsTypeFilter === t
                        return (
                          <button key={t} onClick={() => setUnitsTypeFilter(t)} style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.06em',
                            padding: '3px 10px', borderRadius: 20, cursor: 'pointer',
                            border: active ? '1px solid rgba(201,169,110,0.6)' : '1px solid rgba(139,105,20,0.25)',
                            background: active ? 'rgba(160,120,32,0.2)' : 'transparent',
                            color: active ? '#C9A96E' : 'var(--tm)',
                            transition: 'all 0.15s',
                          }}>
                            {t === 'all' ? tr('units.filterAll') : t}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Bar chart */}
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <Bar data={unitBarData} options={{
                      indexAxis: 'y' as const,
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(30,30,30,0.9)', bodyColor: '#fff', displayColors: false } },
                      scales: {
                        x: { display: false, grid: { display: false } },
                        y: { grid: { display: false }, ticks: { color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : '#374151', font: { family: 'DM Mono', size: 11 } } },
                      },
                    } as never} />
                  </div>

                </div>
              )}

              {/* CTA buttons — desktop only here; mobile gets sticky footer */}
              {!isMobile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ctaButtons}
                </div>
              )}
            </div>
          </div>
        </div>{/* end scrollable */}

        {/* Sticky CTA footer (mobile only) */}
        {isMobile && (
          <div style={{
            flexShrink: 0,
            padding: '0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom))',
            borderTop: '1px solid var(--border-c)',
            background: 'var(--surface)',
          }}>
            {ctaButtons}
          </div>
        )}
      </div>
    </div>
  )
}
