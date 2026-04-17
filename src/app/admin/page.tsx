import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Récupérer boucheries en attente
  const { data: pending } = await supabase
    .from('boucheries')
    .select('*')
    .eq('is_approved', false)
    .order('created_at', { ascending: false })

  // Stats rapides
  const { count: totalApproved } = await supabase
    .from('boucheries')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', true)

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Administration</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalApproved} boucheries publiées · {pending?.length || 0} en attente de validation
          </p>
        </div>
        <AdminClient pending={pending || []} />
      </main>
    </>
  )
}
