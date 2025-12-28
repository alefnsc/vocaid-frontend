/**
 * Landing Trust Section
 * 
 * Displays privacy and security features.
 * Uses the two-tone title pattern (first word black, second word purple).
 */

'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Card } from 'components/ui/card'
import { TRUST_FEATURES } from './LandingMockData'
import { Shield, Lock, User, Building2, CheckCircle, type LucideIcon } from 'lucide-react'

// Map iconName strings to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Lock,
  User,
  Building2,
  CheckCircle,
}

export const LandingTrust: React.FC = () => {
  const { t } = useTranslation()
  const prefersReducedMotion = useReducedMotion()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.2 : 0.5, ease: 'easeOut' },
    },
  }

  return (
    <section className="py-20 bg-zinc-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-purple-300 bg-purple-900/50 rounded-full mb-6">
              <Shield className="w-4 h-4" />
              {t('landing.trust.badge', 'Security & Privacy')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t('landing.trust.title', 'Built for')} <span className="text-purple-400">{t('landing.trust.titleHighlight', 'Trust')}</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              {t('landing.trust.subtitle', 'Your data security and privacy are our top priorities. Designed with enterprise-grade protection from day one.')}
            </p>
          </motion.div>

          {/* Trust Cards */}
          <motion.div
            variants={containerVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {TRUST_FEATURES.map((feature, index) => {
              const IconComponent = ICON_MAP[feature.iconName]
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="h-full p-6 bg-zinc-800/50 border-zinc-700 hover:border-purple-500/50 hover:bg-zinc-800 transition-all duration-300 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
                      {IconComponent && <IconComponent className="w-6 h-6 text-purple-400" />}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-zinc-400">{feature.description}</p>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Disclaimer */}
          <motion.p variants={itemVariants} className="mt-10 text-center text-xs text-zinc-500">
            {t('landing.trust.disclaimer', 'Security features are designed for best practices. Specific compliance certifications may be in progress.')}
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

export default LandingTrust
