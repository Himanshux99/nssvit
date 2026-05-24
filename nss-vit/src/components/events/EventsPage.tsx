/**
 * ╻ NSS-VIT
 * ┃ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ┃ Not Me, But You
 * ┃
 * ┃ EventsPage.tsx
 * ╹ src/components/events/
 */

import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { urlFor } from '../../lib/sanity';
import EventsAnalytics, { type AnalyticsStats } from './EventsAnalytics';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventCategory {
  _id: string;
  name: string;
  slug: string;
  color?: { hex: string };
}

interface EventLocation {
  venue?: string;
  city?: string;
  state?: string;
}

interface EventEntry {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  coverImage?: any;
  eventDate: string;
  isCancelled: boolean;
  status: 'upcoming' | 'completed' | 'cancelled';
  category?: EventCategory;
  tags?: string[];
  location?: EventLocation;
  impact?: {
    beneficiariesCount?: number;
    volunteersCount?: number;
    hoursOfService?: number;
  };
  description?: any[];
}

interface Testimonial {
  personName: string;
  role?: string;
  image?: any;
  quote: string;
}

interface CategoryFocus {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: any;
  color?: { hex: string };
}

interface Props {
  upcomingEvents: EventEntry[];
  pastEvents: EventEntry[];
  ongoingEvents: EventEntry[];
  categories: CategoryFocus[];
  testimonials: Testimonial[];
  eventsPageContent: {
    heroTitle?: string;
    heroSubtitle?: string;
    heroImage?: any;
    ctaText?: string;
    ctaLink?: string;
    analyticsDataSource?: 'auto' | 'manual' | 'api';
    manualStats?: {
      totalEventsCompleted?: number;
      totalHoursCompleted?: number;
      totalBeneficiaries?: number;
      categoryStats?: Array<{
        categoryId: string;
        categoryName: string;
        categorySlug: string;
        categoryColor?: { hex: string };
        eventsCount?: number;
        hoursCount?: number;
      }>;
    };
  } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    month: d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
    day: d.getDate(),
    full: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

function locationString(loc?: EventLocation): string {
  if (!loc) return '';
  return [loc.venue, loc.city, loc.state].filter(Boolean).join(', ');
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: EventEntry['status'] }) {
  const map = {
    upcoming: { label: 'Upcoming', cls: 'bg-indigo-50 text-primary border border-primary/20' },
    ongoing: { label: 'Ongoing', cls: 'bg-green-50 text-green-700 border border-green-200' },
    completed: { label: 'Completed', cls: 'bg-swiss-gray-100 text-swiss-gray-600 border border-swiss-gray-200' },
    cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-600 border border-red-200' },
  };
  const { label, cls } = map[status] ?? map.completed;
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-sm tracking-wide ${cls}`}>
      {label}
    </span>
  );
}

// ─── Portable Text Custom Renderer ──────────────────────────────────────────

function renderBlockChildren(block: any) {
  if (!block.children || !Array.isArray(block.children)) return '';
  return block.children.map((child: any, idx: number) => {
    let content: ReactNode = child.text || '';
    if (child.marks && child.marks.length > 0) {
      child.marks.forEach((mark: string) => {
        if (mark === 'strong') {
          content = <strong key={idx}>{content}</strong>;
        } else if (mark === 'em') {
          content = <em key={idx}>{content}</em>;
        } else if (mark === 'code') {
          content = <code key={idx} className="bg-swiss-gray-100 px-1 rounded-sm font-mono text-xs">{content}</code>;
        } else {
          const linkDef = block.markDefs?.find((def: any) => def._key === mark);
          if (linkDef && linkDef._type === 'link') {
            content = (
              <a
                key={idx}
                href={linkDef.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-semibold"
              >
                {content}
              </a>
            );
          }
        }
      });
    }
    return <span key={child._key || idx}>{content}</span>;
  });
}

function renderPortableText(blocks?: any[]) {
  if (!blocks || !Array.isArray(blocks)) return null;

  const rendered: ReactNode[] = [];
  let currentList: { type: 'bullet' | 'number'; items: any[] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    const ListTag = currentList.type === 'bullet' ? 'ul' : 'ol';
    const listClass = currentList.type === 'bullet'
      ? 'list-disc pl-5 mb-4 space-y-1.5 text-sm text-swiss-gray-600'
      : 'list-decimal pl-5 mb-4 space-y-1.5 text-sm text-swiss-gray-600';

    rendered.push(
      <ListTag key={`list-${rendered.length}`} className={listClass}>
        {currentList.items.map((item, idx) => {
          const children = renderBlockChildren(item);
          return <li key={item._key || idx}>{children}</li>;
        })}
      </ListTag>
    );
    currentList = null;
  };

  blocks.forEach((block) => {
    if (block._type !== 'block') {
      flushList();
      return;
    }

    if (block.listItem) {
      if (currentList && currentList.type !== block.listItem) {
        flushList();
      }
      if (!currentList) {
        currentList = { type: block.listItem, items: [] };
      }
      currentList.items.push(block);
    } else {
      flushList();
      const children = renderBlockChildren(block);
      if (block.style === 'h1') {
        rendered.push(<h1 key={block._key} className="text-xl font-bold mt-5 mb-3 text-text">{children}</h1>);
      } else if (block.style === 'h2') {
        rendered.push(<h2 key={block._key} className="text-lg font-bold mt-4 mb-2 text-text">{children}</h2>);
      } else if (block.style === 'h3') {
        rendered.push(<h3 key={block._key} className="text-md font-semibold mt-3.5 mb-1.5 text-text">{children}</h3>);
      } else if (block.style === 'blockquote') {
        rendered.push(<blockquote key={block._key} className="border-l-4 border-primary pl-4 italic my-4 text-swiss-gray-600 bg-swiss-gray-50/50 py-1 pr-2">{children}</blockquote>);
      } else {
        rendered.push(<p key={block._key} className="text-sm text-swiss-gray-600 leading-relaxed mb-3.5">{children}</p>);
      }
    }
  });

  flushList();
  return rendered;
}

// ─── Upcoming Event Row ────────────────────────────────────────────────────────

function UpcomingEventRow({ event, index, onSelect }: { event: EventEntry; index: number; onSelect: (event: EventEntry) => void }) {
  const { month, day } = formatDate(event.eventDate);
  const loc = locationString(event.location);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      onClick={() => onSelect(event)}
      className="flex items-start gap-4 py-4 border-b border-swiss-gray-100 last:border-0 group cursor-pointer"
    >
      {/* Date badge */}
      <div className="flex-shrink-0 w-12 text-center">
        <div className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-1 py-0.5 rounded-t-sm">
          {month}
        </div>
        <div className="border border-t-0 border-swiss-gray-200 text-text font-bold text-xl leading-none py-1.5 rounded-b-sm">
          {day}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-text text-sm leading-snug mb-0.5 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        {loc && (
          <p className="text-xs text-swiss-gray-500 flex items-center gap-1 mb-1">
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {loc}
          </p>
        )}
        <p className="text-xs text-swiss-gray-500 line-clamp-1">{event.shortDescription}</p>
      </div>

      {/* Badge */}
      <div className="flex-shrink-0 self-center">
        <StatusBadge status={event.status} />
      </div>
    </motion.div>
  );
}

// ─── Past Event Row ────────────────────────────────────────────────────────────

function PastEventRow({ event, index, onSelect }: { event: EventEntry; index: number; onSelect: (event: EventEntry) => void }) {
  const { full } = formatDate(event.eventDate);
  const loc = locationString(event.location);
  const beneficiaries = event.impact?.beneficiariesCount;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      onClick={() => onSelect(event)}
      className="flex items-start gap-4 py-4 border-b border-swiss-gray-100 last:border-0 group cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-20 h-16 overflow-hidden rounded-sm bg-swiss-gray-100">
        {event.coverImage ? (
          <img
            src={urlFor(event.coverImage).width(160).height(128).url()}
            alt={event.coverImage.alt || event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-text text-sm leading-snug mb-0.5 group-hover:text-primary transition-colors line-clamp-1">
          {event.title}
        </h3>
        <p className="text-xs text-swiss-gray-500 flex items-center gap-2 mb-1">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {full}
          </span>
          {loc && (
            <>
              <span className="text-swiss-gray-300">•</span>
              <span className="truncate">{loc}</span>
            </>
          )}
        </p>
        <p className="text-xs text-swiss-gray-500 line-clamp-1">{event.shortDescription}</p>
      </div>

      {/* Beneficiaries count */}
      {beneficiaries != null && beneficiaries > 0 && (
        <div className="flex-shrink-0 text-right self-center">
          <div className="text-primary font-bold text-lg leading-none">
            {beneficiaries.toLocaleString()}
          </div>
          <div className="text-[10px] text-swiss-gray-500 font-medium">Beneficiaries</div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Category Icons ────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, JSX.Element> = {
  default: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  environment: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
    </svg>
  ),
  education: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  ),
  welfare: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('environ') || lower.includes('green') || lower.includes('plant')) return CATEGORY_ICONS.environment;
  if (lower.includes('edu') || lower.includes('literacy') || lower.includes('school')) return CATEGORY_ICONS.education;
  if (lower.includes('welfare') || lower.includes('community') || lower.includes('social')) return CATEGORY_ICONS.welfare;
  return CATEGORY_ICONS.default;
}

// ─── Testimonial Carousel ──────────────────────────────────────────────────────

function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0);

  if (!testimonials.length) return null;

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  const t = testimonials[current];

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.3 }}
          className="bg-indigo-50 border border-indigo-100 p-5 rounded-sm"
        >
          <svg className="w-6 h-6 text-primary/30 mb-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="text-sm text-swiss-gray-700 leading-relaxed italic mb-4">
            "{t.quote}"
          </p>
          <div className="flex items-center gap-3">
            {t.image ? (
              <img
                src={urlFor(t.image).width(48).height(48).url()}
                alt={t.personName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                {t.personName.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-semibold text-text text-sm">{t.personName}</div>
              {t.role && <div className="text-xs text-swiss-gray-500">{t.role}</div>}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      {testimonials.length > 1 && (
        <div className="flex gap-2 mt-3 justify-end">
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            className="w-8 h-8 border border-swiss-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors text-swiss-gray-400"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next testimonial"
            className="w-8 h-8 border border-swiss-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors text-swiss-gray-400"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function EventsPage({
  upcomingEvents,
  pastEvents,
  ongoingEvents,
  categories,
  testimonials,
  eventsPageContent,
}: Props) {
  const allUpcoming = [...ongoingEvents, ...upcomingEvents];
  const UPCOMING_LIMIT = 5;
  const PAST_LIMIT = 5;
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllPast, setShowAllPast] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventEntry | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;

      const foundEvent = [...allUpcoming, ...pastEvents].find(
        (e) => e.slug === hash || e._id === hash
      );
      if (foundEvent) {
        setSelectedEvent(foundEvent);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [allUpcoming, pastEvents]);

  const visibleUpcoming = showAllUpcoming ? allUpcoming : allUpcoming.slice(0, UPCOMING_LIMIT);
  const visiblePast = showAllPast ? pastEvents : pastEvents.slice(0, PAST_LIMIT);

  // Resolve active stats based on data source
  const dataSource = eventsPageContent?.analyticsDataSource || 'auto';

  const [stats, setStats] = useState<AnalyticsStats>({
    totalEventsCompleted: 0,
    totalHoursCompleted: 0,
    totalBeneficiaries: 0,
    categoryStats: [],
    dataSource,
  });

  useEffect(() => {
    const isCompetition = (cat: { name?: string; slug?: string }) => {
      const name = cat.name?.toLowerCase() || '';
      const slug = cat.slug?.toLowerCase() || '';
      return name === 'competitions' || name === 'competition' || slug === 'competitions' || slug === 'competition';
    };

    const filteredCategories = categories.filter(cat => !isCompetition(cat));

    if (dataSource === 'auto') {
      const completedEvents = pastEvents
        .filter(e => e.status === 'completed' || !e.isCancelled)
        .filter(e => !e.category || !isCompetition(e.category));

      const totalEvents = completedEvents.length;
      const totalHours = completedEvents.reduce((acc, e) => acc + (e.impact?.hoursOfService || 0), 0);
      const totalBeneficiaries = completedEvents.reduce((acc, e) => acc + (e.impact?.beneficiariesCount || 0), 0);

      const catStatsMap = new Map<string, { eventsCount: number; hoursCount: number }>();
      filteredCategories.forEach(cat => {
        catStatsMap.set(cat._id, { eventsCount: 0, hoursCount: 0 });
      });

      completedEvents.forEach(e => {
        if (e.category?._id && !isCompetition(e.category)) {
          const current = catStatsMap.get(e.category._id) || { eventsCount: 0, hoursCount: 0 };
          catStatsMap.set(e.category._id, {
            eventsCount: current.eventsCount + 1,
            hoursCount: current.hoursCount + (e.impact?.hoursOfService || 0),
          });
        }
      });

      const categoryStats = filteredCategories.map(cat => {
        const computed = catStatsMap.get(cat._id) || { eventsCount: 0, hoursCount: 0 };
        return {
          categoryId: cat._id,
          categoryName: cat.name,
          categorySlug: cat.slug,
          categoryColor: cat.color,
          eventsCount: computed.eventsCount,
          hoursCount: computed.hoursCount,
        };
      });

      setStats({
        totalEventsCompleted: totalEvents,
        totalHoursCompleted: totalHours,
        totalBeneficiaries,
        categoryStats,
        dataSource: 'auto',
      });
    } else if (dataSource === 'manual') {
      const manual = eventsPageContent?.manualStats;
      const categoryStats = filteredCategories.map(cat => {
        const manualCat = manual?.categoryStats?.find(mcs => mcs.categoryId === cat._id);
        return {
          categoryId: cat._id,
          categoryName: cat.name,
          categorySlug: cat.slug,
          categoryColor: cat.color || manualCat?.categoryColor,
          eventsCount: manualCat?.eventsCount || 0,
          hoursCount: manualCat?.hoursCount || 0,
        };
      });

      setStats({
        totalEventsCompleted: manual?.totalEventsCompleted || 0,
        totalHoursCompleted: manual?.totalHoursCompleted || 0,
        totalBeneficiaries: manual?.totalBeneficiaries || 0,
        categoryStats,
        dataSource: 'manual',
      });
    } else if (dataSource === 'api') {
      // Mock/Placeholder for future external API.
      // In the future, this would fetch from an API route.
      // For now, simulate an API fetch or use a beautiful mock.
      const timer = setTimeout(() => {
        const categoryStats = filteredCategories.map((cat, idx) => ({
          categoryId: cat._id,
          categoryName: cat.name,
          categorySlug: cat.slug,
          categoryColor: cat.color,
          eventsCount: 12 + idx * 3,
          hoursCount: 280 + idx * 95,
        }));

        setStats({
          totalEventsCompleted: categoryStats.reduce((acc, c) => acc + c.eventsCount, 0),
          totalHoursCompleted: categoryStats.reduce((acc, c) => acc + c.hoursCount, 0),
          totalBeneficiaries: 2150,
          categoryStats,
          dataSource: 'api',
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [dataSource, pastEvents, categories, eventsPageContent]);

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[220px] flex items-end overflow-hidden bg-text">
        {eventsPageContent?.heroImage && (
          <img
            src={urlFor(eventsPageContent.heroImage).width(1600).height(500).url()}
            alt={eventsPageContent.heroImage?.alt || 'Events Hero'}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            loading="eager"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-text/80 via-text/50 to-text/20" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-10 py-10 w-full">
          <span className="text-label text-white/60 block mb-2">NSS VIT EVENTS</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
            {eventsPageContent?.heroTitle || "What We're Up To"}
          </h1>
          <p className="text-white/75 max-w-xl text-sm leading-relaxed">
            {eventsPageContent?.heroSubtitle ||
              'Stay updated with our upcoming and past events as we continue to serve and create impact.'}
          </p>
        </div>
      </section>

      {/* ── Events Grid ───────────────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-10 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── Upcoming Events ─────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-label text-primary font-bold tracking-widest">UPCOMING EVENTS</h2>
              {allUpcoming.length > UPCOMING_LIMIT && (
                <button
                  onClick={() => setShowAllUpcoming((v) => !v)}
                  className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  {showAllUpcoming ? 'Show Less' : `View All`}
                  <svg className={`w-3.5 h-3.5 transition-transform ${showAllUpcoming ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            {visibleUpcoming.length > 0 ? (
              <div className="border border-swiss-gray-200 divide-y-0 px-4">
                {visibleUpcoming.map((event, i) => (
                  <UpcomingEventRow key={event._id} event={event} index={i} onSelect={setSelectedEvent} />
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-swiss-gray-200 p-8 text-center text-swiss-gray-400">
                <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium">No upcoming events right now</p>
                <p className="text-xs mt-1">Check back soon — we're always planning something new.</p>
              </div>
            )}
          </div>

          {/* ── Past Events ─────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-label text-swiss-gray-600 font-bold tracking-widest">PAST EVENTS</h2>
              {pastEvents.length > PAST_LIMIT && (
                <button
                  onClick={() => setShowAllPast((v) => !v)}
                  className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  {showAllPast ? 'Show Less' : `View All`}
                  <svg className={`w-3.5 h-3.5 transition-transform ${showAllPast ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            {visiblePast.length > 0 ? (
              <div className="border border-swiss-gray-200 divide-y-0 px-4">
                {visiblePast.map((event, i) => (
                  <PastEventRow key={event._id} event={event} index={i} onSelect={setSelectedEvent} />
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-swiss-gray-200 p-8 text-center text-swiss-gray-400">
                <p className="text-sm font-medium">No past events to show yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Analytics Section ──────────────────────────────────────────────── */}
      <EventsAnalytics stats={stats} />

      {/* ── Our Impact Stories ────────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="border-t border-swiss-gray-100 bg-white py-16">
          <div className="max-w-[800px] mx-auto px-6 sm:px-8 text-center">
            <h2 className="text-label text-primary font-bold tracking-widest mb-1">OUR IMPACT STORIES</h2>
            <p className="text-xs text-swiss-gray-500 mb-8">Real stories from the communities we serve</p>
            <div className="text-left">
              <TestimonialCarousel testimonials={testimonials} />
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="bg-text border-t border-text">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-snug">Be a Part of the Change</h2>
              <p className="text-white/60 text-sm">Every effort counts. Join us in building a better tomorrow.</p>
            </div>
          </div>
          <a
            href={eventsPageContent?.ctaLink || '/get-involved'}
            className="flex-shrink-0 bg-primary text-white text-sm font-semibold px-5 py-2.5 flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            {eventsPageContent?.ctaText || 'Join NSS VIT'}
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </section>

      {/* ── Event Detail Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed mt-6 inset-0 z-[10000] flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white rounded-lg shadow-2xl overflow-hidden max-w-2xl w-full relative z-10 border border-swiss-gray-200 flex flex-col max-h-[85vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-white/80 hover:bg-white text-swiss-gray-600 hover:text-text p-1.5 rounded-full shadow-md z-20 transition-all border border-swiss-gray-100 cursor-pointer"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Header Image vs Date Block */}
              {selectedEvent.status === 'upcoming' ? (
                <div className="bg-primary text-white p-6 pt-10 flex flex-col justify-end min-h-[140px] relative overflow-hidden flex-shrink-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 -translate-y-10" />
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-white/10 px-2.5 py-1 rounded-sm w-fit mb-3">
                    Upcoming Event
                  </span>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-base font-bold">
                      {formatDate(selectedEvent.eventDate).full}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative h-60 w-full bg-swiss-gray-100 flex-shrink-0">
                  {selectedEvent.coverImage ? (
                    <img
                      src={urlFor(selectedEvent.coverImage).width(800).height(480).url()}
                      alt={selectedEvent.coverImage.alt || selectedEvent.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-primary/40">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500 text-white px-2.5 py-1 rounded-sm shadow-sm">
                      Completed Event
                    </span>
                  </div>
                </div>
              )}

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {/* Title */}
                <h3 className="text-2xl font-bold text-text mb-3 leading-snug">
                  {selectedEvent.title}
                </h3>

                {/* Metadata Row */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5 pb-4 border-b border-swiss-gray-100 text-xs">
                  {selectedEvent.category && (
                    <span
                      className="font-semibold px-2 py-0.5 rounded-sm"
                      style={{
                        backgroundColor: `${selectedEvent.category.color?.hex || '#6366f1'}15`,
                        color: selectedEvent.category.color?.hex || '#6366f1'
                      }}
                    >
                      {selectedEvent.category.name}
                    </span>
                  )}

                  {selectedEvent.location && (
                    <span className="text-swiss-gray-500 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {locationString(selectedEvent.location)}
                    </span>
                  )}
                </div>

                {/* Description */}
                

                {/* Impact Metrics (For completed past events) */}
                {selectedEvent.status !== 'upcoming' && selectedEvent.impact && (
                  <div className="bg-swiss-gray-50 border border-swiss-gray-200 p-4 rounded-sm">
                    <h4 className="font-semibold text-text text-sm mb-3 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Event Impact Summary
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3  gap-3 text-center">
                      {selectedEvent.impact.beneficiariesCount != null && (
                        <div className="bg-white border border-swiss-gray-200 rounded-sm p-3">
                          <div className="text-primary font-bold text-xl leading-none">
                            {selectedEvent.impact.beneficiariesCount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-swiss-gray-500 font-medium mt-1.5 uppercase tracking-wide">Beneficiaries</div>
                        </div>
                      )}
                      {selectedEvent.impact.volunteersCount != null && (
                        <div className="bg-white border border-swiss-gray-200 rounded-sm p-3">
                          <div className="text-primary font-bold text-xl leading-none">
                            {selectedEvent.impact.volunteersCount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-swiss-gray-500 font-medium mt-1.5 uppercase tracking-wide">Volunteers</div>
                        </div>
                      )}
                      {selectedEvent.impact.hoursOfService != null && (
                        <div className="bg-white border border-indigo-100 rounded-sm p-3">
                          <div className="text-indigo-600 font-bold text-xl leading-none">
                            {selectedEvent.impact.hoursOfService.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-swiss-gray-500 font-medium mt-1.5 uppercase tracking-wide">Hours of Service</div>
                        </div>
                      )}
            
                    </div>
                  </div>
                )}
                <div className="mb-6 mt-6">
                  <h4 className="font-semibold text-text text-sm mb-3 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    About the Event
                  </h4>
                  <div className="text-swiss-gray-600 leading-relaxed">
                    {selectedEvent.description && Array.isArray(selectedEvent.description) && selectedEvent.description.length > 0 ? (
                      renderPortableText(selectedEvent.description)
                    ) : typeof selectedEvent.description === 'string' && selectedEvent.description.trim() !== '' ? (
                      <p className="text-sm text-swiss-gray-600 leading-relaxed">
                        {selectedEvent.description}
                      </p>
                    ) : selectedEvent.shortDescription ? (
                      <p className="text-sm text-swiss-gray-600 leading-relaxed">
                        {selectedEvent.shortDescription}
                      </p>
                    ) : (
                      <p className="text-sm text-swiss-gray-400 italic">
                        No description available for this event.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
