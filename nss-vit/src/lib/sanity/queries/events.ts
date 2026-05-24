/**
 * ╻ NSS-VIT
 * ┃ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ┃ Not Me, But You
 * ┃
 * ┃ events.ts (GROQ Queries)
 * ╹ src/lib/sanity/queries/
 */

export const eventFields = `
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  description,
  coverImage,
  eventDate,
  featured,
  isCancelled,
  "status": select(
    isCancelled == true => "cancelled",
    eventDate > now() => "upcoming",
    "completed"
  ),
  category->{
    _id,
    name,
    "slug": slug.current,
    color
  },
  tags,
  location,
  "impact": impact {
    beneficiariesCount,
    volunteersCount,
    hoursOfService,
    additionalMetrics
  },
  "registration": registration { registrationUrl }
`;


export const upcomingEventsQuery = `*[_type == "eventEntry" && !isCancelled && eventDate > now()] | order(eventDate asc) {
  ${eventFields}
}`;

export const ongoingEventsQuery = `*[_type == "eventEntry" && false]`;

export const pastEventsQuery = `*[_type == "eventEntry" && (isCancelled == true || eventDate <= now())] | order(eventDate desc) {
  ${eventFields}
}`;

export const featuredEventsQuery = `*[_type == "eventEntry" && featured == true] | order(eventDate asc) {
  ${eventFields}
}`;

export const eventBySlugQuery = `*[_type == "eventEntry" && slug.current == $slug][0] {
  ${eventFields},
  description,
  gallery,
  registration,
  impact,
  timeline,
  testimonials,
  seo
}`;
