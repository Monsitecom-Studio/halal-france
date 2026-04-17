'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Mail, Lock, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/layout/Navbar'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (password.length < 6) { setError('Le mot de passe doit faire au moins 6 caractères'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signUp({ email, password })
    if (err) { setError(err.message) }
    else { setSuccess(true) }
    setLoading(false)
  }

  if (success) {
    return (
      <>
        <Navbar />
        <main className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <CheckCircle className="w-16 h-16 text-halal-green mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Compte créé !</h1>
            <p className="text-gray-600 mb-6">
              Un email de confirmation a été envoyé à <strong>{email}</strong>.
              Cliquez sur le lien pour activer votre compte.
            </p>
            <Link href="/login" className="btn-primary inline-block">
              Se connecter
            </Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🥩</div>
            <h1 className="text-2xl font-bold">Créer un compte</h1>
            <p className="text-gray-500 text-sm mt-1">Rejoignez la communauté Halal France</p>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field pl-9"
                  placeholder="vous@exemple.fr"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-9"
                  placeholder="Min. 6 caractères"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="input-field pl-9"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" />
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-halal-green font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}
