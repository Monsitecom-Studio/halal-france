// Remplit city/dept/region manquants via reverse geocoding Nominatim
// Usage: node fix-cities.mjs
// Prérequis: npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://cpkjmoqpysnvcmrvkfku.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwa2ptb3FweXNudmNtcnZrZmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM1MDQxMCwiZXhwIjoyMDkxOTI2NDEwfQ.hI_ySC7oRntoIqj4ndGWH55pQh2btogRvGP_FEoLMuI'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'HalalFrance/1.0 (monsitecomfr@gmail.com)' },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const addr = data.address || {}
    return {
      city: addr.city || addr.town || addr.village || addr.municipality || '',
      dept: addr.county || addr.state_district || '',
      region: addr.state || '',
      postcode: addr.postcode || '',
    }
  } catch {
    return null
  }
}

async function main() {
  console.log('🔍 Recherche boucheries sans ville...\n')

  const { data: boucheries, error } = await supabase
    .from('boucheries')
    .select('id, name, lat, lng, city, dept, region')
    .or('city.eq.,city.is.null')
    .not('lat', 'is', null)
    .not('lng', 'is', null)

  if (error) { console.error(error); return }
  console.log(`${boucheries.length} boucheries à corriger\n`)

  let fixed = 0
  let failed = 0

  for (const b of boucheries) {
    const geo = await reverseGeocode(b.lat, b.lng)

    if (!geo || !geo.city) {
      console.log(`❌ ${b.name} — pas de résultat`)
      failed++
    } else {
      const { error: updateErr } = await supabase
        .from('boucheries')
        .update({
          city: geo.city,
          dept: geo.dept || b.dept || '',
          region: geo.region || b.region || '',
        })
        .eq('id', b.id)

      if (!updateErr) {
        console.log(`✅ ${b.name} → ${geo.city} (${geo.dept})`)
        fixed++
      } else {
        console.error(`❌ ${b.name}: ${updateErr.message}`)
        failed++
      }
    }

    // Nominatim limite à 1 requête/seconde
    await sleep(1100)
  }

  console.log(`\n✅ Terminé: ${fixed} corrigées, ${failed} échecs`)
}

main()
