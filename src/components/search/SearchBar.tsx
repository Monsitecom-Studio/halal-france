'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { CERTIFICATION_INFO } from '@/types'
import type { Certification } from '@/types'

interface Suggestion {
  slug: string
  name: string
  city: string
  dept: string
  certification: Certification
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const timeout = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleInput = (value: string) => {
    setQuery(value)
    clearTimeout(timeout.current)
    if (value.length < 2) { setSuggestions([]); setOpen(false); return }
    timeout.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}&limit=6`)
        const data = await res.json()
        setSuggestions(data)
        setOpen(data.length > 0)
      } catch {}
      setLoading(false)
    }, 300)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setOpen(false)
      router.push(`/boucheries?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleGeolocate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      router.push(`/boucheries?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
    })
  }

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Ville, nom, code postal..."
            className="w-full pl-10 pr-10 py-3 rounded-xl text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-base shadow-lg"
            autoComplete="off"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          )}
        </div>
        <button
          type="button"
          onClick={handleGeolocate}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl transition-colors"
          title="Autour de moi"
        >
          <MapPin className="w-5 h-5" />
        </button>
        <button
          type="submit"
          className="bg-halal-gold hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg whitespace-nowrap"
        >
          Rechercher
        </button>
      </form>

      {/* Dropdown suggestions */}
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          {suggestions.map((s) => {
            const certInfo = CERTIFICATION_INFO[s.certification]
            return (
              <Link
                key={s.slug}
                href={`/boucherie/${s.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
              >
                <div>
                  <div className="font-medium text-sm text-gray-800">{s.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    <MapPin className="w-3 h-3 inline mr-0.5" />
                    {s.city} ({s.dept})
                  </div>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white font-medium shrink-0 ml-3"
                  style={{ backgroundColor: certInfo.color }}
                >
                  {certInfo.icon} {certInfo.name}
                </span>
              </Link>
            )
          })}
          <div
            className="px-4 py-2.5 text-xs text-center text-halal-green font-medium hover:bg-gray-50 cursor-pointer"
            onClick={() => { setOpen(false); router.push(`/boucheries?q=${encodeURIComponent(query)}`) }}
          >
            Voir tous les résultats pour "{query}" →
          </div>
        </div>
      )}
    </div>
  )
}
