import Link from 'next/link'
import { MapPin, Phone } from 'lucide-react'
import type { Boucherie } from '@/types'
import CertBadge from '@/components/ui/CertBadge'
import StarRating from '@/components/ui/StarRating'

const BAYES_M = 50
const BAYES_C = 4.2

function bayesianScore(rating: number, reviewsCount: number): number {
  const v = reviewsCount || 0
  const R = rating || 0
  return (v / (v + BAYES_M)) * R + (BAYES_M / (v + BAYES_M)) * BAYES_C
}

interface Props {
  boucherie: Boucherie
}

export default function BoucherieCard({ boucherie: b }: Props) {
  const googleRating = b.rating ?? 0
  const googleCount = b.reviews_count || 0
  const halalScore = googleRating > 0 ? bayesianScore(googleRating, googleCount) : 0

  return (
    <Link href={`/boucherie/${b.slug}`} className="card block p-4 group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-gray-900 group-hover:text-halal-green transition-colors line-clamp-2 text-sm leading-snug">
          {b.name}
        </h3>
        <CertBadge certification={b.certification} verified={b.certification_verified} size="sm" />
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
        <MapPin className="w-3 h-3 shrink-0" />
        <span className="truncate">{b.city}</span>
      </div>

      {googleRating > 0 && (
        <div className="space-y-1">
          <StarRating rating={googleRating} count={googleCount} size="sm" source="google" />
          <StarRating rating={halalScore} size="sm" source="halal" />
        </div>
      )}

      {b.phone && (
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
          <Phone className="w-3 h-3" />
          <span>{b.phone}</span>
        </div>
      )}
    </Link>
  )
}
