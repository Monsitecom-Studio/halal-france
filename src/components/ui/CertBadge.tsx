import { CERTIFICATION_INFO } from '@/types'
import type { Certification } from '@/types'
import { clsx } from 'clsx'

interface Props {
  certification: Certification
  size?: 'sm' | 'md'
  verified?: boolean
}

export default function CertBadge({ certification, size = 'md', verified }: Props) {
  const info = CERTIFICATION_INFO[certification]

  return (
    <span
      className={clsx(
        'cert-badge',
        size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'
      )}
      style={{ backgroundColor: info.color }}
      title={info.full_name}
    >
      {info.icon} {info.name}
      {verified && ' ✓'}
    </span>
  )
}
