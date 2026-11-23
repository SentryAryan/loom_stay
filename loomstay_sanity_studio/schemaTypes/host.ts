import {defineField, defineType} from 'sanity'

export const host = defineType({
  name: 'host',
  title: 'Host',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'photo', type: 'image', options: {hotspot: true}, fields: [
      defineField({name: 'alt', type: 'string', title: 'Alt text', validation: (r) => r.required()}),
    ]}),
    defineField({name: 'superhost', type: 'boolean', initialValue: false}),
    defineField({
      name: 'responseRate',
      title: 'Response rate (%)',
      type: 'number',
      validation: (r) => r.required().integer().min(0).max(100),
    }),
    defineField({
      name: 'responseTime',
      type: 'string',
      options: {
        list: [
          {title: 'Within an hour', value: 'within-an-hour'},
          {title: 'Within a few hours', value: 'within-a-few-hours'},
          {title: 'Within a day', value: 'within-a-day'},
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({name: 'hostingSince', title: 'Hosting since (year)', type: 'number', validation: (r) => r.integer().min(2008)}),
    defineField({name: 'languages', type: 'array', of: [{type: 'string'}], options: {layout: 'tags'}}),
    defineField({name: 'bio', type: 'text', rows: 3}),
  ],
  preview: {select: {title: 'name', subtitle: 'responseTime', media: 'photo'}},
})
