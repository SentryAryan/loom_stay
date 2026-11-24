// Read-only check that Dataset Embeddings rank and never filter (Plan 09).
// Usage: SANITY_WRITE_TOKEN=... node scripts/check-embeddings.mjs   (seeded docs have dotted ids, so they are private: a token is needed to read them)
import {createClient} from '@sanity/client'
const client = createClient({projectId: 'vxnms1ub', dataset: 'production', apiVersion: '2025-02-19', useCdn: false, token: process.env.SANITY_WRITE_TOKEN})
const QUERY = `*[_type == "property" && nightlyPrice <= $max] | score(text::semanticSimilarity($q)) | order(_score desc)[0..4]{title, city, category, nightlyPrice, _score}`
const cases = [
  {q: 'quiet cabin to unplug', max: 200},
  {q: 'cozy with a fireplace', max: 300},
  {q: 'sunny family villa', max: 250},
]
let bad = 0
for (const {q, max} of cases) {
  const rows = await client.fetch(QUERY, {q, max})
  console.log(`\n"${q}" (max $${max})`)
  for (const r of rows) console.log(`  ${r._score?.toFixed(3)}  $${r.nightlyPrice}  ${r.category}  ${r.title} (${r.city})`)
  if (rows.length === 0) { console.log('  NO RESULTS'); bad++ }
  if (rows.some((r) => r.nightlyPrice > max)) { console.log('  FILTER VIOLATED'); bad++ }
}
process.exit(bad ? 1 : 0)
