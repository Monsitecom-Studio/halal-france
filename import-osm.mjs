import { createClient } from '@supabase/supabase-js'
import slugify from 'slugify'

const SUPABASE_URL = 'https://cpkjmoqpysnvcmrvkfku.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwa2ptb3FweXNudmNtcnZrZmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM1MDQxMCwiZXhwIjoyMDkxOTI2NDEwfQ.hI_ySC7oRntoIqj4ndGWH55pQh2btogRvGP_FEoLMuI'
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

const BBOXES = [
  // [sud, ouest, nord, est] — France découpée en zones
  [48.5, 2.0, 49.2, 2.8],   // Paris centre
  [48.7, 1.5, 49.5, 2.5],   // Île-de-France ouest
  [48.7, 2.5, 49.5, 3.5],   // Île-de-France est
  [45.5, 4.7, 46.0, 5.2],   // Lyon
  [43.1, 5.2, 43.5, 5.5],   // Marseille
  [43.4, 1.2, 43.8, 1.7],   // Toulouse
  [43.5, 6.8, 43.8, 7.3],   // Nice
  [47.1, -1.7, 47.4, -1.4], // Nantes
  [43.5, 3.7, 43.8, 4.0],   // Montpellier
  [48.4, 7.6, 48.7, 7.9],   // Strasbourg
  [44.7, -0.7, 45.0, -0.4], // Bordeaux
  [50.5, 2.9, 50.8, 3.2],   // Lille
  [48.0, -1.8, 48.2, -1.5], // Rennes
  [49.1, 4.0, 49.3, 4.2],   // Reims
  [49.4, 1.0, 49.6, 1.2],   // Rouen
  [45.7, 3.0, 45.9, 3.2],   // Clermont-Ferrand
  [47.3, 5.0, 47.5, 5.2],   // Dijon
  [47.3, 0.6, 47.5, 0.8],   // Tours
  [43.8, 4.3, 44.0, 4.5],   // Nîmes
  [45.1, 5.7, 45.3, 5.9],   // Grenoble
  [50.3, 3.9, 50.5, 4.2],   // Valenciennes/Maubeuge
  [48.6, 6.1, 48.8, 6.3],   // Nancy
  [49.3, 4.0, 49.5, 4.3],   // Charleville
  [47.7, 7.3, 47.9, 7.5],   // Mulhouse
  [48.0, 7.6, 48.2, 7.8],   // Colmar
  [44.8, 4.7, 45.0, 4.9],   // Valence
  [43.1, 2.3, 43.4, 2.6],   // Carcassonne/Béziers
  [42.6, 2.8, 42.8, 3.0],   // Perpignan
  [45.6, 0.1, 45.9, 0.4],   // Limoges
  [46.3, 6.0, 46.6, 6.3],   // Annecy
  [45.5, 5.8, 45.8, 6.1],   // Chambéry
  [47.2, -1.6, 47.4, -1.4], // Saint-Nazaire
  [46.1, -1.3, 46.3, -1.0], // La Rochelle
  [48.8, 2.2, 49.1, 2.5],   // Cergy/Pontoise
  [48.6, 2.4, 48.9, 2.7],   // Évry/Corbeil
  [48.8, 2.3, 49.0, 2.6],   // Saint-Denis/Aubervilliers
]

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function generateSlug(name, city) {
  return slugify(`${name} ${city} ${Date.now()}`, { lower: true, strict: true })
}

function detectCertification(tags) {
  const t = JSON.stringify(tags).toLowerCase()
  if (t.includes('avs')) return 'avs'
  if (t.includes('argml')) return 'argml'
  if (t.includes('mosquee-paris') || t.includes('mosquée de paris')) return 'mosquee-paris'
  if (t.includes('acmif')) return 'acmif'
  return 'unknown'
}

async function fetchWithRetry(bbox) {
  const [s, w, n, e] = bbox
  const query = `[out:json][timeout:30];(node["shop"="butcher"]["diet:halal"](${s},${w},${n},${e});node["shop"="butcher"]["halal"="yes"](${s},${w},${n},${e});way["shop"="butcher"]["diet:halal"](${s},${w},${n},${e}););out center;`

  for (let attempt = 0; attempt < SERVERS.length; attempt++) {
    const server = SERVERS[attempt % SERVERS.length]
    try {
      const res = await fetch(server, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(35000),
      })
      if (res.ok) {
        const data = await res.json()
        return data.elements || []
      }
      console.log(`  ⚠️  Serveur ${attempt + 1} erreur ${res.status}, retry...`)
      await sleep(3000)
    } catch (err) {
      console.log(`  ⚠️  Serveur ${attempt + 1} timeout, retry...`)
      await sleep(3000)
    }
  }
  return []
}

async function main() {
  console.log('🚀 Import OSM boucheries halal — France\n')

  let totalImported = 0
  let totalSkipped = 0

  for (let i = 0; i < BBOXES.length; i++) {
    const bbox = BBOXES[i]
    console.log(`[${i + 1}/${BBOXES.length}] Zone ${bbox.join(',')}`)

    const elements = await fetchWithRetry(bbox)
    console.log(`  → ${elements.length} trouvés`)

    for (const el of elements) {
      const tags = el.tags || {}
      const name = tags.name || tags['name:fr'] || 'Boucherie halal'
      const lat = el.lat || el.center?.lat
      const lng = el.lon || el.center?.lon
      if (!lat || !lng) { totalSkipped++; continue }

      const city = tags['addr:city'] || tags['addr:town'] || ''
      const housenumber = tags['addr:housenumber'] || ''
      const street = tags['addr:street'] || ''
      const postcode = tags['addr:postcode'] || ''
      const address = [housenumber, street, postcode, city].filter(Boolean).join(' ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      const phone = tags.phone || tags['contact:phone'] || null
      const horaires = tags.opening_hours || null
      const osm_id = `osm_${el.type}_${el.id}`

      // Check doublon osm_id
      const { data: ex } = await supabase.from('boucheries').select('id').eq('google_place_id', osm_id).maybeSingle()
      if (ex) { totalSkipped++; continue }

      // Check doublon géo
      const { data: geo } = await supabase.from('boucheries').select('id')
        .gte('lat', lat - 0.0005).lte('lat', lat + 0.0005)
        .gte('lng', lng - 0.0005).lte('lng', lng + 0.0005)
      if (geo && geo.length > 0) { totalSkipped++; continue }

      const { error } = await supabase.from('boucheries').insert({
        name, slug: generateSlug(name, city), address, city,
        dept: null, region: null, lat, lng, phone, horaires,
        rating: null, reviews_count: 0,
        google_place_id: osm_id,
        certification: detectCertification(tags),
        certification_verified: false, is_approved: true,
      })

      if (!error) {
        console.log(`  ✅ ${name} (${city})`)
        totalImported++
      }
      await sleep(50)
    }

    await sleep(2000) // pause entre zones
  }

  console.log(`\n✅ Terminé: ${totalImported} ajoutées, ${totalSkipped} ignorées`)
}

main()
