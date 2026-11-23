import {defineArrayMember, defineField, defineType} from 'sanity'

export const CATEGORIES = [
  {title: 'Cabin', value: 'cabin'},
  {title: 'Beach', value: 'beach'},
  {title: 'City', value: 'city'},
  {title: 'Villa', value: 'villa'},
]

export const AMENITIES = [
  {title: 'Hot tub', value: 'hot-tub'},
  {title: 'Pool', value: 'pool'},
  {title: 'Ocean view', value: 'ocean-view'},
  {title: 'Fireplace', value: 'fireplace'},
  {title: 'Lake view', value: 'lake-view'},
  {title: 'City view', value: 'city-view'},
  {title: 'Mountain view', value: 'mountain-view'},
  {title: 'Workspace', value: 'workspace'},
  {title: 'Wi-Fi', value: 'wifi'},
  {title: 'Kitchen', value: 'kitchen'},
  {title: 'Air conditioning', value: 'air-conditioning'},
  {title: 'Free parking', value: 'parking'},
  {title: 'Garden', value: 'garden'},
]

const int = (min: number, max?: number) => (r: any) => {
  const rule = r.required().integer().min(min)
  return max === undefined ? rule : rule.max(max)
}

export const property = defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'filters', title: 'Filters'},
    {name: 'pricing', title: 'Pricing'},
    {name: 'links', title: 'Host and policies'},
  ],
  fields: [
    // Descriptive text lives here so dataset embeddings can see it (they ignore references).
    defineField({name: 'title', type: 'string', group: 'content', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title', maxLength: 96},
      validation: (r) => r.required(),
    }),
    defineField({name: 'summary', type: 'string', group: 'content', description: 'One line for cards.', validation: (r) => r.required().max(140)}),
    defineField({name: 'description', type: 'text', rows: 8, group: 'content', description: 'About this stay.', validation: (r) => r.required()}),
    defineField({
      name: 'highlights',
      type: 'array',
      group: 'content',
      of: [{type: 'string'}],
      validation: (r) => r.max(6),
    }),
    defineField({
      name: 'vibes',
      type: 'array',
      group: 'content',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'Soft intent words (quiet, cozy, secluded). They rank results and never filter.',
    }),
    defineField({
      name: 'images',
      title: 'Photo gallery',
      type: 'array',
      group: 'content',
      validation: (r) => r.required().min(1).max(24),
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'alt', type: 'string', title: 'Alt text', validation: (r) => r.required()}),
          ],
        }),
      ],
    }),

    defineField({
      name: 'category',
      type: 'string',
      group: 'filters',
      options: {list: CATEGORIES, layout: 'radio'},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'amenities',
      type: 'array',
      group: 'filters',
      description: 'Most notable first: the first two show as tags on a search result.',
      of: [{type: 'string'}],
      options: {list: AMENITIES},
    }),
    defineField({name: 'petsAllowed', type: 'boolean', group: 'filters', initialValue: false}),
    defineField({name: 'maxGuests', type: 'number', group: 'filters', validation: int(1, 30)}),
    defineField({name: 'bedrooms', type: 'number', group: 'filters', validation: int(0, 20)}),
    defineField({name: 'beds', type: 'number', group: 'filters', validation: int(1, 40)}),
    defineField({name: 'baths', type: 'number', group: 'filters', validation: (r) => r.required().min(0.5).max(20)}),
    defineField({name: 'city', type: 'string', group: 'filters', validation: (r) => r.required()}),
    defineField({name: 'region', title: 'State or region', type: 'string', group: 'filters', validation: (r) => r.required()}),
    defineField({name: 'country', type: 'string', group: 'filters', validation: (r) => r.required()}),
    defineField({name: 'location', type: 'geopoint', group: 'filters', validation: (r) => r.required()}),
    defineField({name: 'rating', type: 'number', group: 'filters', validation: (r) => r.required().min(0).max(5)}),
    defineField({name: 'reviewCount', type: 'number', group: 'filters', validation: int(0)}),

    defineField({
      name: 'nightlyPrice',
      title: 'Nightly price (USD)',
      type: 'number',
      group: 'pricing',
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: 'cleaningFee',
      title: 'Cleaning fee (USD, once per stay)',
      type: 'number',
      group: 'pricing',
      initialValue: 0,
      validation: (r) => r.required().min(0),
    }),
    defineField({name: 'minNights', type: 'number', group: 'pricing', initialValue: 1, validation: int(1, 60)}),

    defineField({name: 'host', type: 'reference', to: [{type: 'host'}], group: 'links', validation: (r) => r.required()}),
    defineField({
      name: 'cancellationPolicy',
      type: 'reference',
      to: [{type: 'policy'}],
      group: 'links',
      options: {filter: 'kind == "cancellation"'},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'houseRules',
      type: 'reference',
      to: [{type: 'policy'}],
      group: 'links',
      options: {filter: 'kind == "house-rules"'},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'checkInOut',
      title: 'Check-in and check-out',
      type: 'reference',
      to: [{type: 'policy'}],
      group: 'links',
      options: {filter: 'kind == "check-in-out"'},
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: {title: 'title', city: 'city', country: 'country', media: 'images.0'},
    prepare: ({title, city, country, media}) => ({title, subtitle: `${city}, ${country}`, media}),
  },
})
