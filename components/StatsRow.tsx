'use client'
import { Complex } from '@/lib/types'
import { useT } from '@/lib/StaticTranslationProvider'

export default function StatsRow({ data }: { data: Complex[] }) {
  const tr = useT()
  const districts = new Set(data.map(c => c.district)).size
  const minPrice  = data.length ? Math.min(...data.map(c => c.price_usd)) : 0
  const taxCount  = data.filter(c => c.tax_refund).length

  const stats = [
    { value: String(data.length), label: tr('stats.projects') },
    { value: String(districts),   label: tr('stats.locations') },
    { value: `$${minPrice.toLocaleString()}`, label: tr('stats.fromPerSqm') },
    { value: String(taxCount),    label: tr('stats.taxRefund') },
  ]

  return (
    <div style={{
      borderBottom:'1px solid var(--border-c)',
      padding:'0.45rem 2rem',
      background:'var(--bg)',
      transition:'background 0.25s, border-color 0.25s',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:'2rem', flexWrap:'wrap' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'baseline', gap:6 }}>
            <span style={{ fontFamily:'var(--font-serif)', fontSize:'1.55rem', fontWeight:400, color:'var(--gold)', lineHeight:1 }}>
              {s.value}
            </span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.58rem', letterSpacing:'0.1em', color:'var(--tm)', textTransform:'uppercase' }}>
              {s.label}
            </span>
            {i < stats.length - 1 && (
              <span style={{ marginLeft:'1rem', width:1, height:14, background:'var(--border-c)', display:'inline-block', verticalAlign:'middle' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
