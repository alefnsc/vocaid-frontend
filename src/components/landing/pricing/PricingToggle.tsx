'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface PricingToggleProps {
  options: {
    id: string
    label: string
  }[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

export const PricingToggle: React.FC<PricingToggleProps> = ({
  options,
  activeId,
  onChange,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      className={`inline-flex items-center bg-zinc-100 rounded-full p-1 ${className}`}
      role="tablist"
      aria-label="Pricing type"
    >
      {options.map((option) => {
        const isActive = option.id === activeId
        return (
          <button
            key={option.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
              isActive
                ? 'text-purple-700'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="pricing-toggle-active"
                className="absolute inset-0 bg-white rounded-full shadow-sm"
                transition={{
                  type: 'spring',
                  stiffness: prefersReducedMotion ? 500 : 300,
                  damping: prefersReducedMotion ? 50 : 30,
                }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default PricingToggle
