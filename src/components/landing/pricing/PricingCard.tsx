'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card'
import { Button } from 'components/ui/button'
import { PlanBadge } from './PlanBadge'
import { PricingFeatureList } from './PricingFeatureList'
import { PricingPlan } from 'config/pricing.config'

interface PricingCardProps {
  plan: PricingPlan
  onCtaClick?: (action: string, planId: string) => void
  animationDelay?: number
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  onCtaClick,
  animationDelay = 0,
}) => {
  const { t } = useTranslation()
  const prefersReducedMotion = useReducedMotion()

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick(plan.ctaAction, plan.id)
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.2 : 0.5,
        ease: 'easeOut',
        delay: prefersReducedMotion ? 0 : animationDelay,
      },
    },
  }

  const isDisabled = plan.comingSoon
  const showHeaderBadge = plan.badge === 'mostPopular' && !plan.comingSoon

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="h-full"
    >
      <Card
        className={`h-full flex flex-col relative overflow-hidden transition-all duration-300 ${
          isDisabled
            ? 'border-zinc-200 opacity-90'
            : plan.highlighted
              ? 'border-purple-300 shadow-xl shadow-purple-100/50 ring-2 ring-purple-600 hover:shadow-2xl hover:shadow-purple-200/60'
              : 'border-zinc-200 hover:border-purple-200 hover:shadow-lg hover:-translate-y-1'
        }`}
      >
        {/* Header badge (Most Popular - full width) */}
        {showHeaderBadge && (
          <div className="bg-purple-600 text-white text-center py-2 text-xs font-semibold uppercase tracking-wide">
            {t('pricing.badges.mostPopular')}
          </div>
        )}

        {/* Corner badge for Coming Soon or other badges */}
        {plan.badge && !showHeaderBadge && (
          <PlanBadge badge={plan.badge} position="corner" />
        )}

        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold text-zinc-900">
              {t(plan.titleKey)}
            </CardTitle>
            {plan.badge && plan.badge === 'bestValue' && (
              <PlanBadge badge={plan.badge} position="inline" />
            )}
            {plan.badge && plan.badge === 'save' && (
              <PlanBadge badge={plan.badge} position="inline" />
            )}
          </div>
          
          {/* Price display */}
          {plan.price && (
            <div className="mt-3">
              <span className="text-3xl font-bold text-zinc-900">{plan.price}</span>
              {plan.priceSubtext && (
                <span className="text-sm text-zinc-500 ml-1">{plan.priceSubtext}</span>
              )}
            </div>
          )}
          
          <p className="text-sm text-zinc-600 mt-2">
            {t(plan.taglineKey)}
          </p>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <PricingFeatureList featuresKey={plan.featuresKey} className="flex-1" />
          
          <div className="pt-6 mt-6 border-t border-zinc-100">
            <Button
              disabled={isDisabled && plan.ctaAction === 'waitlist'}
              onClick={handleCtaClick}
              className={`w-full transition-all duration-200 ${
                isDisabled
                  ? plan.ctaAction === 'sales'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200'
                  : plan.highlighted
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300'
              }`}
            >
              {t(plan.ctaKey)}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default PricingCard
