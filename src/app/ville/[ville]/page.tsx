import { notFound } from 'next/navigation'
import { getBoucheriesByVille } from '@/lib/supabase/queries'
import BoucherieCard from '@/components/boucherie/BoucherieCard'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'

interface Props {
  params: { ville: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ville = decodeURIComponent(params.ville)
  return {
    title: `Boucheries halal ${ville}`,
    description: `Toutes les boucheries halal certifiées à ${ville}. Trouvez votre boucherie halal de confiance.`,
  }
}

export default async function VillePage({ params }: Props) {
  const ville = decodeURIComponent(params.ville)
  const boucheries = await getBoucheriesByVille(ville).catch(() => [])

  if (boucheries.length === 0) notFound()

  const displayVille = boucheries[0]?.city || ville

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Boucheries halal ${displayVille}`,
    numberOfItems: boucheries.length,
    itemListElement: boucheries.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.name,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/boucherie/${b.slug}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-sm text-halal-green font-medium mb-1">📍 {displayVille}</p>
          <h1 className="text-2xl font-bold">
            Boucheries halal à {displayVille}
          </h1>
          <p className="text-gray-500 mt-1">
            {boucheries.length} établissement{boucheries.length > 1 ? 's' : ''} référencé{boucheries.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {boucheries.map((b) => (
            <BoucherieCard key={b.id} boucherie={b} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
