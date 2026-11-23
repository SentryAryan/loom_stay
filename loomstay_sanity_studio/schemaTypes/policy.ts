import {defineField, defineType} from 'sanity'

export const policy = defineType({
  name: 'policy',
  title: 'Policy',
  type: 'document',
  description: 'Shared by many properties. Answers quote this text word for word.',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'kind',
      type: 'string',
      options: {
        list: [
          {title: 'Cancellation', value: 'cancellation'},
          {title: 'House rules', value: 'house-rules'},
          {title: 'Check-in and check-out', value: 'check-in-out'},
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({name: 'summary', type: 'string', description: 'One line shown on the details screen.', validation: (r) => r.required()}),
    defineField({name: 'body', type: 'text', rows: 5, description: 'Full policy text.', validation: (r) => r.required()}),
    defineField({
      name: 'rules',
      type: 'array',
      of: [{type: 'string'}],
      description: 'One rule per item.',
      hidden: ({document}) => document?.kind !== 'house-rules',
    }),
    defineField({
      name: 'checkInTime',
      type: 'string',
      description: '24-hour time, e.g. 15:00',
      hidden: ({document}) => document?.kind !== 'check-in-out',
      validation: (r) => r.regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    }),
    defineField({
      name: 'checkOutTime',
      type: 'string',
      description: '24-hour time, e.g. 11:00',
      hidden: ({document}) => document?.kind !== 'check-in-out',
      validation: (r) => r.regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'kind'}},
})
