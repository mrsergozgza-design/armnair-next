'use client'
import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Complex } from '@/lib/types'
import { fmtAmd, statusStyle } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function createGoldIcon() {
  return L.divIcon({
    html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.268 21.732 0 14 0Z" fill="#A07820" opacity="0.9"/>
      <circle cx="14" cy="14" r="6" fill="#C9A96E"/>
      <circle cx="14" cy="14" r="3" fill="#09090F"/>
    </svg>`,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -38],
  })
}

function MapFitBounds({ complexes }: { complexes: Complex[] }) {
  const map = useMap()
  useEffect(() => {
    if (complexes.length === 0) return
    if (complexes.length === 1) {
      map.setView([complexes[0].lat, complexes[0].lng], 14)
      return
    }
    const bounds = L.latLngBounds(complexes.map(c => [c.lat, c.lng]))
    map.fitBounds(bounds, { padding: [50, 50] })
  }, [complexes, map])
  return null
}

interface MapPanelProps {
  complexes: Complex[]
  onMarkerClick: (id: string) => void
}

export default function MapPanel({ complexes, onMarkerClick }: MapPanelProps) {
  const goldIcon = createGoldIcon()

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        center={[40.1872, 44.515]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="© OpenStreetMap © CARTO"
          maxZoom={19}
        />
        <MapFitBounds complexes={complexes} />
        {complexes.map(c => {
          const ss = statusStyle(c.status)
          return (
            <Marker
              key={c.id}
              position={[c.lat, c.lng]}
              icon={goldIcon}
              eventHandlers={{
                click: () => onMarkerClick(c.id),
              }}
            >
              <Popup>
                <div style={{
                  background: '#16161F', color: '#F0EDE8',
                  width: 220, overflow: 'hidden',
                }}>
                  {c.image && (
                    <div style={{ height: 110, overflow: 'hidden', position: 'relative' }}>
                      <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,9,15,0.8) 0%, transparent 60%)' }} />
                    </div>
                  )}
                  <div style={{ padding: '0.65rem' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#9A9A9A', marginBottom: 3 }}>{c.developer}</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 400, marginBottom: 5 }}>{c.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#C9A96E' }}>${c.price_usd.toLocaleString()}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#9A9A9A' }}>{fmtAmd(c.price_amd)}</span>
                    </div>
                    <div style={{
                      display: 'inline-block',
                      background: ss.bg, border: `1px solid ${ss.border}`,
                      color: ss.color, borderRadius: 2,
                      fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
                      padding: '1px 6px', marginBottom: 8,
                    }}>
                      {c.status}
                    </div>
                    <div>
                      <button
                        onClick={() => onMarkerClick(c.id)}
                        style={{
                          width: '100%', background: 'rgba(160,120,32,0.12)',
                          border: '1px solid rgba(160,120,32,0.3)',
                          color: '#C9A96E', cursor: 'pointer',
                          fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                          letterSpacing: '0.06em', padding: '0.4rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        }}
                      >
                        Подробнее <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
