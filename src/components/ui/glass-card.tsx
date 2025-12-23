/**
 * Glass Card Component
 * 
 * Semi-transparent card with backdrop blur effect.
 * Features a thin purple-600 top border and frosted glass aesthetic.
 * 
 * @module components/ui/glass-card
 */

import React from 'react';
import { cn } from 'lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

// ========================================
// TYPES
// ========================================

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
  withTopAccent?: boolean;
  className?: string;
}

// ========================================
// COMPONENT
// ========================================

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  withTopAccent = true,
  className,
  ...motionProps
}) => {
  const baseClasses = 'bg-white/80 backdrop-blur-md rounded-xl';
  
  const variantClasses = {
    default: 'border border-zinc-200/60',
    elevated: 'border border-zinc-200/60 shadow-lg shadow-zinc-900/5',
    bordered: 'border-2 border-zinc-200',
  };

  const topAccentClasses = withTopAccent 
    ? 'border-t-2 border-t-purple-600' 
    : '';

  return (
    <motion.div
      className={cn(
        baseClasses,
        variantClasses[variant],
        topAccentClasses,
        className
      )}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

// ========================================
// GLASS CARD VARIANTS
// ========================================

interface GlassFeatureCardProps {
  title: string;
  description: string;
  accent?: 'purple' | 'zinc';
  className?: string;
}

export const GlassFeatureCard: React.FC<GlassFeatureCardProps> = ({
  title,
  description,
  accent = 'zinc',
  className,
}) => {
  const isPurple = accent === 'purple';

  return (
    <GlassCard 
      variant="default" 
      withTopAccent={isPurple}
      className={cn('p-6 transition-all duration-200 hover:shadow-md', className)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Accent dot */}
      <div className="flex items-start justify-between mb-4">
        <div 
          className={cn(
            'w-2 h-2 rounded-full mt-1.5',
            isPurple ? 'bg-purple-600' : 'bg-zinc-300'
          )}
        />
      </div>
      
      {/* Content */}
      <h3 className={cn(
        'text-lg font-semibold tracking-tight mb-2',
        isPurple ? 'text-purple-600' : 'text-zinc-900'
      )}>
        {title}
      </h3>
      <p className="text-sm text-zinc-600 leading-relaxed">
        {description}
      </p>
    </GlassCard>
  );
};

// ========================================
// GLASS STAT CARD
// ========================================

interface GlassStatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export const GlassStatCard: React.FC<GlassStatCardProps> = ({
  label,
  value,
  subtitle,
  className,
}) => {
  return (
    <GlassCard 
      variant="elevated" 
      withTopAccent
      className={cn('p-6', className)}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
        {label}
      </p>
      <p className="text-3xl font-bold text-zinc-900 tracking-tight">
        {value}
      </p>
      {subtitle && (
        <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
      )}
    </GlassCard>
  );
};

export default GlassCard;
