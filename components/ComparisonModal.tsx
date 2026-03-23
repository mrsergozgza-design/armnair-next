'use client'
import { useEffect, useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Complex } from '@/lib/types'
import { fmtAmd, parseYield } from '@/lib/utils'

interface Props {
  complexes: Complex[]        // только те, что в compareIds
  onRemove: (id: string) => void
  onClear: () => void
  onClose: () => void
  onOpenModal: (id: string) => void
}

const MONTHLY_REFUND_CAP = 500_000

export default function ComparisonModal({ complexes, onRemove, onClear, onClose, onOpenModal }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.body.classList.add('modal-open')
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('modal-open')
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  if (complexes.length === 0) return null

  // Identify best values for highlighting
  const minPrice = Math.min(...complexes.map(c => c.price_usd))
  const maxYield = Math.max(...complexes.map(c => parseYield(c.yield)))

  const cell = (content: React.ReactNode, highlight?: 'best' | null) => ({
    content,
    highlight,
  })

  const rows: { label: string; cells: { content: React.ReactNode; highlight?: 'best' | null }[] }[] = [
    {
      label: 'Цена ($/м²)',
      cells: complexes.map(c => cell(
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 500, color: c.price_usd === minPrice ? '#2A9D8F' : 'var(--t1)' }}>
          ${c.price_usd.toLocaleString()}
        </span>,
        c.price_usd === minPrice ? 'best' : null
      )),
    },
    {
      label: 'Цена (֏/м²)',
      cells: complexes.map(c => cell(
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--t2)' }}>
          {fmtAmd(c.price_amd)}
        </span>
      )),
    },
    {
      label: 'Район',
      cells: complexes.map(c => cell(
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--t2)' }}>{c.district}</span>
      )),
    },
    {
      label: 'Статус',
      cells: complexes.map(c => cell(
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--t2)' }}>{c.status}</span>
      )),
    },
    {
      label: 'Тип объекта',
      cells: complexes.map(c => cell(
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--t2)' }}>{c.unit_type ?? '—'}</span>
      )),
    },
    {
      label: 'Доходность',
      cells: complexes.map(c => {
        const y = parseYield(c.yield)
        return cell(
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 500, color: y === maxYield ? '#2A9D8F' : 'var(--t2)' }}>
            {c.yield}
          </span>,
          y === maxYield ? 'best' : null
        )
      }),
    },
    {
      label: 'Макс. возврат\nналога (мес.)',
      cells: complexes.map(c => cell(
        c.tax_refund
          ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#2A9D8F', fontWeight: 500 }}>
              до {fmtAmd(MONTHLY_REFUND_CAP)}
            </span>
          : <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--tm)' }}>—</span>,
        c.tax_refund ? 'best' : null
      )),
    },
    {
      label: 'Мин. площадь',
      cells: complexes.map(c => cell(
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--t2)' }}>{c.min_area ? `от ${c.min_area} м²` : '—'}</span>
      )),
    },
    {
      label: 'Рассрочка',
      cells: complexes.map(c => cell(
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--t2)' }}>{c.payment_plan ?? '—'}</span>
      )),
    },
    {
      label: 'Метро',
      cells: complexes.map(c => cell(
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--t2)' }}>{c.subway_station ?? '—'}</span>
      )),
    },
    {
      label: 'Инфраструктура',
      cells: complexes.map(c => cell(
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--t2)', display: 'block', maxWidth: 180 }}>{c.infrastructure ?? '—'}</span>
      )),
    },
  ]

  const colW = complexes.length === 2 ? '50%' : complexes.length === 3 ? '33.33%' : '25%'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9100,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '1rem',
        paddingTop: '72px',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.25s ease',
        overflowY: 'auto',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '100%', maxWidth: 1100,
        background: 'var(--surface)',
        border: '1px solid rgba(139,105,20,0.2)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        borderRadius: 2,
        transform: mounted ? 'translateY(0)' : 'translateY(24px)',
        transition: 'transform 0.3s ease',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(139,105,20,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#A07820', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Сравнение объектов
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--tm)' }}>
              {complexes.length} из 4
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={onClear}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: '1px solid rgba(231,111,81,0.3)',
                color: '#E76F51', borderRadius: 2, padding: '4px 12px',
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em',
                cursor: 'pointer', transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(231,111,81,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <Trash2 size={11} />
              ОЧИСТИТЬ
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border-c)',
                borderRadius: '50%', width: 30, height: 30,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--t3)',
                transition: 'background 0.2s, color 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(160,120,32,0.12)'
                e.currentTarget.style.color = '#C9A96E'
                e.currentTarget.style.borderColor = 'rgba(160,120,32,0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--card)'
                e.currentTarget.style.color = 'var(--t3)'
                e.currentTarget.style.borderColor = 'var(--border-c)'
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable table area */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>

        {/* Object headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(139,105,20,0.15)', minWidth: 480 }}>
          {/* Label column */}
          <div style={{ width: 130, flexShrink: 0 }} />
          {complexes.map(c => (
            <div key={c.id} style={{
              width: colW, flex: 1,
              padding: '0.75rem 1rem',
              borderLeft: '1px solid rgba(139,105,20,0.1)',
              position: 'relative',
            }}>
              {/* Remove button */}
              <button
                onClick={() => onRemove(c.id)}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--tm)', padding: 2,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#E76F51')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--tm)')}
              >
                <X size={12} />
              </button>

              {/* Image */}
              <div
                onClick={() => onOpenModal(c.id)}
                style={{
                  height: 100, overflow: 'hidden', borderRadius: 2,
                  marginBottom: 8, cursor: 'pointer',
                  background: 'var(--card)',
                }}
              >
                {c.image
                  ? <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75)' }} />
                  : <div style={{ width: '100%', height: '100%', background: 'var(--card)' }} />
                }
              </div>

              <div
                onClick={() => onOpenModal(c.id)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--tm)', marginBottom: 2 }}>{c.developer}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 400, color: 'var(--t1)', lineHeight: 1.1 }}>{c.name}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison rows */}
        {rows.map((row, ri) => (
          <div
            key={ri}
            style={{
              display: 'flex',
              minWidth: 480,
              borderBottom: '1px solid rgba(139,105,20,0.07)',
              background: ri % 2 === 0 ? 'transparent' : 'rgba(160,120,32,0.02)',
            }}
          >
            {/* Label */}
            <div style={{
              width: 130, flexShrink: 0, padding: '0.55rem 1rem',
              display: 'flex', alignItems: 'center',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                color: 'var(--tm)', letterSpacing: '0.04em', whiteSpace: 'pre-line',
              }}>
                {row.label}
              </span>
            </div>

            {/* Values */}
            {row.cells.map((cell, ci) => (
              <div
                key={ci}
                style={{
                  flex: 1, padding: '0.55rem 1rem',
                  borderLeft: '1px solid rgba(139,105,20,0.08)',
                  display: 'flex', alignItems: 'center',
                  background: cell.highlight === 'best' ? 'rgba(42,157,143,0.05)' : 'transparent',
                  transition: 'background 0.2s',
                }}
              >
                {cell.highlight === 'best' && (
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.5rem',
                    color: '#2A9D8F', marginRight: 6, flexShrink: 0,
                    border: '1px solid rgba(42,157,143,0.3)',
                    borderRadius: 2, padding: '1px 4px', letterSpacing: '0.06em',
                  }}>
                    ЛУЧШЕ
                  </span>
                )}
                {cell.content}
              </div>
            ))}
          </div>
        ))}

        <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'center', minWidth: 480 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.57rem', color: 'var(--tm)', letterSpacing: '0.04em' }}>
            Нажмите на название объекта, чтобы открыть детальную карточку
          </span>
        </div>

        </div>{/* end scrollable */}
      </div>
    </div>
  )
}
