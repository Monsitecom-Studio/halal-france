import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Vérifier dans la table admins
  const { data: adminRow } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRow) redirect('/')

  const adminClient = createAdminClient()

  const [
    { data: pending },
    { count: totalApproved },
    { data: signalements },
    usersData,
  ] = await Promise.all([
    supabase.from('boucheries').select('*').eq('is_approved', false).order('created_at', { ascending: false }),
    supabase.from('boucheries').select('*', { count: 'exact', head: true }).eq('is_approved', true),
    supabase.from('signalements').select('*, boucheries(name, city, slug)').eq('traite', false).order('created_at', { ascending: false }),
    adminClient.auth.admin.listUsers(),
  ])

  const users = usersData.data?.users || []
  const nonTraites = signalements?.length ?? 0

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Administration</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalApproved} boucheries publiées · {pending?.length || 0} en attente · {nonTraites} signalements · {users.length} comptes
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Boucheries publiées', value: totalApproved ?? 0 },
            { label: 'En attente', value: pending?.length ?? 0 },
            { label: 'Signalements', value: nonTraites },
            { label: 'Utilisateurs', value: users.length },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <div className="text-2xl font-bold text-halal-green">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <AdminClient pending={pending || []} users={users} signalements={signalements || []} />
      </main>
    </>
  )
}
