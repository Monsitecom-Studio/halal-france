'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CERTIFICATION_INFO, REGIONS } from '@/types'
import type { Certification } from '@/types'

export default function SearchFilters() {
  const router = useRouter()
  const sp = useSearchParams()

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/boucheries?${params.toString()}`)
  }

  const certifications: Array<{ id: string; label: string; color: string }> = [
    { id: 'all', label: 'Toutes', color: '#6b7280' },
    ...Object.values(CERTIFICATION_INFO).map((c) => ({
      id: c.id,
      label: c.name,
      color: c.color,
    })),
  ]

  const sortOptions = [
    { value: 'reviews', label: 'Popularité' },
    { value: 'rating', label: 'Note' },
    { value: 'recent', label: 'Récent' },
  ]

  const currentCert = sp.get('cert') || 'all'
  const currentSort = sp.get('sort') || 'reviews'
  const currentRegion = sp.get('region') || ''

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
      {/* Certification */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Certification</p>
        <div className="flex flex-wrap gap-2">
          {certifications.map((c) => (
            <button
              key={c.id}
              onClick={() => update('cert', c.id === 'all' ? '' : c.id)}
              className="text-xs px-2.5 py-1 rounded-full border font-medium transition-colors"
              style={
                currentCert === c.id
                  ? { backgroundColor: c.color, color: 'white', borderColor: c.color }
                  : { color: c.color, borderColor: c.color }
              }
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Région */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Région</p>
        <select
          value={currentRegion}
          onChange={(e) => update('region', e.target.value)}
          className="input-field text-sm"
        >
          <option value="">Toutes les régions</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Tri */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Trier par</p>
        <div className="flex gap-2">
          {sortOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => update('sort', s.value)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                currentSort === s.value
                  ? 'bg-halal-green text-white border-halal-green'
                  : 'text-gray-600 border-gray-200 hover:border-halal-green'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
