import test from 'node:test'
import assert from 'node:assert/strict'
import {checkCopy} from './copy-check.mjs'

const facts = {
  title: 'Modern Cabin with Hot Tub', category: 'cabin', city: 'Lake Arrowhead', region: 'California', country: 'United States',
  amenities: ['hot-tub', 'fireplace', 'lake-view', 'wifi'], petsAllowed: true, maxGuests: 6, bedrooms: 3, beds: 4, baths: 2,
  nightlyPrice: 289, cleaningFee: 80, minNights: 2, vibes: ['quiet', 'cozy', 'secluded', 'romantic', 'mountain'],
}
const good = {
  summary: 'A quiet three-bedroom cabin with a hot tub and lake views.',
  description: 'Sleeps up to 6 guests across 3 bedrooms. Soak in the hot tub or sit by the fireplace. Pets are welcome and Wi-Fi is included.',
  highlights: ['Hot tub', 'Fireplace', 'Lake views', 'Pet friendly', '3 bedrooms'],
}
const rules = (copy, f = facts) => checkCopy(f, copy).violations.map((x) => x.rule)

test('good copy passes', () => assert.deepEqual(checkCopy(facts, good).violations, []))
test('made-up pool fails', () => {
  assert.ok(rules({...good, description: good.description.replace('hot tub', 'private pool')}).includes('unbacked-feature'))
})
test('made-up number fails', () => {
  assert.ok(rules({...good, summary: 'A cabin for 12 guests with a hot tub.'}).includes('number'))
  assert.ok(rules({...good, summary: 'A five-bedroom cabin with a hot tub.'}).includes('number'))
})
test('wrong city fails', () => {
  assert.ok(rules({...good, summary: 'A cabin near Big Bear with a hot tub.'}).includes('proper-noun'))
})
test('pet contradiction fails', () => {
  assert.ok(rules(good, {...facts, petsAllowed: false}).includes('pets'))
  assert.ok(rules({...good, highlights: ['Hot tub', 'Fireplace', 'No pets']}).includes('pets'))
})
test('highlight with no backing fails', () => {
  assert.ok(rules({...good, highlights: ['Hot tub', 'Fireplace', 'Warm welcome']}).includes('highlight-unmapped'))
})
test('amenity the stay lacks fails', () => {
  assert.ok(rules({...good, highlights: ['Hot tub', 'Fireplace', 'Mountain views']}).includes('unbacked-feature'))
})
test('shape limits', () => {
  assert.ok(rules({...good, summary: 'x'.repeat(141)}).includes('shape'))
  assert.ok(rules({...good, highlights: ['Hot tub']}).includes('shape'))
})
