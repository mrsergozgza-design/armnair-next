'use client'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { useEffect, useRef } from 'react'
import React from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import { Complex } from '@/lib/types'
import { statusStyle } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { useT, useTStatus } from '@/lib/StaticTranslationProvider'
import { useLang } from '@/lib/LanguageContext'

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

function ClusterLayer({ complexes, onMarkerClick, hoveredId, markerRefs, clusterGroupRef, detailsLabel, focusId, onFocusDone }: {
  complexes: Complex[]
  onMarkerClick: (id: string) => void
  hoveredId?: string | null
  markerRefs: React.MutableRefObject<Map<string, L.Marker>>
  clusterGroupRef: React.MutableRefObject<any>
  detailsLabel: string
  focusId?: string | null
  onFocusDone?: () => void
}) {
  const map = useMap()

  // Rebuild cluster when complexes change
  useEffect(() => {
    const clusterGroup = (L as any).markerClusterGroup({
      maxClusterRadius: 60,
      iconCreateFunction: (cluster: any) => L.divIcon({
        html: `<div style="background:#A07820;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.35)">${cluster.getChildCount()}</div>`,
        className: '',
        iconSize: [36, 36],
      }),
    })

    clusterGroupRef.current = clusterGroup
    markerRefs.current.clear()

    complexes.forEach(c => {
      if (!c.lat || !c.lng) return

      const marker = L.marker([c.lat, c.lng], { icon: GOLD_ICON })

      marker.bindPopup(() => {
        const div = document.createElement('div')
        div.style.cssText = 'width:220px;overflow:hidden'
        const ss = statusStyle(c.status)
        div.innerHTML = `
          ${c.image ? `
            <div style="height:105px;overflow:hidden;position:relative">
              <img src="${c.image}" alt="${c.name}" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.65)"/>
              <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 55%)"></div>
            </div>` : ''}
          <div style="padding:0.6rem">
            <div style="font-family:monospace;font-size:0.56rem;color:#888;margin-bottom:3px">${c.developer ?? ''}</div>
            <div style="font-size:1.05rem;font-weight:400;margin-bottom:4px">${c.name}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
              <span style="font-family:monospace;font-size:0.78rem;color:#b8942a">$${c.price_usd.toLocaleString()}</span>
              <span style="font-family:monospace;font-size:0.52rem;background:${ss.bg};border:1px solid ${ss.border};color:${ss.color};padding:1px 5px;border-radius:2px">${c.status}</span>
            </div>
            <button class="cluster-popup-btn" style="width:100%;background:rgba(160,120,32,0.1);border:1px solid rgba(160,120,32,0.28);color:#b8942a;cursor:pointer;font-family:monospace;font-size:0.62rem;letter-spacing:0.06em;padding:0.35rem;display:flex;align-items:center;justify-content:center;gap:4px">
              ${detailsLabel} →
            </button>
          </div>
        `
        div.querySelector('.cluster-popup-btn')?.addEventListener('click', () => onMarkerClick(c.id))
        return div
      }, { maxWidth: 240 })

      marker.on('mouseover', e => (e.target as L.Marker).openPopup())
      marker.on('mouseout', e => (e.target as L.Marker).closePopup())
      marker.on('click', () => onMarkerClick(c.id))

      clusterGroup.addLayer(marker)
      markerRefs.current.set(c.id, marker)
    })

    map.addLayer(clusterGroup)

    return () => {
      map.removeLayer(clusterGroup)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complexes.map(c => c.id).join(',')])

  // Update hovered marker icon
  useEffect(() => {
    markerRefs.current.forEach((marker, id) => {
      marker.setIcon(id === hoveredId ? GOLD_ICON_ACTIVE : GOLD_ICON)
      if (id === hoveredId) marker.setZIndexOffset(1000)
      else marker.setZIndexOffset(0)
    })
  }, [hoveredId, markerRefs])

  // Handle focus: zoom to show the marker, then open its popup
  useEffect(() => {
    if (!focusId) return
    const marker = markerRefs.current.get(focusId)
    if (!marker) return
    const cg = clusterGroupRef.current
    if (cg) {
      cg.zoomToShowLayer(marker, () => {
        map.flyTo(marker.getLatLng(), 15, { animate: true, duration: 1.2 })
        setTimeout(() => { marker.openPopup(); onFocusDone?.() }, 1300)
      })
    } else {
      map.flyTo(marker.getLatLng(), 15, { animate: true, duration: 1.2 })
      setTimeout(() => { marker.openPopup(); onFocusDone?.() }, 1300)
    }
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
  const { lang } = useLang()
  const markerRefs = useRef<Map<string, L.Marker>>(new Map())
  const clusterGroupRef = useRef<any>(null)
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  // tStatus is only used in popup HTML (non-React), so we pass the label string
  void tStatus

  return (
    <MapContainer
      center={[40.1872, 44.515]}
      zoom={13}
      style={{ width:'100%', height:'100%' }}
      zoomControl={false}
      scrollWheelZoom={true}
    >
      <TileLayer url={tileUrl} attribution="© OpenStreetMap © CARTO" maxZoom={19} />
      <FitBounds complexes={complexes} />
      <ClusterLayer
        complexes={complexes}
        onMarkerClick={onMarkerClick}
        hoveredId={hoveredId}
        markerRefs={markerRefs}
        clusterGroupRef={clusterGroupRef}
        detailsLabel={tr('map.details')}
        focusId={mapFocusId}
        onFocusDone={onMapFocusDone}
      />
    </MapContainer>
  )
}
