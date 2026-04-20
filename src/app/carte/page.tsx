import { getBoucheriesForMap } from '@/lib/supabase/queries'
import Navbar from '@/components/layout/Navbar'
import MapPageClient from './MapPageClient'

export const metadata = {
  title: 'Carte des boucheries halal en France',
}

export default async function CartePage() {
  const boucheries = await getBoucheriesForMap().catch(() => [])

  return (
    <>
      <Navbar />
      <MapPageClient boucheries={boucheries} />
    </>
  )
}
