// Layer 1 of the "invents nothing" check for generated stay copy (Plan 09). Deterministic, no model.
// checkCopy(facts, {summary, description, highlights}) -> {ok, violations: [{rule, text}]}

const NUMBER_WORDS = {one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12}

// Terms that stand for each amenity id. A term is allowed in the copy only if the stay has that amenity.
const AMENITY_TERMS = {
  'hot-tub': ['hot tub', 'jacuzzi', 'hot-tub'],
  pool: ['pool', 'swim'],
  'ocean-view': ['ocean', 'sea', 'sea view'],
  fireplace: ['fireplace', 'hearth', 'fire'],
  'lake-view': ['lake', 'lakeside', 'lakefront'],
  'city-view': ['skyline', 'city view', 'city views'],
  'mountain-view': ['mountain', 'mountains', 'peak', 'peaks'],
  workspace: ['workspace', 'desk', 'work'],
  wifi: ['wifi', 'wi-fi'],
  kitchen: ['kitchen', 'cook'],
  'air-conditioning': ['air conditioning', 'air-conditioning', 'a/c', 'cooling'],
  parking: ['parking', 'garage'],
  garden: ['garden', 'lawn'],
}

// Concrete things a model likes to add. Allowed only when the facts back them (amenity, place, title, category).
const RISKY_NOUNS = [
  'sauna', 'bbq', 'barbecue', 'grill', 'balcony', 'terrace', 'deck', 'rooftop', 'patio', 'gym', 'beach', 'ocean', 'sea',
  'lake', 'river', 'mountain', 'mountains', 'forest', 'pines', 'ski', 'cove', 'trail', 'hike', 'hiking', 'bikes', 'bicycles',
  'breakfast', 'chef', 'jacuzzi', 'fire pit', 'firepit', 'hammock', 'canoe', 'kayak', 'boat', 'view', 'views', 'skyline',
  'pool', 'hot tub', 'fireplace', 'kitchen', 'wifi', 'wi-fi', 'parking', 'garage', 'garden', 'workspace', 'desk',
  'air conditioning', 'a/c', 'lawn', 'courtyard', 'jetty', 'waterfall', 'desert', 'island', 'vineyard', 'cinema', 'piano',
  'snow', 'ski-in', 'concierge', 'housekeeping', 'cook',
]

const PET_YES = /\bpets?[- ]friendly\b|\bpets? (are )?welcome\b|\bdog(s)?\b|\bbring (your )?pets?\b|\bfour-legged\b/i
const PET_NO = /\bno pets\b|\bpets? (are )?(not|n't) (allowed|welcome)\b/i

const words = (s) => String(s ?? '').toLowerCase().match(/[a-z0-9À-ɏ'/-]+/g) ?? []
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
const has = (text, term) => new RegExp(`(^|[^a-z0-9])${escapeRe(term)}([^a-z0-9]|$)`, 'i').test(text)

export function allowedFor(facts) {
  const place = [facts.city, facts.region, facts.country, facts.title].join(' ')
  const placeWords = words(place).flatMap((w) => [w, ...w.split('-')])
  const allowedTerms = new Set(placeWords)
  for (const t of [facts.category, ...(facts.amenities ?? []).flatMap((a) => AMENITY_TERMS[a] ?? [])]) {
    allowedTerms.add(String(t).toLowerCase())
    for (const w of words(t)) allowedTerms.add(w)
  }
  if ((facts.amenities ?? []).some((a) => a.endsWith('-view'))) ['view', 'views'].forEach((w) => allowedTerms.add(w))
  const nums = new Set(
    [facts.maxGuests, facts.bedrooms, facts.beds, facts.baths, facts.minNights, facts.nightlyPrice, facts.cleaningFee]
      .filter((n) => n !== undefined && n !== null)
      .map(Number),
  )
  const capWords = new Set(placeWords.concat(['wi-fi', 'wifi']))
  return {allowedTerms, nums, capWords}
}

function numbersIn(text) {
  const found = []
  for (const m of text.matchAll(/\d[\d,.]*/g)) found.push({text: m[0], value: Number(m[0].replace(/,/g, ''))})
  for (const m of text.matchAll(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b(?=[ -]+(bed|bath|guest|night|sleep|people|person))?/gi)) {
    const w = m[1].toLowerCase()
    // "one" is only a number claim when it counts something.
    if (w === 'one' && !m[2] && !/^one[ -]+(bed|bath|guest|night)/i.test(text.slice(m.index))) continue
    found.push({text: m[0], value: NUMBER_WORDS[w]})
  }
  return found
}

function sentences(text) {
  return String(text ?? '').split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean)
}

export function checkCopy(facts, copy) {
  const v = []
  const fail = (rule, text) => v.push({rule, text})
  const {allowedTerms, nums, capWords} = allowedFor(facts)
  const summary = String(copy.summary ?? '')
  const description = String(copy.description ?? '')
  const highlights = Array.isArray(copy.highlights) ? copy.highlights.map(String) : []

  if (!summary) fail('shape', 'summary missing')
  if (summary.length > 140) fail('shape', `summary is ${summary.length} characters (max 140)`)
  if (summary.includes('\n')) fail('shape', 'summary has a line break')
  const n = sentences(description).length
  if (n < 2 || n > 4) fail('shape', `description has ${n} sentences (need 2 to 4)`)
  if (highlights.length < 3 || highlights.length > 6) fail('shape', `${highlights.length} highlights (need 3 to 6)`)

  const parts = [['summary', summary], ['description', description], ...highlights.map((h, i) => [`highlight ${i + 1}`, h])]
  for (const [label, text] of parts) {
    for (const num of numbersIn(text)) {
      if (!nums.has(num.value)) fail('number', `${label}: "${num.text}" is not a number in the facts`)
    }
    // Capitalised words that are not the first word of a sentence or highlight must be a known place or the title.
    for (const s of label.startsWith('highlight') ? [text] : sentences(text)) {
      const toks = s.match(/[A-Za-zÀ-ɏ][A-Za-zÀ-ɏ'-]*/g) ?? []
      toks.slice(1).forEach((tok) => {
        if (/^[A-ZÀ-Þ]/.test(tok) && !capWords.has(tok.toLowerCase().replace(/'s$/, '')) && tok !== 'I') {
          fail('proper-noun', `${label}: "${tok}" is not a place or title word in the facts`)
        }
      })
    }
    const lower = text.toLowerCase()
    for (const noun of RISKY_NOUNS) {
      if (has(lower, noun) && !allowedTerms.has(noun) && !noun.split(' ').every((w) => allowedTerms.has(w))) {
        fail('unbacked-feature', `${label}: "${noun}" is not backed by this stay's fields`)
      }
    }
    if (facts.petsAllowed === false && PET_YES.test(text)) fail('pets', `${label}: mentions pets but petsAllowed is false`)
    if (facts.petsAllowed === true && PET_NO.test(text)) fail('pets', `${label}: says no pets but petsAllowed is true`)
  }

  // Every highlight must map to a fact: an amenity term, place, category, pets, or a counted number.
  for (const h of highlights) {
    const lower = h.toLowerCase()
    const byTerm = [...allowedTerms].some((t) => t.length > 2 && has(lower, t))
    const byPets = facts.petsAllowed === true && /\bpet|\bdog/i.test(lower)
    const nv = numbersIn(h)
    const byNumber = nv.length > 0 && nv.every((x) => nums.has(x.value))
    if (!byTerm && !byPets && !byNumber) fail('highlight-unmapped', `"${h}" does not map to an amenity or fact`)
  }
  return {ok: v.length === 0, violations: v}
}
