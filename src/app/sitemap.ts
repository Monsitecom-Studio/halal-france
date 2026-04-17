import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const { data } = await supabase
    .from('boucheries')
    .select('slug, city, updated_at')
    .eq('is_approved', true)

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://halal-france.fr'

  const boucherieUrls: MetadataRoute.Sitemap = (data || []).map(b => ({
    url: `${base}/boucherie/${b.slug}`,
    lastModified: new Date(b.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const cities = Array.from(new Set((data || []).map(b => b.city)))
  const villeUrls: MetadataRoute.Sitemap = cities.map(city => ({
    url: `${base}/ville/${encodeURIComponent(city.toLowerCase())}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/boucheries`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/carte`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/ajouter`, changeFrequency: 'monthly', priority: 0.5 },
    ...villeUrls,
    ...boucherieUrls,
  ]
}
