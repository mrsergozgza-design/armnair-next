'use client'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Complex } from '@/lib/types'
import { statusStyle } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { useT, useTStatus } from '@/lib/StaticTranslationProvider'

// Fix default icon paths
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const GOLD_ICON = L.divIcon({
  html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none">
    <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.268 21.732 0 14 0Z"
          fill="#A07820" opacity="0.85"/>
    <circle cx="14" cy="14" r="5.5" fill="#C9A96E"/>
    <circle cx="14" cy="14" r="2.5" fill="white" opacity="0.9"/>
  </svg>`,
  className: '',
  iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -40],
})

const GOLD_ICON_ACTIVE = L.divIcon({
  html: `<svg width="38" height="48" viewBox="0 0 38 48" fill="none">
    <circle cx="19" cy="19" r="19" fill="#A07820" opacity="0.18"/>
    <path d="M19 4C10.163 4 3 11.163 3 20C3 32.5 19 44 19 44C19 44 35 32.5 35 20C35 11.163 27.837 4 19 4Z"
          fill="#A07820" opacity="1"/>
    <circle cx="19" cy="20" r="7" fill="#C9A96E"/>
    <circle cx="19" cy="20" r="3.5" fill="white" opacity="0.95"/>
  </svg>`,
  className: '',
  iconSize: [38, 48], iconAnchor: [19, 48], popupAnchor: [0, -52],
})

function FitBounds({ complexes }: { complexes: Complex[] }) {
  const map = useMap()
  useEffect(() => {
    if (!complexes.length) return
    if (complexes.length === 1) { map.setView([complexes[0].lat, complexes[0].lng], 14); return }
    map.fitBounds(L.latLngBounds(complexes.map(c => [c.lat, c.lng])), { padding:[50,50] })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complexes.map(c => c.id).join(',')])
  return null
}

function MapController({ complexes, focusId, markerRefs, onDone }: {
  complexes: Complex[]
  focusId: string | null | undefined
  markerRefs: React.MutableRefObject<Map<string, L.Marker>>
  onDone?: () => void
}) {
  const map = useMap()
  useEffect(() => {
    if (!focusId) return
    const c = complexes.find(cx => cx.id === focusId)
    if (!c || !c.lat || !c.lng) return
    map.flyTo([c.lat, c.lng], 15, { animate: true, duration: 1.2 })
    setTimeout(() => {
      markerRefs.current.get(focusId)?.openPopup()
      onDone?.()
    }, 1300)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId])
  return null
}

interface Props {
  complexes: Complex[]
  onMarkerClick: (id: string) => void
  theme?: 'light' | 'dark'
  hoveredId?: string | null
  mapFocusId?: string | null
  onMapFocusDone?: () => void
}

export default function MapPanel({ complexes, onMarkerClick, theme = 'light', hoveredId, mapFocusId, onMapFocusDone }: Props) {
  const tr = useT()
  const tStatus = useTStatus()
  const markerRefs = useRef<Map<string, L.Marker>>(new Map())
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  return (
    <MapContainer
      center={[40.1872, 44.515]}
      zoom={13}
      style={{ width:'100%', height:'100%' }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer url={tileUrl} attribution="© OpenStreetMap © CARTO" maxZoom={19} />
      <FitBounds complexes={complexes} />
      <MapController complexes={complexes} focusId={mapFocusId} markerRefs={markerRefs} onDone={onMapFocusDone} />
      {complexes.map(c => {
        const ss = statusStyle(c.status)
        const isHovered = c.id === hoveredId
        return (
          <Marker
            key={c.id}
            position={[c.lat, c.lng]}
            icon={isHovered ? GOLD_ICON_ACTIVE : GOLD_ICON}
            zIndexOffset={isHovered ? 1000 : 0}
            ref={(ref) => { if (ref) markerRefs.current.set(c.id, ref as unknown as L.Marker) }}
            eventHandlers={{
              mouseover: (e) => e.target.openPopup(),
              mouseout: (e) => e.target.closePopup(),
              click: () => onMarkerClick(c.id),
            }}
          >
            <Popup>
              <div style={{ width:220, overflow:'hidden', background:'var(--popup-bg)', color:'var(--t1)' }}>
                {c.image && (
                  <div style={{ height:105, overflow:'hidden', position:'relative' }}>
                    <img src={c.image} alt={c.name}
                      style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.65)' }}
                    />
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 55%)' }} />
                  </div>
                )}
                <div style={{ padding:'0.6rem' }}>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.56rem', color:'var(--t3)', marginBottom:3 }}>{c.developer}</div>
                  <div style={{ fontFamily:'var(--font-serif)', fontSize:'1.05rem', fontWeight:400, color:'var(--t1)', marginBottom:4 }}>{c.name}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.78rem', color:'var(--gold-b)' }}>${c.price_usd.toLocaleString()}</span>
                    <span style={{
                      fontFamily:'var(--font-mono)', fontSize:'0.52rem',
                      background:ss.bg, border:`1px solid ${ss.border}`,
                      color:ss.color, padding:'1px 5px', borderRadius:2,
                    }}>{tStatus(c.status)}</span>
                  </div>
                  <button onClick={() => onMarkerClick(c.id)} style={{
                    width:'100%', background:'rgba(160,120,32,0.1)', border:'1px solid rgba(160,120,32,0.28)',
                    color:'var(--gold)', cursor:'pointer',
                    fontFamily:'var(--font-mono)', fontSize:'0.62rem', letterSpacing:'0.06em',
                    padding:'0.35rem', display:'flex', alignItems:'center', justifyContent:'center', gap:4,
                    transition:'background 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.18)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(160,120,32,0.1)')}
                  >
                    {tr('map.details')} <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
