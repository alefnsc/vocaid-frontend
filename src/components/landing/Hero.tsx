'use client'

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from 'components/ui/button'
import { SUPPORTED_LANGUAGES } from './LandingMockData'
import { ArrowRight, Building2 } from 'lucide-react'

interface HeroProps {
  onDemoClick: () => void
}

export const Hero: React.FC<HeroProps> = ({ onDemoClick }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const prefersReducedMotion = useReducedMotion()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.15,
        delayChildren: prefersReducedMotion ? 0 : 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.2 : 0.6, ease: 'easeOut' },
    },
  }

  const floatAnimation = prefersReducedMotion
    ? {}
    : {
        y: [0, -8, 0],
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }

  return (
    <section className="relative min-h-screen flex items-center pt-20 md:pt-24 pb-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 via-white to-white -z-10" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-purple-100/40 to-transparent rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-block px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full mb-6">
                {t('landing.hero.badge')}
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 tracking-tight leading-tight"
            >
              {t('landing.hero.title')}{' '}
              <span className="text-purple-600">{t('landing.hero.titleHighlight')}</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg sm:text-xl text-zinc-600 leading-relaxed"
            >
              {t('landing.hero.description')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                onClick={() => navigate('/sign-up')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-base font-semibold shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-200 transition-all group"
              >
                {t('landing.hero.ctaStart')}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const el = document.getElementById('b2b-section')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="border-zinc-300 text-zinc-700 hover:bg-zinc-50 px-8 py-6 text-base font-semibold group"
              >
                <Building2 className="w-4 h-4 mr-2" />
                {t('landing.hero.ctaOrganizations', 'For Organizations')}
                <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                  {t('common.soon', 'Soon')}
                </span>
              </Button>
            </motion.div>

            {/* Language Badges */}
            <motion.div
              variants={itemVariants}
              className="mt-8"
            >
              <p className="text-xs font-medium text-zinc-500 mb-3">
                {t('landing.hero.languagesLabel', 'Available in 7 languages')}
              </p>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <span
                    key={lang.code}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded-full text-xs font-medium text-zinc-700 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Trust strip */}
            <motion.div
              variants={itemVariants}
              className="mt-10 pt-8 border-t border-zinc-200"
            >
              <p className="text-sm font-medium text-zinc-500 mb-4">
                {t('landing.hero.trustSubtitle')}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-600">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                  {t('landing.hero.features.tenant')}
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                  {t('landing.hero.features.audit')}
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                  {t('landing.hero.features.gdpr')}
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Hero Visual */}
          <motion.div
            initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.2 : 0.8, delay: prefersReducedMotion ? 0 : 0.4 }}
            className="relative"
          >
            <motion.div
              animate={floatAnimation}
              className="relative z-10"
            >
              {/* Hero banner container with animated frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-200/50">
                {/* Animated border */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-purple-600 to-purple-400 rounded-2xl p-[2px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-purple-600 to-purple-400 rounded-2xl animate-pulse opacity-50" />
                </div>
                
                {/* Image container */}
                <div className="relative bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-2xl p-1">
                  <img
                    src="/hero-banner.png"
                    alt="Vocaid Dashboard Preview"
                    className="w-full h-auto rounded-xl"
                    onError={(e) => {
                      // Fallback to gradient placeholder if image doesn't exist
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `
                          <div class="aspect-video rounded-xl bg-gradient-to-br from-purple-100 via-purple-50 to-zinc-100 flex items-center justify-center">
                            <div class="text-center">
                              <div class="text-6xl font-bold text-purple-600 mb-2">Vocaid</div>
                              <div class="text-zinc-500">AI-Powered Interview Platform</div>
                            </div>
                          </div>
                        `
                      }
                    }}
                  />
                </div>
              </div>

              {/* Floating cards for visual interest - hidden on small screens to prevent overflow */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="hidden sm:block absolute -bottom-4 sm:-bottom-6 left-2 sm:-left-6 bg-white rounded-xl shadow-lg p-3 sm:p-4 border border-zinc-100"
              >
                <div className="text-xl sm:text-2xl font-bold text-purple-600">98%</div>
                <div className="text-[10px] sm:text-xs text-zinc-500">{t('landing.hero.stats.accuracy')}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="hidden sm:block absolute -top-2 sm:-top-4 right-2 sm:-right-4 bg-white rounded-xl shadow-lg p-3 sm:p-4 border border-zinc-100"
              >
                <div className="text-xl sm:text-2xl font-bold text-zinc-900">3.2x</div>
                <div className="text-[10px] sm:text-xs text-zinc-500">{t('landing.hero.stats.faster')}</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
