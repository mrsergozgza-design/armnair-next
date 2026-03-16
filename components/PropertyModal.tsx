'use client'
import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { X, Download, ArrowRight, TrendingUp, Phone, MessageCircle } from 'lucide-react'
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
  onOpenMap: () => void
}

export default function PropertyModal({ complex: c, onClose, onOpenContact, onOpenMap }: PropertyModalProps) {
  const { theme } = useTheme()
  const [area, setArea] = useState(60)
  const [mounted, setMounted] = useState(false)

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

  // Tax calculator
  const totalCost = c.price_usd * area
  const annualRent = totalCost * (yld / 100)
  const taxRate = 0.10
  const annualTax = annualRent * taxRate
  const refundAmt = c.tax_refund ? annualTax * 0.5 : 0
  const netTax = annualTax - refundAmt

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
    { label: 'Нал. возврат', value: c.tax_refund ? 'Да' : 'Нет' },
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
                НАЛ. ВОЗВРАТ
              </div>
            )}
          </div>

          {/* Name + developer */}
          <div style={{ position: 'absolute', bottom: 20, left: 24, right: 60 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#9A9A9A', marginBottom: 4, letterSpacing: '0.08em' }}>{c.developer} · {c.district}</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 400, margin: 0, color: '#F0EDE8', lineHeight: 1 }}>{c.name}</h2>
          </div>
        </div>

        {/* Presentation download bar */}
        {c.presentation && (
          <a href={c.presentation} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1.5rem',
            background: 'rgba(160,120,32,0.08)', borderBottom: '1px solid rgba(160,120,32,0.15)',
            color: '#C9A96E', textDecoration: 'none',
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.06em',
          }}>
            <Download size={14} />
            <span>Скачать презентацию объекта</span>
            <ArrowRight size={13} style={{ marginLeft: 'auto' }} />
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
                Калькулятор
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--t3)' }}>Площадь: {area} м²</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#C9A96E' }}>
                    ${totalCost.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range" min={30} max={300} value={area}
                  onChange={e => setArea(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#A07820', cursor: 'pointer' }}
                />
              </div>
              {[
                { label: 'Стоимость', value: `$${totalCost.toLocaleString()}` },
                { label: 'Нал. в год', value: `$${annualTax.toFixed(0)}` },
                { label: 'Возврат', value: c.tax_refund ? `$${refundAmt.toFixed(0)}` : 'Нет', color: c.tax_refund ? '#2A9D8F' : 'var(--tm)' },
                { label: 'Нал. чистый', value: `$${netTax.toFixed(0)}` },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--tm)' }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: row.color ?? 'var(--t2)' }}>{row.value}</span>
                </div>
              ))}
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
            <div style={{ height: 180, marginBottom: '1.5rem', border: '1px solid rgba(139,105,20,0.15)', overflow: 'hidden' }}>
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
