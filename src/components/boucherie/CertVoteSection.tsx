'use client'

import { useState } from 'react'
import { Vote } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CERTIFICATION_INFO } from '@/types'
import type { Certification } from '@/types'

interface Props {
  boucherieId: string
  votes: Record<string, number>
}

export default function CertVoteSection({ boucherieId, votes: initialVotes }: Props) {
  const [votes, setVotes] = useState(initialVotes)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0)

  const handleVote = async (certification: Certification) => {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Connectez-vous pour voter'); setLoading(false); return }

    const { error: err } = await supabase
      .from('certification_votes')
      .upsert({ boucherie_id: boucherieId, user_id: user.id, certification })

    if (err) { setError(err.message) }
    else {
      setVotes(prev => ({ ...prev, [certification]: (prev[certification] || 0) + 1 }))
    }
    setLoading(false)
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Vote className="w-5 h-5 text-halal-green" />
        <h3 className="font-semibold">Quelle certification avez-vous vue ?</h3>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Votez pour indiquer la certification constatée sur place ({totalVotes} vote{totalVotes > 1 ? 's' : ''})
      </p>

      <div className="space-y-2">
        {Object.values(CERTIFICATION_INFO).map((cert) => {
          const count = votes[cert.id] || 0
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
          return (
            <button
              key={cert.id}
              onClick={() => handleVote(cert.id as Certification)}
              disabled={loading}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between text-xs mb-0.5">
                <span className="font-medium" style={{ color: cert.color }}>
                  {cert.icon} {cert.name}
                </span>
                <span className="text-gray-500">{count} vote{count > 1 ? 's' : ''}</span>
              </div>
              <div className="bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: cert.color }}
                />
              </div>
            </button>
          )
        })}
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  )
}
