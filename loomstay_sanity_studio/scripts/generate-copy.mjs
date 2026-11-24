// Writes each stay's summary, description and highlights with Sanity Agent Actions, using only that stay's own
// fields, and patches the dataset only when both checks pass (copy-check.mjs, then a model claim check).
// Usage: SANITY_WRITE_TOKEN=... node scripts/generate-copy.mjs [--dry-run] [--only <slug>] [--verify-only] [--force] [--max-calls 140]
// Output (git-ignored): scripts/out/backup-*.json, state.json (facts hash, pass/fail, call count), report.json
import {createClient} from '@sanity/client'
import {createHash} from 'node:crypto'
import {mkdirSync, readFileSync, writeFileSync, existsSync} from 'node:fs'
import {checkCopy} from './copy-check.mjs'

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined)
const dryRun = flag('dry-run')
const verifyOnly = flag('verify-only')
const only = opt('only')
const maxCalls = Number(opt('max-calls') ?? 140)
const out = new URL('./out/', import.meta.url).pathname
mkdirSync(out, {recursive: true})

const token = process.env.SANITY_WRITE_TOKEN
if (!token) {
  console.error('Set SANITY_WRITE_TOKEN.')
  process.exit(1)
}
const client = createClient({projectId: 'vxnms1ub', dataset: 'production', apiVersion: 'vX', useCdn: false, token})

const FACTS = `{title, category, city, region, country, amenities, petsAllowed, maxGuests, bedrooms, beds, baths, nightlyPrice, cleaningFee, minNights, vibes}`
const INSTRUCTION = `Write guest-facing copy for one rental stay, using only the facts in $facts.
Rules:
- Use only facts in $facts. Do not add numbers, places, amenities, views, distances, activities, services or events that are not in $facts.
- Do not mention the host, policies, reviews, ratings or prices.
- vibes only shape the tone. Never quote a vibe as a fact about the stay.
- Mention pets only if petsAllowed is true.
- summary: one line, at most 140 characters.
- description: 2 to 4 sentences.
- highlights: 3 to 6 short items, each one an amenity or a fact from $facts (for example "3 bedrooms").
- Write in plain English, no marketing superlatives.`
const CHECK_INSTRUCTION = `You check rental copy against facts. List every factual claim in $copy (a JSON object with summary, description, highlights), each with the key in $facts that supports it. A claim is supported only if $facts says it directly (an amenity id like hot-tub means a hot tub, lake-view means a lake view; counts must match). Tone words are not claims. Return JSON: {"claims":[{"text":string,"supportedBy":string|null}]}. Use null when no fact supports the claim.`

const statePath = out + 'state.json'
const state = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : {calls: 0, stays: {}}
const save = () => writeFileSync(statePath, JSON.stringify(state, null, 2))
let calls = 0
const call = async (fn) => {
  if (state.calls >= maxCalls) throw new Error(`Agent Action budget reached (${state.calls}/${maxCalls})`)
  state.calls++
  calls++
  save()
  return fn()
}

const docs = await client.fetch(
  `*[_type == "property" && ($only == null || slug.current == $only)] | order(slug.current) {_id, "slug": slug.current, summary, description, highlights, ...${FACTS}}`,
  {only: only ?? null},
)
console.log(`${docs.length} stays, mode: ${verifyOnly ? 'verify-only' : dryRun ? 'dry-run' : 'write'}, calls used so far ${state.calls}/${maxCalls}`)

const factsOf = ({_id, slug, summary, description, highlights, ...f}) => f
const hashOf = (f) => createHash('sha256').update(JSON.stringify(f)).digest('hex').slice(0, 16)

if (!verifyOnly && !dryRun) {
  const file = `${out}backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  const all = await client.fetch(`*[_type == "property"]{_id, summary, description, highlights}`)
  writeFileSync(file, JSON.stringify(all, null, 2))
  console.log(`Backed up current copy of ${all.length} stays to ${file}`)
}

const report = []
for (const d of docs) {
  const facts = factsOf(d)
  const hash = hashOf(facts)
  const prev = state.stays[d.slug]
  if (verifyOnly) {
    const r = checkCopy(facts, d)
    report.push({slug: d.slug, status: r.ok ? 'pass' : 'fail', layer: 1, violations: r.violations})
    continue
  }
  if (prev?.passed && prev.hash === hash && !flag('force')) {
    report.push({slug: d.slug, status: 'skipped (already passed)', layer: null, violations: []})
    continue
  }
  let feedback = ''
  let result
  for (let attempt = 0; attempt < 3 && !result?.passed; attempt++) {
    try {
      const gen = await call(() =>
        client.agent.action.generate({
          schemaId: '_.schemas.default',
          targetDocument: {operation: 'edit', _id: d._id},
          instruction: INSTRUCTION + feedback,
          instructionParams: {facts: {type: 'groq', query: `*[_id == $id][0]${FACTS}`, params: {id: d._id}}},
          target: [{path: 'summary', operation: 'set'}, {path: 'description', operation: 'set'}, {path: 'highlights', operation: 'set'}],
          noWrite: true,
        }),
      )
      const copy = {summary: gen.summary, description: gen.description, highlights: gen.highlights}
      const l1 = checkCopy(facts, copy)
      let violations = l1.violations.map((v) => `${v.rule}: ${v.text}`)
      let layer = 1
      if (l1.ok) {
        layer = 2
        const chk = await call(() =>
          client.agent.action.prompt({
            instruction: CHECK_INSTRUCTION,
            instructionParams: {facts: {type: 'constant', value: JSON.stringify(facts)}, copy: {type: 'constant', value: JSON.stringify(copy)}},
            format: 'json',
          }),
        )
        violations = (chk.claims ?? []).filter((c) => !c.supportedBy).map((c) => `unsupported claim: ${c.text}`)
        if (!Array.isArray(chk.claims)) violations.push('claim check returned no claims')
      }
      result = {passed: violations.length === 0, copy, violations, layer, attempts: attempt + 1}
      if (!result.passed) feedback = `\nYour previous attempt was rejected for these problems, fix them and stay strictly within $facts:\n- ${violations.join('\n- ')}`
    } catch (e) {
      if (/budget reached/.test(e.message)) {
        save()
        writeFileSync(out + 'report.json', JSON.stringify(report, null, 2))
        console.error(e.message)
        process.exit(2)
      }
      result = {passed: false, copy: null, violations: [`error: ${e.message}`], layer: 0, attempts: attempt + 1}
      break
    }
  }
  if (result.passed && !dryRun) {
    await client.patch(d._id).set(result.copy).commit()
  }
  state.stays[d.slug] = {hash, passed: result.passed, violations: result.violations, copy: result.copy, written: result.passed && !dryRun}
  save()
  report.push({slug: d.slug, status: result.passed ? (dryRun ? 'pass (not written)' : 'pass, written') : 'FAIL', layer: result.layer, attempts: result.attempts, violations: result.violations})
  console.log(`${d.slug}: ${report.at(-1).status}${result.passed ? '' : ' - ' + result.violations.join(' | ')}`)
}

writeFileSync(out + 'report.json', JSON.stringify(report, null, 2))
const failed = report.filter((r) => r.status === 'FAIL' || r.status === 'fail')
console.log(`\n${report.length - failed.length}/${report.length} ok, ${failed.length} failed, ${calls} Agent Action calls this run (${state.calls}/${maxCalls} total)`)
for (const f of failed) console.log(`  ${f.slug}: ${f.violations.map((v) => (typeof v === 'string' ? v : `${v.rule}: ${v.text}`)).join(' | ')}`)
