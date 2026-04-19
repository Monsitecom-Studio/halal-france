'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, MapPin, Phone, Clock, Users, Store, Flag, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CERTIFICATION_INFO } from '@/types'
import type { Boucherie } from '@/types'

interface Signalement {
  id: string
  boucherie_id: string
  raison: string
  created_at: string
  traite: boolean
  boucheries: { name: string; city: string; slug: string }
}

interface Props {
  pending: Boucherie[]
  users: any[]
  signalements: Signalement[]
}

const RAISONS: Record<string, string> = {
  non_halal: '🚫 Pas halal',
  fermee: '🔒 Fermée définitivement',
  mauvaise_adresse: '📍 Adresse incorrecte',
  doublon: '♻️ Doublon',
  autre: '❓ Autre',
}

export default function AdminClient({ pending: initialPending, users, signalements: initialSignalements }: Props) {
  const [pending, setPending] = useState(initialPending)
  const [signalements, setSignalements] = useState(initialSignalements)
  const [loading, setLoading] = useState<string | null>(null)
  const [tab, setTab] = useState<'pending' | 'signalements' | 'users'>('signalements')

  const handleApprove = async (id: string) => {
    setLoading(id)
    const supabase = createClient()
    const { error } = await supabase.from('boucheries').update({ is_approved: true }).eq('id', id)
    if (!error) setPending(prev => prev.filter(b => b.id !== id))
    setLoading(null)
  }

  const handleReject = async (id: string) => {
    if (!confirm('Supprimer définitivement cette boucherie ?')) return
    setLoading(id)
    const supabase = createClient()
    await supabase.from('boucheries').delete().eq('id', id)
    setPending(prev => prev.filter(b => b.id !== id))
    setLoading(null)
  }

  const handleDeleteBoucherie = async (boucherieId: string, signalementId: string) => {
    if (!confirm('Supprimer définitivement cette boucherie ?')) return
    setLoading(signalementId)
    const supabase = createClient()
    await supabase.from('boucheries').delete().eq('id', boucherieId)
    setSignalements(prev => prev.filter(s => s.id !== signalementId))
    setLoading(null)
  }

  const handleTraiter = async (id: string) => {
    setLoading(id)
    const supabase = createClient()
    await supabase.from('signalements').update({ traite: true }).eq('id', id)
    setSignalements(prev => prev.filter(s => s.id !== id))
    setLoading(null)
  }

  const nonTraites = signalements.filter(s => !s.traite)

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-gray-100">
        <button onClick={() => setTab('signalements')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'signalements' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400'}`}>
          <Flag className="w-4 h-4" />
          Signalements ({nonTraites.length})
        </button>
        <button onClick={() => setTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'pending' ? 'border-halal-green text-halal-green' : 'border-transparent text-gray-400'}`}>
          <Store className="w-4 h-4" />
          En attente ({pending.length})
        </button>
        <button onClick={() => setTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'users' ? 'border-halal-green text-halal-green' : 'border-transparent text-gray-400'}`}>
          <Users className="w-4 h-4" />
          Utilisateurs ({users.length})
        </button>
      </div>

      {tab === 'signalements' && (
        <div className="space-y-4">
          {nonTraites.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Flag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-medium">Aucun signalement en attente</p>
            </div>
          ) : nonTraites.map(s => (
            <div key={s.id} className="card p-5 border-l-4 border-red-300">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold">{s.boucheries?.name} — {s.boucheries?.city}</p>
                  <p className="text-sm text-red-500 mt-1">{RAISONS[s.raison] || s.raison}</p>
                  <p className="text-xs text-gray-400 mt-1">Signalé le {new Date(s.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <a href={`/boucherie/${s.boucheries?.slug}`} target="_blank"
                    className="btn-secondary text-sm px-3 py-2">
                    Voir la fiche
                  </a>
                  <button onClick={() => handleDeleteBoucherie(s.boucherie_id, s.id)} disabled={loading === s.id}
                    className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                  <button onClick={() => handleTraiter(s.id)} disabled={loading === s.id}
                    className="flex items-center gap-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                    <CheckCircle className="w-4 h-4" /> Ignorer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'pending' && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <CheckCircle className="w-12 h-12 text-halal-green mx-auto mb-3" />
              <p className="font-medium">Aucune boucherie en attente</p>
            </div>
          ) : pending.map(b => {
            const certInfo = CERTIFICATION_INFO[b.certification]
            const isLoading = loading === b.id
            return (
              <div key={b.id} className="card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{b.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: certInfo.color }}>
                        {certInfo.icon} {certInfo.name}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{b.address}, {b.city}</div>
                      {b.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{b.phone}</div>}
                      {b.horaires && <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{b.horaires}</div>}
                      <div className="text-xs text-gray-400">Soumis le {new Date(b.created_at).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(b.id)} disabled={isLoading}
                      className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                      <CheckCircle className="w-4 h-4" /> Publier
                    </button>
                    <button onClick={() => handleReject(b.id)} disabled={isLoading}
                      className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                      <XCircle className="w-4 h-4" /> Rejeter
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'users' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Inscription</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dernière connexion</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.email}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 text-gray-400">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.email_confirmed_at ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {u.email_confirmed_at ? 'Vérifié' : 'En attente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
