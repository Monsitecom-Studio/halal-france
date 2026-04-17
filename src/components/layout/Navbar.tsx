'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, Plus, Search, User, LogIn } from 'lucide-react'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const path = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-halal-green font-semibold text-base">
          <div className="w-7 h-7 rounded-lg bg-halal-green flex items-center justify-center text-white text-[10px] font-bold">
            HF
          </div>
          Halal France
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/boucheries"
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors',
              path.startsWith('/boucherie') ? 'bg-green-50 text-halal-green font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Rechercher</span>
          </Link>

          <Link
            href="/carte"
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors',
              path === '/carte' ? 'bg-green-50 text-halal-green font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Carte</span>
          </Link>

          {user ? (
            <Link
              href="/profil"
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors',
                path === '/profil' ? 'bg-green-50 text-halal-green font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profil</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Connexion</span>
            </Link>
          )}

          <Link
            href="/ajouter"
            className="flex items-center gap-1.5 bg-halal-green text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-halal-green-dark transition-colors ml-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
