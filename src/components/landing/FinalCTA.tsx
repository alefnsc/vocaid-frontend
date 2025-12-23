'use client'

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Button } from 'components/ui/button'

interface FinalCTAProps {
  onDemoClick: () => void
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onDemoClick }) => {
  const navigate = useNavigate()
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
    <section className="py-24 bg-zinc-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            {t('landing.finalCta.title')}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-zinc-300 mb-10 max-w-2xl mx-auto"
          >
            {t('landing.finalCta.subtitle')}
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={() => navigate('/sign-up')}
              className="bg-white text-zinc-900 hover:bg-zinc-100 px-8 py-6 text-base font-semibold"
            >
              {t('landing.finalCta.ctaWorkspace')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onDemoClick}
              className="border-zinc-600 text-white hover:bg-zinc-800 px-8 py-6 text-base font-semibold"
            >
              {t('landing.finalCta.ctaDemo')}
            </Button>
          </motion.div>
          <motion.p
            variants={itemVariants}
            className="mt-8 text-sm text-zinc-500"
          >
            {t('landing.finalCta.disclaimer')}
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

export default FinalCTA
