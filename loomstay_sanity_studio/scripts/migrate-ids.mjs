// One-off (Plan 09): dotted ids (seed.property.x) are private in Sanity, so the app could not read them.
// Recreates every seeded host, policy and property under a dash id (property-x), rewrites references,
// verifies, and only then deletes the old documents.
// Usage: SANITY_WRITE_TOKEN=... node scripts/migrate-ids.mjs [--delete-old]
import {createClient} from '@sanity/client'
import {fileURLToPath} from 'node:url'
import {mkdirSync, writeFileSync} from 'node:fs'

const client = createClient({projectId: 'vxnms1ub', dataset: 'production', apiVersion: '2025-02-19', useCdn: false, token: process.env.SANITY_WRITE_TOKEN, perspective: 'raw'})
const newId = (id) => id.replace(/^seed\.(host|policy|property)\./, '$1-')
const deleteOld = process.argv.includes('--delete-old')

const old = await client.fetch(`*[_id match "seed.*" && !(_id in path("sanity.**"))]`)
console.log(`${old.length} old docs`)
const out = fileURLToPath(new URL('./out/', import.meta.url))
mkdirSync(out, {recursive: true})
writeFileSync(`${out}pre-migration-${Date.now()}.json`, JSON.stringify(old, null, 2))

const rewrite = (v) => {
  if (Array.isArray(v)) return v.map(rewrite)
  if (v && typeof v === 'object') {
    const o = {}
    for (const [k, x] of Object.entries(v)) o[k] = k === '_ref' && typeof x === 'string' && x.startsWith('seed.') ? newId(x) : rewrite(x)
    return o
  }
  return v
}
const fresh = old.map((d) => ({...rewrite(d), _id: newId(d._id)})).map(({_rev, _createdAt, _updatedAt, ...d}) => d)
if (!deleteOld) {
  let tx = client.transaction()
  for (const d of fresh) tx = tx.createOrReplace(d)
  await tx.commit()
  console.log(`created ${fresh.length} docs`)
}

// Verify anonymous visibility and reference integrity before any delete.
const anon = createClient({projectId: 'vxnms1ub', dataset: 'production', apiVersion: '2025-02-19', useCdn: false})
const seen = await anon.fetch(`{"p": count(*[_type=="property"]), "h": count(*[_type=="host"]), "pol": count(*[_type=="policy"]), "broken": count(*[_type=="property" && (!defined(host->_id) || !defined(cancellationPolicy->_id) || !defined(houseRules->_id) || !defined(checkInOut->_id))])}`)
console.log('anonymous view', seen)
if (seen.p !== 30 || seen.h !== 10 || seen.pol !== 9 || seen.broken !== 0) {
  console.error('Verification failed; old docs kept.')
  process.exit(1)
}
if (deleteOld) {
  const ids = await client.fetch(`*[_id match "seed.*" || _id match "sanity.assist.status.seed.*" || _id match "drafts.seed.*"]._id`)
  let tx = client.transaction()
  for (const id of ids) tx = tx.delete(id)
  await tx.commit()
  console.log(`deleted ${ids.length} old docs`)
}
