import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { urlFor } from "../../lib/sanity";

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
  status: "upcoming" | "completed" | "cancelled";
  category?: EventCategory;
  tags?: string[];
  location?: EventLocation;
  impact?: {
    beneficiariesCount?: number;
    volunteersCount?: number;
    hoursOfService?: number;
  };
  description?: any[] | string;
}

interface EventDetailModalProps {
  selectedEvent: EventEntry | null;
  onClose: () => void;
  renderPortableText: (blocks?: any[]) => ReactNode;
  formatDate: (dateStr: string) => { full: string };
  locationString: (loc?: EventLocation) => string;
}

export default function EventDetailModal({
  selectedEvent,
  onClose,
  renderPortableText,
  formatDate,
  locationString,
}: EventDetailModalProps) {
  return (
    <AnimatePresence>
      {selectedEvent && (
        <div className="fixed inset-0 z-[10000] flex items-start justify-center p-3 pt-16 sm:p-4 sm:pt-20 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-[95vw] sm:max-w-2xl relative z-10 border border-swiss-gray-200 flex flex-col max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-6rem)]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/80 hover:bg-white text-swiss-gray-600 hover:text-text p-1.5 rounded-full shadow-md z-20 transition-all border border-swiss-gray-100 cursor-pointer"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Header Image vs Date Block */}
            {selectedEvent.status === "upcoming" ? (
              <div className="bg-primary text-white p-6 pt-10 flex flex-col justify-end min-h-[140px] relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 -translate-y-10" />
                <span className="text-[10px] uppercase font-bold tracking-widest bg-white/10 px-2.5 py-1 rounded-sm w-fit mb-3">
                  Upcoming Event
                </span>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-white/80"
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
                  <span className="text-base font-bold">
                    {formatDate(selectedEvent.eventDate).full}
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative h-60 w-full bg-swiss-gray-100 flex-shrink-0">
                {selectedEvent.coverImage ? (
                  <img
                    src={urlFor(selectedEvent.coverImage)
                      .width(800)
                      .height(480)
                      .url()}
                    alt={selectedEvent.coverImage.alt || selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-primary/40">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
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
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
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
                      backgroundColor: `${selectedEvent.category.color?.hex || "#6366f1"}15`,
                      color: selectedEvent.category.color?.hex || "#6366f1",
                    }}
                  >
                    {selectedEvent.category.name}
                  </span>
                )}

                {selectedEvent.location && (
                  <span className="text-swiss-gray-500 flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {locationString(selectedEvent.location)}
                  </span>
                )}
              </div>

              {/* Impact Metrics (For completed past events) */}
              {selectedEvent.status !== "upcoming" && selectedEvent.impact && (
                <div className="bg-swiss-gray-50 border border-swiss-gray-200 p-4 rounded-sm">
                  <h4 className="font-semibold text-text text-sm mb-3 flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Event Impact Summary
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                    {selectedEvent.impact.beneficiariesCount != null && (
                      <div className="bg-white border border-swiss-gray-200 rounded-sm p-3">
                        <div className="text-primary font-bold text-xl leading-none">
                          {selectedEvent.impact.beneficiariesCount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-swiss-gray-500 font-medium mt-1.5 uppercase tracking-wide">
                          Beneficiaries
                        </div>
                      </div>
                    )}
                    {selectedEvent.impact.volunteersCount != null && (
                      <div className="bg-white border border-swiss-gray-200 rounded-sm p-3">
                        <div className="text-primary font-bold text-xl leading-none">
                          {selectedEvent.impact.volunteersCount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-swiss-gray-500 font-medium mt-1.5 uppercase tracking-wide">
                          Volunteers
                        </div>
                      </div>
                    )}
                    {selectedEvent.impact.hoursOfService != null && (
                      <div className="bg-white border border-indigo-100 rounded-sm p-3">
                        <div className="text-indigo-600 font-bold text-xl leading-none">
                          {selectedEvent.impact.hoursOfService.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-swiss-gray-500 font-medium mt-1.5 uppercase tracking-wide">
                          Hours of Service
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-6 mt-6">
                <h4 className="font-semibold text-text text-sm mb-3 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  About the Event
                </h4>
                <div className="text-swiss-gray-600 leading-relaxed">
                  {selectedEvent.description &&
                  Array.isArray(selectedEvent.description) &&
                  selectedEvent.description.length > 0 ? (
                    renderPortableText(selectedEvent.description)
                  ) : typeof selectedEvent.description === "string" &&
                    selectedEvent.description.trim() !== "" ? (
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
  );
}