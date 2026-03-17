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
  mapFocusId?: string | null
  onMapFocusDone?: () => void
  favorites?: Set<string>
  onToggleFavorite?: (id: string) => void
  favOnly?: boolean
  onClearFavOnly?: () => void
  compareIds?: string[]
  onToggleCompare?: (id: string) => void
}

export default function SplitPanel({ id, complexes, onCardClick, mapFocusId, onMapFocusDone, favorites, onToggleFavorite, favOnly = false, onClearFavOnly, compareIds, onToggleCompare }: Props) {
  const { theme } = useTheme()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div id={id} style={{ display:'flex', alignItems:'flex-start' }}>
      {/* Left — cards */}
      <div style={{
        flexShrink:0, width:'45%', minWidth:0,
        borderRight:'1px solid var(--border-c)',
        padding:'1.25rem',
        height:'calc(100vh - 64px)',
        overflowY:'auto',
        position:'sticky', top:64,
        transition:'border-color 0.25s',
      }}>
        {console.log('Filtered Properties:', complexes) as undefined}
        {complexes.length === 0 ? (
          <div style={{
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            minHeight:300, gap:16,
          }}>
            <span style={{ fontSize:'3rem', opacity:0.25 }}>{favOnly ? '♡' : '◻'}</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.78rem', color:'var(--t3)', textAlign:'center' }}>
              {favOnly ? 'В вашем списке избранного пока ничего нет' : 'Нет объектов по выбранным фильтрам'}
            </span>
            <button
              onClick={onClearFavOnly}
              style={{
                fontFamily:'var(--font-mono)', fontSize:'0.65rem', letterSpacing:'0.1em',
                padding:'0.55rem 1.4rem', cursor:'pointer',
                background:'rgba(160,120,32,0.1)', border:'1px solid rgba(160,120,32,0.45)',
                color:'var(--gold-b)', borderRadius:2, transition:'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.22)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.1)')}
            >
              ПОКАЗАТЬ ВСЕ ОБЪЕКТЫ
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {complexes.map(c => (
              <PropertyCard
                key={c.id} complex={c}
                onClick={() => onCardClick(c.id)}
                onHover={setHoveredId}
                isFavorite={favorites?.has(c.id)}
                onToggleFavorite={() => onToggleFavorite?.(c.id)}
                inCompare={compareIds?.includes(c.id)}
                onToggleCompare={() => onToggleCompare?.(c.id)}
              />
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
        <MapPanel complexes={complexes} onMarkerClick={onCardClick} theme={theme} hoveredId={hoveredId} mapFocusId={mapFocusId} onMapFocusDone={onMapFocusDone} />
      </div>
    </div>
  )
}
