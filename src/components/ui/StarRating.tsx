import { Star } from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
  rating: number
  count?: number
  size?: 'sm' | 'md'
}

export default function StarRating({ rating, count, size = 'md' }: Props) {
  const stars = Math.round(rating * 2) / 2 // Arrondi au 0.5

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={clsx(
              size === 'sm' ? 'w-3 h-3' : 'w-4 h-4',
              i <= stars ? 'fill-halal-gold text-halal-gold' : 'fill-gray-200 text-gray-200'
            )}
          />
        ))}
      </div>
      <span className={clsx('font-medium', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {rating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className={clsx('text-gray-400', size === 'sm' ? 'text-xs' : 'text-sm')}>
          ({count})
        </span>
      )}
    </div>
  )
}
