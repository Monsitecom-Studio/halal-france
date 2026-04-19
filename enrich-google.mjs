// Enrichit les boucheries OSM avec notes/avis Google Places
// Usage: node enrich-google.mjs
// Prérequis: npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js'

const GOOGLE_API_KEY = 'AIzaSyAcyUVY9G5GIfLISsJ0CBMEdmYAg7ev-0w'
const SUPABASE_URL = 'https://cpkjmoqpysnvcmrvkfku.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwa2ptb3FweXNudmNtcnZrZmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM1MDQxMCwiZXhwIjoyMDkxOTI2NDEwfQ.hI_ySC7oRntoIqj4ndGWH55pQh2btogRvGP_FEoLMuI'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function searchGooglePlace(name, lat, lng) {
  const url = 'https://places.googleapis.com/v1/places:searchText'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'places.id,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.formattedAddress,places.regularOpeningHours',
    },
    body: JSON.stringify({
      textQuery: `${name} boucherie halal`,
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 500,
        },
      },
      languageCode: 'fr',
      regionCode: 'FR',
      maxResultCount: 1,
    }),
  })

  if (!res.ok) return null
  const data = await res.json()
  return data.places?.[0] || null
}

async function main() {
  console.log('🔍 Récupération boucheries sans note Google...\n')

  // Récupère boucheries sans rating (importées depuis OSM)
  const { data: boucheries, error } = await supabase
    .from('boucheries')
    .select('id, name, lat, lng, city, rating, phone')
    .is('rating', null)
    .not('lat', 'is', null)
    .limit(500)

  if (error) { console.error(error); return }
  console.log(`${boucheries.length} boucheries à enrichir\n`)

  let enriched = 0
  let notFound = 0
  let errors = 0

  for (const b of boucheries) {
    try {
      const place = await searchGooglePlace(b.name, b.lat, b.lng)

      if (!place) {
        console.log(`⚪ ${b.name} (${b.city}) — non trouvé sur Google`)
        notFound++
      } else {
        const updates = {}
        if (place.rating) updates.rating = place.rating
        if (place.userRatingCount) updates.reviews_count = place.userRatingCount
        if (place.nationalPhoneNumber && !b.phone) updates.phone = place.nationalPhoneNumber
        if (place.regularOpeningHours?.weekdayDescriptions) {
          updates.horaires = place.regularOpeningHours.weekdayDescriptions.join(' | ')
        }
        if (place.id) updates.google_place_id = place.id

        if (Object.keys(updates).length > 0) {
          const { error: updateErr } = await supabase
            .from('boucheries')
            .update(updates)
            .eq('id', b.id)

          if (!updateErr) {
            console.log(`✅ ${b.name} → ⭐ ${place.rating ?? '?'} (${place.userRatingCount ?? 0} avis)`)
            enriched++
          } else {
            console.error(`❌ ${b.name}: ${updateErr.message}`)
            errors++
          }
        } else {
          notFound++
        }
      }
    } catch (err) {
      console.error(`❌ ${b.name}: ${err.message}`)
      errors++
    }

    await sleep(200)
  }

  console.log(`\n✅ Terminé:`)
  console.log(`   ${enriched} enrichies`)
  console.log(`   ${notFound} non trouvées sur Google`)
  console.log(`   ${errors} erreurs`)
}

main()
