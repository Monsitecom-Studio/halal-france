// Script d'import boucheries halal via Google Places API (New)
// Usage: node import-boucheries.js
// Prérequis: npm install @supabase/supabase-js node-fetch slugify

import { createClient } from '@supabase/supabase-js'
import slugify from 'slugify'

const GOOGLE_API_KEY = 'AIzaSyDBOHTtX1XvRm8IjP7Dbx1DY4cdZO2hjDY'
const SUPABASE_URL = 'https://cpkjmoqpysnvcmrvkfku.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwa2ptb3FweXNudmNtcnZrZmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM1MDQxMCwiZXhwIjoyMDkxOTI2NDEwfQ.hI_ySC7oRntoIqj4ndGWH55pQh2btogRvGP_FEoLMuI'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const VILLES = [
  'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Montpellier',
  'Strasbourg', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne',
  'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne', 'Le Mans',
  'Aix-en-Provence', 'Clermont-Ferrand', 'Brest', 'Tours', 'Limoges', 'Amiens',
  'Perpignan', 'Metz', 'Besançon', 'Orléans', 'Mulhouse', 'Rouen', 'Caen',
  'Nancy', 'Argenteuil', 'Montreuil', 'Saint-Denis', 'Roubaix', 'Tourcoing',
  'Avignon', 'Nanterre', 'Créteil', 'Poitiers', 'Versailles', 'Pau', 'Colombes',
  'Aulnay-sous-Bois', 'Vitry-sur-Seine', 'Asnières-sur-Seine', 'Rueil-Malmaison',
  'Champigny-sur-Marne', 'Saint-Pierre', 'Antibes', 'Béziers', 'La Rochelle',
  'Dunkerque', 'Aubervilliers', 'Cannes', 'Calais', 'Mérignac', 'Saint-Nazaire',
  'Colmar', 'Valence', 'Drancy', 'Noisy-le-Grand', 'Courbevoie', 'Bourges',
  'Villejuif', 'Quimper', 'La Seyne-sur-Mer', 'Issy-les-Moulineaux', 'Évry',
  'Lorient', 'Pessac', 'Ivry-sur-Seine', 'Cergy', 'Troyes', 'Levallois-Perret',
  'Chambéry', 'Montauban', 'Niort', 'Sartrouville', 'Cayenne', 'Annecy',
  'Ajaccio', 'Clichy', 'Neuilly-sur-Seine', 'Vaulx-en-Velin', 'Sarcelles',
  'Les Lilas', 'Aubervilliers', 'Bobigny', 'Pantin', 'Épinay-sur-Seine',
  'Stains', 'Saint-Ouen', 'Gennevilliers', 'Argenteuil', 'Garges-lès-Gonesse',
  'Massy', 'Antony', 'Clamart', 'Bagneux', 'Fontenay-sous-Bois',
]

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function generateSlug(name, city) {
  const base = slugify(`${name} ${city}`, { lower: true, strict: true })
  return base
}

function detectCertification(name, types) {
  const n = (name || '').toLowerCase()
  if (n.includes('avs')) return 'avs'
  if (n.includes('argml') || n.includes('mosquée de lyon') || n.includes('mosquee de lyon')) return 'argml'
  if (n.includes('mosquée de paris') || n.includes('mosquee de paris')) return 'mosquee-paris'
  if (n.includes('acmif')) return 'acmif'
  return 'unknown'
}

function extractRegion(addressComponents) {
  for (const c of addressComponents) {
    if (c.types.includes('administrative_area_level_1')) {
      return c.long_name
    }
  }
  return null
}

function extractDept(addressComponents) {
  for (const c of addressComponents) {
    if (c.types.includes('administrative_area_level_2')) {
      return c.long_name
    }
  }
  return null
}

async function searchBoucheriesInVille(ville) {
  const query = `boucherie halal ${ville} France`
  const url = 'https://places.googleapis.com/v1/places:searchText'

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.regularOpeningHours,places.addressComponents',
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: 'fr',
      regionCode: 'FR',
      maxResultCount: 20,
    }),
  })

  if (!response.ok) {
    console.error(`Erreur API pour ${ville}:`, response.status, await response.text())
    return []
  }

  const data = await response.json()
  return data.places || []
}

async function importVille(ville) {
  console.log(`\n📍 Traitement: ${ville}`)
  const places = await searchBoucheriesInVille(ville)
  console.log(`  → ${places.length} résultats trouvés`)

  let imported = 0
  let skipped = 0

  for (const place of places) {
    const name = place.displayName?.text || ''
    const address = place.formattedAddress || ''
    const lat = place.location?.latitude
    const lng = place.location?.longitude
    const rating = place.rating || null
    const reviews_count = place.userRatingCount || 0
    const phone = place.nationalPhoneNumber || null
    const horaires = place.regularOpeningHours?.weekdayDescriptions?.join(' | ') || null
    const google_place_id = place.id || null
    const addressComponents = place.addressComponents || []

    const city = ville
    const dept = extractDept(addressComponents)
    const region = extractRegion(addressComponents)
    const certification = detectCertification(name, [])

    // Vérifier si déjà en base
    if (google_place_id) {
      const { data: existing } = await supabase
        .from('boucheries')
        .select('id')
        .eq('google_place_id', google_place_id)
        .single()

      if (existing) {
        skipped++
        continue
      }
    }

    const slug = generateSlug(name, city)

    const { error } = await supabase.from('boucheries').insert({
      name,
      slug,
      address,
      city,
      dept,
      region,
      lat,
      lng,
      phone,
      horaires,
      rating,
      reviews_count,
      google_place_id,
      certification,
      certification_verified: false,
      is_approved: true,
    })

    if (error) {
      if (error.code === '23505') {
        // Slug dupliqué → ajouter suffixe
        const slugUnique = `${slug}-${Date.now()}`
        await supabase.from('boucheries').insert({
          name, slug: slugUnique, address, city, dept, region,
          lat, lng, phone, horaires, rating, reviews_count,
          google_place_id, certification,
          certification_verified: false, is_approved: true,
        })
        imported++
      } else {
        console.error(`  ❌ Erreur insert ${name}:`, error.message)
      }
    } else {
      imported++
      console.log(`  ✅ ${name} (${city})`)
    }

    await sleep(100) // éviter rate limit
  }

  console.log(`  → ${imported} importées, ${skipped} ignorées (déjà en base)`)
  return imported
}

async function main() {
  console.log('🚀 Démarrage import boucheries halal France')
  console.log(`📊 ${VILLES.length} villes à traiter\n`)

  let total = 0

  for (const ville of VILLES) {
    try {
      const count = await importVille(ville)
      total += count
      await sleep(500) // pause entre villes
    } catch (err) {
      console.error(`❌ Erreur pour ${ville}:`, err.message)
    }
  }

  console.log(`\n✅ Import terminé: ${total} boucheries ajoutées`)
}

main()
