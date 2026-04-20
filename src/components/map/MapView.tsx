'use client'

import { useEffect, useRef } from 'react'
import type { Boucherie } from '@/types'
import { CERTIFICATION_INFO } from '@/types'

interface Props {
  boucheries: Boucherie[]
  center?: [number, number]
  zoom?: number
  onMarkerClick?: (b: Boucherie) => void
}

export default function MapView({ boucheries, center = [46.5, 2.5], zoom = 6, onMarkerClick }: Props) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then((L) => {
      // Import CSS Leaflet
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
        document.head.appendChild(link)
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!).setView(center, zoom)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map)

      boucheries.forEach((b) => {
        if (!b.lat || !b.lng) return
        const certInfo = CERTIFICATION_INFO[b.certification]
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            background:${certInfo.color};
            width:28px;height:28px;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:2px solid white;
            box-shadow:0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        })

        const marker = L.marker([b.lat, b.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:160px">
              <strong style="font-size:13px">${b.name}</strong><br>
              <span style="font-size:11px;color:#666">${b.city}</span><br>
              <span style="display:inline-block;margin-top:4px;padding:2px 6px;background:${certInfo.color};color:white;border-radius:999px;font-size:10px;font-weight:600">${certInfo.icon} ${certInfo.name}</span>
              ${b.rating ? `<br><span style="font-size:11px;color:#f59e0b">★ ${b.rating}</span>` : ''}
              <br><a href="/boucherie/${b.slug}" style="font-size:11px;color:#1a7a3c">Voir la fiche →</a>
            </div>
          `)

        if (onMarkerClick) marker.on('click', () => onMarkerClick(b))
      })
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
  )
}
