import { Complex } from '@/lib/types'
import { fmtAmd } from '@/lib/utils'

interface StatsRowProps {
  data: Complex[]
}

export default function StatsRow({ data }: StatsRowProps) {
  const districts = new Set(data.map(c => c.district)).size
  const minPrice = data.length ? Math.min(...data.map(c => c.price_usd)) : 0
  const taxCount = data.filter(c => c.tax_refund).length

  const stats = [
    { value: String(data.length), label: 'проектов' },
    { value: String(districts), label: 'локаций' },
    { value: `$${minPrice.toLocaleString()}`, label: 'от/м²' },
    { value: String(taxCount), label: 'с возвратом' },
  ]

  return (
    <div style={{
      borderBottom: '1px solid rgba(139,105,20,0.08)',
      padding: '0.4rem 2rem',
      background: '#09090F',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.6rem', fontWeight: 400,
              color: '#A07820', lineHeight: 1,
            }}>
              {s.value}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
              letterSpacing: '0.1em', color: '#555560',
              textTransform: 'uppercase',
            }}>
              {s.label}
            </span>
            {i < stats.length - 1 && (
              <span style={{ marginLeft: '1rem', width: 1, height: 16, background: 'rgba(139,105,20,0.15)', display: 'inline-block', verticalAlign: 'middle' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
