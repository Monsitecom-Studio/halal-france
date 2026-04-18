import { Star } from 'lucide-react'
import { clsx } from 'clsx'

interface Props {
  rating: number
  count?: number
  size?: 'sm' | 'md'
  source?: 'google' | 'halal'
}

export default function StarRating({ rating, count, size = 'md', source }: Props) {
  const stars = Math.round(rating * 2) / 2

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
      {source && (
        <span className={clsx(
          'rounded-full px-1.5 py-0.5 font-medium',
          size === 'sm' ? 'text-[10px]' : 'text-xs',
          source === 'google'
            ? 'bg-blue-50 text-blue-600'
            : 'bg-green-50 text-halal-green'
        )}>
          {source === 'google' ? 'Google' : 'Halal France'}
        </span>
      )}
    </div>
  )
}
