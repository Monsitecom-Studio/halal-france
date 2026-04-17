'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User, MapPin, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'
import BoucherieCard from '@/components/boucherie/BoucherieCard'
import type { Boucherie } from '@/types'

export default function ProfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mesBoucheries, setMesBoucheries] = useState<Boucherie[]>([])
  const [mesAvis, setMesAvis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)

      const [{ data: boucheries }, { data: avis }] = await Promise.all([
        supabase
          .from('boucheries')
          .select('*')
          .eq('added_by', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('avis')
          .select('*, boucheries(name, slug, city)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ])

      setMesBoucheries((boucheries as Boucherie[]) || [])
      setMesAvis(avis || [])
      setLoading(false)
    })
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="text-gray-400 animate-pulse">Chargement...</div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header profil */}
        <div className="card p-6 mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-halal-green flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{user.email}</h1>
              <p className="text-sm text-gray-500">
                Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card p-5 text-center">
            <MapPin className="w-6 h-6 text-halal-green mx-auto mb-1" />
            <div className="text-2xl font-bold">{mesBoucheries.length}</div>
            <div className="text-sm text-gray-500">boucherie{mesBoucheries.length > 1 ? 's' : ''} ajoutée{mesBoucheries.length > 1 ? 's' : ''}</div>
          </div>
          <div className="card p-5 text-center">
            <Star className="w-6 h-6 text-halal-gold mx-auto mb-1" />
            <div className="text-2xl font-bold">{mesAvis.length}</div>
            <div className="text-sm text-gray-500">avis publiés</div>
          </div>
        </div>

        {/* Mes boucheries */}
        {mesBoucheries.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-4">Mes contributions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mesBoucheries.map(b => (
                <div key={b.id} className="relative">
                  <BoucherieCard boucherie={b} />
                  {!b.is_approved && (
                    <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-medium">
                      En attente
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mes avis */}
        {mesAvis.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-4">Mes avis</h2>
            <div className="space-y-3">
              {mesAvis.map(a => (
                <div key={a.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/boucherie/${a.boucheries?.slug}`}
                        className="font-medium text-sm hover:text-halal-green transition-colors"
                      >
                        {a.boucheries?.name}
                      </Link>
                      <div className="text-xs text-gray-400">{a.boucheries?.city}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={`text-sm ${i <= a.rating ? 'text-halal-gold' : 'text-gray-200'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  {a.comment && <p className="text-sm text-gray-600 mt-2">{a.comment}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(a.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {mesBoucheries.length === 0 && mesAvis.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">🥩</div>
            <p className="font-medium">Vous n'avez pas encore contribué</p>
            <Link href="/ajouter" className="btn-primary inline-block mt-4">
              Ajouter une boucherie
            </Link>
          </div>
        )}
      </main>
    </>
  )
}
