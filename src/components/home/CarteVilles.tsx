'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MapPin } from 'lucide-react'

interface Ville {
  city: string
  count: number
}

interface Props {
  villes: Ville[]
  totalLabel: string
  avisLabel: string
}

const VILLES_CARTE = [
  { name: 'Paris', x: 47, y: 22, count: 40 },
  { name: 'Montpellier', x: 56, y: 68 },
  { name: 'Bordeaux', x: 31, y: 62 },
  { name: 'Nice', x: 73, y: 72 },
  { name: 'Toulouse', x: 47, y: 75 },
  { name: 'Grenoble', x: 62, y: 55 },
  { name: 'Lyon', x: 57, y: 50 },
  { name: 'Marseille', x: 65, y: 75 },
  { name: 'Strasbourg', x: 72, y: 22 },
  { name: 'Nantes', x: 32, y: 38 },
  { name: 'Lille', x: 46, y: 8 },
  { name: 'Rennes', x: 25, y: 28 },
  { name: 'Rouen', x: 40, y: 16 },
  { name: 'Dijon', x: 57, y: 35 },
  { name: 'Reims', x: 50, y: 16 },
  { name: 'Caen', x: 34, y: 18 },
  { name: 'Le Mans', x: 38, y: 30 },
  { name: 'Avignon', x: 61, y: 68 },
  { name: 'Perpignan', x: 53, y: 82 },
  { name: 'Béziers', x: 56, y: 76 },
]

function getDotSize(count: number) {
  if (count >= 30) return 22
  if (count >= 20) return 18
  if (count >= 10) return 14
  if (count >= 5) return 10
  return 7
}

function getDotColor(count: number) {
  if (count >= 30) return '#1a6b3c'
  if (count >= 20) return '#1a6b3c'
  if (count >= 10) return '#2d8a55'
  if (count >= 5) return '#4aa870'
  return '#7dd4a0'
}

export default function CarteVilles({ villes, totalLabel, avisLabel }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)

  const villesMap = new Map(villes.map(v => [v.city, v.count]))

  const villesAvecCount = VILLES_CARTE.map(v => ({
    ...v,
    count: villesMap.get(v.name) ?? v.count ?? 5,
  }))

  return (
    <div className="bg-[#0a1628] rounded-2xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Carte */}
        <div className="lg:col-span-2 relative p-6">
          <div
            className="relative rounded-xl overflow-hidden"
            style={{ background: '#0f2040', border: '1px solid rgba(26,107,60,0.2)' }}
          >
            <svg viewBox="0 0 500 520" width="100%" style={{ display: 'block' }}>
              {/* Grille légère */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(26,107,60,0.08)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="500" height="520" fill="url(#grid)" />
              {/* France */}
              <path
                d="M180,40 L230,30 L290,45 L340,60 L380,90 L400,130 L410,170 L405,210 L420,240 L430,280 L415,320 L390,360 L360,390 L330,420 L300,440 L270,460 L240,450 L210,430 L180,400 L160,370 L140,340 L120,300 L110,260 L115,220 L100,180 L110,140 L130,100 L155,70 Z"
                fill="rgba(26,107,60,0.12)"
                stroke="rgba(74,222,128,0.25)"
                strokeWidth="1.5"
              />
              <path d="M390,380 L400,370 L415,375 L420,390 L415,405 L405,410 L395,400 Z"
                fill="rgba(26,107,60,0.12)" stroke="rgba(74,222,128,0.25)" strokeWidth="1"/>
            </svg>

            {/* Points villes */}
            {villesAvecCount.map(v => {
              const size = getDotSize(v.count)
              const color = getDotColor(v.count)
              const isHovered = hovered === v.name
              return (
                <Link
                  key={v.name}
                  href={`/boucheries?q=${encodeURIComponent(v.name)}`}
                  className="absolute"
                  style={{
                    left: `${v.x}%`,
                    top: `${v.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isHovered ? 20 : 10,
                  }}
                  onMouseEnter={() => setHovered(v.name)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div
                    className="rounded-full border-2 border-white/30 transition-all duration-200"
                    style={{
                      width: isHovered ? size + 8 : size,
                      height: isHovered ? size + 8 : size,
                      background: color,
                      boxShadow: isHovered ? `0 0 12px ${color}` : 'none',
                    }}
                  />
                  {isHovered && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-white text-gray-900 text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
                      {v.name} · {v.count} boucheries
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg mb-1">Présent partout</h3>
            <p className="text-white/40 text-sm mb-6">en France métropolitaine</p>

            <div className="space-y-3 mb-6">
              {[
                { label: totalLabel, desc: 'boucheries', color: '#4ade80' },
                { label: `${villes.length}+`, desc: 'villes', color: '#4ade80' },
                { label: avisLabel, desc: 'avis Google', color: '#4ade80' },
              ].map(s => (
                <div key={s.desc} className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold" style={{ color: s.color, fontFamily: 'system-ui' }}>{s.label}</span>
                  <span className="text-white/40 text-sm">{s.desc}</span>
                </div>
              ))}
            </div>

            {/* Légende */}
            <div className="space-y-2 mb-6">
              {[
                { color: '#1a6b3c', label: '20+ boucheries', size: 14 },
                { color: '#2d8a55', label: '10-20 boucheries', size: 11 },
                { color: '#4aa870', label: '5-10 boucheries', size: 8 },
                { color: '#7dd4a0', label: '1-5 boucheries', size: 6 },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="rounded-full border border-white/20 flex-shrink-0"
                    style={{ width: l.size, height: l.size, background: l.color }} />
                  <span className="text-white/40 text-xs">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/carte"
            className="flex items-center justify-center gap-2 bg-halal-green text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Carte interactive complète
          </Link>
        </div>
      </div>
    </div>
  )
}
