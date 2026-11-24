# Feature: Agent Actions stay copy, Dataset Embeddings, live Home content

Status: approved (user answered all questions 2026-11-24; implementation not started)

## Goal
Use Sanity Agent Actions to write each stay's `summary`, `description` and `highlights` from that stay's own fields, and prove the copy invents nothing. Then turn on Dataset Embeddings (ranking only) and make Home read the 30 stays from Sanity instead of `stays.ts`, with loading, error and empty states.

Parent: ARY-47. This plan: ARY-48. No app code is written until the user approves (AGENTS.md, "How we build features").

## Context & Docs
What I read, and what I observed in the dataset (read-only queries, no mutations):
- Dataset `vxnms1ub/production`: 30 `property` docs (world-wide: beach 6, cabin 7, city 8, villa 9), 10 hosts, 9 policies, 0 drafts, `aclMode: public`. Schema is already deployed (`system.schema` `_.schemas.default`). Embeddings are **disabled** (`GET .../settings/embeddings` returns `{"enabled":false}`). The project has the `editorialAiFieldActions` feature.
- Every property already has hand-written `summary`, `description`, `highlights` from the ARY-46 seed (`loomstay_sanity_studio/scripts/seed-data.mjs`). Some of that copy contains details no field backs (e.g. "a path leads down to a small sandy cove"). The check below would flag those.
- Home today: `src/app/(tabs)/home.tsx` reads `stays` from `src/features/stays/stays.ts` (12 California stays, `Stay` type with `state: "CA"`, 8 amenity ids, `pets` as an amenity). Search (`search-stays.ts`, filter and sort sheets) reads the same file.
- Agent Actions ([intro](https://www.sanity.io/docs/agent-actions/introduction), [generate quickstart](https://www.sanity.io/docs/agent-actions/generate-quickstart)):
  - `client.agent.action.generate({schemaId, documentId | targetDocument: {operation: 'edit', _id}, instruction, instructionParams, target: {path}, operation: 'set'|'append'|'mixed', noWrite, async})`. Needs `@sanity/client` 7.4+, `apiVersion: 'vX'`, a deployed schema and a write token.
  - `instructionParams` types: `constant`, `field` (a path on the target doc), `document` (a whole doc by id), `groq` (query + params). Instructions refer to them as `$name`.
  - `Generate` writes new content; `Transform` only edits existing content (no new fields or array items); `Prompt` is a plain LLM call with no document write. Hidden and read-only fields are skipped.
  - `noWrite: true` returns the result without saving; `async: true` returns immediately and the write lands later.
  - I did not find a documented "fieldwise grounding" switch. Grounding is done by what we pass in (`groq` or `field` params) and by the instruction text. The plan below does not depend on such a switch; the check is ours.
  - I could not confirm from docs whether an `edit` action writes to the draft or the published doc. Step 1 settles that with a `noWrite` call. The plan never lets the action write directly (see Decisions).
- Dataset Embeddings ([docs](https://www.sanity.io/docs/content-lake/dataset-embeddings)): enable with `npx sanity datasets embeddings enable production --projection '<GROQ projection>' --wait` (or `PUT /projects/:id/datasets/:name/settings/embeddings`). Whole docs are embedded unless a projection is set; **references are not expanded**; max 10 chunks per doc; indexing is async, normally under a minute; available on all plans, generation is free, only `text::semanticSimilarity()` queries count against the monthly semantic search quota. Query shape: `*[filters] | score(text::semanticSimilarity($q)) | order(_score desc)`.
- Local rules this plan follows: secrets only in local scripts (AGENTS.md Rules), embeddings rank and never filter, GROQ values always params, ask before adding a dependency or changing the schema once content exists, loading/error/empty states on data screens.

## Decisions & Tradeoffs
Defaults I picked (change any before approving). The ones that need the user are in "Questions".

**1. Copy generation (per stay, only its own facts).**
- Runs as a local script, `loomstay_sanity_studio/scripts/generate-copy.mjs`, next to the seed script. Reads `SANITY_WRITE_TOKEN` from env, never imports into the app, no API route. (An API route would need Clerk verification and gives no benefit: this is a batch content job a human runs.)
- Facts for one stay = a GROQ projection of that doc's non-copy fields: `title, category, city, region, country, amenities, petsAllowed, maxGuests, bedrooms, beds, baths, nightlyPrice, cleaningFee, minNights, vibes`, plus the three policy `summary` lines and host `name`/`superhost` only if the user wants them in the copy (default: **not**, so copy stays about the stay itself and matches what embeddings can see). Passed as one `groq` instruction param with `$id` as a param, so a stay never sees another stay's data. Rating and review count are excluded (they change).
- One call per stay, `generate` with `target: [{path: 'summary'}, {path: 'description'}, {path: 'highlights'}]`, `operation: 'set'`, `noWrite: true`. Instruction (kept in a constant in the script): write for a rental guest; use only the facts in `$facts`; no numbers, places, amenities, distances, views, or events that are not in `$facts`; summary is one line of at most 140 characters; description 2 to 4 sentences; highlights 3 to 6 short items, each an amenity or fact from `$facts`; vibes shape tone only and are never quoted as facts.
- The script, not the action, writes the result: `client.patch(id).set({...}).commit()` only after the check passes. This avoids the draft/published uncertainty, keeps the old copy recoverable (the script saves a before/after JSON in `loomstay_sanity_studio/scripts/out/`, git-ignored), and lets one stay fail without touching the rest.
- Idempotent: re-running regenerates only stays whose facts hash changed or that failed last time (hash stored in the out file, not in the dataset, so no schema change). `--only <slug>` and `--dry-run` flags. Concurrency 3.

**2. "Invents nothing" check (two layers, both must pass).**
- Layer 1, deterministic, no LLM. Build an allow-list from the stay's fields: city, region, country, title words, category, amenity labels plus a small synonym map (e.g. `hot-tub` -> hot tub, jacuzzi; `ocean-view` -> ocean, sea, sea views), the numbers from `maxGuests, bedrooms, beds, baths, minNights, nightlyPrice, cleaningFee`. Then fail the copy if it has: any digit or number word not in the allow-list; any capitalised token or place not in city/region/country/title; any amenity keyword from the global amenity list (pool, hot tub, fireplace, view, kitchen, Wi-Fi, parking, garden, workspace, air conditioning...) that this stay lacks; pet words that contradict `petsAllowed`; any highlight that does not map to an amenity or a numeric fact (`4 bedrooms`). Unit-testable with fixtures (good copy, copy with a made-up pool, made-up number, wrong city).
- Layer 2, model check. A second call with `client.agent.action.prompt({format: 'json', instruction, instructionParams: {facts, copy}})`: list each factual claim in `$copy`, cite the fact key that supports it, and return `{claims: [{text, supportedBy: string|null}]}`. Any `supportedBy: null` fails. This catches paraphrase the word lists miss. It is advisory-strong but not proof, which is why layer 1 is a hard gate and layer 2 is a second gate, not a replacement.
- On failure: retry up to 2 times, feeding the violations back into the instruction. Still failing: leave the existing copy untouched, list the stay in the report for a human.
- Result report (`out/report.json` and a printed table): per stay pass or fail, which layer, the offending phrase.

**3. Embeddings (when and what).**
- Enabled **after** the copy is final and all 30 stays pass (so the first index is built once, from the good text), as a separate step the user triggers or approves. Free on all plans; the one cost is the monthly semantic-search quota, which only our queries use. Writes to the dataset get slightly slower while enabled.
- Projection (own fields only, no references): `{ title, summary, description, highlights, vibes, category, amenities, city, region, country }`. Excludes numbers, slug, images, geopoint and references on purpose: prices and guests are exact constraints (GROQ), not meaning. Command: `npx sanity datasets embeddings enable production --projection '{ title, summary, description, highlights, vibes, category, amenities, city, region, country }' --wait`. This only applies to `property`; host and policy docs have no soft-intent text (confirm they should be left out; the projection above would give them empty embeddings).
- Verified with a script `scripts/check-embeddings.mjs` (read-only): `*[_type=="property" && nightlyPrice <= $max] | score(text::semanticSimilarity($q)) | order(_score desc)[0..4]{title,_score}` for realistic sentences ("quiet cabin to unplug", "cozy with a fireplace", "sunny family villa"), checking the filter still wins (nothing over `$max` appears) and ranking is sensible.
- **Out of scope here: wiring embeddings into the Search tab.** It means replacing `search-stays.ts` with an API route (Clerk-verified, Jev for the typed decisions, GROQ built in code). That is its own plan (decided: separate task, see Resolved decisions).

**4. Home reads live content.**
- No new dependency. Dataset is public, so Home reads the GROQ HTTP API with `fetch` from `https://vxnms1ub.apicdn.sanity.io/v2025-02-19/data/query/production?query=...&$id=...` (params JSON-encoded). Project id and dataset are not secrets; they go in `src/features/stays/sanity-config.ts`. No token in the app. (If the dataset is ever made private, Home must move behind an API route; noted, not needed now.)
- New `src/features/stays/use-stays.ts`: `useStays()` returns `{status: 'loading' | 'error' | 'empty' | 'ready', stays, retry}`. Module-level cache so switching tabs does not refetch; `retry` clears it. Request has a 10s timeout (AbortController) and checks `res.ok`.
- Query (constant, no interpolation): `*[_type == "property" && defined(slug.current)] | order(rating desc, reviewCount desc) { "id": _id, title, city, "state": region, country, category, rating, reviewCount, "pricePerNight": nightlyPrice, amenities, petsAllowed, vibes, "imageUri": images[0].asset->url, "imageAlt": images[0].alt }`. The `->` on the image asset is a projection, not a filter, so no rule conflict.
- Mapper to the existing `Stay` type: `imageUri` gets `?auto=format&fit=crop&w=1200&h=900&q=80` appended; `state` carries the country (cards read "Lagos, Portugal" instead of "Lake Arrowhead, CA"; decided by user); `AmenityId` and `amenityLabels` widen to the 13 schema ids; `petsAllowed` becomes a `pets` entry in `amenities` after the schema's first two so the first-two-tags rule still holds. Docs with missing image or price are dropped by the mapper, not crashed on.
- UI states in `home.tsx` (design tokens only, no hex): loading = 3 skeleton cards the size of `StayCard` (`bg-surface-container-high`, static, no shimmer so reduced motion needs nothing); error = message "Couldn't load stays" plus a `Button` "Try again" that calls `retry`; empty (zero docs) = "No stays yet" text; empty after a category chip (no stay in that category) = "No <category> stays" with a "Show all" action. Header, greeting, search and chips render in every state. Existing enter animation is unchanged.
- `stays.ts` stays as the data source for Search until the separate embeddings-Search task ships. It keeps `Stay` and labels; its array is not used by Home any more. Home category chips filter the fetched list in memory, same as today.

**5. No schema change in the recommended path.** Copy goes into the existing `summary/description/highlights` fields; the apparatus (facts hash, reports) lives in git-ignored files. Re-running the seed would overwrite generated copy with the old hand-written text (it uses `createOrReplace`); the plan adds a note at the top of `seed.mjs` and a README line, and recommends not re-running it after generation.

## Step-by-Step Implementation
1. **Spike (read-only, one stay).** Smoke-test `generate` with `noWrite: true` on one stay and `prompt` with `format: 'json'`. Confirm the token has permission, the AI actions are available on this plan, response shape, cost per call, and whether `target` paths accept the three fields at once. Report; stop and ask if anything is blocked.
2. Add `generate-copy.mjs` (+ `copy-check.mjs` with layer 1, `copy-check.test.mjs` run with `node --test`, no dependency). Dry-run on all 30: print facts, generated copy, and check results, write nothing.
3. Review the report with the user (sample 3 stays plus every failure). Then run for real; the script patches only passing stays.
4. Re-run the report on the live dataset (`--verify-only`) to confirm 30/30 pass on what is stored.
5. With approval: enable embeddings with the projection above, wait for `status` to become `ready`, run `check-embeddings.mjs`.
6. App: `sanity-config.ts`, `use-stays.ts`, widen `AmenityId`/`Stay`, update `stay-card.tsx` / `stay-row.tsx` only if the new `state`/amenity values need it, `home.tsx` states. Add `.env.example` entries only if a new variable is introduced (none planned).
7. Lint, type check, graphify incremental update, update AGENTS.md (Content, Home sections; the "Stays are local data" sentence changes), set `Status: done`.

## Verification
- Script unit tests: `node --test loomstay_sanity_studio/scripts/copy-check.test.mjs` passes, including the made-up pool, made-up number, wrong city and pet contradiction fixtures (each must fail).
- Dry-run report: every stay shown with pass/fail and reason; no write calls (confirmed by running without `SANITY_WRITE_TOKEN` permission to mutate, or by `--dry-run` logging zero mutate requests).
- After the real run: GROQ query returns 30 properties with `length(summary) <= 140`, 3 to 6 highlights, and `--verify-only` prints 30/30 pass. Spot-read 5 stays against their fields by hand.
- Embeddings: `status` ready; `check-embeddings.mjs` output shows ranking sensible and price filter respected for three sentences; no query uses user input outside a param.
- Home on the AVD (`ClearEnergy_API33`, Metro on 8081, per AGENTS.md): 30 stays show with Sanity photos; category chips filter; airplane mode -> error state and "Try again" recovers; slow network (adb throttle or a bad host in `sanity-config.ts` temporarily) -> skeleton then content; a category with no stays -> empty message. Light and dark, 200% font scale glance. Screenshots read, not assumed.
- `npx tsc --noEmit` and `npx expo lint` pass. Grep confirms `SANITY_WRITE_TOKEN` appears in no file under `src/` and nothing is `EXPO_PUBLIC_`-prefixed except existing Clerk key.
- Failures explained by cause per Checks: missing data (field absent), the model's output, the check rule, or the code.

## Resolved decisions (user answers, 2026-11-24)
1. Copy storage: overwrite `summary/description/highlights` in place, keep a git-ignored backup. No schema change.
2. Strictness: both check layers must pass. Copy uses the stay's own fields only (no host or policy facts).
3. Search tab stays on local `stays.ts`. Embeddings-powered Search is planned as a separate task.
4. `@sanity/client` is added as a direct dependency of `loomstay_sanity_studio/package.json`.
5. Agent Action credit spend (up to ~150 calls) approved. Enabling Dataset Embeddings on `production` approved (still run after step 4 passes). Dataset stays public.
6. Card location text is "City, Country".

## Result
<Added during closeout: short summary of outcome and verification evidence>
