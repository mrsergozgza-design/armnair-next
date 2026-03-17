'use client'
import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { X, Download, TrendingUp, Phone, MessageCircle, Heart, GitCompare } from 'lucide-react'
import { Complex } from '@/lib/types'
import { fmtAmd, fmtDate, statusStyle, parseYield, priceGrowth } from '@/lib/utils'
import { useTheme } from './ThemeProvider'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

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
  const [area, setArea] = useState(60)
  const [interestRate, setInterestRate] = useState(11)
  const [loanPct, setLoanPct] = useState(0.80) // доля кредита от стоимости, default 80% (взнос 20%)
  const [salary, setSalary] = useState(600000)
  const [mounted, setMounted] = useState(false)
  const [heartAnim, setHeartAnim] = useState(false)

  useEffect(() => {
    if (c) {
      setMounted(true)
      document.body.classList.add('modal-open')
    } else {
      setMounted(false)
      document.body.classList.remove('modal-open')
    }
    return () => { document.body.classList.remove('modal-open') }
  }, [c])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!c) return null

  const ss = statusStyle(c.status)
  const yld = parseYield(c.yield)
  const growth = priceGrowth(c.history)

  // Tax calculator — mortgage-based refund (Armenian law)
  const INCOME_TAX_RATE = 0.20
  const MONTHLY_REFUND_CAP = 500_000 // ֏ — max 1.5M/quarter

  const priceAmd = c.price_amd * area
  // Сумма ипотеки: шаг 1M AMD, зажата в диапазон 10–90% от стоимости
  const loanStep = 1_000_000
  const loanMin = Math.ceil(priceAmd * 0.10 / loanStep) * loanStep
  const loanMax = Math.floor(priceAmd * 0.90 / loanStep) * loanStep
  const loanAmt = Math.min(loanMax, Math.max(loanMin, Math.round(loanPct * priceAmd / loanStep) * loanStep))
  const downPct = Math.round((1 - loanAmt / priceAmd) * 100)

  const monthlyInterest = (loanAmt * (interestRate / 100)) / 12
  const incomeTax = salary * INCOME_TAX_RATE
  const refundAmt = c.tax_refund ? Math.min(incomeTax, monthlyInterest, MONTHLY_REFUND_CAP) : 0
  const realPayment = monthlyInterest - refundAmt

  // Chart data
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
    plugins: { legend: { display: false }, tooltip: { backgroundColor: 'var(--card)', borderColor: 'rgba(160,120,32,0.3)', borderWidth: 1, titleColor: 'var(--t3)', bodyColor: '#C9A96E' } },
    scales: {
      x: { grid: { color: 'rgba(160,120,32,0.1)' }, ticks: { color: 'var(--tm)', font: { family: 'DM Mono', size: 10 } } },
      y: { grid: { color: 'rgba(160,120,32,0.1)' }, ticks: { color: 'var(--tm)', font: { family: 'DM Mono', size: 10 } } },
    },
  }

  const metrics = [
    { label: '$/м²', value: `$${c.price_usd.toLocaleString()}` },
    { label: '֏/м²', value: fmtAmd(c.price_amd) },
    { label: 'Доходность', value: c.yield },
    { label: 'Возврат налога', value: c.tax_refund ? 'Да' : 'Нет' },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        maxWidth: 900, width: '100%',
        background: 'var(--surface)',
        border: '1px solid rgba(139,105,20,0.2)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        maxHeight: '90vh', overflowY: 'auto',
        borderRadius: 2,
        transform: mounted ? 'translateY(0)' : 'translateY(24px)',
        transition: 'transform 0.3s ease',
        position: 'relative',
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14, zIndex: 10,
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(139,105,20,0.2)',
            borderRadius: '50%', width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#C9A96E',
          }}
        >
          <X size={15} />
        </button>

        {/* Compare button */}
        <button
          onClick={onToggleCompare}
          title={inCompare ? 'Убрать из сравнения' : 'Добавить к сравнению'}
          style={{
            position: 'absolute', top: 14, right: 94, zIndex: 10,
            background: inCompare ? 'rgba(160,120,32,0.25)' : 'rgba(0,0,0,0.5)',
            border: inCompare ? '1px solid rgba(201,169,110,0.5)' : '1px solid rgba(139,105,20,0.2)',
            borderRadius: '50%', width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.2s',
          }}
        >
          <GitCompare size={14} color="#C9A96E" />
        </button>

        {/* Favorite button */}
        <button
          onClick={() => { setHeartAnim(true); onToggleFavorite?.() }}
          onAnimationEnd={() => setHeartAnim(false)}
          className={heartAnim ? 'heart-pop' : ''}
          title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
          style={{
            position: 'absolute', top: 14, right: 54, zIndex: 10,
            background: isFavorite ? 'rgba(201,169,110,0.18)' : 'rgba(0,0,0,0.5)',
            border: isFavorite ? '1px solid rgba(201,169,110,0.5)' : '1px solid rgba(139,105,20,0.2)',
            borderRadius: '50%', width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s',
          }}
        >
          <Heart size={15} fill={isFavorite ? '#C9A96E' : 'none'} color="#C9A96E" />
        </button>

        {/* Hero image */}
        <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
          {c.image ? (
            <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--card)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(17,17,24,1) 0%, rgba(17,17,24,0.3) 50%, transparent 100%)' }} />

          {/* Badges */}
          <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6 }}>
            <div style={{ background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color, borderRadius: 2, fontFamily: 'var(--font-mono)', fontSize: '0.6rem', padding: '3px 10px', letterSpacing: '0.06em' }}>
              {c.status}
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
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, margin: 0, color: '#F0EDE8', lineHeight: 1 }}>{c.name}</h2>
          </div>
        </div>

        {/* Presentation CTA — directly under hero */}
        {c.presentation && (
          <a
            href={c.presentation}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: 'linear-gradient(135deg, #C9A96E 0%, #A68238 50%, #8B6A28 100%)',
              color: '#fff', textDecoration: 'none',
              fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
              letterSpacing: '0.12em', padding: '1rem 1.5rem',
              boxShadow: '0 4px 24px rgba(166,130,56,0.3)',
              transition: 'opacity 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.boxShadow = '0 6px 32px rgba(166,130,56,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(166,130,56,0.3)' }}
          >
            <Download size={16} />
            СКАЧАТЬ ПРЕЗЕНТАЦИЮ ОБЪЕКТА
          </a>
        )}

        {/* 4-col metric strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
          borderBottom: '1px solid rgba(139,105,20,0.1)',
        }}>
          {metrics.map((m, i) => (
            <div key={i} style={{
              padding: '0.9rem 1.25rem',
              borderRight: i < 3 ? '1px solid rgba(139,105,20,0.1)' : 'none',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--tm)', letterSpacing: '0.1em', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400, color: '#C9A96E' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* 2-col layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {/* Left column */}
          <div style={{ padding: '1.5rem', borderRight: '1px solid rgba(139,105,20,0.1)' }}>
            {/* Description */}
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.12em', marginBottom: 8, textTransform: 'uppercase' }}>Описание</h4>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'var(--t2)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{c.description}</p>

            {/* Info table */}
            <div style={{ marginBottom: '1.5rem' }}>
              {[
                { label: 'Обновлено', value: fmtDate(c.last_updated) },
                { label: 'Застройщик', value: c.developer },
                { label: 'Район', value: c.district },
                { label: 'Статус', value: c.status },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(139,105,20,0.08)',
                  padding: '0.45rem 0',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.06em' }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--t2)' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Extended characteristics */}
            {(c.unit_type || c.min_area || c.payment_plan || c.subway_station || c.infrastructure || c.commission || c.contact || c.website) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.12em', marginBottom: 8, textTransform: 'uppercase' }}>Характеристики</h4>
                {[
                  c.unit_type      && { label: 'Тип объекта',   value: c.unit_type },
                  c.min_area       && { label: 'Мин. площадь',  value: `${c.min_area} м²` },
                  c.payment_plan   && { label: 'Payment Plan',  value: c.payment_plan },
                  c.subway_station && { label: 'Метро',         value: c.subway_station },
                  c.infrastructure && { label: 'Инфраструктура',value: c.infrastructure },
                  c.commission     && { label: 'Комиссия',      value: `${c.commission}%` },
                  c.contact        && { label: 'Контакт',       value: c.contact },
                ].filter(Boolean).map((row, i) => {
                  const r = row as { label: string; value: string }
                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(139,105,20,0.08)',
                      padding: '0.45rem 0',
                    }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.06em' }}>{r.label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--t2)', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>{r.value}</span>
                    </div>
                  )
                })}
                {c.website && (
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(139,105,20,0.08)',
                    padding: '0.45rem 0',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.06em' }}>Сайт</span>
                    <a href={c.website} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--gold)', textDecoration: 'none', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>
                      {c.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Tax calculator */}
            <div style={{ background: 'rgba(160,120,32,0.05)', border: '1px solid rgba(160,120,32,0.12)', borderRadius: 4, padding: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#A07820', letterSpacing: '0.12em', marginBottom: 12, textTransform: 'uppercase' }}>
                Налоговый калькулятор
              </div>

              {/* Параметры объекта */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--tm)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                Параметры объекта
              </div>
              <div style={{ marginBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--t3)' }}>Площадь</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: '#C9A96E' }}>{area} м²  ·  {fmtAmd(priceAmd)}</span>
                </div>
                <input type="range" min={30} max={300} value={area}
                  onChange={e => setArea(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#A07820', cursor: 'pointer', marginBottom: 10 }} />
              </div>

              {/* Параметры ипотеки */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--tm)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, marginTop: 4 }}>
                Параметры ипотеки
              </div>

              {/* Сумма ипотеки */}
              <div style={{ marginBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--t3)' }}>Сумма ипотеки</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: '#C9A96E' }}>
                    {fmtAmd(loanAmt)}  ·  взнос {downPct}%
                  </span>
                </div>
                <input type="range" min={loanMin} max={loanMax} step={loanStep} value={loanAmt}
                  onChange={e => setLoanPct(Number(e.target.value) / priceAmd)}
                  style={{ width: '100%', accentColor: '#A07820', cursor: 'pointer', marginBottom: 10 }} />
              </div>

              {/* Ставка */}
              <div style={{ marginBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--t3)' }}>Процентная ставка</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: '#C9A96E' }}>{interestRate}% годовых</span>
                </div>
                <input type="range" min={8} max={15} step={0.5} value={interestRate}
                  onChange={e => setInterestRate(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#A07820', cursor: 'pointer', marginBottom: 10 }} />
              </div>

              {/* Зарплата */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--t3)' }}>Официальная зарплата</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: '#C9A96E' }}>{fmtAmd(salary)}/мес</span>
                </div>
                <input type="range" min={200000} max={2000000} step={50000} value={salary}
                  onChange={e => setSalary(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#A07820', cursor: 'pointer' }} />
              </div>

              {/* Результаты */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--tm)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, paddingTop: 4, borderTop: '1px solid rgba(160,120,32,0.12)' }}>
                Результаты
              </div>
              {[
                { label: 'Подоходный налог (20%)', value: fmtAmd(Math.round(incomeTax)) + '/мес' },
                { label: 'Проценты по ипотеке (в месяц)', value: fmtAmd(Math.round(monthlyInterest)) },
                { label: 'Сумма возврата (до 500к ֏)', value: c.tax_refund ? fmtAmd(Math.round(refundAmt)) + '/мес' : 'Нет', color: c.tax_refund ? '#2A9D8F' : 'var(--tm)' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.32rem 0', borderBottom: '1px solid rgba(160,120,32,0.06)', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--tm)' }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: row.color ?? 'var(--t2)', textAlign: 'right', flexShrink: 0 }}>{row.value}</span>
                </div>
              ))}

              {/* Ваш реальный платеж — акцент */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.45rem 0', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--t2)', fontWeight: 700 }}>Ваш реальный платеж по %</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#C9A96E', fontWeight: 700, flexShrink: 0 }}>{fmtAmd(Math.round(realPayment))}/мес</span>
              </div>

              {/* Итоговая выгода */}
              {c.tax_refund && (
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginTop: 10, padding: '0.6rem 0.75rem',
                  background: 'rgba(160,120,32,0.12)', border: '1px solid rgba(160,120,32,0.3)',
                  borderRadius: 3, gap: 12,
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#C9A96E', letterSpacing: '0.04em' }}>Итоговая выгода за год</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#C9A96E', fontWeight: 600, flexShrink: 0 }}>{fmtAmd(Math.round(refundAmt * 12))}</span>
                </div>
              )}

              {/* Disclaimer */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.57rem', color: 'var(--tm)', marginTop: 12, lineHeight: 1.6, opacity: 0.75 }}>
                * Расчет является приблизительным. Максимальный возврат ограничен 1.5 млн ֏ в квартал согласно законодательству РА.
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ padding: '1.5rem' }}>
            {/* Price chart */}
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.12em', marginBottom: 12, textTransform: 'uppercase' }}>
              Динамика цен
            </h4>
            <div style={{ height: 160, marginBottom: 8 }}>
              <Line data={chartData} options={chartOptions as never} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1.5rem' }}>
              <TrendingUp size={13} color={growth >= 0 ? '#2A9D8F' : '#E76F51'} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: growth >= 0 ? '#2A9D8F' : '#E76F51' }}>
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% за период
              </span>
            </div>

            {/* Mini-map */}
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--tm)', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>
              На карте
            </h4>
            <div
              onClick={() => onOpenMap(c.id)}
              title="Открыть на карте"
              style={{ height: 180, marginBottom: '1.5rem', border: '1px solid rgba(139,105,20,0.15)', overflow: 'hidden', cursor: 'pointer' }}
            >
              <MiniMap lat={c.lat} lng={c.lng} name={c.name} theme={theme} />
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={onOpenContact}
                style={{
                  background: 'rgba(160,120,32,0.15)',
                  border: '1px solid rgba(160,120,32,0.4)',
                  color: '#C9A96E', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                  letterSpacing: '0.1em', padding: '0.75rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(160,120,32,0.25)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(160,120,32,0.15)' }}
              >
                <Phone size={14} />
                ПОЛУЧИТЬ КОНСУЛЬТАЦИЮ
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <a href={`https://wa.me/971528892559?text=Интересует ${encodeURIComponent(c.name)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)',
                    color: '#25D366', padding: '0.55rem',
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    textDecoration: 'none',
                  }}
                >
                  <MessageCircle size={13} />
                  WhatsApp
                </a>
                <a href="https://t.me/NazaryanDubai"
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    background: 'rgba(42,171,238,0.08)', border: '1px solid rgba(42,171,238,0.25)',
                    color: '#2AABEE', padding: '0.55rem',
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    textDecoration: 'none',
                  }}
                >
                  Telegram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
