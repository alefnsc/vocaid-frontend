/**
 * Auth Feature Pills Component
 * 
 * Text-only feature chips for visual richness without icons.
 * Displays key platform features in a pill layout.
 * 
 * @module components/auth/AuthFeaturePills
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from 'lib/utils';

interface AuthFeaturePillsProps {
  /** Optional class name */
  className?: string;
}

export const AuthFeaturePills: React.FC<AuthFeaturePillsProps> = ({
  className,
}) => {
  const { t } = useTranslation();

  const features = [
    t('auth.features.aiPowered', 'AI-Powered'),
    t('auth.features.realTimeFeedback', 'Real-Time Feedback'),
    t('auth.features.practiceAnytime', 'Practice Anytime'),
  ];

  return (
    <div className={cn('flex flex-wrap justify-center gap-2', className)}>
      {features.map((feature, index) => (
        <span
          key={index}
          className={cn(
            'inline-flex items-center',
            'px-3 py-1',
            'bg-zinc-50 border border-zinc-200',
            'text-zinc-700 text-xs font-medium',
            'rounded-full'
          )}
        >
          {feature}
        </span>
      ))}
    </div>
  );
};

export default AuthFeaturePills;
