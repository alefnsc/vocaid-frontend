/**
 * Trust Bar Component
 * 
 * Enterprise social proof section with animated counters.
 * Clean typography, white/zinc/purple-600 color scheme.
 * HR-focused metrics and enterprise testimonials.
 * 
 * @module components/trust-bar
 */

import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// ========================================
// ANIMATION CONFIG
// ========================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// ========================================
// ANIMATED COUNTER COMPONENT
// ========================================

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
}

function AnimatedCounter({ value, suffix = '', duration = 2 }: AnimatedCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (current) => Math.floor(current));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  useEffect(() => {
    return display.onChange((v) => setDisplayValue(v));
  }, [display]);

  return (
    <span ref={ref}>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
}

// ========================================
// STATS DATA - Enterprise HR metrics
// ========================================

interface Stat {
  id: string;
  value: number;
  suffix: string;
  labelKey: string;
  defaultLabel: string;
  highlight?: boolean;
}

const stats: Stat[] = [
  {
    id: 'time-saved',
    value: 72,
    suffix: '%',
    labelKey: 'trustBar.stats.timeSaved',
    defaultLabel: 'Time-to-Hire Reduction',
    highlight: true,
  },
  {
    id: 'interviews',
    value: 1000000,
    suffix: '+',
    labelKey: 'trustBar.stats.interviews',
    defaultLabel: 'Interviews Conducted',
  },
  {
    id: 'countries',
    value: 85,
    suffix: '+',
    labelKey: 'trustBar.stats.countries',
    defaultLabel: 'Countries Served',
    highlight: true,
  },
  {
    id: 'enterprises',
    value: 250,
    suffix: '+',
    labelKey: 'trustBar.stats.enterprises',
    defaultLabel: 'Enterprise Clients',
  },
];

// ========================================
// TESTIMONIALS DATA - Enterprise HR focus
// ========================================

interface Testimonial {
  id: string;
  quoteKey: string;
  authorKey: string;
  roleKey: string;
  companyKey: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    quoteKey: 'trustBar.testimonials.items.1.quote',
    authorKey: 'trustBar.testimonials.items.1.author',
    roleKey: 'trustBar.testimonials.items.1.role',
    companyKey: 'trustBar.testimonials.items.1.company',
  },
  {
    id: '2',
    quoteKey: 'trustBar.testimonials.items.2.quote',
    authorKey: 'trustBar.testimonials.items.2.author',
    roleKey: 'trustBar.testimonials.items.2.role',
    companyKey: 'trustBar.testimonials.items.2.company',
  },
  {
    id: '3',
    quoteKey: 'trustBar.testimonials.items.3.quote',
    authorKey: 'trustBar.testimonials.items.3.author',
    roleKey: 'trustBar.testimonials.items.3.role',
    companyKey: 'trustBar.testimonials.items.3.company',
  },
];

// ========================================
// COMPANY NAMES - Enterprise focus
// ========================================

const trustedCompanies = [
  'Deloitte', 'PwC', 'Accenture', 'McKinsey', 'BCG', 'KPMG'
];

// ========================================
// COMPONENT
// ========================================

interface TrustBarProps {
  showTestimonials?: boolean;
  showCompanies?: boolean;
}

export function TrustBar({ showTestimonials = true, showCompanies = true }: TrustBarProps) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-20 md:py-28 bg-white border-y border-zinc-200">
      <div className="max-w-6xl mx-auto px-6">
        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat) => (
            <StatCard key={stat.id} stat={stat} t={t} />
          ))}
        </motion.div>

        {/* Trusted By Section */}
        {showCompanies && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-6">
              {t('trustBar.trustedBy', 'Trusted by professionals at')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {trustedCompanies.map((company) => (
                <span
                  key={company}
                  className="text-zinc-400 font-medium text-lg"
                >
                  {company}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Testimonials Section */}
        {showTestimonials && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="space-y-8"
          >
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-purple-600 bg-purple-50 rounded-full border border-purple-100">
                {t('trustBar.testimonials.badge', 'Enterprise Results')}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
                {t('trustBar.testimonials.heading', 'Trusted by HR Leaders')}
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard 
                  key={testimonial.id} 
                  testimonial={testimonial}
                  delay={index * 0.1}
                  t={t}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ========================================
// SUBCOMPONENTS
// ========================================

interface StatCardProps {
  stat: Stat;
  t: ReturnType<typeof useTranslation>['t'];
}

function StatCard({ stat, t }: StatCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="text-center"
    >
      <div className={`text-3xl md:text-4xl font-bold mb-1 ${
        stat.highlight ? 'text-purple-600' : 'text-zinc-900'
      }`}>
        <AnimatedCounter value={stat.value} suffix={stat.suffix} />
      </div>
      <div className="text-sm text-zinc-500">
        {t(stat.labelKey, stat.defaultLabel)}
      </div>
    </motion.div>
  );
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  delay?: number;
  t: ReturnType<typeof useTranslation>['t'];
}

function TestimonialCard({ testimonial, delay = 0, t }: TestimonialCardProps) {
  const author = t(testimonial.authorKey);
  
  return (
    <motion.div
      variants={itemVariants}
      transition={{ delay }}
      className="p-6 bg-zinc-50 border border-zinc-200 rounded-xl"
    >
      {/* Quote */}
      <p className="text-zinc-700 text-sm leading-relaxed mb-6">
        "{t(testimonial.quoteKey)}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
          {author.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="font-medium text-zinc-900 text-sm">{author}</div>
          <div className="text-xs text-zinc-500">{t(testimonial.roleKey)} {t('trustBar.at')} {t(testimonial.companyKey)}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default TrustBar;
