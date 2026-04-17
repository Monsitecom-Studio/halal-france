import Link from 'next/link'
import { Shield, ExternalLink, CheckCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CERTIFICATION_INFO } from '@/types'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Les certifications halal en France',
  description: 'Comprendre les certifications halal : AVS, ARGML, Grande Mosquée de Paris, ACMIF. Leur rôle, leurs exigences et comment les vérifier.',
}

export default async function CertificationsPage() {
  const supabase = createClient()
  const { data: counts } = await supabase
    .from('boucheries')
    .select('certification')
    .eq('is_approved', true)

  const certCounts: Record<string, number> = {}
  counts?.forEach(b => {
    certCounts[b.certification] = (certCounts[b.certification] || 0) + 1
  })

  const certDetails: Record<string, { exigences: string[]; particularites: string }> = {
    avs: {
      exigences: [
        'Jusqu\'à 3 visites de contrôle par jour sur les abattoirs',
        'Contrôle de la chaîne d\'approvisionnement complète',
        'Certification individuelle de chaque boucher',
        'Renouvellement annuel obligatoire',
      ],
      particularites: 'Organisme indépendant reconnu, particulièrement strict sur le suivi de traçabilité. Environ 100 boucheries certifiées en France.',
    },
    argml: {
      exigences: [
        '80+ contrôleurs rituels actifs',
        'Présence lors de l\'abattage',
        'Marque déposée à l\'INPI',
        'Contrôles surprises réguliers',
      ],
      particularites: 'Émanant de la Mosquée de Lyon, une des plus grandes mosquées de France. Forte présence dans la région Auvergne-Rhône-Alpes.',
    },
    'mosquee-paris': {
      exigences: [
        'Habilitation la plus ancienne de France (depuis 1939)',
        'Comité religieux ET scientifique',
        'Supervision des abattoirs agréés',
        'Agrément reconnu internationalement',
      ],
      particularites: 'La Grande Mosquée de Paris est l\'institution islamique la plus ancienne de France. Ses certifications sont reconnues dans de nombreux pays.',
    },
    acmif: {
      exigences: [
        'Partenariats avec groupes industriels (LDC/Groupe Doux)',
        'Certifie la marque Reghalal',
        'Contrôle des unités de production',
        'Focus sur la grande distribution',
      ],
      particularites: 'L\'ACMIF certifie principalement des produits industriels et de grande distribution, notamment via la marque Reghalal.',
    },
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-green-50 text-halal-green px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            Guide des certifications
          </div>
          <h1 className="text-3xl font-bold mb-3">Les certifications halal en France</h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            En France, plusieurs organismes sont habilités à certifier les boucheries halal.
            Chaque certification a ses propres exigences et son niveau de rigueur.
          </p>
        </div>

        {/* Explainer */}
        <div className="card p-6 mb-8 bg-amber-50 border-amber-100">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-amber-600" />
            Comment ça marche ?
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Une certification halal garantit que la viande a été abattue selon les rites islamiques,
            avec une invocation (Bismillah), un abattage par un musulman pratiquant, et l'écoulement
            total du sang. Les organismes de certification contrôlent l'ensemble de la chaîne,
            de l'abattoir à la boucherie.
          </p>
        </div>

        {/* Certifications */}
        <div className="space-y-6">
          {Object.values(CERTIFICATION_INFO)
            .filter(c => c.id !== 'unknown')
            .map(cert => {
              const details = certDetails[cert.id]
              const count = certCounts[cert.id] || 0
              return (
                <div key={cert.id} className="card p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: cert.color + '20' }}
                      >
                        {cert.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-bold text-xl" style={{ color: cert.color }}>{cert.name}</h2>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                            style={{ backgroundColor: cert.color }}
                          >
                            {count} boucherie{count > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{cert.full_name}</p>
                      </div>
                    </div>
                    {cert.website && (
                      <a
                        href={cert.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-300 transition-colors"
                      >
                        Site officiel <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {details && (
                    <>
                      <p className="text-sm text-gray-600 mb-4">{details.particularites}</p>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Exigences principales</p>
                        <ul className="space-y-1.5">
                          {details.exigences.map((e, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="mt-0.5 text-halal-green">✓</span>
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link
                      href={`/boucheries?cert=${cert.id}`}
                      className="text-sm text-halal-green font-medium hover:underline"
                    >
                      Voir les {count} boucheries certifiées {cert.name} →
                    </Link>
                  </div>
                </div>
              )
            })}
        </div>

        {/* Non vérifié */}
        <div className="card p-6 mt-6 border-dashed">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⚪</span>
            <h3 className="font-semibold text-gray-600">Non vérifié / Auto-déclaré</h3>
          </div>
          <p className="text-sm text-gray-500">
            Certains établissements se déclarent halal sans certification officielle reconnue.
            Ces boucheries peuvent être halal, mais leur conformité n'est pas contrôlée par un organisme tiers.
            Notre communauté peut voter pour indiquer la certification constatée sur place.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
