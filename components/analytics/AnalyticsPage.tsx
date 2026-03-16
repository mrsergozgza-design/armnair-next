'use client'
import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Tooltip, Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Complex } from '@/lib/types'
import { fmtAmd, statusStyle, parseYield } from '@/lib/utils'
import { ArrowRight, TrendingUp } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface AnalyticsPageProps {
  data: Complex[]
  onOpenModal: (id: string) => void
  onBack: () => void
}

export default function AnalyticsPage({ data, onOpenModal, onBack }: AnalyticsPageProps) {
  const minPrice = data.length ? Math.min(...data.map(c => c.price_usd)) : 0
  const maxPrice = data.length ? Math.max(...data.map(c => c.price_usd)) : 0
  const avgPrice = data.length ? Math.round(data.reduce((a, c) => a + c.price_usd, 0) / data.length) : 0
  const taxCount = data.filter(c => c.tax_refund).length

  const kpis = [
    { label: 'Всего объектов', value: String(data.length) },
    { label: 'Мин. цена/м²', value: `$${minPrice.toLocaleString()}` },
    { label: 'Средняя цена/м²', value: `$${avgPrice.toLocaleString()}` },
    { label: 'Макс. цена/м²', value: `$${maxPrice.toLocaleString()}` },
    { label: 'Нал. возврат', value: String(taxCount) },
  ]

  // District avg price data
  const districtData = useMemo(() => {
    const map: Record<string, number[]> = {}
    data.forEach(c => {
      if (!map[c.district]) map[c.district] = []
      map[c.district].push(c.price_usd)
    })
    return Object.entries(map).map(([d, prices]) => ({
      district: d,
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    })).sort((a, b) => b.avg - a.avg)
  }, [data])

  const barChartData = {
    labels: districtData.map(d => d.district),
    datasets: [{
      label: 'Средняя цена ($)',
      data: districtData.map(d => d.avg),
      backgroundColor: 'rgba(160,120,32,0.4)',
      borderColor: '#A07820',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(201,169,110,0.5)',
    }]
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: 'var(--card)', borderColor: 'rgba(160,120,32,0.3)', borderWidth: 1, titleColor: 'var(--t3)', bodyColor: '#C9A96E' },
    },
    scales: {
      x: { grid: { color: 'rgba(160,120,32,0.08)' }, ticks: { color: 'var(--tm)', font: { family: 'DM Mono', size: 10 } } },
      y: { grid: { color: 'rgba(160,120,32,0.08)' }, ticks: { color: 'var(--tm)', font: { family: 'DM Mono', size: 10 } } },
    },
  }

  // Top 3 by yield
  const topROI = [...data].sort((a, b) => parseYield(b.yield) - parseYield(a.yield)).slice(0, 3)
  const maxYield = topROI.length ? parseYield(topROI[0].yield) : 10

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: 80, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <button
              onClick={onBack}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                color: 'var(--t3)', letterSpacing: '0.08em',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C9A96E')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--t3)')}
            >
              ← Главная
            </button>
            <span style={{ color: 'var(--tm)' }}>/</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#A07820' }}>Аналитика</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.8rem', fontWeight: 300, color: 'var(--t1)', margin: 0 }}>
              Аналитика рынка
            </h1>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(42,157,143,0.1)', border: '1px solid rgba(42,157,143,0.25)',
              borderRadius: 100, padding: '3px 10px',
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#2A9D8F',
            }}>
              <TrendingUp size={10} />
              Рынок активен
            </div>
          </div>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--t3)', fontSize: '0.9rem', margin: '8px 0 0 0' }}>
            Ереван · {data.length} объектов · обновлено в реальном времени
          </p>
        </div>

        {/* KPI Strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5,1fr)',
          gap: 12, marginBottom: '2rem',
        }}>
          {kpis.map((k, i) => (
            <div key={i} style={{
              background: 'var(--card)', border: '1px solid rgba(139,105,20,0.12)',
              padding: '1.1rem 1rem', borderRadius: 2, textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 400, color: '#C9A96E', lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--tm)', letterSpacing: '0.08em', marginTop: 5 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* 2-col charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: '2rem' }}>
          {/* Bar chart */}
          <div style={{ background: 'var(--card)', border: '1px solid rgba(139,105,20,0.1)', padding: '1.25rem', borderRadius: 2 }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--t3)', letterSpacing: '0.1em', margin: '0 0 1rem 0', textTransform: 'uppercase' }}>
              Средняя цена по районам
            </h3>
            <div style={{ height: 220 }}>
              <Bar data={barChartData} options={barOptions as never} />
            </div>
          </div>

          {/* Top ROI */}
          <div style={{ background: 'var(--card)', border: '1px solid rgba(139,105,20,0.1)', padding: '1.25rem', borderRadius: 2 }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--t3)', letterSpacing: '0.1em', margin: '0 0 1rem 0', textTransform: 'uppercase' }}>
              Топ-3 по доходности
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {topROI.map((c, i) => {
                const pct = (parseYield(c.yield) / maxYield) * 100
                const colors = ['#C9A96E', '#A07820', '#7A5C10']
                return (
                  <div key={c.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: colors[i], width: 16 }}>
                          {['①', '②', '③'][i]}
                        </span>
                        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--t1)' }}>{c.name}</span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: colors[i] }}>{c.yield}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(139,105,20,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: colors[i], borderRadius: 2, transition: 'width 0.6s ease' }} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--tm)', marginTop: 3 }}>
                      {c.developer} · {c.district}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Data table */}
        <div style={{ background: 'var(--card)', border: '1px solid rgba(139,105,20,0.1)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(139,105,20,0.08)' }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--t3)', letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' }}>
              Все объекты
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(139,105,20,0.1)' }}>
                  {['Объект', 'Застройщик', 'Район', '$/м²', '֏/м²', 'Доходность', 'Статус', 'Возврат', ''].map(h => (
                    <th key={h} style={{
                      padding: '0.7rem 1rem', textAlign: 'left',
                      fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                      color: 'var(--tm)', letterSpacing: '0.1em', textTransform: 'uppercase',
                      fontWeight: 400,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((c, i) => {
                  const ss = statusStyle(c.status)
                  return (
                    <tr
                      key={c.id}
                      onClick={() => onOpenModal(c.id)}
                      style={{
                        borderBottom: '1px solid rgba(139,105,20,0.06)',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '0.8rem 1rem', fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--t1)', whiteSpace: 'nowrap' }}>{c.name}</td>
                      <td style={{ padding: '0.8rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--t3)' }}>{c.developer}</td>
                      <td style={{ padding: '0.8rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--t3)' }}>{c.district}</td>
                      <td style={{ padding: '0.8rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#C9A96E', whiteSpace: 'nowrap' }}>${c.price_usd.toLocaleString()}</td>
                      <td style={{ padding: '0.8rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--t3)', whiteSpace: 'nowrap' }}>{fmtAmd(c.price_amd)}</td>
                      <td style={{ padding: '0.8rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#2A9D8F' }}>{c.yield}</td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <span style={{ background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color, borderRadius: 2, padding: '2px 7px', fontFamily: 'var(--font-mono)', fontSize: '0.58rem', whiteSpace: 'nowrap' }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: c.tax_refund ? '#2A9D8F' : '#555560' }}>
                        {c.tax_refund ? 'Да' : 'Нет'}
                      </td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <ArrowRight size={13} color="#A07820" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
