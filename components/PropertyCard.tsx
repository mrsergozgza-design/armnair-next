'use client'
import { memo } from 'react'
import { Complex } from '@/lib/types'
import { fmtAmd, statusStyle, freshLabel, priceGrowth } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

interface Props { complex: Complex; onClick: () => void; onHover?: (id: string | null) => void }

function PropertyCard({ complex: c, onClick, onHover }: Props) {
  const ss = statusStyle(c.status)
  const fresh = freshLabel(c.last_updated)
  const growth = priceGrowth(c.history)

  return (
    <div
      onClick={onClick}
      style={{
        background:'var(--card)', border:'1px solid var(--border-c)',
        overflow:'hidden', cursor:'pointer',
        transition:'border-color 0.28s, transform 0.28s, box-shadow 0.28s, background 0.25s',
        borderRadius:2, boxShadow:'var(--card-shadow)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(160,120,32,0.4)'
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'
        onHover?.(c.id)
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-c)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--card-shadow)'
        onHover?.(null)
      }}
    >
      {/* Image */}
      <div style={{ position:'relative', height:190, background:'var(--surface)', overflow:'hidden' }}>
        {c.image && (
          <img src={c.image} alt={c.name} loading="lazy"
            style={{ width:'100%', height:'100%', objectFit:'cover', filter:`brightness(var(--img-brightness))` }}
          />
        )}
        <div style={{ position:'absolute', inset:0, background:'var(--img-overlay)' }} />

        {c.tax_refund && (
          <div style={{
            position:'absolute', top:10, left:10,
            background:'rgba(42,157,143,0.85)', borderRadius:2,
            padding:'2px 7px', fontFamily:'var(--font-mono)', fontSize:'0.56rem',
            letterSpacing:'0.08em', color:'#fff',
          }}>НАЛ. ВОЗВРАТ</div>
        )}
        <div style={{
          position:'absolute', top:10, right:10,
          background:ss.bg, border:`1px solid ${ss.border}`,
          borderRadius:2, padding:'2px 8px',
          fontFamily:'var(--font-mono)', fontSize:'0.56rem',
          letterSpacing:'0.06em', color:ss.color,
        }}>{c.status}</div>
        <div style={{
          position:'absolute', bottom:10, left:10,
          fontFamily:'var(--font-mono)', fontSize:'0.58rem',
          color:'rgba(255,255,255,0.7)', letterSpacing:'0.08em',
        }}>{c.district}</div>
      </div>

      {/* Body */}
      <div style={{ padding:'0.8rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.35rem' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--t3)', letterSpacing:'0.08em' }}>
            {c.developer}
          </span>
          <span style={{
            fontFamily:'var(--font-mono)', fontSize:'0.58rem', color:'var(--teal)',
            background:'rgba(42,157,143,0.08)', border:'1px solid rgba(42,157,143,0.22)',
            borderRadius:2, padding:'1px 6px',
          }}>{c.yield}</span>
        </div>

        <h3 style={{ fontFamily:'var(--font-serif)', fontSize:'1.35rem', fontWeight:400, color:'var(--t1)', margin:'0 0 0.55rem 0', lineHeight:1.1 }}>
          {c.name}
        </h3>

        <div style={{ display:'flex', alignItems:'baseline', gap:7, marginBottom:'0.6rem' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.95rem', color:'var(--gold-b)', fontWeight:500 }}>
            ${c.price_usd.toLocaleString()}
          </span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.68rem', color:'var(--t3)' }}>
            {fmtAmd(c.price_amd)}
          </span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--tm)' }}>/м²</span>
        </div>

        {/* Metrics strip */}
        <div style={{
          display:'flex', gap:0,
          borderTop:'1px solid var(--border-c)', borderBottom:'1px solid var(--border-c)',
          margin:'0 -0.8rem 0.6rem -0.8rem', padding:'0.35rem 0.8rem',
        }}>
          {[
            { label:'Доходность', value:c.yield },
            { label:'Рост', value:growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%` },
            { label:'Район', value:c.district.split('-')[0] },
          ].map((m, i) => (
            <div key={i} style={{ flex:1, textAlign: i===1 ? 'center' : i===2 ? 'right' : 'left' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.54rem', color:'var(--tm)', letterSpacing:'0.06em', marginBottom:1 }}>{m.label}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:'var(--t2)' }}>{m.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', color: fresh.stale ? 'var(--tm)' : 'var(--teal)', letterSpacing:'0.04em' }}>
            {fresh.label ?? '—'}
          </span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.62rem', color:'var(--gold)', display:'flex', alignItems:'center', gap:3 }}>
            Подробнее <ArrowRight size={10} />
          </span>
        </div>
      </div>
    </div>
  )
}

export default memo(PropertyCard)
