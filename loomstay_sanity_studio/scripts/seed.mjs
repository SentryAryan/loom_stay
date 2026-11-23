// Seeds hosts, policies and 30 properties. Safe to re-run: every document has a fixed _id and is written
// with createOrReplace, and Sanity de-duplicates identical image uploads.
// Usage: SANITY_WRITE_TOKEN=... node scripts/seed.mjs [--dry-run]
import {hosts, policies, properties} from './seed-data.mjs'

const projectId = 'vxnms1ub'
const dataset = 'production'
const api = `https://${projectId}.api.sanity.io/v2025-02-19`
const dryRun = process.argv.includes('--dry-run')
const token = process.env.SANITY_WRITE_TOKEN
if (!token && !dryRun) {
  console.error('Set SANITY_WRITE_TOKEN (an Editor token) or pass --dry-run.')
  process.exit(1)
}

const headers = {Authorization: `Bearer ${token}`}

async function uploadImage(url, filename) {
  const img = await fetch(url)
  if (!img.ok) throw new Error(`Download failed ${img.status}: ${url}`)
  const res = await fetch(`${api}/assets/images/${dataset}?filename=${encodeURIComponent(filename)}`, {
    method: 'POST',
    headers: {...headers, 'Content-Type': img.headers.get('content-type') ?? 'image/jpeg'},
    body: Buffer.from(await img.arrayBuffer()),
  })
  if (!res.ok) throw new Error(`Upload failed ${res.status}: ${await res.text()}`)
  return (await res.json()).document._id
}

const imageField = (assetId, extra = {}) => ({_type: 'image', asset: {_type: 'reference', _ref: assetId}, ...extra})
const ref = (id) => ({_type: 'reference', _ref: id})
const id = {
  host: (k) => `seed.host.${k}`,
  policy: (k) => `seed.policy.${k}`,
  property: (slug) => `seed.property.${slug}`,
}

const docs = []

for (const h of hosts) {
  const asset = dryRun ? 'dry' : await uploadImage(`https://images.unsplash.com/photo-${h.photo}?auto=format&fit=crop&w=400&h=400&q=80`, `host-${h.key}.jpg`)
  docs.push({
    _id: id.host(h.key), _type: 'host', name: h.name, superhost: h.superhost, responseRate: h.responseRate,
    responseTime: h.responseTime, hostingSince: h.hostingSince, languages: h.languages, bio: h.bio,
    photo: imageField(asset, {alt: `Portrait of ${h.name}`}),
  })
}

for (const {key, ...p} of policies) docs.push({_id: id.policy(key), _type: 'policy', ...p})

for (const p of properties) {
  const images = []
  for (const im of p.images) {
    const asset = dryRun ? 'dry' : await uploadImage(im.url, `${im.key}.jpg`)
    images.push(imageField(asset, {_key: im.key, alt: im.alt}))
  }
  docs.push({
    _id: id.property(p.slug), _type: 'property', title: p.title, slug: {_type: 'slug', current: p.slug},
    summary: p.summary, description: p.description, highlights: p.highlights, vibes: p.vibes, images,
    category: p.category, amenities: p.amenities, petsAllowed: p.petsAllowed, maxGuests: p.maxGuests,
    bedrooms: p.bedrooms, beds: p.beds, baths: p.baths, city: p.city, region: p.region, country: p.country,
    location: {_type: 'geopoint', lat: p.lat, lng: p.lng}, rating: p.rating, reviewCount: p.reviewCount,
    nightlyPrice: p.nightlyPrice, cleaningFee: p.cleaningFee, minNights: p.minNights,
    host: ref(id.host(p.host)), cancellationPolicy: ref(id.policy(p.cancel)),
    houseRules: ref(id.policy(p.rules)), checkInOut: ref(id.policy(p.checkin)),
  })
}

if (dryRun) {
  console.log(`Dry run: ${hosts.length} hosts, ${policies.length} policies, ${properties.length} properties (${docs.length} documents).`)
  process.exit(0)
}

const res = await fetch(`${api}/data/mutate/${dataset}`, {
  method: 'POST',
  headers: {...headers, 'Content-Type': 'application/json'},
  body: JSON.stringify({mutations: docs.map((d) => ({createOrReplace: d}))}),
})
if (!res.ok) throw new Error(`Mutate failed ${res.status}: ${await res.text()}`)
console.log(`Wrote ${docs.length} documents.`)
