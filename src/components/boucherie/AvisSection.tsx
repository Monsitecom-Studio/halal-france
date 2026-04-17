'use client'

import { useState } from 'react'
import { Star, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import StarRating from '@/components/ui/StarRating'

interface Props {
  boucherieId: string
  avis: any[]
}

export default function AvisSection({ boucherieId, avis: initialAvis }: Props) {
  const [avis, setAvis] = useState(initialAvis)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) return setError('Sélectionnez une note')
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Connectez-vous pour laisser un avis')
      setLoading(false)
      return
    }

    const { data, error: err } = await supabase
      .from('avis')
      .upsert({ boucherie_id: boucherieId, user_id: user.id, rating, comment })
      .select()
      .single()

    if (err) {
      setError(err.message)
    } else {
      setAvis([data, ...avis.filter(a => a.user_id !== user.id)])
      setRating(0)
      setComment('')
    }
    setLoading(false)
  }

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-lg mb-4">Avis ({avis.length})</h2>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 mb-5">
        <p className="text-sm font-medium mb-2">Votre avis</p>
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(s)}
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  s <= (hovered || rating)
                    ? 'fill-halal-gold text-halal-gold'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Votre commentaire (optionnel)"
          rows={2}
          className="input-field mb-3 resize-none"
        />
        {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 text-sm">
          <Send className="w-4 h-4" />
          {loading ? 'Envoi...' : 'Publier'}
        </button>
      </form>

      {/* Liste avis */}
      <div className="space-y-3">
        {avis.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">Soyez le premier à laisser un avis !</p>
        )}
        {avis.map((a) => (
          <div key={a.id} className="border-b border-gray-100 pb-3 last:border-0">
            <div className="flex items-center gap-2 mb-1">
              <StarRating rating={a.rating} size="sm" />
              <span className="text-xs text-gray-400">
                {new Date(a.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
            {a.comment && <p className="text-sm text-gray-700">{a.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
