import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { urlFor } from "../../lib/sanity";

export interface Testimonial {
  personName: string;
  role?: string;
  image?: any;
  quote: string;
  title?: string;
}

function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0);

  if (!testimonials.length) return null;

  const prevIndex = current > 0 ? current - 1 : null;
  const nextIndex = current < testimonials.length - 1 ? current + 1 : null;

  const prev = () => setCurrent((c) => Math.max(c - 1, 0));
  const next = () =>
    setCurrent((c) => Math.min(c + 1, testimonials.length - 1));

  const currentT = testimonials[current];
  const prevT = prevIndex !== null ? testimonials[prevIndex] : null;
  const nextT = nextIndex !== null ? testimonials[nextIndex] : null;

  const renderCard = (t: Testimonial, active = false) => (
    <div
      className={`relative rounded-sm border p-5 bg-white transition-all w-full ${
        active
          ? "border-indigo-100 bg-indigo-50 shadow-sm"
          : "border-swiss-gray-200 opacity-70 scale-[0.97]"
      }`}
    >
      <svg
        className="w-5 h-5 text-primary/30 mb-3"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>

      <div className="relative mb-4 pr-7">
        <p className="text-sm text-swiss-gray-700 leading-relaxed italic line-clamp-4">
          "{t.quote}"
        </p>

        <svg
          className="w-5 h-5 text-primary/30 absolute bottom-0 right-0 transform scale-x-[-1]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>

      <div className="flex items-center gap-3">
        {t.image ? (
          <img
            src={urlFor(t.image).width(48).height(48).url()}
            alt={t.personName}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            {t.personName.charAt(0)}
          </div>
        )}

        <div>
          <div className="font-semibold text-text text-sm">{t.personName}</div>
          {t.role && (
            <div className="text-xs text-swiss-gray-500">{t.role}</div>
          )}
        </div>

        {t.title && (
          <div className="ml-auto text-right max-w-[45%]">
            <div className="text-[10px] text-swiss-gray-400 uppercase tracking-wide">
              During the Event
            </div>
            <div className="font-semibold text-swiss-gray-600 text-sm line-clamp-1">
              {t.title}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1fr] gap-4 items-stretch">
        <AnimatePresence mode="popLayout" initial={false}>
          {prevT ? (
            <motion.button
              key={`prev-${prevIndex}`}
              type="button"
              onClick={prev}
              aria-label="Previous testimonial"
              className="text-left hidden md:block w-full"
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {renderCard(prevT)}
            </motion.button>
          ) : (
            <motion.div
              key="prev-empty"
              className="hidden md:block"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        <motion.div
          key={`current-${current}`}
          layout
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -28 }}
          transition={{ duration: 0, ease: "easeOut" }}
        >
          {renderCard(currentT, true)}
        </motion.div>

        <AnimatePresence mode="popLayout" initial={false}>
          {nextT ? (
            <motion.button
              key={`next-${nextIndex}`}
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="text-left hidden md:block w-full"
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {renderCard(nextT)}
            </motion.button>
          ) : (
            <motion.div
              key="next-empty"
              className="hidden md:block"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </div>

      {testimonials.length > 1 && (
        <div className="flex gap-2 mt-3 justify-end">
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            disabled={current === 0}
            className="w-8 h-8 border border-swiss-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors text-swiss-gray-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Next testimonial"
            disabled={current === testimonials.length - 1}
            className="w-8 h-8 border border-swiss-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition-colors text-swiss-gray-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default function ImpactStories({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  if (!testimonials.length) return null;

  return (
    <section className="border-t border-swiss-gray-100 bg-white py-8">
      <div className="mx-auto px-6 sm:px-8 text-center">
        <h2 className="text-label text-primary font-bold tracking-widest mb-1">
          OUR IMPACT STORIES
        </h2>
        <p className="text-sm text-swiss-gray-500 mb-4">
          Real stories from the communities we serve
        </p>
        <div className="text-left">
          <TestimonialCarousel testimonials={testimonials} />
        </div>
      </div>
    </section>
  );
}