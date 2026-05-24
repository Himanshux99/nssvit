/**
 * ╻ NSS-VIT
 * ┃ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ┃ Not Me, But You
 * ┃
 * ┃ eventsPage.ts
 * ╹ sanity/schemas/
 */

import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'eventsPage',
  title: 'Events Page',
  type: 'document',
  icon: () => '📅',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'analytics', title: 'Analytics Dashboard' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      rows: 3,
      group: 'content',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Text',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'ctaLink',
      title: 'CTA Link',
      type: 'string',
      group: 'content',
    }),

    // ─── Analytics Dashboard Settings ─────────────────────────────────────────
    defineField({
      name: 'analyticsDataSource',
      title: 'Analytics Data Source',
      type: 'string',
      group: 'analytics',
      initialValue: 'auto',
      description:
        'auto = calculated live from event entries | manual = use values you set below | api = reserved for future external API',
      options: {
        list: [
          { title: '⚡ Auto (calculated from events)', value: 'auto' },
          { title: '✏️ Manual (set values below)', value: 'manual' },
          { title: '🔌 API (future external source)', value: 'api' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'manualStats',
      title: 'Manual Stats Override',
      type: 'object',
      group: 'analytics',
      description: 'Only used when Data Source is set to "Manual"',
      fields: [
        defineField({
          name: 'totalEventsCompleted',
          title: 'Total Events Completed',
          type: 'number',
          validation: (Rule) => Rule.min(0).integer(),
        }),
        defineField({
          name: 'totalHoursCompleted',
          title: 'Total Hours of Service',
          type: 'number',
          validation: (Rule) => Rule.min(0),
        }),
        defineField({
          name: 'totalBeneficiaries',
          title: 'Total Beneficiaries',
          type: 'number',
          validation: (Rule) => Rule.min(0).integer(),
        }),
        defineField({
          name: 'categoryStats',
          title: 'Per-Category Stats',
          type: 'array',
          description: 'Override stats for individual categories',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'categoryStat',
              fields: [
                defineField({
                  name: 'category',
                  title: 'Category',
                  type: 'reference',
                  to: [{ type: 'eventCategory' }],
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'eventsCount',
                  title: 'Events Count',
                  type: 'number',
                  validation: (Rule) => Rule.min(0).integer(),
                }),
                defineField({
                  name: 'hoursCount',
                  title: 'Total Hours',
                  type: 'number',
                  validation: (Rule) => Rule.min(0),
                }),
              ],
              preview: {
                select: { title: 'category.name', events: 'eventsCount', hours: 'hoursCount' },
                prepare({ title, events, hours }: any) {
                  return {
                    title: title || 'Unknown Category',
                    subtitle: `${events ?? 0} events · ${hours ?? 0} hrs`,
                  };
                },
              },
            }),
          ],
        }),
      ],
    }),

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
      title: 'heroTitle',
    },
    prepare({ title }) {
      return {
        title: title || 'Untitled Events Page',
        subtitle: 'Events Page Singleton Settings',
      };
    },
  },
});