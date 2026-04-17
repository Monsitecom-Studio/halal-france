import { Suspense } from 'react'
import { MapPin, Map as MapIcon } from 'lucide-react'
import { getBoucheries, getVillesWithCount } from '@/lib/supabase/queries'
import SearchBar from '@/components/search/SearchBar'
import BoucherieCard from '@/components/boucherie/BoucherieCard'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const revalidate = 3600

const VILLES_FALLBACK = [
  { city: "Paris", count: 87 },
  { city: "Marseille", count: 41 },
  { city: "Lyon", count: 34 },
  { city: "Toulouse", count: 19 },
  { city: "Lille", count: 15 },
  { city: "Bordeaux", count: 12 },
  { city: "Nantes", count: 9 },
  { city: "Strasbourg", count: 10 },
  { city: "Nice", count: 12 },
  { city: "Montpellier", count: 9 },
  { city: "Rennes", count: 7 },
  { city: "Rouen", count: 6 },
  { city: "Grenoble", count: 8 },
  { city: "Saint-Étienne", count: 8 },
  { city: "Toulon", count: 6 },
  { city: "Reims", count: 6 },
  { city: "Metz", count: 6 },
  { city: "Mulhouse", count: 7 },
  { city: "Dijon", count: 5 },
  { city: "Nîmes", count: 5 },
  { city: "Perpignan", count: 5 },
  { city: "Clermont-Ferrand", count: 5 },
  { city: "Amiens", count: 5 },
  { city: "Tours", count: 5 },
  { city: "Avignon", count: 5 },
  { city: "Caen", count: 5 },
  { city: "Le Havre", count: 5 },
  { city: "Orléans", count: 5 },
  { city: "Angers", count: 5 },
  { city: "Besançon", count: 5 },
  { city: "Limoges", count: 5 },
  { city: "Le Mans", count: 5 },
  { city: "Brest", count: 5 },
  { city: "Pau", count: 5 },
  { city: "Dunkerque", count: 5 },
  { city: "Valence", count: 5 },
  { city: "Colmar", count: 5 },
  { city: "Troyes", count: 5 },
  { city: "Poitiers", count: 5 },
  { city: "Calais", count: 5 },
  { city: "Bayonne", count: 5 },
  { city: "Lorient", count: 3 },
  { city: "Chambéry", count: 5 },
  { city: "Annecy", count: 5 },
  { city: "Les Lilas", count: 4 },
  { city: "Villeurbanne", count: 4 },
  { city: "Vaulx-en-Velin", count: 3 },
  { city: "Bron", count: 3 },
  { city: "Aubagne", count: 3 },
  { city: "Vitry-sur-Seine", count: 3 }
]

const CERT_INFO = [
  { id: 'avs', color: '#1e40af', name: 'AVS', desc: 'Organisme indépendant, 3 visites/jour sur site', count: 89 },
  { id: 'argml', color: '#5b21b6', name: 'ARGML', desc: 'Mosquée de Lyon, ~80 contrôleurs rituels', count: 54 },
  { id: 'mosquee-paris', color: '#92400e', name: 'Mosquée de Paris', desc: 'Plus ancienne habilitation française (1939)', count: 72 },
  { id: 'acmif', color: '#065f46', name: 'ACMIF', desc: "Assemblée des Communautés Musulmanes d'Île-de-France", count: 43 },
]

const QUICK_SEARCHES = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Strasbourg', 'Certification AVS', 'Mosquée de Paris']

