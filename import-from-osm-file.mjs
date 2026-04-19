// Script d'import depuis fichier OSM export.json
// Usage: node import-from-osm-file.mjs
// Prérequis: npm install @supabase/supabase-js slugify

import { createClient } from '@supabase/supabase-js'
import slugify from 'slugify'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://cpkjmoqpysnvcmrvkfku.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwa2ptb3FweXNudmNtcnZrZmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM1MDQxMCwiZXhwIjoyMDkxOTI2NDEwfQ.hI_ySC7oRntoIqj4ndGWH55pQh2btogRvGP_FEoLMuI'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

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

async function main() {
  const raw = readFileSync('./export.json', 'utf-8')
  const data = JSON.parse(raw)
  const elements = data.elements || []

  console.log(`🚀 Import de ${elements.length} boucheries OSM\n`)

  let imported = 0
  let skipped = 0
  let errors = 0

  for (const el of elements) {
    const tags = el.tags || {}
    const name = tags.name || tags['name:fr'] || 'Boucherie halal'
    const lat = el.lat
    const lng = el.lon
    if (!lat || !lng) { skipped++; continue }

    const city = tags['addr:city'] || tags['contact:city'] || tags['addr:town'] || tags['addr:village'] || ''
    const housenumber = tags['addr:housenumber'] || tags['contact:housenumber'] || ''
    const street = tags['addr:street'] || tags['contact:street'] || ''
    const postcode = tags['addr:postcode'] || tags['contact:postcode'] || ''
    const parts = [housenumber, street, postcode, city].filter(Boolean)
    const address = parts.length ? parts.join(' ') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    const phone = tags.phone || tags['contact:phone'] || null
    const horaires = tags.opening_hours || null
    const osm_id = `osm_node_${el.id}`
    const certification = detectCertification(tags)

    // Check doublon osm_id
    const { data: ex } = await supabase
      .from('boucheries')
      .select('id')
      .eq('google_place_id', osm_id)
      .maybeSingle()
    if (ex) { skipped++; continue }

    // Check doublon géographique
    const { data: geo } = await supabase
      .from('boucheries')
      .select('id')
      .gte('lat', lat - 0.0005)
      .lte('lat', lat + 0.0005)
      .gte('lng', lng - 0.0005)
      .lte('lng', lng + 0.0005)
    if (geo && geo.length > 0) { skipped++; continue }

    const { error } = await supabase.from('boucheries').insert({
      name,
      slug: generateSlug(name, city),
      address,
      city,
      dept: '',
      region: '',
      lat,
      lng,
      phone,
      horaires,
      rating: null,
      reviews_count: 0,
      google_place_id: osm_id,
      certification,
      certification_verified: false,
      is_approved: true,
    })

    if (error) {
      console.error(`❌ ${name}: ${error.message}`)
      errors++
    } else {
      console.log(`✅ ${name} — ${city || 'ville inconnue'}`)
      imported++
    }

    await sleep(80)
  }

  console.log(`\n✅ Terminé:`)
  console.log(`   ${imported} importées`)
  console.log(`   ${skipped} ignorées (doublons)`)
  console.log(`   ${errors} erreurs`)
}

main()
