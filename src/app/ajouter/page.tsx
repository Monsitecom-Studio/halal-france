'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Phone, Clock, Shield, Send, Search, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CERTIFICATION_INFO } from '@/types'
import type { Certification } from '@/types'

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address: {
    road?: string
    house_number?: string
    city?: string
    town?: string
    village?: string
    county?: string
    postcode?: string
    country_code?: string
  }
}

export default function AjouterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Geocoding
  const [addressQuery, setAddressQuery] = useState('')
  const [geoResults, setGeoResults] = useState<NominatimResult[]>([])
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoSelected, setGeoSelected] = useState(false)
  const geoTimeout = useRef<NodeJS.Timeout>()

  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    dept: '',
    phone: '',
    horaires: '',
    certification: 'unknown' as Certification,
    lat: '',
    lng: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  // Geocoding Nominatim avec debounce
  const handleAddressInput = (value: string) => {
    setAddressQuery(value)
    setGeoSelected(false)
    clearTimeout(geoTimeout.current)
    if (value.length < 5) { setGeoResults([]); return }
    geoTimeout.current = setTimeout(async () => {
      setGeoLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=fr&q=${encodeURIComponent(value)}`,
          { headers: { 'Accept-Language': 'fr' } }
        )
        const data: NominatimResult[] = await res.json()
        setGeoResults(data)
      } catch {}
      setGeoLoading(false)
    }, 500)
  }

  const selectGeoResult = (r: NominatimResult) => {
    const a = r.address
    const street = [a.house_number, a.road].filter(Boolean).join(' ')
    const city = a.city || a.town || a.village || ''
    const postcode = a.postcode || ''
    const dept = postcode.slice(0, 2)

    setAddressQuery(street || r.display_name.split(',')[0])
    setForm(prev => ({
      ...prev,
      address: street || r.display_name.split(',')[0],
      city,
      dept,
      lat: parseFloat(r.lat).toFixed(6),
      lng: parseFloat(r.lon).toFixed(6),
    }))
    setGeoResults([])
    setGeoSelected(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Vous devez être connecté pour ajouter un établissement')
      setLoading(false)
      return
    }

    if (!form.name || !form.address || !form.city || !form.dept) {
      setError('Remplissez les champs obligatoires')
      setLoading(false)
      return
    }

    const { error: err } = await supabase.from('boucheries').insert({
      name: form.name,
      address: form.address,
      city: form.city,
      dept: form.dept,
      phone: form.phone || null,
      horaires: form.horaires || null,
      certification: form.certification,
      lat: parseFloat(form.lat) || 46.0,
      lng: parseFloat(form.lng) || 2.0,
      added_by: user.id,
      is_approved: false,
    })

    if (err) { setError(err.message) }
    else { setSuccess(true) }
    setLoading(false)
  }

  if (success) {
    return (
      <>
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-16 text-center">
          <CheckCircle className="w-16 h-16 text-halal-green mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Merci pour votre contribution !</h1>
          <p className="text-gray-600 mb-6">
            L'établissement a été soumis et sera vérifié avant publication sous 24–48h.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push('/')} className="btn-secondary">
              Retour à l'accueil
            </button>
            <button
              onClick={() => { setSuccess(false); setForm({ name: '', address: '', city: '', dept: '', phone: '', horaires: '', certification: 'unknown', lat: '', lng: '' }); setAddressQuery('') }}
              className="btn-primary"
            >
              Ajouter un autre
            </button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Ajouter une boucherie</h1>
        <p className="text-gray-500 text-sm mb-6">
          L'établissement sera vérifié avant d'apparaître dans l'annuaire.
        </p>

        {!user && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
            <strong>Connexion requise.</strong>{' '}
            <a href="/login" className="underline font-medium">Se connecter</a>{' '}
            ou{' '}
            <a href="/register" className="underline font-medium">créer un compte</a>{' '}
            pour contribuer.
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium mb-1">Nom de l'établissement *</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Boucherie Al-Baraka"
              className="input-field"
              required
            />
          </div>

          {/* Adresse avec geocoding */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Adresse *
              <span className="text-xs text-gray-400 font-normal ml-2">— tapez pour chercher</span>
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={addressQuery}
                  onChange={e => handleAddressInput(e.target.value)}
                  placeholder="12 rue de la Paix, Paris..."
                  className={`input-field pl-9 pr-8 ${geoSelected ? 'border-halal-green' : ''}`}
                  autoComplete="off"
                />
                {geoLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}
                {geoSelected && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-halal-green" />
                )}
              </div>

              {geoResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 overflow-hidden">
                  {geoResults.map(r => (
                    <button
                      key={r.place_id}
                      type="button"
                      onClick={() => selectGeoResult(r)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 text-sm"
                    >
                      <div className="font-medium text-gray-800 truncate">
                        {r.display_name.split(',').slice(0, 2).join(',')}
                      </div>
                      <div className="text-xs text-gray-400 truncate mt-0.5">
                        {r.display_name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ville + Dept (auto-remplis) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Ville *</label>
              <input
                value={form.city}
                onChange={e => set('city', e.target.value)}
                placeholder="Paris"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Département *</label>
              <input
                value={form.dept}
                onChange={e => set('dept', e.target.value)}
                placeholder="75"
                className="input-field"
                maxLength={3}
                required
              />
            </div>
          </div>

          {/* Coordonnées GPS (auto-remplies, éditables) */}
          {(form.lat || form.lng) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-500">Latitude (auto)</label>
                <input
                  value={form.lat}
                  onChange={e => set('lat', e.target.value)}
                  className="input-field text-sm text-gray-500"
                  type="number"
                  step="any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-500">Longitude (auto)</label>
                <input
                  value={form.lng}
                  onChange={e => set('lng', e.target.value)}
                  className="input-field text-sm text-gray-500"
                  type="number"
                  step="any"
                />
              </div>
            </div>
          )}
          {!form.lat && !geoSelected && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              ⚠ Sélectionnez une adresse dans la liste pour remplir automatiquement les coordonnées GPS.
            </p>
          )}

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <Phone className="w-4 h-4 inline mr-1" />Téléphone
            </label>
            <input
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="+33 1 23 45 67 89"
              className="input-field"
              type="tel"
            />
          </div>

          {/* Horaires */}
          <div>
            <label className="block text-sm font-medium mb-1">
              <Clock className="w-4 h-4 inline mr-1" />Horaires
            </label>
            <input
              value={form.horaires}
              onChange={e => set('horaires', e.target.value)}
              placeholder="Lun-Sam 9h-19h, Dim 9h-13h"
              className="input-field"
            />
          </div>

          {/* Certification */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Shield className="w-4 h-4 inline mr-1" />Certification connue
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(CERTIFICATION_INFO).map((cert) => (
                <button
                  key={cert.id}
                  type="button"
                  onClick={() => set('certification', cert.id)}
                  className="text-left px-3 py-2.5 rounded-lg border text-sm transition-all"
                  style={
                    form.certification === cert.id
                      ? { borderColor: cert.color, backgroundColor: cert.color + '15', boxShadow: `0 0 0 1px ${cert.color}` }
                      : { borderColor: '#e5e7eb' }
                  }
                >
                  <span>{cert.icon}</span>
                  <span className="ml-1.5 font-medium" style={form.certification === cert.id ? { color: cert.color } : {}}>
                    {cert.name}
                  </span>
                  {form.certification === cert.id && (
                    <span className="ml-1 text-xs" style={{ color: cert.color }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !user}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</>
              : <><Send className="w-4 h-4" /> Soumettre l'établissement</>
            }
          </button>
        </form>
      </main>
      <Footer />
    </>
  )
}
