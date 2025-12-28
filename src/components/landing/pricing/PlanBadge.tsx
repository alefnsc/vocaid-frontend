'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { BADGE_CONFIG } from 'config/pricing.config'

interface PlanBadgeProps {
  badge: 'bestValue' | 'mostPopular' | 'save' | 'comingSoon'
  position?: 'inline' | 'corner' | 'header'
  className?: string
}

export const PlanBadge: React.FC<PlanBadgeProps> = ({
  badge,
  position = 'inline',
  className = '',
}) => {
  const { t } = useTranslation()
  const config = BADGE_CONFIG[badge]

  if (!config) return null

  const baseClasses = 'text-xs font-semibold border rounded-full whitespace-nowrap'
  
  const positionClasses = {
    inline: 'px-2.5 py-0.5',
    corner: 'absolute top-3 right-3 px-2.5 py-0.5',
    header: 'px-3 py-1.5 text-center w-full rounded-none rounded-t-lg border-0',
  }

  return (
    <span
      className={`${baseClasses} ${positionClasses[position]} ${config.className} ${className}`}
    >
      {t(config.labelKey)}
    </span>
  )
}

export default PlanBadge
