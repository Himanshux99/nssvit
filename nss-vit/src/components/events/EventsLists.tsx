import { motion } from "framer-motion";
import { urlFor } from "../../lib/sanity";

type EventStatus = "upcoming" | "completed" | "cancelled" | "ongoing";

interface EventLocation {
  venue?: string;
  city?: string;
  state?: string;
}

interface EventEntry {
  _id: string;
  title: string;
  shortDescription: string;
  coverImage?: any;
  eventDate: string;
  status: EventStatus;
  location?: EventLocation;
  impact?: {
    beneficiariesCount?: number;
    volunteersCount?: number;
  };
}

interface FormatDateResult {
  month: string;
  day: number;
  full: string;
}

interface CommonProps {
  onSelect: (event: EventEntry) => void;
  formatDate: (dateStr: string) => FormatDateResult;
  locationString: (loc?: EventLocation) => string;
}

interface UpcomingEventsSectionProps extends CommonProps {
  visibleUpcoming: EventEntry[];
  allUpcomingCount: number;
  showAllUpcoming: boolean;
  onToggleShowAll: () => void;
}

interface PastEventsSectionProps extends CommonProps {
  visiblePast: EventEntry[];
  pastEventsCount: number;
  showAllPast: boolean;
  onToggleShowAll: () => void;
}

