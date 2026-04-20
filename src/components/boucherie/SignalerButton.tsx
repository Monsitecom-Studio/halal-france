'use client'

import { useState } from 'react'
import { Flag, X, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  boucherieId: string
  boucherieName: string
}

const RAISONS = [
  { value: 'non_halal', label: '🚫 Cette boucherie n\'est pas halal' },
  { value: 'fermee', label: '🔒 Cette boucherie est fermée définitivement' },
  { value: 'horaires', label: '🕐 Les horaires ont changé' },
  { value: 'mauvaise_adresse', label: '📍 Adresse incorrecte' },
  { value: 'doublon', label: '♻️ Doublon' },
  { value: 'autre', label: '❓ Autre problème' },
]

export default function SignalerButton({ boucherieId, boucherieName }: Props) {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
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
    setShowModal(false)
  }

  if (sent) return (
    <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm">
      <Flag className="w-4 h-4" />
      Merci pour votre signalement, nous allons vérifier.
    </div>
  )

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-between bg-orange-50 border border-orange-200 text-orange-700 rounded-xl px-4 py-3 text-sm font-medium hover:bg-orange-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4" />
          <span>Aidez la communauté — Signaler un problème</span>
        </div>
        <ChevronRight className="w-4 h-4" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Signaler un problème</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400 px-4 pt-3">
              Aidez la communauté à maintenir l&apos;annuaire à jour pour <span className="font-medium text-gray-600">{boucherieName}</span>
            </p>

            <div className="p-4 space-y-2">
              {RAISONS.map(r => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${
                    raison === r.value
                      ? 'border-halal-green bg-green-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="raison"
                    value={r.value}
                    checked={raison === r.value}
                    onChange={() => setRaison(r.value)}
                    className="accent-halal-green"
                  />
                  <span className="text-sm text-gray-700">{r.label}</span>
                </label>
              ))}
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 btn-secondary py-3 text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleSignal}
                disabled={loading}
                className="flex-1 btn-primary py-3 text-sm"
              >
                {loading ? 'Envoi...' : 'Envoyer le signalement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
