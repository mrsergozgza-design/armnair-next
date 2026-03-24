'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Map, Maximize2, Minimize2 } from 'lucide-react'
import { Complex } from '@/lib/types'
import PropertyCard from './PropertyCard'
import { useTheme } from './ThemeProvider'
import { useIsMobile } from '@/lib/useIsMobile'
import { useT } from '@/lib/StaticTranslationProvider'

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
      Loading map…
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
  onShareFavorites?: () => void
}

export default function SplitPanel({ id, complexes, onCardClick, mapFocusId, onMapFocusDone, favorites, onToggleFavorite, favOnly = false, onClearFavOnly, compareIds, onToggleCompare, onShareFavorites }: Props) {
  const { theme } = useTheme()
  
  const tr = useT()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [mapFullscreen, setMapFullscreen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <div id={id} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'flex-start' }}>
      {/* Cards panel */}
      <div style={{
        flexShrink: 0,
        width: isMobile ? '100%' : '45%',
        minWidth: 0,
        borderRight: isMobile ? 'none' : '1px solid var(--border-c)',
        padding: isMobile ? '0.75rem' : '1.25rem',
        height: isMobile ? 'auto' : 'calc(100vh - 64px)',
        overflowY: isMobile ? 'visible' : 'auto',
        position: isMobile ? 'static' : 'sticky',
        top: isMobile ? undefined : 64,
        transition: 'border-color 0.25s',
      }}>
        {/* Mobile: map toggle button */}
        {isMobile && (
          <button
            onClick={() => setMapOpen(v => !v)}
            style={{
              width: '100%', marginBottom: '0.75rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: mapOpen ? 'rgba(160,120,32,0.15)' : 'var(--card)',
              border: `1px solid ${mapOpen ? 'rgba(160,120,32,0.45)' : 'var(--border-c)'}`,
              borderRadius: 4, padding: '0.6rem',
              color: mapOpen ? '#C9A96E' : 'var(--t3)',
              fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <Map size={14} />
            {mapOpen ? tr('map.hide') : tr('map.show')}
          </button>
        )}

        {/* Mobile: collapsible map */}
        {isMobile && mapOpen && (
          <div style={{
            height: 260, marginBottom: '0.75rem',
            borderRadius: 4, overflow: 'hidden',
            border: '1px solid var(--border-c)', position: 'relative',
          }}>
            <MapPanel
              complexes={complexes}
              onMarkerClick={id => { onCardClick(id); setMapOpen(false) }}
              theme={theme}
              hoveredId={hoveredId}
              mapFocusId={mapFocusId}
              onMapFocusDone={onMapFocusDone}
            />
            {/* Fullscreen toggle */}
            <button
              onClick={() => setMapFullscreen(true)}
              style={{
                position: 'absolute', top: 10, right: 10, zIndex: 500,
                background: 'var(--card)', border: '1px solid var(--border-c)',
                borderRadius: 4, width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--t2)',
              }}
            >
              <Maximize2 size={14} />
            </button>
          </div>
        )}

        {/* Share favorites button */}
        {favOnly && favorites && favorites.size > 0 && (
          <button
            onClick={onShareFavorites}
            style={{
              width: '100%', marginBottom: '0.75rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              background: 'rgba(37,211,102,0.08)',
              border: '1px solid rgba(37,211,102,0.3)',
              borderRadius: 4, padding: '0.7rem',
              color: '#25D366',
              fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,211,102,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(37,211,102,0.08)')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            {tr('catalog.shareWA')}
          </button>
        )}

        {complexes.length === 0 ? (
          <div style={{
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            minHeight: 300, gap: 16,
          }}>
            <span style={{ fontSize:'3rem', opacity:0.25 }}>{favOnly ? '♡' : '◻'}</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.78rem', color:'var(--t3)', textAlign:'center' }}>
              {favOnly ? tr('catalog.noFavs') : tr('catalog.noItems')}
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
              {tr('catalog.showAll')}
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 12 : 14 }}>
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

      {/* Desktop: sticky map */}
      {!isMobile && (
        <div id="right-panel" style={{
          flexShrink: 0, width: '55%',
          position: 'sticky', top: 64,
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
        }}>
          <MapPanel
            complexes={complexes}
            onMarkerClick={onCardClick}
            theme={theme}
            hoveredId={hoveredId}
            mapFocusId={mapFocusId}
            onMapFocusDone={onMapFocusDone}
          />
        </div>
      )}

      {/* Fullscreen map overlay (mobile) */}
      {mapFullscreen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 8000,
          background: 'var(--bg)',
        }}>
          <MapPanel
            complexes={complexes}
            onMarkerClick={id => { onCardClick(id); setMapFullscreen(false) }}
            theme={theme}
            hoveredId={hoveredId}
            mapFocusId={mapFocusId}
            onMapFocusDone={onMapFocusDone}
          />
          <button
            onClick={() => setMapFullscreen(false)}
            style={{
              position: 'absolute', top: 16, right: 16, zIndex: 8100,
              background: 'var(--nav-bg)', border: '1px solid var(--border-c)',
              borderRadius: 4, padding: '0.5rem 1rem',
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.08em',
              color: 'var(--t1)', cursor: 'pointer',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Minimize2 size={13} />
            ЗАКРЫТЬ КАРТУ
          </button>
        </div>
      )}
    </div>
  )
}