function StatusBadge({ status }: { status: EventStatus }) {
  const map = {
    upcoming: {
      label: "Upcoming",
      cls: "bg-indigo-50 text-primary border border-primary/20",
    },
    ongoing: {
      label: "Ongoing",
      cls: "bg-green-50 text-green-700 border border-green-200",
    },
    completed: {
      label: "Completed",
      cls: "bg-swiss-gray-100 text-swiss-gray-600 border border-swiss-gray-200",
    },
    cancelled: {
      label: "Cancelled",
      cls: "bg-red-50 text-red-600 border border-red-200",
    },
  };
  const { label, cls } = map[status] ?? map.completed;
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-sm tracking-wide ${cls}`}
    >
      {label}
    </span>
  );
}

function UpcomingEventRow({
  event,
  index,
  onSelect,
  formatDate,
  locationString,
}: {
  event: EventEntry;
  index: number;
  onSelect: (event: EventEntry) => void;
  formatDate: (dateStr: string) => FormatDateResult;
  locationString: (loc?: EventLocation) => string;
}) {
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
      <div className="flex-shrink-0 w-12 text-center">
        <div className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-1 py-0.5 rounded-t-sm">
          {month}
        </div>
        <div className="border border-t-0 border-swiss-gray-200 text-text font-bold text-xl leading-none py-1.5 rounded-b-sm">
          {day}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-text text-sm leading-snug mb-0.5 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        {loc && (
          <p className="text-xs text-swiss-gray-500 flex items-center gap-1 mb-1">
            <svg
              className="w-3 h-3 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            {loc}
          </p>
        )}
        <p className="text-xs text-swiss-gray-500 line-clamp-1">
          {event.shortDescription}
        </p>
      </div>

      <div className="flex-shrink-0 self-center">
        <StatusBadge status={event.status} />
      </div>
    </motion.div>
  );
}

function PastEventRow({
  event,
  index,
  onSelect,
  formatDate,
  locationString,
}: {
  event: EventEntry;
  index: number;
  onSelect: (event: EventEntry) => void;
  formatDate: (dateStr: string) => FormatDateResult;
  locationString: (loc?: EventLocation) => string;
}) {
  const { full } = formatDate(event.eventDate);
  const loc = locationString(event.location);

  const beneficiaries = event.impact?.beneficiariesCount;
  const volunteers = event.impact?.volunteersCount;

  const showBeneficiaries = beneficiaries != null && beneficiaries > 0;
  const showVolunteers =
    !showBeneficiaries && volunteers != null && volunteers > 0;

  return (
    <>
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.07 }}
        onClick={() => onSelect(event)}
        className="md:hidden w-full text-left py-4 border-b border-swiss-gray-100 last:border-0"
      >
        <div className="rounded-lg overflow-hidden border border-swiss-gray-200 bg-white shadow-sm">
          <div className="relative aspect-[16/9] bg-swiss-gray-100">
            {event.coverImage ? (
              <img
                src={urlFor(event.coverImage).width(800).height(450).url()}
                alt={event.coverImage.alt || event.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-primary/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-text text-sm leading-snug line-clamp-2">
                  {event.title}
                </h3>

                <div className="mt-1 flex flex-col gap-1 text-[11px] text-swiss-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{full}</span>
                  </span>

                  {loc && (
                    <span className="inline-flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5 text-swiss-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="truncate">{loc}</span>
                    </span>
                  )}
                </div>
              </div>

              {showBeneficiaries && (
                <div className="flex-shrink-0 self-start bg-white/95 backdrop-blur px-2.5 py-1 rounded-full shadow-sm border border-swiss-gray-200">
                  <span className="text-[10px] font-semibold text-primary">
                    {beneficiaries.toLocaleString()} benef.
                  </span>
                </div>
              )}

              {showVolunteers && (
                <div className="flex-shrink-0 self-start bg-white/95 backdrop-blur px-2.5 py-1 rounded-full shadow-sm border border-swiss-gray-200">
                  <span className="text-[10px] font-semibold text-indigo-600">
                    {volunteers.toLocaleString()} volunteers
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-swiss-gray-500 line-clamp-2">
              {event.shortDescription}
            </p>
          </div>
        </div>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: index * 0.07 }}
        onClick={() => onSelect(event)}
        className="hidden md:flex items-start gap-4 py-4 border-b border-swiss-gray-100 last:border-0 group cursor-pointer"
      >
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
              <svg
                className="w-6 h-6 text-primary/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text text-sm leading-snug mb-0.5 group-hover:text-primary transition-colors line-clamp-1">
            {event.title}
          </h3>
          <p className="text-xs text-swiss-gray-500 flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
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
          <p className="text-xs text-swiss-gray-500 line-clamp-1">
            {event.shortDescription}
          </p>
        </div>

        {showBeneficiaries && (
          <div className="flex-shrink-0 text-right self-center">
            <div className="text-primary font-bold text-lg leading-none">
              {beneficiaries.toLocaleString()}
            </div>
            <div className="text-[10px] text-swiss-gray-500 font-medium">
              Beneficiaries
            </div>
          </div>
        )}

        {showVolunteers && (
          <div className="flex-shrink-0 text-right self-center">
            <div className="text-indigo-600 font-bold text-lg leading-none">
              {volunteers.toLocaleString()}
            </div>
            <div className="text-[10px] text-swiss-gray-500 font-medium">
              Volunteers
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}

export function UpcomingEventsSection({
  visibleUpcoming,
  allUpcomingCount,
  showAllUpcoming,
  onToggleShowAll,
  onSelect,
  formatDate,
  locationString,
}: UpcomingEventsSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-label text-primary font-bold tracking-widest">
          UPCOMING EVENTS
        </h2>
        {allUpcomingCount > 5 && (
          <button
            onClick={onToggleShowAll}
            className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            {showAllUpcoming ? "Show Less" : `View All`}
            <svg
              className={`w-3.5 h-3.5 transition-transform ${
                showAllUpcoming ? "rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {visibleUpcoming.length > 0 ? (
        <div className="border border-swiss-gray-200 divide-y-0 px-4">
          {visibleUpcoming.map((event, i) => (
            <UpcomingEventRow
              key={event._id}
              event={event}
              index={i}
              onSelect={onSelect}
              formatDate={formatDate}
              locationString={locationString}
            />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-swiss-gray-200 p-8 text-center text-swiss-gray-400">
          <svg
            className="w-10 h-10 mx-auto mb-3 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm font-medium">No upcoming events right now</p>
          <p className="text-xs mt-1">
            Check back soon — we're always planning something new.
          </p>
        </div>
      )}
    </div>
  );
}

export function PastEventsSection({
  visiblePast,
  pastEventsCount,
  showAllPast,
  onToggleShowAll,
  onSelect,
  formatDate,
  locationString,
}: PastEventsSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-label text-swiss-gray-600 font-bold tracking-widest">
          PAST EVENTS
        </h2>
        {pastEventsCount > 5 && (
          <button
            onClick={onToggleShowAll}
            className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            {showAllPast ? "Show Less" : `View All`}
            <svg
              className={`w-3.5 h-3.5 transition-transform ${
                showAllPast ? "rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {visiblePast.length > 0 ? (
        <div className="border border-swiss-gray-200 divide-y-0 px-4">
          {visiblePast.map((event, i) => (
            <PastEventRow
              key={event._id}
              event={event}
              index={i}
              onSelect={onSelect}
              formatDate={formatDate}
              locationString={locationString}
            />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-swiss-gray-200 p-8 text-center text-swiss-gray-400">
          <p className="text-sm font-medium">No past events to show yet.</p>
        </div>
      )}
    </div>
  );
}