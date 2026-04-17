'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import type { Boucherie } from '@/types'
import { CERTIFICATION_INFO } from '@/types'
import CertBadge from '@/components/ui/CertBadge'
import StarRating from '@/components/ui/StarRating'
import Link from 'next/link'
import { X } from 'lucide-react'

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false })

interface Props {
  boucheries: Boucherie[]
}

export default function MapPageClient({ boucheries }: Props) {
  const [selected, setSelected] = useState<Boucherie | null>(null)
  const [certFilter, setCertFilter] = useState<string>('all')

  const filtered = certFilter === 'all'
    ? boucheries
    : boucheries.filter(b => b.certification === certFilter)

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Filtres rapides */}
      <div className="bg-white border-b px-4 py-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setCertFilter('all')}
          className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap font-medium transition-colors ${
            certFilter === 'all' ? 'bg-gray-700 text-white border-gray-700' : 'border-gray-300 text-gray-600'
          }`}
        >
          Toutes ({boucheries.length})
        </button>
        {Object.values(CERTIFICATION_INFO).map(c => {
          const count = boucheries.filter(b => b.certification === c.id).length
          if (count === 0) return null
          return (
            <button
              key={c.id}
              onClick={() => setCertFilter(c.id)}
              className="text-xs px-3 py-1.5 rounded-full border whitespace-nowrap font-medium transition-colors"
              style={
                certFilter === c.id
                  ? { background: c.color, color: 'white', borderColor: c.color }
                  : { color: c.color, borderColor: c.color }
              }
            >
              {c.icon} {c.name} ({count})
            </button>
          )
        })}
      </div>

      {/* Carte + sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <MapView
            boucheries={filtered}
            center={[46.5, 2.5]}
            zoom={6}
            onMarkerClick={setSelected}
          />
        </div>

        {/* Panel sélection */}
        {selected && (
          <div className="w-72 bg-white border-l shadow-lg overflow-y-auto">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold pr-2">{selected.name}</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <CertBadge certification={selected.certification} />
              <p className="text-sm text-gray-500 mt-2">{selected.address}</p>
              <p className="text-sm text-gray-500">{selected.city}</p>
              {selected.phone && <p className="text-sm text-gray-500 mt-1">{selected.phone}</p>}
              {(selected.rating_combined ?? selected.rating) && (
                <div className="mt-2">
                  <StarRating rating={selected.rating_combined ?? selected.rating ?? 0} count={selected.reviews_count} size="sm" />
                </div>
              )}
              <Link href={`/boucherie/${selected.slug}`} className="btn-primary block text-center mt-4 text-sm">
                Voir la fiche →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
