/**
 * ╻ NSS-VIT
 * ┃ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ┃ Not Me, But You
 * ┃
 * ┃ eventEntry.ts
 * ╹ sanity/schemas/
 */

import { defineArrayMember, defineField, defineType } from 'sanity';

const uriRule = (Rule: any) => Rule.uri({ scheme: ['http', 'https'] });

export default defineType({
  name: 'eventEntry',
  title: 'Event',
  type: 'document',
  icon: () => '📅',

  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'media', title: 'Media' },
    { name: 'schedule', title: 'Schedule' },
    { name: 'location', title: 'Location' },
    { name: 'impact', title: 'Impact' },
    { name: 'stories', title: 'Stories' },
    { name: 'seo', title: 'SEO' },
  ],

  fields: [
    // Basic Info
    defineField({
      name: 'title',
      title: 'Event Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required().min(5).max(120),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Used on cards and previews',
      validation: (Rule) => Rule.required().min(10).max(240),
    }),

    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'array',
      group: 'content',
      description: 'Rich description for modal/detail page',
      of: [defineArrayMember({ type: 'block' })],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'category',
      title: 'Event Category',
      type: 'reference',
      group: 'content',
      to: [{ type: 'eventCategory' }],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'content',
      options: { layout: 'tags' },
      of: [defineArrayMember({ type: 'string' })],
      validation: (Rule) => Rule.max(12),
    }),

    // Media
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const doc = context.document as any;
          if (!doc?.isUpcoming && !value) {
            return 'Cover image is required for past events';
          }
          return true;
        }),
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Required for accessibility',
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const parent = context.parent as any;
              const doc = context.document as any;
              // Only require alt text if coverImage is uploaded
              if (parent?.asset && !value) {
                return 'Alt text is required when an image is uploaded';
              }
              // If it's a past event, coverImage is required, hence alt is also required
              if (!doc?.isUpcoming && !parent?.asset) {
                return 'Alt text is required for past events';
              }
              return true;
            }),
        }),
        defineField({
          name: 'caption',
          title: 'Caption',
          type: 'string',
        }),
      ],
    }),

    // defineField({
    //   name: 'gallery',
    //   title: 'Gallery',
    //   type: 'array',
    //   group: 'media',
    //   of: [
    //     defineArrayMember({
    //       type: 'object',
    //       name: 'galleryImage',
    //       fields: [
    //         defineField({
    //           name: 'image',
    //           title: 'Image',
    //           type: 'image',
    //           options: { hotspot: true },
    //           validation: (Rule) => Rule.required(),
    //           fields: [
    //             defineField({
    //               name: 'alt',
    //               title: 'Alt Text',
    //               type: 'string',
    //               description: 'Required for accessibility',
    //               validation: (Rule) => Rule.required(),
    //             }),
    //           ],
    //         }),
    //         defineField({
    //           name: 'caption',
    //           title: 'Caption',
    //           type: 'string',
    //         }),
    //       ],
    //       preview: {
    //         select: { media: 'image', title: 'caption' },
    //         prepare({ media, title }) {
    //           return { media, title: title || 'Gallery image' };
    //         },
    //       },
    //     }),
    //   ],
    //   validation: (Rule) => Rule.max(40),
    // }),

    // Schedule
    defineField({
      name: 'isUpcoming',
      title: 'Is Upcoming Event?',
      type: 'boolean',
      group: 'schedule',
      initialValue: true,
      description: 'Toggle ON for upcoming events, OFF for past/completed events.',
    }),

    defineField({
      name: 'eventDate',
      title: 'Event Date & Time',
      type: 'datetime',
      group: 'schedule',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'isCancelled',
      title: 'Cancelled',
      type: 'boolean',
      group: 'schedule',
      initialValue: false,
      description: 'Use only for events that were cancelled',
    }),

    // Location
    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      group: 'location',
      fields: [
        defineField({
          name: 'venue',
          title: 'Venue',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'city',
          title: 'City',
          type: 'string',
        }),
        defineField({
          name: 'state',
          title: 'State',
          type: 'string',
        }),
        defineField({
          name: 'googleMapsLink',
          title: 'Google Maps Link',
          type: 'url',
          validation: uriRule,
        }),
      ],
    }),

    

    // Impact
    defineField({
      name: 'impact',
      title: 'Impact Statistics',
      type: 'object',
      group: 'impact',
      fields: [
        defineField({
          name: 'beneficiariesCount',
          title: 'Beneficiaries Count',
          type: 'number',
          validation: (Rule) => Rule.min(0).integer(),
        }),
        defineField({
          name: 'volunteersCount',
          title: 'Volunteers Count',
          type: 'number',
          validation: (Rule) => Rule.min(0).integer(),
        }),
        defineField({
          name: 'hoursOfService',
          title: 'Hours of Service',
          type: 'number',
          description: 'Total volunteer hours contributed during this event',
          validation: (Rule) => Rule.min(0),
        }),
        // defineField({
        //   name: 'fundsRaised',
        //   title: 'Funds Raised',
        //   type: 'number',
        //   description: 'Use numeric value only',
        //   validation: (Rule) => Rule.min(0),
        // }),
        // defineField({
        //   name: 'itemsDistributed',
        //   title: 'Items Distributed',
        //   type: 'number',
        //   validation: (Rule) => Rule.min(0).integer(),
        // }),
        defineField({
          name: 'additionalMetrics',
          title: 'Additional Metrics',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'metric',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Label',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'value',
                  title: 'Value',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'note',
                  title: 'Note',
                  type: 'string',
                }),
              ],
            }),
          ],
          validation: (Rule) => Rule.max(20),
        }),
      ],
    }),

    

    // Testimonials / Stories
    defineField({
      name: 'testimonials',
      title: 'Testimonials / Impact Stories',
      type: 'array',
      group: 'stories',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'testimonial',
          fields: [
            defineField({
              name: 'personName',
              title: 'Person Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'role',
              title: 'Role',
              type: 'string',
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                  validation: (Rule) =>
                    Rule.custom((value, context) => {
                      const parent = context.parent as any;
                      if (parent?.asset && !value) {
                        return 'Alt text is required when an image is uploaded';
                      }
                      return true;
                    }),
                }),
              ],
            }),
            defineField({
              name: 'quote',
              title: 'Quote',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'personName', subtitle: 'role', media: 'image' },
          },
        }),
      ],
      validation: (Rule) => Rule.max(12),
    }),

    // Featured
    defineField({
      name: 'featured',
      title: 'Featured Event',
      type: 'boolean',
      group: 'content',
      initialValue: false,
    }),

    // SEO
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          validation: (Rule) => Rule.max(70),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160),
        }),
        defineField({
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          options: { layout: 'tags' },
          of: [defineArrayMember({ type: 'string' })],
          validation: (Rule) => Rule.max(20),
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      shortDescription: 'shortDescription',
      coverImage: 'coverImage',
      categoryName: 'category.name',
      eventDate: 'eventDate',
      isCancelled: 'isCancelled',
    },
    prepare({ title, shortDescription, coverImage, categoryName, eventDate, isCancelled }) {
      const date = eventDate ? new Date(eventDate).toLocaleDateString() : 'No date';
      const status = isCancelled ? 'Cancelled' : '';
      const categoryStr = categoryName ? categoryName : 'No Category';
      return {
        title: title || 'Untitled Event',
        subtitle: `${categoryStr} • ${date} ${status ? `(${status})` : ''} • ${shortDescription || ''}`,
        media: coverImage,
      };
    },
  },

  orderings: [
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        { field: 'featured', direction: 'desc' },
        { field: 'eventDate', direction: 'asc' },
      ],
    },
    {
      title: 'Event Date (Ascending)',
      name: 'eventDateAsc',
      by: [{ field: 'eventDate', direction: 'asc' }],
    },
    {
      title: 'Event Date (Descending)',
      name: 'eventDateDesc',
      by: [{ field: 'eventDate', direction: 'desc' }],
    },
  ],
});
