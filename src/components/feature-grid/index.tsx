/**
 * Feature Grid Component
 * 
 * Minimalist feature cards with glass morphism effect.
 * Semi-transparent cards with backdrop blur and purple accent borders.
 * Text-focused design with no decorative icons.
 * 
 * @module components/feature-grid
 */

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GlassCard } from 'components/ui/glass-card';

// ========================================
// ANIMATION VARIANTS
// ========================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
  },
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
// FEATURE DATA - Enterprise HR Hub focus
// ========================================

interface Feature {
  id: string;
  titleKey: string;
  descriptionKey: string;
  defaultTitle: string;
  defaultDescription: string;
  accent?: 'purple' | 'zinc';
}

const features: Feature[] = [
  {
    id: 'recruitment-speed',
    titleKey: 'features.recruitmentSpeed.title',
    descriptionKey: 'features.recruitmentSpeed.description',
    defaultTitle: 'Recruitment Velocity',
    defaultDescription: 'Screen candidates 3x faster with AI-powered interviews that run 24/7 across global timezones.',
    accent: 'purple',
  },
  {
    id: 'bias-reduction',
    titleKey: 'features.biasReduction.title',
    descriptionKey: 'features.biasReduction.description',
    defaultTitle: 'Bias Reduction',
    defaultDescription: 'Standardized evaluation criteria and structured interviews that reduce unconscious bias by 40%.',
  },
  {
    id: 'talent-analytics',
    titleKey: 'features.talentAnalytics.title',
    descriptionKey: 'features.talentAnalytics.description',
    defaultTitle: 'Talent Analytics',
    defaultDescription: 'Data-driven insights on candidate performance, skill gaps, and hiring pipeline efficiency.',
    accent: 'purple',
  },
  {
    id: 'global-reach',
    titleKey: 'features.globalReach.title',
    descriptionKey: 'features.globalReach.description',
    defaultTitle: 'Global Reach',
    defaultDescription: 'Interview in 8+ languages with native-level fluency. Build diverse teams without borders.',
  },
  {
    id: 'realtime-feedback',
    titleKey: 'features.realtimeFeedback.title',
    descriptionKey: 'features.realtimeFeedback.description',
    defaultTitle: 'Real-Time Scoring',
    defaultDescription: 'Instant evaluation with detailed scorecards on communication, technical skills, and cultural fit.',
  },
  {
    id: 'compliance',
    titleKey: 'features.compliance.title',
    descriptionKey: 'features.compliance.description',
    defaultTitle: 'Enterprise Compliance',
    defaultDescription: 'SOC 2 compliant with full audit trails. Your data is encrypted and never shared.',
    accent: 'purple',
  },
  {
    id: 'scalability',
    titleKey: 'features.scalability.title',
    descriptionKey: 'features.scalability.description',
    defaultTitle: 'Infinite Scale',
    defaultDescription: 'From 10 to 10,000 interviews. Our infrastructure grows with your hiring needs.',
  },
  {
    id: 'integration',
    titleKey: 'features.integration.title',
    descriptionKey: 'features.integration.description',
    defaultTitle: 'ATS Integration',
    defaultDescription: 'Seamless connection with your existing applicant tracking systems and workflows.',
  },
];

// ========================================
// COMPONENT
// ========================================

interface FeatureGridProps {
  showExtended?: boolean;
}

export function FeatureGrid({ showExtended = true }: FeatureGridProps) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  // Show first 4 features unless extended
  const displayFeatures = showExtended ? features : features.slice(0, 4);

  return (
    <section 
      ref={ref}
      id="features"
      className="py-20 md:py-28 bg-zinc-50"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-purple-600 bg-purple-50 rounded-full border border-purple-100">
            {t('features.badge', 'Platform Capabilities')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight mb-4">
            {t('features.heading', 'Enterprise-Grade Interview Intelligence')}
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            {t('features.subheading', 'Built for HR teams that demand speed, fairness, and data-driven hiring decisions at scale.')}
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        >
          {displayFeatures.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} t={t} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ========================================
// SUBCOMPONENTS
// ========================================

interface FeatureCardProps {
  feature: Feature;
  t: ReturnType<typeof useTranslation>['t'];
}

function FeatureCard({ feature, t }: FeatureCardProps) {
  const isPurple = feature.accent === 'purple';

  return (
    <GlassCard
      variants={cardVariants}
      variant="default"
      withTopAccent={isPurple}
      className="group relative p-6 transition-all duration-200 hover:shadow-md"
      whileHover={{ y: -2 }}
    >
      {/* Accent dot */}
      <div 
        className={`absolute top-6 right-6 w-2 h-2 rounded-full ${
          isPurple ? 'bg-purple-600' : 'bg-zinc-300'
        }`}
      />
      
      {/* Content */}
      <div className="pr-6">
        <h3 className={`text-lg font-semibold tracking-tight mb-2 ${
          isPurple ? 'text-purple-600' : 'text-zinc-900'
        }`}>
          {t(feature.titleKey, feature.defaultTitle)}
        </h3>
        <p className="text-sm text-zinc-600 leading-relaxed">
          {t(feature.descriptionKey, feature.defaultDescription)}
        </p>
      </div>
    </GlassCard>
  );
}

export default FeatureGrid;