export default async function HomePage() {
  const [topBoucheries, villesDB] = await Promise.all([
    getBoucheries({ sort: 'reviews' }).then(d => d.slice(0, 8)).catch(() => []),
    getVillesWithCount().catch(() => []),
  ])

  const villesMap = new Map(villesDB.map(v => [v.city, v.count]))
  const villes = VILLES_FALLBACK.map(v => ({
    city: v.city,
    count: villesMap.get(v.city) ?? v.count,
  })).sort((a, b) => b.count - a.count)

  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <section className="bg-white border-b border-gray-100 px-4 py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-50 text-halal-green border border-green-200 rounded-full px-4 py-1.5 text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-halal-green inline-block" />
              258+ boucheries référencées en France
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 leading-tight tracking-tight">
              L&apos;annuaire des boucheries<br />
              <span className="text-halal-green">halal certifiées</span> en France
            </h1>
            <p className="text-gray-500 text-lg mb-10 leading-relaxed">
              Trouvez une boucherie près de chez vous avec certification vérifiable.
              Avis de la communauté, photos, horaires.
            </p>

            <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm max-w-xl mx-auto mb-6 focus-within:border-halal-green/50 transition-colors">
              <span className="px-4 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
                </svg>
              </span>
              <Suspense>
                <SearchBar />
              </Suspense>
              <div className="h-6 w-px bg-gray-100 mx-1" />
              <Link href="/carte" className="flex items-center gap-1.5 px-3 text-sm text-halal-green font-medium whitespace-nowrap">
                <MapPin className="w-3.5 h-3.5" />
                Me localiser
              </Link>
              <Link href="/boucheries"
                className="m-2 px-4 py-2 bg-halal-green text-white text-sm font-medium rounded-lg hover:bg-halal-green-dark transition-colors whitespace-nowrap">
                Rechercher
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_SEARCHES.map(q => (
                <Link
                  key={q}
                  href={`/boucheries?q=${encodeURIComponent(q)}`}
                  className="px-3 py-1.5 rounded-full text-xs bg-gray-50 text-gray-500 border border-gray-100 hover:border-halal-green/40 hover:text-halal-green transition-colors"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="border-b border-gray-100 bg-gray-50">
          <div className="max-w-2xl mx-auto grid grid-cols-4 divide-x divide-gray-100">
            {[
              { n: '258+', label: 'boucheries' },
              { n: `${villes.length}+`, label: 'villes' },
              { n: '4', label: 'certifications' },
              { n: '12k+', label: 'avis' },
            ].map(s => (
              <div key={s.label} className="py-5 text-center">
                <div className="text-2xl font-semibold text-halal-green">{s.n}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top boucheries */}
        {topBoucheries.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Les mieux notées</h2>
              <Link href="/boucheries" className="text-sm text-halal-green hover:underline">Voir tout →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {topBoucheries.map(b => <BoucherieCard key={b.id} boucherie={b} />)}
            </div>
          </section>
        )}

        {/* Certifications */}
        <section className="border-t border-b border-gray-100 bg-gray-50 py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Certifications reconnues</h2>
              <p className="text-sm text-gray-400 mt-1">Chaque établissement affiche son certificat — vérifiable par la communauté.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {CERT_INFO.map(c => (
                <Link key={c.id} href={`/boucheries?cert=${c.id}`} className="card p-4 block">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    <span className="font-medium text-sm text-gray-900">{c.name}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-3">{c.desc}</p>
                  <span className="text-xs text-halal-green font-medium">{c.count} établissements →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Toutes les villes */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Toutes les villes</h2>
            <span className="text-sm text-gray-400">{villes.length} villes couvertes</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {villes.map(v => (
              <Link
                key={v.city}
                href={`/ville/${encodeURIComponent(v.city.toLowerCase())}`}
                className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm hover:border-halal-green/40 hover:text-halal-green transition-colors group"
              >
                {v.city}
                <span className="text-xs text-gray-300 group-hover:text-halal-green/60 transition-colors">
                  {v.count}
                </span>
              </Link>
            ))}
          </div>

          {/* CTA Carte */}
          <div className="mt-10 bg-halal-green rounded-2xl p-8 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-4">
              <MapIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Voir toutes les boucheries sur la carte</h3>
            <p className="text-green-200 text-sm mb-6">Géolocalisation en temps réel, filtres par certification et rayon de recherche</p>
            <Link
              href="/carte"
              className="inline-flex items-center gap-2 bg-white text-halal-green px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-green-50 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Ouvrir la carte interactive
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}