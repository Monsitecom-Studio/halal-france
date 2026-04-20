'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

interface Ville {
  city: string
  count: number
  dept?: string
}

interface Props {
  villes: Ville[]
  totalLabel: string
  avisLabel: string
}

const VILLES_COORDS: Record<string, [number, number]> = {
  'Paris': [48.8566, 2.3522],
  'Marseille': [43.2965, 5.3698],
  'Lyon': [45.7640, 4.8357],
  'Toulouse': [43.6047, 1.4442],
  'Nice': [43.7102, 7.2620],
  'Nantes': [47.2184, -1.5536],
  'Montpellier': [43.6110, 3.8767],
  'Strasbourg': [48.5734, 7.7521],
  'Bordeaux': [44.8378, -0.5792],
  'Lille': [50.6292, 3.0573],
  'Rennes': [48.1173, -1.6778],
  'Reims': [49.2583, 4.0317],
  'Le Havre': [49.4938, 0.1077],
  'Saint-Étienne': [45.4397, 4.3872],
  'Toulon': [43.1242, 5.9280],
  'Grenoble': [45.1885, 5.7245],
  'Dijon': [47.3220, 5.0415],
  'Angers': [47.4784, -0.5632],
  'Nîmes': [43.8367, 4.3601],
  'Villeurbanne': [45.7676, 4.8798],
  'Le Mans': [48.0061, 0.1996],
  'Aix-en-Provence': [43.5298, 5.4474],
  'Clermont-Ferrand': [45.7772, 3.0870],
  'Brest': [48.3905, -4.4860],
  'Tours': [47.3941, 0.6848],
  'Limoges': [45.8336, 1.2611],
  'Amiens': [49.8941, 2.2957],
  'Perpignan': [42.6987, 2.8956],
  'Metz': [49.1193, 6.1757],
  'Besançon': [47.2378, 6.0241],
  'Orléans': [47.9029, 1.9093],
  'Mulhouse': [47.7508, 7.3359],
  'Rouen': [49.4432, 1.0993],
  'Caen': [49.1829, -0.3707],
  'Nancy': [48.6921, 6.1844],
  'Avignon': [43.9493, 4.8055],
  'Pau': [43.2951, -0.3708],
  'Cannes': [43.5528, 7.0174],
  'Colmar': [48.0793, 7.3585],
  'Valence': [44.9334, 4.8924],
  'Montauban': [44.0175, 1.3528],
  'Béziers': [43.3441, 3.2153],
  'La Rochelle': [46.1591, -1.1520],
  'Dunkerque': [51.0343, 2.3767],
  'Calais': [50.9513, 1.8587],
  'Lorient': [47.7480, -3.3700],
  'Annecy': [45.8992, 6.1294],
  'Chambéry': [45.5646, 5.9178],
  'Bayonne': [43.4933, -1.4748],
  'Antibes': [43.5808, 7.1239],
  'Troyes': [48.2973, 4.0744],
  'Poitiers': [46.5802, 0.3404],
  'Aubagne': [43.2935, 5.5693],
  'Vaulx-en-Velin': [45.7783, 4.9187],
  'Aubervilliers': [48.9175, 2.3834],
  'Saint-Denis': [48.9362, 2.3574],
  'Créteil': [48.7904, 2.4552],
  'Vitry-sur-Seine': [48.7876, 2.3929],
  'Ivry-sur-Seine': [48.8136, 2.3836],
  'Argenteuil': [48.9472, 2.2467],
  'Montreuil': [48.8638, 2.4479],
  'Mauguio': [43.6167, 4.0000],
  'Lunel': [43.6744, 4.1349],
  'Carcassonne': [43.2130, 2.3491],
  'Arles': [43.6767, 4.6277],
  'Fréjus': [43.4328, 6.7369],
  'Blois': [47.5861, 1.3359],
  'Narbonne': [43.1833, 3.0000],
  'Agen': [44.2003, 0.6239],
  'La Ciotat': [43.1742, 5.6042],
  'Libourne': [44.9178, -0.2433],
  'Biarritz': [43.4832, -1.5586],
  'Roubaix': [50.6942, 3.1746],
  'Tourcoing': [50.7236, 3.1619],
  'Villejuif': [48.7944, 2.3633],
  'Sarcelles': [48.9967, 2.3806],
}

function getColor(count: number) {
  if (count >= 30) return '#1a6b3c'
  if (count >= 20) return '#1a6b3c'
  if (count >= 10) return '#2d8a55'
  if (count >= 5) return '#4aa870'
  return '#7dd4a0'
}

function getRadius(count: number) {
  if (count >= 30) return 22000
  if (count >= 20) return 18000
  if (count >= 10) return 14000
  if (count >= 5) return 10000
  return 6000
}

export default function CarteVilles({ villes, totalLabel, avisLabel }: Props) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then((L) => {
      const map = L.map(containerRef.current!, {
        center: [46.5, 2.5],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: false,
        dragging: true,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CartoDB',
        maxZoom: 10,
      }).addTo(map)

      mapRef.current = map

      villes.forEach((ville) => {
        const coords = VILLES_COORDS[ville.city]
        if (!coords) return

        const circle = L.circle(coords, {
          radius: getRadius(ville.count),
          color: getColor(ville.count),
          fillColor: getColor(ville.count),
          fillOpacity: 0.5,
          weight: 1.5,
        }).addTo(map)

        circle.bindPopup(`
          <div style="font-family:system-ui;min-width:140px">
            <strong style="font-size:13px;color:#111">${ville.city}</strong><br>
            <span style="font-size:12px;color:#1a6b3c;font-weight:600">${ville.count} boucherie${ville.count > 1 ? 's' : ''} halal</span><br>
            <a href="/boucheries?q=${encodeURIComponent(ville.city)}" 
               style="font-size:11px;color:#1a6b3c;text-decoration:none;display:inline-block;margin-top:4px">
              Voir toutes →
            </a>
          </div>
        `, { maxWidth: 200 })
      })
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [villes])

  return (
    <div className="bg-[#0a1628] rounded-2xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-4">
        {/* Carte */}
        <div className="lg:col-span-3" style={{ height: '420px' }}>
          <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
        </div>

        {/* Sidebar */}
        <div className="p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/5">
          <div>
            <h3 className="text-white font-semibold text-lg mb-1">Partout en France</h3>
            <p className="text-white/40 text-sm mb-6">Survolez un cercle pour voir les boucheries</p>

            <div className="space-y-4 mb-6">
              {[
                { label: totalLabel, desc: 'boucheries' },
                { label: `${villes.length}+`, desc: 'villes' },
                { label: avisLabel, desc: 'avis Google' },
              ].map(s => (
                <div key={s.desc} className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-400">{s.label}</span>
                  <span className="text-white/40 text-sm">{s.desc}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-6">
              {[
                { color: '#1a6b3c', label: '20+ boucheries', size: 14 },
                { color: '#2d8a55', label: '10-20', size: 11 },
                { color: '#4aa870', label: '5-10', size: 8 },
                { color: '#7dd4a0', label: '1-5', size: 6 },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="rounded-full border border-white/20 flex-shrink-0"
                    style={{ width: l.size, height: l.size, background: l.color }} />
                  <span className="text-white/40 text-xs">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <Link href="/carte"
            className="flex items-center justify-center gap-2 bg-halal-green text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
            <MapPin className="w-4 h-4" />
            Carte interactive complète
          </Link>
        </div>
      </div>
    </div>
  )
}
