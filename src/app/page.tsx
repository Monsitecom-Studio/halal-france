import { Suspense } from 'react'
import { MapPin } from 'lucide-react'
import { getBoucheries, getVillesWithCount } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import SearchBar from '@/components/search/SearchBar'
import BoucherieCard from '@/components/boucherie/BoucherieCard'
import CarteVilles from '@/components/home/CarteVilles'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const revalidate = 3600

const CERT_INFO = [
  { id: 'avs', color: '#1e40af', name: 'AVS', desc: 'Organisme indépendant, 3 visites/jour sur site', count: 89 },
  { id: 'argml', color: '#5b21b6', name: 'ARGML', desc: 'Mosquée de Lyon, ~80 contrôleurs rituels', count: 54 },
  { id: 'mosquee-paris', color: '#92400e', name: 'Mosquée de Paris', desc: 'Plus ancienne habilitation française (1939)', count: 72 },
  { id: 'acmif', color: '#065f46', name: 'ACMIF', desc: "Assemblée des Communautés Musulmanes d'Île-de-France", count: 43 },
]

const QUICK_SEARCHES = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Strasbourg', 'Certification AVS', 'Mosquée de Paris']

export default async function HomePage() {
  const supabase = createClient()

  const [topBoucheries, villesDB, { count: totalBoucheries }, reviewsData, { count: userAvis }] = await Promise.all([
    getBoucheries({ sort: 'popular' }).then(d => d.slice(0, 8)).catch(() => []),
    getVillesWithCount().catch(() => []),
    supabase.from('boucheries').select('*', { count: 'exact', head: true }).eq('is_approved', true),
    supabase.from('boucheries').select('reviews_count').eq('is_approved', true),
    supabase.from('avis').select('*', { count: 'exact', head: true }),
  ])

  const total = totalBoucheries ?? 0
  const totalLabel = total >= 1000 ? `${(total / 1000).toFixed(1)}k+` : `${total}+`
  const googleAvis = (reviewsData.data ?? []).reduce((sum: number, b: any) => sum + (b.reviews_count || 0), 0)
  const totalAvisCount = googleAvis + (userAvis ?? 0)
  const avisLabel = totalAvisCount >= 1000 ? `${Math.floor(totalAvisCount / 1000)}k+` : `${totalAvisCount}`

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-white border-b border-gray-100 px-4 py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-50 text-halal-green border border-green-200 rounded-full px-4 py-1.5 text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-halal-green inline-block" />
              {totalLabel} boucheries référencées en France
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 leading-tight tracking-tight">
              L&apos;annuaire des boucheries<br />
              <span className="text-halal-green">halal certifiées</span> en France
            </h1>
            <p className="text-gray-500 text-lg mb-10 leading-relaxed">
              Trouvez une boucherie près de chez vous avec certification vérifiable.
              Avis de la communauté, photos, horaires.
            </p>
            <div className="max-w-xl mx-auto mb-6">
              <Suspense><SearchBar /></Suspense>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_SEARCHES.map(q => (
                <Link key={q} href={`/boucheries?q=${encodeURIComponent(q)}`}
                  className="px-3 py-1.5 rounded-full text-xs bg-gray-50 text-gray-500 border border-gray-100 hover:border-halal-green/40 hover:text-halal-green transition-colors">
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
              { n: totalLabel, label: 'boucheries' },
              { n: `${villesDB.length}+`, label: 'villes' },
              { n: '4', label: 'certifications' },
              { n: avisLabel, label: 'avis' },
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

        {/* Carte des villes */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Boucheries halal en France</h2>
              <p className="text-sm text-gray-400 mt-1">{villesDB.length} villes couvertes — survolez pour explorer</p>
            </div>
            <Link href="/carte" className="text-sm text-halal-green hover:underline flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Carte interactive
            </Link>
          </div>
          <CarteVilles villes={villesDB} totalLabel={totalLabel} avisLabel={avisLabel} />
        </section>
      </main>
      <Footer />
    </>
  )
}
