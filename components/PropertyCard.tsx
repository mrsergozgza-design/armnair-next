'use client'
import { Complex } from '@/lib/types'
import { fmtAmd, statusStyle, freshLabel, parseYield, priceGrowth } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

interface PropertyCardProps {
  complex: Complex
  onClick: () => void
}

export default function PropertyCard({ complex: c, onClick }: PropertyCardProps) {
  const ss = statusStyle(c.status)
  const fresh = freshLabel(c.last_updated)
  const growth = priceGrowth(c.history)

  return (
    <div
      onClick={onClick}
      style={{
        background: '#16161F',
        border: '1px solid rgba(139,105,20,0.1)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
        borderRadius: 2,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(139,105,20,0.35)'
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(139,105,20,0.1)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Image area */}
      <div style={{ position: 'relative', height: 200, background: '#0d0d14', overflow: 'hidden' }}>
        {c.image && (
          <img
            src={c.image}
            alt={c.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)' }}
          />
        )}
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(9,9,15,0.9) 0%, transparent 60%)',
        }} />

        {/* Tax refund badge - top left */}
        {c.tax_refund && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: 'rgba(42,157,143,0.85)', borderRadius: 2,
            padding: '2px 7px',
            fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
            letterSpacing: '0.08em', color: '#fff',
          }}>
            НАЛ. ВОЗВРАТ
          </div>
        )}

        {/* Status badge - top right */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: ss.bg, border: `1px solid ${ss.border}`,
          borderRadius: 2, padding: '2px 8px',
          fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
          letterSpacing: '0.06em', color: ss.color,
        }}>
          {c.status}
        </div>

        {/* District - bottom left */}
        <div style={{
          position: 'absolute', bottom: 10, left: 10,
          fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
          color: 'rgba(240,237,232,0.65)', letterSpacing: '0.08em',
        }}>
          {c.district}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '0.85rem' }}>
        {/* Developer + yield row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#9A9A9A', letterSpacing: '0.08em' }}>
            {c.developer}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
            color: '#2A9D8F',
            background: 'rgba(42,157,143,0.1)', border: '1px solid rgba(42,157,143,0.25)',
            borderRadius: 2, padding: '1px 6px',
          }}>
            {c.yield}
          </span>
        </div>

        {/* Name */}
        <h3 style={{
          fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 400,
          color: '#F0EDE8', margin: '0 0 0.6rem 0', lineHeight: 1.1,
        }}>
          {c.name}
        </h3>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: '0.65rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: '#C9A96E', fontWeight: 500 }}>
            ${c.price_usd.toLocaleString()}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#9A9A9A' }}>
            {fmtAmd(c.price_amd)}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#555560' }}>
            /м²
          </span>
        </div>

        {/* Metrics strip */}
        <div style={{
          display: 'flex', gap: 0,
          borderTop: '1px solid rgba(139,105,20,0.1)',
          borderBottom: '1px solid rgba(139,105,20,0.1)',
          margin: '0 -0.85rem 0.65rem -0.85rem',
          padding: '0.4rem 0.85rem',
        }}>
          {[
            { label: 'Доходность', value: c.yield },
            { label: 'Рост', value: growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%` },
            { label: 'Район', value: c.district.split('-')[0] },
          ].map((m, i) => (
            <div key={i} style={{ flex: 1, textAlign: i === 1 ? 'center' : i === 2 ? 'right' : 'left' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#555560', letterSpacing: '0.06em', marginBottom: 1 }}>
                {m.label}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#CCCCCC' }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
            color: fresh.stale ? '#555560' : '#2A9D8F',
            letterSpacing: '0.04em',
          }}>
            {fresh.label ?? '—'}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            color: '#A07820', display: 'flex', alignItems: 'center', gap: 3,
          }}>
            Подробнее <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </div>
  )
}
