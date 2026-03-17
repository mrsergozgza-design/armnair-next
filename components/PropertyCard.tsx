'use client'
import { memo, useState, useCallback } from 'react'
import { Complex } from '@/lib/types'
import { fmtAmd, statusStyle, freshLabel, priceGrowth } from '@/lib/utils'
import { ArrowRight, Heart, GitCompare } from 'lucide-react'

interface Props {
  complex: Complex
  onClick: () => void
  onHover?: (id: string | null) => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
  inCompare?: boolean
  onToggleCompare?: () => void
}

function PropertyCard({ complex: c, onClick, onHover, isFavorite = false, onToggleFavorite, inCompare = false, onToggleCompare }: Props) {
  const ss = statusStyle(c.status)
  const fresh = freshLabel(c.last_updated)
  const growth = priceGrowth(c.history)
  const [heartAnim, setHeartAnim] = useState(false)

  const handleHeart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setHeartAnim(true)
    onToggleFavorite?.()
  }, [onToggleFavorite])

  const favBorder = isFavorite
    ? '1px solid rgba(201,169,110,0.55)'
    : '1px solid var(--border-c)'
  const favShadow = isFavorite
    ? '0 0 0 1px rgba(201,169,110,0.18), 0 4px 24px rgba(160,120,32,0.18)'
    : 'var(--card-shadow)'

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--card)', border: favBorder,
        overflow: 'hidden', cursor: 'pointer',
        transition: 'border-color 0.28s, transform 0.28s, box-shadow 0.28s, background 0.25s',
        borderRadius: 2, boxShadow: favShadow,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(160,120,32,0.4)'
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'
        onHover?.(c.id)
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isFavorite ? 'rgba(201,169,110,0.55)' : 'var(--border-c)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = favShadow
        onHover?.(null)
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 190, background: 'var(--surface)', overflow: 'hidden' }}>
        {c.image && (
          <img src={c.image} alt={c.name} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: `brightness(var(--img-brightness))` }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'var(--img-overlay)' }} />

        {c.tax_refund && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: 'rgba(42,157,143,0.85)', borderRadius: 2,
            padding: '2px 7px', fontFamily: 'var(--font-mono)', fontSize: '0.56rem',
            letterSpacing: '0.08em', color: '#fff',
          }}>ВОЗВРАТ НАЛОГА</div>
        )}

        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: ss.bg, border: `1px solid ${ss.border}`,
          borderRadius: 2, padding: '2px 8px',
          fontFamily: 'var(--font-mono)', fontSize: '0.56rem',
          letterSpacing: '0.06em', color: ss.color,
        }}>{c.status}</div>

        {/* Compare button */}
        <button
          onClick={e => { e.stopPropagation(); e.preventDefault(); onToggleCompare?.() }}
          title={inCompare ? 'Убрать из сравнения' : 'Добавить к сравнению'}
          style={{
            position: 'absolute', bottom: 10, right: 44,
            background: inCompare ? 'rgba(160,120,32,0.35)' : 'rgba(0,0,0,0.45)',
            border: inCompare ? '1px solid rgba(201,169,110,0.6)' : '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%', width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.2s', zIndex: 10,
          }}
        >
          <GitCompare size={12} color={inCompare ? '#C9A96E' : 'rgba(255,255,255,0.75)'} />
        </button>

        {/* Heart button */}
        <button
          onClick={handleHeart}
          onAnimationEnd={() => setHeartAnim(false)}
          className={heartAnim ? 'heart-pop' : ''}
          style={{
            position: 'absolute', bottom: 10, right: 10,
            background: 'rgba(0,0,0,0.45)',
            border: isFavorite ? '1px solid rgba(201,169,110,0.5)' : '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50%', width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s',
            zIndex: 10,
          }}
        >
          <Heart
            size={13}
            fill={isFavorite ? '#C9A96E' : 'none'}
            color={isFavorite ? '#C9A96E' : 'rgba(255,255,255,0.75)'}
          />
        </button>

        <div style={{
          position: 'absolute', bottom: 10, left: 10,
          fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
          color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em',
        }}>{c.district}</div>
      </div>

      {/* Body */}
      <div style={{ padding: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--t3)', letterSpacing: '0.08em' }}>
            {c.developer}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--teal)',
            background: 'rgba(42,157,143,0.08)', border: '1px solid rgba(42,157,143,0.22)',
            borderRadius: 2, padding: '1px 6px',
          }}>{c.payment_plan ?? c.yield}</span>
        </div>

        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 400, color: 'var(--t1)', margin: '0 0 0.55rem 0', lineHeight: 1.1 }}>
          {c.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: '0.6rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--gold-b)', fontWeight: 500 }}>
            ${c.price_usd.toLocaleString()}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--t3)' }}>
            {fmtAmd(c.price_amd)}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--tm)' }}>/м²</span>
        </div>

        {/* Metrics strip */}
        <div style={{
          display: 'flex', gap: 0,
          borderTop: '1px solid var(--border-c)', borderBottom: '1px solid var(--border-c)',
          margin: '0 -0.8rem 0.6rem -0.8rem', padding: '0.35rem 0.8rem',
        }}>
          {[
            { label: c.unit_type ? 'Тип' : 'Доходность', value: c.unit_type ?? c.yield },
            { label: c.min_area ? 'Площадь' : 'Рост', value: c.min_area ? `от ${c.min_area}м²` : (growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`) },
            { label: 'Район', value: c.district.split('-')[0] },
          ].map((m, i) => (
            <div key={i} style={{ flex: 1, textAlign: i === 1 ? 'center' : i === 2 ? 'right' : 'left' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.54rem', color: 'var(--tm)', letterSpacing: '0.06em', marginBottom: 1 }}>{m.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--t2)' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Description snippet */}
        {c.description && (
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--t3)',
            lineHeight: 1.5, margin: '0 0 0.5rem 0',
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {c.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: fresh.stale ? 'var(--tm)' : 'var(--teal)', letterSpacing: '0.04em' }}>
            {fresh.label ?? '—'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 3 }}>
            Подробнее <ArrowRight size={10} />
          </span>
        </div>
      </div>
    </div>
  )
}

export default memo(PropertyCard)
