'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Complex } from '@/lib/types'
import PropertyCard from './PropertyCard'
import { useTheme } from './ThemeProvider'

const MapPanel = dynamic(() => import('./MapPanel'), {
  ssr: false,
  loading: () => (
    <div style={{
      width:'100%', height:'100%',
      background:'var(--surface)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'var(--font-mono)', fontSize:'0.7rem', color:'var(--tm)',
      letterSpacing:'0.1em',
    }}>
      Загрузка карты…
    </div>
  ),
})

interface Props {
  id?: string
  complexes: Complex[]
  onCardClick: (id: string) => void
}

export default function SplitPanel({ id, complexes, onCardClick }: Props) {
  const { theme } = useTheme()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div id={id} style={{ display:'flex', alignItems:'flex-start' }}>
      {/* Left — cards */}
      <div style={{
        flexShrink:0, width:'45%', minWidth:0,
        borderRight:'1px solid var(--border-c)',
        padding:'1.25rem', paddingBottom:'5rem',
        transition:'border-color 0.25s',
      }}>
        {console.log('Filtered Properties:', complexes) as undefined}
        {complexes.length === 0 ? (
          <div style={{
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            minHeight:300, color:'var(--tm)', fontFamily:'var(--font-mono)', fontSize:'0.78rem', gap:8,
          }}>
            <span style={{ fontSize:'2.5rem', opacity:0.3 }}>◻</span>
            <span>Нет объектов по выбранным фильтрам</span>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {complexes.map(c => (
              <PropertyCard key={c.id} complex={c} onClick={() => onCardClick(c.id)} onHover={setHoveredId} />
            ))}
          </div>
        )}
      </div>

      {/* Right — sticky map */}
      <div id="right-panel" style={{
        flexShrink:0, width:'55%',
        position:'sticky', top:64,
        height:'calc(100vh - 64px)',
      }}>
        <MapPanel complexes={complexes} onMarkerClick={onCardClick} theme={theme} hoveredId={hoveredId} />
      </div>
    </div>
  )
}
