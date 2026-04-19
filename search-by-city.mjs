// Recherche boucheries halal par ville via Google Places API
// Usage: node search-by-city.mjs
// Prérequis: npm install @supabase/supabase-js slugify

import { createClient } from '@supabase/supabase-js'
import slugify from 'slugify'

const GOOGLE_API_KEY = 'AIzaSyAcyUVY9G5GIfLISsJ0CBMEdmYAg7ev-0w'
const SUPABASE_URL = 'https://cpkjmoqpysnvcmrvkfku.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwa2ptb3FweXNudmNtcnZrZmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM1MDQxMCwiZXhwIjoyMDkxOTI2NDEwfQ.hI_ySC7oRntoIqj4ndGWH55pQh2btogRvGP_FEoLMuI'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function generateSlug(name, city) {
  return slugify(`${name} ${city} ${Date.now()}`, { lower: true, strict: true })
}

function detectCertification(name) {
  const n = name.toLowerCase()
  if (n.includes('avs')) return 'avs'
  if (n.includes('argml')) return 'argml'
  if (n.includes('mosquee-paris') || n.includes('mosquée de paris')) return 'mosquee-paris'
  if (n.includes('acmif')) return 'acmif'
  return 'unknown'
}

const VILLES = [
  'Montauban', 'Cahors', 'Albi', 'Castres', 'Rodez',
  'Auch', 'Tarbes', 'Pau', 'Bayonne', 'Biarritz',
  'Agen', 'Périgueux', 'Bergerac', 'Brive-la-Gaillarde',
  'Tulle', 'Aurillac', 'Mende', 'Millau', 'Figeac',
  'Montpellier', 'Nîmes', 'Béziers', 'Sète', 'Perpignan',
  'Carcassonne', 'Narbonne', 'Lunel', 'Mauguio',
  'Avignon', 'Nîmes', 'Arles', 'Orange', 'Carpentras',
  'Toulon', 'Nice', 'Cannes', 'Antibes', 'Fréjus',
  'Marseille', 'Aix-en-Provence', 'Aubagne', 'La Ciotat',
  'Bordeaux', 'Mérignac', 'Pessac', 'Talence', 'Libourne',
  'La Rochelle', 'Rochefort', 'Saintes', 'Angoulême',
  'Poitiers', 'Niort', 'Châtellerault',
  'Tours', 'Blois', 'Orléans', 'Bourges', 'Chartres',
  'Clermont-Ferrand', 'Vichy', 'Riom', 'Thiers',
  'Lyon', 'Villeurbanne', 'Vénissieux', 'Saint-Priest',
  'Grenoble', 'Échirolles', 'Annecy', 'Chambéry',
  'Valence', 'Romans-sur-Isère', 'Montélimar',
  'Saint-Étienne', 'Roanne', 'Firminy',
  'Dijon', 'Chalon-sur-Saône', 'Mâcon', 'Auxerre',
  'Besançon', 'Belfort', 'Mulhouse', 'Colmar', 'Strasbourg',
  'Metz', 'Nancy', 'Épinal', 'Thionville', 'Forbach',
  'Reims', 'Troyes', 'Châlons-en-Champagne',
  'Amiens', 'Beauvais', 'Compiègne', 'Saint-Quentin',
  'Lille', 'Roubaix', 'Tourcoing', 'Dunkerque', 'Valenciennes',
  'Rouen', 'Le Havre', 'Caen', 'Cherbourg', 'Évreux',
  'Rennes', 'Brest', 'Lorient', 'Quimper', 'Vannes',
  'Nantes', 'Saint-Nazaire', 'Angers', 'Le Mans', 'Laval',
  'Paris', 'Boulogne-Billancourt', 'Saint-Denis', 'Montreuil',
  'Aubervilliers', 'Pantin', 'Créteil', 'Vitry-sur-Seine',
  'Ivry-sur-Seine', 'Champigny-sur-Marne', 'Argenteuil',
  'Versailles', 'Cergy', 'Évry', 'Massy', 'Croissy',
  'Sarcelles', 'Garges-lès-Gonesse', 'Goussainville',
]

async function searchInVille(ville) {
  const url = 'https://places.googleapis.com/v1/places:searchText'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.regularOpeningHours',
    },
    body: JSON.stringify({
      textQuery: `boucherie halal ${ville} France`,
      languageCode: 'fr',
      regionCode: 'FR',
      maxResultCount: 20,
    }),
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.places || []
}

async function main() {
  console.log(`🚀 Recherche boucheries halal dans ${VILLES.length} villes\n`)

  let totalImported = 0
  let totalSkipped = 0

  for (const ville of VILLES) {
    console.log(`📍 ${ville}...`)
    const places = await searchInVille(ville)

    for (const place of places) {
      const name = place.displayName?.text || 'Boucherie halal'
      const lat = place.location?.latitude
      const lng = place.location?.longitude
      const googleId = place.id

      if (!lat || !lng) { totalSkipped++; continue }

      // Check doublon google_place_id
      const { data: ex } = await supabase
        .from('boucheries')
        .select('id')
        .eq('google_place_id', googleId)
        .maybeSingle()
      if (ex) { totalSkipped++; continue }

      // Check doublon géo
      const { data: geo } = await supabase
        .from('boucheries')
        .select('id')
        .gte('lat', lat - 0.0005)
        .lte('lat', lat + 0.0005)
        .gte('lng', lng - 0.0005)
        .lte('lng', lng + 0.0005)
      if (geo && geo.length > 0) { totalSkipped++; continue }

      const address = place.formattedAddress || ''
      const phone = place.nationalPhoneNumber || null
      const rating = place.rating || null
      const reviews_count = place.userRatingCount || 0
      const horaires = place.regularOpeningHours?.weekdayDescriptions?.join(' | ') || null

      const { error } = await supabase.from('boucheries').insert({
        name,
        slug: generateSlug(name, ville),
        address,
        city: ville,
        dept: '',
        region: '',
        lat,
        lng,
        phone,
        horaires,
        rating,
        reviews_count,
        google_place_id: googleId,
        certification: detectCertification(name),
        certification_verified: false,
        is_approved: true,
      })

      if (!error) {
        console.log(`  ✅ ${name} — ⭐ ${rating ?? '?'} (${reviews_count} avis)`)
        totalImported++
      }

      await sleep(100)
    }

    await sleep(500)
  }

  console.log(`\n✅ Terminé: ${totalImported} nouvelles boucheries, ${totalSkipped} doublons ignorés`)
}

main()
