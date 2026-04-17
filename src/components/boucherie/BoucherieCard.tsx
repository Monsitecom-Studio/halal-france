import Link from 'next/link'
import { MapPin, Phone } from 'lucide-react'
import type { Boucherie } from '@/types'
import CertBadge from '@/components/ui/CertBadge'
import StarRating from '@/components/ui/StarRating'

interface Props {
  boucherie: Boucherie
}

export default function BoucherieCard({ boucherie: b }: Props) {
  const rating = b.rating_combined ?? b.rating ?? 0
  const reviews = (b.reviews_count || 0) + (b.community_reviews_count || 0)

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

      {rating > 0 && (
        <StarRating rating={rating} count={reviews} size="sm" />
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
