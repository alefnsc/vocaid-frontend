'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { PlatformType, PLATFORM_CONFIGS } from 'config/pricing.config'
import { useTranslation } from 'react-i18next'
import { User, Users, Building2 } from 'lucide-react'

interface PricingTabsProps {
  activeTab: PlatformType
  onChange: (tab: PlatformType) => void
  className?: string
}

const TAB_ICONS: Record<PlatformType, React.ReactNode> = {
  b2c: <User className="w-4 h-4" />,
  b2b: <Users className="w-4 h-4" />,
  hr: <Building2 className="w-4 h-4" />,
}

const TAB_ORDER: PlatformType[] = ['b2c', 'b2b', 'hr']

export const PricingTabs: React.FC<PricingTabsProps> = ({
  activeTab,
  onChange,
  className = '',
}) => {
  const { t } = useTranslation()
  const prefersReducedMotion = useReducedMotion()

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex

    if (e.key === 'ArrowLeft') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : TAB_ORDER.length - 1
    } else if (e.key === 'ArrowRight') {
      newIndex = currentIndex < TAB_ORDER.length - 1 ? currentIndex + 1 : 0
    } else if (e.key === 'Home') {
      newIndex = 0
    } else if (e.key === 'End') {
      newIndex = TAB_ORDER.length - 1
    } else {
      return
    }

    e.preventDefault()
    onChange(TAB_ORDER[newIndex])
  }

  return (
    <div
      className={`flex justify-center ${className}`}
      role="tablist"
      aria-label="Pricing platforms"
    >
      <div className="inline-flex items-center bg-zinc-100 rounded-xl p-1.5 gap-1">
        {TAB_ORDER.map((tab, index) => {
          const config = PLATFORM_CONFIGS[tab]
          const isActive = tab === activeTab

          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              aria-controls={`pricing-panel-${tab}`}
              id={`pricing-tab-${tab}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ${
                isActive
                  ? 'text-purple-700'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="pricing-tab-active"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm"
                  transition={{
                    type: 'spring',
                    stiffness: prefersReducedMotion ? 500 : 300,
                    damping: prefersReducedMotion ? 50 : 30,
                  }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {TAB_ICONS[tab]}
                <span className="hidden sm:inline">{t(config.tabLabelKey)}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default PricingTabs
