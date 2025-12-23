/**
 * Empty State Component
 * 
 * Typography-based empty state following Enterprise HR Hub design.
 * No icons - uses bold text statements and subtle descriptions.
 * 
 * @module components/ui/empty-state
 */

import React from 'react';
import { cn } from 'lib/utils';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  className,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'py-6',
    md: 'py-12',
    lg: 'py-20',
  };

  const titleClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center text-center px-6',
        sizeClasses[size],
        className
      )}
    >
      {/* Decorative line */}
      <div className="w-12 h-0.5 bg-zinc-200 mb-6 rounded-full" />
      
      {/* Title - Bold statement */}
      <h3 className={cn(
        'font-semibold text-zinc-900 tracking-tight mb-2',
        titleClasses[size]
      )}>
        {title}
      </h3>
      
      {/* Description */}
      {description && (
        <p className="text-sm text-zinc-500 max-w-xs">
          {description}
        </p>
      )}
      
      {/* Action button */}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
      
      {/* Bottom decorative line */}
      <div className="w-8 h-0.5 bg-zinc-100 mt-6 rounded-full" />
    </motion.div>
  );
};

/**
 * Inline Empty State - For smaller containers
 */
interface InlineEmptyStateProps {
  message: string;
  className?: string;
}

export const InlineEmptyState: React.FC<InlineEmptyStateProps> = ({
  message,
  className,
}) => {
  return (
    <div className={cn(
      'flex items-center justify-center py-8 px-4 text-center',
      className
    )}>
      <p className="text-sm font-medium text-zinc-500">{message}</p>
    </div>
  );
};

export default EmptyState;
