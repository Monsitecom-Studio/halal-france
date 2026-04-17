'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, MapPin, Phone, Clock, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CERTIFICATION_INFO } from '@/types'
import type { Boucherie } from '@/types'

interface Props {
  pending: Boucherie[]
}

export default function AdminClient({ pending: initialPending }: Props) {
  const [pending, setPending] = useState(initialPending)
  const [loading, setLoading] = useState<string | null>(null)

  const handleApprove = async (id: string) => {
    setLoading(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('boucheries')
      .update({ is_approved: true })
      .eq('id', id)
    if (!error) setPending(prev => prev.filter(b => b.id !== id))
    setLoading(null)
  }

  const handleReject = async (id: string) => {
    if (!confirm('Supprimer définitivement cette boucherie ?')) return
    setLoading(id)
    const supabase = createClient()
    const { error } = await supabase
      .from('boucheries')
      .delete()
      .eq('id', id)
    if (!error) setPending(prev => prev.filter(b => b.id !== id))
    setLoading(null)
  }

  if (pending.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <CheckCircle className="w-12 h-12 text-halal-green mx-auto mb-3" />
        <p className="font-medium">Aucune boucherie en attente</p>
        <p className="text-sm">Toutes les soumissions ont été traitées.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pending.map(b => {
        const certInfo = CERTIFICATION_INFO[b.certification]
        const isLoading = loading === b.id
        return (
          <div key={b.id} className="card p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{b.name}</h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                    style={{ backgroundColor: certInfo.color }}
                  >
                    {certInfo.icon} {certInfo.name}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {b.address}, {b.city} ({b.dept})
                  </div>
                  {b.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {b.phone}
                    </div>
                  )}
                  {b.horaires && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {b.horaires}
                    </div>
                  )}
                  <div className="text-xs text-gray-400">
                    Lat: {b.lat} · Lng: {b.lng} · Soumis le {new Date(b.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(b.id)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Publier
                </button>
                <button
                  onClick={() => handleReject(b.id)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Rejeter
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
