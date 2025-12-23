/**
 * Testimonial Carousel Component
 * 
 * Enhanced testimonial display with auto-rotating carousel.
 * Enterprise HR testimonials with smooth animations.
 * 
 * @module components/testimonial-carousel
 */

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

// ========================================
// TESTIMONIAL DATA
// ========================================

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  image?: string;
  rating: number;
  metric?: {
    value: string;
    label: string;
  };
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    quote: "We reduced our screening time by 70% while improving candidate quality. The AI interviews are remarkably thorough and candidates love the flexibility.",
    author: "Jennifer Walsh",
    role: "VP of Talent Acquisition",
    company: "Fortune 500 Tech",
    rating: 5,
    metric: {
      value: "70%",
      label: "Time Saved"
    }
  },
  {
    id: '2',
    quote: "The bias reduction metrics sold our leadership team. We've seen a 35% increase in diverse hiring outcomes and our candidate satisfaction scores have never been higher.",
    author: "David Kim",
    role: "Chief People Officer",
    company: "Global Finance Corp",
    rating: 5,
    metric: {
      value: "35%",
      label: "More Diversity"
    }
  },
  {
    id: '3',
    quote: "Our recruiters can now focus on high-touch activities. The AI handles initial screening brilliantly, and the analytics give us insights we never had before.",
    author: "Maria Santos",
    role: "Head of Recruitment",
    company: "European Retail Group",
    rating: 5,
    metric: {
      value: "3x",
      label: "Faster Hiring"
    }
  },
  {
    id: '4',
    quote: "The multilingual support was a game-changer for our global expansion. We interview candidates in 8 languages with consistent quality across all regions.",
    author: "Thomas Mueller",
    role: "Global HR Director",
    company: "International Manufacturing",
    rating: 5,
    metric: {
      value: "8+",
      label: "Languages"
    }
  },
];

// ========================================
// ANIMATION VARIANTS
// ========================================

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

// ========================================
// COMPONENT
// ========================================

export function TestimonialCarousel() {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [[page, direction], setPage] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);

  const testimonialIndex = ((page % testimonials.length) + testimonials.length) % testimonials.length;
  const currentTestimonial = testimonials[testimonialIndex];

  // Auto-rotate
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setPage(([p, _]) => [p + 1, 1]);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  return (
    <section 
      ref={ref}
      className="py-20 md:py-28 bg-zinc-50 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-sm font-medium text-purple-600 bg-purple-50 rounded-full border border-purple-100">
            <Star className="w-4 h-4 fill-purple-600" />
            {t('testimonials.badge', 'Trusted by Enterprise')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            {t('testimonials.title', 'What HR Leaders Say')}
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            {t('testimonials.subtitle', 'Join hundreds of enterprise teams transforming their hiring process.')}
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Testimonial Card */}
          <div className="relative min-h-[320px] md:min-h-[280px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={page}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="absolute inset-0"
              >
                <div className="bg-white rounded-2xl border border-zinc-200 p-8 md:p-10 shadow-lg shadow-zinc-100/50 h-full">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Quote Section */}
                    <div className="flex-1">
                      <Quote className="w-10 h-10 text-purple-200 mb-4" />
                      <p className="text-lg md:text-xl text-zinc-700 leading-relaxed mb-6">
                        "{currentTestimonial.quote}"
                      </p>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-4">
                        {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>

                      {/* Author Info */}
                      <div>
                        <p className="font-semibold text-zinc-900">
                          {currentTestimonial.author}
                        </p>
                        <p className="text-sm text-zinc-500">
                          {currentTestimonial.role} at {currentTestimonial.company}
                        </p>
                      </div>
                    </div>

                    {/* Metric Card */}
                    {currentTestimonial.metric && (
                      <div className="md:w-48 flex-shrink-0">
                        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-center text-white h-full flex flex-col justify-center">
                          <div className="text-4xl md:text-5xl font-bold mb-2">
                            {currentTestimonial.metric.value}
                          </div>
                          <div className="text-purple-200 text-sm font-medium">
                            {currentTestimonial.metric.label}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {/* Previous Button */}
            <button
              onClick={() => paginate(-1)}
              className="p-2 rounded-full bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setPage([index, index > testimonialIndex ? 1 : -1])}
                  className={`
                    h-2 rounded-full transition-all duration-300
                    ${index === testimonialIndex 
                      ? 'w-8 bg-purple-600' 
                      : 'w-2 bg-zinc-300 hover:bg-zinc-400'
                    }
                  `}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => paginate(1)}
              className="p-2 rounded-full bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialCarousel;
