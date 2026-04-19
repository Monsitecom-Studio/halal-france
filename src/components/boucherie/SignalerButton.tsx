'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  boucherieId: string
  boucherieName: string
}

export default function SignalerButton({ boucherieId, boucherieName }: Props) {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [raison, setRaison] = useState('non_halal')

  const handleSignal = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('signalements').insert({
      boucherie_id: boucherieId,
      user_id: user?.id || null,
      raison,
    })

    setSent(true)
    setLoading(false)
    setShowForm(false)
  }

  if (sent) return (
    <p className="text-xs text-gray-400 flex items-center gap-1">
      <Flag className="w-3 h-3" /> Signalement envoyé, merci.
    </p>
  )

  return (
    <div>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          <Flag className="w-3 h-3" />
          Signaler un problème
        </button>
      ) : (
        <div className="bg-gray-50 rounded-xl p-4 mt-3 space-y-3">
          <p className="text-sm font-medium">Signaler "{boucherieName}"</p>
          <select
            value={raison}
            onChange={e => setRaison(e.target.value)}
            className="input-field text-sm"
          >
            <option value="non_halal">Cette boucherie n'est pas halal</option>
            <option value="fermee">Cette boucherie est fermée définitivement</option>
            <option value="mauvaise_adresse">Adresse incorrecte</option>
            <option value="doublon">Doublon</option>
            <option value="autre">Autre</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleSignal}
              disabled={loading}
              className="btn-primary text-sm px-4 py-2"
            >
              {loading ? 'Envoi...' : 'Envoyer'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="btn-secondary text-sm px-4 py-2"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
