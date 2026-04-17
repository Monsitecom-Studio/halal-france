import { notFound } from 'next/navigation'
import { getBoucheries, getVillesWithCount } from '@/lib/supabase/queries'
import BoucherieCard from '@/components/boucherie/BoucherieCard'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: { region: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const region = decodeURIComponent(params.region)
  return {
    title: `Boucheries halal en ${region}`,
    description: `Trouvez les meilleures boucheries halal certifiées en ${region}. Annuaire complet avec certifications AVS, ARGML, Mosquée de Paris.`,
  }
}

export default async function RegionPage({ params }: Props) {
  const region = decodeURIComponent(params.region)

  const [boucheries, allVilles] = await Promise.all([
    getBoucheries({ region, sort: 'reviews' }).catch(() => []),
    getVillesWithCount().catch(() => []),
  ])

  if (boucheries.length === 0) notFound()

  const villesRegion = allVilles.filter(v => {
    return boucheries.some(b => b.city === v.city)
  })

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-sm text-halal-green font-medium mb-2">
            <MapPin className="w-4 h-4" />
            {region}
          </div>
          <h1 className="text-2xl font-bold">Boucheries halal en {region}</h1>
          <p className="text-gray-500 mt-1">
            {boucheries.length} établissement{boucheries.length > 1 ? 's' : ''} référencé{boucheries.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Villes de la région */}
        {villesRegion.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {villesRegion.map(v => (
              <Link
                key={v.city}
                href={`/ville/${encodeURIComponent(v.city.toLowerCase())}`}
                className="bg-white border border-gray-200 rounded-full px-3 py-1.5 text-sm hover:border-halal-green hover:text-halal-green transition-colors"
              >
                {v.city}
                <span className="ml-1.5 text-gray-400 text-xs">{v.count}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {boucheries.map(b => (
            <BoucherieCard key={b.id} boucherie={b} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
