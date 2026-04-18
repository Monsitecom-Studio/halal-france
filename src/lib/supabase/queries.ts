import { createClient } from './server'
import type { Boucherie, SearchFilters } from '@/types'

// Score bayésien : équilibre note et nombre d'avis
// m = seuil minimum d'avis, C = moyenne globale estimée
const BAYES_M = 50
const BAYES_C = 4.2

function bayesianScore(rating: number, reviewsCount: number): number {
  const v = reviewsCount || 0
  const R = rating || 0
  return (v / (v + BAYES_M)) * R + (BAYES_M / (v + BAYES_M)) * BAYES_C
}

export async function getBoucheries(filters: SearchFilters = {}) {
  const supabase = createClient()
  let query = supabase
    .from('boucheries_with_stats')
    .select('*')

  if (filters.query) {
    query = query.or(
      `name.ilike.%${filters.query}%,city.ilike.%${filters.query}%,address.ilike.%${filters.query}%`
    )
  }
  if (filters.city) query = query.ilike('city', `%${filters.city}%`)
  if (filters.dept) query = query.eq('dept', filters.dept)
  if (filters.region) query = query.eq('region_computed', filters.region)
  if (filters.certification && filters.certification !== 'all') {
    query = query.eq('certification', filters.certification)
  }

  // Pour le tri bayésien on récupère tout sans tri Supabase
  const isBayes = filters.sort === 'popular' || !filters.sort

  const sortMap: Record<string, { col: string; asc: boolean }> = {
    rating: { col: 'rating_combined', asc: false },
    reviews: { col: 'reviews_count', asc: false },
    recent: { col: 'created_at', asc: false },
  }

  if (!isBayes) {
    const sort = sortMap[filters.sort!] ?? { col: 'reviews_count', asc: false }
    query = query.order(sort.col, { ascending: sort.asc })
  }

  const { data, error } = await query.limit(500)
  if (error) throw error

  const boucheries = data as Boucherie[]

  // Tri bayésien côté JS (tri par défaut / "Popularité")
  if (isBayes) {
    boucheries.sort((a, b) =>
      bayesianScore(b.rating_combined, b.reviews_count) -
      bayesianScore(a.rating_combined, a.reviews_count)
    )
  }

  return boucheries
}

export async function getBoucherieBySlug(slug: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('boucheries_with_stats')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data as Boucherie
}

export async function getBoucheriesByVille(city: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('boucheries_with_stats')
    .select('*')
    .ilike('city', city)
    .order('reviews_count', { ascending: false })
  if (error) throw error
  return data as Boucherie[]
}

export async function getAvis(boucherieId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('avis')
    .select('*')
    .eq('boucherie_id', boucherieId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getPhotos(boucherieId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('boucherie_id', boucherieId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getCertificationVotes(boucherieId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('certification_votes')
    .select('certification')
    .eq('boucherie_id', boucherieId)
  if (error) throw error
  const counts: Record<string, number> = {}
  data?.forEach((v) => {
    counts[v.certification] = (counts[v.certification] || 0) + 1
  })
  return counts
}

export async function getVillesWithCount() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('boucheries')
    .select('city, dept, region')
    .eq('is_approved', true)
  if (error) throw error

  const counts: Record<string, { city: string; dept: string; region: string; count: number }> = {}
  data?.forEach((b) => {
    const key = b.city
    if (!counts[key]) counts[key] = { city: b.city, dept: b.dept, region: b.region, count: 0 }
    counts[key].count++
  })
  return Object.values(counts).sort((a, b) => b.count - a.count)
}

export async function getProximity(lat: number, lng: number, radius = 10, limit = 20) {
  const supabase = createClient()
  const latDelta = radius / 111
  const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180))

  const { data, error } = await supabase
    .from('boucheries_with_stats')
    .select('*')
    .gte('lat', lat - latDelta)
    .lte('lat', lat + latDelta)
    .gte('lng', lng - lngDelta)
    .lte('lng', lng + lngDelta)
    .limit(limit)

  if (error) throw error

  return (data as Boucherie[]).sort((a, b) => {
    const da = Math.sqrt((a.lat - lat) ** 2 + (a.lng - lng) ** 2)
    const db = Math.sqrt((b.lat - lat) ** 2 + (b.lng - lng) ** 2)
    return da - db
  })
}
