import { Suspense } from 'react'
import { getBoucheries, getProximity } from '@/lib/supabase/queries'
import BoucherieCard from '@/components/boucherie/BoucherieCard'
import SearchFilters from '@/components/search/SearchFilters'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Certification, SearchFilters as Filters } from '@/types'
import type { Metadata } from 'next'

interface Props {
  searchParams: {
    q?: string
    cert?: string
    region?: string
    sort?: string
    lat?: string
    lng?: string
    page?: string
  }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = searchParams.q
  const region = searchParams.region
  const title = q
    ? `Boucheries halal "${q}"`
    : region
    ? `Boucheries halal en ${region}`
    : 'Toutes les boucheries halal'
  return { title }
}

const PAGE_SIZE = 24

export default async function BoucheriesPage({ searchParams }: Props) {
  const lat = parseFloat(searchParams.lat || '')
  const lng = parseFloat(searchParams.lng || '')
  const page = Math.max(1, parseInt(searchParams.page || '1'))
  const isGeo = !isNaN(lat) && !isNaN(lng)

  let boucheries: any[] = []

  if (isGeo) {
    boucheries = await getProximity(lat, lng, 15, 100).catch(() => [])
  } else {
    const filters: Filters = {
      query: searchParams.q,
      certification: (searchParams.cert as Certification) || 'all',
      region: searchParams.region,
      sort: (searchParams.sort as Filters['sort']) || 'reviews',
    }
    boucheries = await getBoucheries(filters).catch(() => [])
  }

  const total = boucheries.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const paginated = boucheries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const buildUrl = (p: number) => {
    const params = new URLSearchParams()
    if (searchParams.q) params.set('q', searchParams.q)
    if (searchParams.cert) params.set('cert', searchParams.cert)
    if (searchParams.region) params.set('region', searchParams.region)
    if (searchParams.sort) params.set('sort', searchParams.sort)
    if (searchParams.lat) params.set('lat', searchParams.lat)
    if (searchParams.lng) params.set('lng', searchParams.lng)
    if (p > 1) params.set('page', String(p))
    return `/boucheries?${params.toString()}`
  }

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">
            {isGeo
              ? 'Boucheries près de vous'
              : searchParams.q
              ? `Résultats pour "${searchParams.q}"`
              : searchParams.region
              ? `Boucheries halal en ${searchParams.region}`
              : 'Toutes les boucheries halal'}
          </h1>
          <p className="text-gray-500 text-sm">
            {total} établissement{total > 1 ? 's' : ''}
            {isGeo && ' dans un rayon de 15 km'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <Suspense>
              <SearchFilters />
            </Suspense>
          </aside>

          <div className="lg:col-span-3">
            {paginated.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="text-4xl mb-3">🔍</div>
                <p className="font-medium">Aucun résultat</p>
                <p className="text-sm mt-1">Essayez une autre ville ou un autre filtre</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginated.map((b) => (
                    <BoucherieCard key={b.id} boucherie={b} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {page > 1 && (
                      <a href={buildUrl(page - 1)} className="btn-secondary text-sm px-4 py-2">
                        ← Précédent
                      </a>
                    )}
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        const p = i + 1
                        return (
                          <a
                            key={p}
                            href={buildUrl(p)}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                              p === page
                                ? 'bg-halal-green text-white'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-halal-green hover:text-halal-green'
                            }`}
                          >
                            {p}
                          </a>
                        )
                      })}
                    </div>
                    {page < totalPages && (
                      <a href={buildUrl(page + 1)} className="btn-secondary text-sm px-4 py-2">
                        Suivant →
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
