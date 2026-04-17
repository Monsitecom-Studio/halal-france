import { notFound } from 'next/navigation'
import { MapPin, Phone, Clock, ExternalLink, Shield } from 'lucide-react'
import { getBoucherieBySlug, getAvis, getPhotos, getBoucheries, getCertificationVotes } from '@/lib/supabase/queries'
import CertBadge from '@/components/ui/CertBadge'
import StarRating from '@/components/ui/StarRating'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BoucherieCard from '@/components/boucherie/BoucherieCard'
import AvisSection from '@/components/boucherie/AvisSection'
import PhotosSection from '@/components/boucherie/PhotosSection'
import CertVoteSection from '@/components/boucherie/CertVoteSection'
import { CERTIFICATION_INFO } from '@/types'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b = await getBoucherieBySlug(params.slug)
  if (!b) return {}
  return {
    title: `${b.name} — Boucherie halal ${b.city}`,
    description: `${b.name}, boucherie halal à ${b.city}. ${b.certification !== 'unknown' ? `Certifiée ${CERTIFICATION_INFO[b.certification].name}.` : ''} Note: ${b.rating?.toFixed(1)}/5`,
  }
}

export default async function BoucheriePage({ params }: Props) {
  const b = await getBoucherieBySlug(params.slug)
  if (!b) notFound()

  const [avis, photos, certVotes, similaires] = await Promise.all([
    getAvis(b.id),
    getPhotos(b.id),
    getCertificationVotes(b.id),
    getBoucheries({ city: b.city, sort: 'reviews' }).then(d =>
      d.filter(x => x.id !== b.id).slice(0, 4)
    ),
  ])

  const certInfo = CERTIFICATION_INFO[b.certification]
  const rating = b.rating_combined ?? b.rating ?? 0
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: b.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.address,
      addressLocality: b.city,
      addressCountry: 'FR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: b.lat, longitude: b.lng },
    telephone: b.phone,
    aggregateRating: rating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: b.reviews_count,
    } : undefined,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold">{b.name}</h1>
                <CertBadge certification={b.certification} verified={b.certification_verified} />
              </div>

              <div className="flex items-center gap-1.5 text-gray-600 text-sm mb-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{b.address}, {b.city}</span>
              </div>

              {rating > 0 && (
                <StarRating rating={rating} count={b.reviews_count} />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <MapPin className="w-4 h-4" />
                Google Maps
                <ExternalLink className="w-3 h-3" />
              </a>
              {b.phone && (
                <a href={`tel:${b.phone}`} className="btn-primary flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4" />
                  {b.phone}
                </a>
              )}
            </div>
          </div>

          {b.horaires && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-4 pt-4 border-t">
              <Clock className="w-4 h-4 shrink-0 text-halal-green" />
              <span>{b.horaires}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Photos */}
            <PhotosSection boucherieId={b.id} photos={photos} />

            {/* Avis */}
            <AvisSection boucherieId={b.id} avis={avis} />
          </div>

          <div className="space-y-4">
            {/* Certification détail */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-halal-green" />
                <h3 className="font-semibold">Certification</h3>
              </div>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-white mb-2"
                style={{ backgroundColor: certInfo.color }}
              >
                {certInfo.icon} {certInfo.name}
              </div>
              <p className="text-xs text-gray-600">{certInfo.description}</p>
              {certInfo.website && (
                <a
                  href={certInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-halal-green hover:underline mt-2 inline-flex items-center gap-1"
                >
                  Site officiel <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {b.certification_photo_url && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Photo du certificat</p>
                  <img
                    src={b.certification_photo_url}
                    alt="Certificat halal"
                    className="rounded-lg w-full object-cover max-h-40"
                  />
                </div>
              )}
            </div>

            {/* Vote certification communautaire */}
            <CertVoteSection boucherieId={b.id} votes={certVotes} />
          </div>
        </div>

        {/* Similaires */}
        {similaires.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold mb-4">Autres boucheries à {b.city}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {similaires.map((s) => (
                <BoucherieCard key={s.id} boucherie={s} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
