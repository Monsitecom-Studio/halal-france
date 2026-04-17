import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const supabase = createClient()

  let query = supabase
    .from('boucheries_with_stats')
    .select('*')
    .eq('is_approved', true)

  const q = searchParams.get('q')
  const cert = searchParams.get('cert')
  const region = searchParams.get('region')
  const city = searchParams.get('city')
  const dept = searchParams.get('dept')
  const sort = searchParams.get('sort') || 'reviews'
  const lat = parseFloat(searchParams.get('lat') || '')
  const lng = parseFloat(searchParams.get('lng') || '')
  const radius = parseFloat(searchParams.get('radius') || '10')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

  if (q) query = query.or(`name.ilike.%${q}%,city.ilike.%${q}%,address.ilike.%${q}%`)
  if (cert && cert !== 'all') query = query.eq('certification', cert)
  if (region) query = query.eq('region_computed', region)
  if (city) query = query.ilike('city', `%${city}%`)
  if (dept) query = query.eq('dept', dept)

  // Filtre géo si lat/lng fournis
  if (!isNaN(lat) && !isNaN(lng)) {
    const latDelta = radius / 111
    const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180))
    query = query
      .gte('lat', lat - latDelta)
      .lte('lat', lat + latDelta)
      .gte('lng', lng - lngDelta)
      .lte('lng', lng + lngDelta)
  }

  const sortMap: Record<string, { col: string; asc: boolean }> = {
    rating: { col: 'rating_combined', asc: false },
    reviews: { col: 'reviews_count', asc: false },
    recent: { col: 'created_at', asc: false },
  }
  const s = sortMap[sort] || sortMap.reviews
  query = query.order(s.col, { ascending: s.asc })
  query = query.range((page - 1) * limit, page * limit - 1)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: data || [], page, limit })
}
