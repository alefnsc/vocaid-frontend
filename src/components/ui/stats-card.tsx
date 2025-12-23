import React from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: number
  icon: React.ReactNode
  size?: 'default' | 'small'
}

/**
 * StatsCard - Reusable stats card component
 * Used across Home (Total Interviews) and Credits (Balance, Purchased, Used, Spent) pages
 * 
 * Features:
 * - Consistent padding: p-3 sm:p-4
 * - Consistent gap: gap-3 sm:gap-4
 * - Purple icon background: bg-purple-100 rounded-xl
 * - Standard icon sizing: w-5 h-5 sm:w-6 sm:h-6 (applied via wrapper)
 * - Responsive text sizes
 */
const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  change, 
  icon,
  size = 'default'
}) => (
  <div className="p-3 sm:p-4 bg-white border border-zinc-200 rounded-xl flex items-start gap-3 sm:gap-4">
    <div className="inline-flex p-2 sm:p-3 bg-purple-100 rounded-xl flex-shrink-0 text-purple-600 [&>svg]:w-5 [&>svg]:h-5 [&>svg]:sm:w-6 [&>svg]:sm:h-6">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs sm:text-sm text-zinc-500 truncate">{title}</p>
      <p className={`font-bold text-zinc-900 ${size === 'small' ? 'text-sm sm:text-base' : 'text-lg sm:text-2xl'}`}>{value}</p>
      {subtitle && <p className="text-xs text-zinc-400 truncate">{subtitle}</p>}
      {change !== undefined && (
        <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </p>
      )}
    </div>
  </div>
)

export default StatsCard
