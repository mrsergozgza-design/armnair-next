'use client'
import dynamic from 'next/dynamic'
import { Complex } from '@/lib/types'
import PropertyCard from './PropertyCard'

const MapPanel = dynamic(() => import('./MapPanel'), { ssr: false })

interface SplitPanelProps {
  id?: string
  complexes: Complex[]
  onCardClick: (id: string) => void
}

export default function SplitPanel({ id, complexes, onCardClick }: SplitPanelProps) {
  return (
    <div id={id} style={{ display: 'flex', alignItems: 'stretch', minHeight: 'calc(100vh - 64px)' }}>
      {/* Left panel — card grid */}
      <div style={{
        flexShrink: 0, width: '45%', minWidth: 0,
        borderRight: '1px solid rgba(139,105,20,0.1)',
        padding: '1.25rem', paddingBottom: '5rem',
        overflowY: 'auto',
      }}>
        {complexes.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: 300, color: '#555560',
            fontFamily: 'var(--font-mono)', fontSize: '0.8rem', gap: 8,
          }}>
            <span style={{ fontSize: '2rem' }}>◻</span>
            <span>Нет объектов по выбранным фильтрам</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {complexes.map(c => (
              <PropertyCard key={c.id} complex={c} onClick={() => onCardClick(c.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Right panel — map */}
      <div
        id="right-panel"
        style={{
          flexShrink: 0, width: '55%',
          position: 'sticky', top: 64,
          height: 'calc(100vh - 64px)',
        }}
      >
        <MapPanel complexes={complexes} onMarkerClick={onCardClick} />
      </div>
    </div>
  )
}
