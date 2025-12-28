'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'

interface PricingFeatureListProps {
  featuresKey: string
  className?: string
}

export const PricingFeatureList: React.FC<PricingFeatureListProps> = ({
  featuresKey,
  className = '',
}) => {
  const { t } = useTranslation()
  const features = t(featuresKey, { returnObjects: true }) as string[]

  if (!Array.isArray(features)) return null

  return (
    <ul className={`space-y-3 ${className}`}>
      {features.map((feature, idx) => (
        <li key={idx} className="flex items-start gap-3 text-sm text-zinc-700">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  )
}

export default PricingFeatureList
