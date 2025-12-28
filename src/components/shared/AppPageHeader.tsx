/**
 * App Page Header Component
 * 
 * Standardized header for all logged-in area pages.
 * Uses a two-part title pattern with purple accent on the second word.
 * Supports i18n with dedicated title and titleHighlight translation keys.
 * 
 * Usage:
 * <AppPageHeader
 *   titleKey="resumeLibrary.title"           // e.g., "Resume"
 *   titleHighlightKey="resumeLibrary.titleHighlight"  // e.g., "Library"
 *   subtitleKey="resumeLibrary.subtitle"
 * />
 * 
 * For personalized greetings (like Dashboard):
 * <AppPageHeader
 *   title="Welcome,"
 *   titleHighlight={firstName}
 *   subtitleKey="dashboard.readyToPractice"
 * />
 * 
 * @module components/shared/AppPageHeader
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from 'lib/utils';

// ========================================
// TYPES
// ========================================

interface AppPageHeaderProps {
  /** Translation key for the first part of the title */
  titleKey?: string;
  /** Translation key for the highlighted (purple) part of the title */
  titleHighlightKey?: string;
  /** Translation key for the subtitle */
  subtitleKey?: string;
  /** Direct title text (use instead of titleKey for dynamic content) */
  title?: string;
  /** Direct highlight text (use instead of titleHighlightKey for dynamic content) */
  titleHighlight?: string;
  /** Direct subtitle text (use instead of subtitleKey for dynamic content) */
  subtitle?: string;
  /** Default fallback for title if translation not found */
  titleDefault?: string;
  /** Default fallback for title highlight if translation not found */
  titleHighlightDefault?: string;
  /** Default fallback for subtitle if translation not found */
  subtitleDefault?: string;
  /** Additional className for the container */
  className?: string;
  /** Children to render on the right side (e.g., action buttons) */
  children?: React.ReactNode;
}

// ========================================
// COMPONENT
// ========================================

export const AppPageHeader: React.FC<AppPageHeaderProps> = ({
  titleKey,
  titleHighlightKey,
  subtitleKey,
  title,
  titleHighlight,
  subtitle,
  titleDefault,
  titleHighlightDefault,
  subtitleDefault,
  className,
  children,
}) => {
  const { t } = useTranslation();

  // Resolve title parts (prefer direct props, fallback to translation keys)
  const resolvedTitle = title ?? (titleKey ? t(titleKey, titleDefault ?? '') : '');
  const resolvedHighlight = titleHighlight ?? (titleHighlightKey ? t(titleHighlightKey, titleHighlightDefault ?? '') : '');
  const resolvedSubtitle = subtitle ?? (subtitleKey ? t(subtitleKey, subtitleDefault ?? '') : '');

  return (
    <div className={cn('flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6', className)}>
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-1">
          {resolvedTitle}
          {resolvedHighlight && (
            <>
              {' '}
              <span className="text-purple-600">{resolvedHighlight}</span>
            </>
          )}
        </h1>
        {resolvedSubtitle && (
          <p className="text-zinc-600 mt-1">
            {resolvedSubtitle}
          </p>
        )}
      </div>
      
      {/* Actions slot (optional) */}
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default AppPageHeader;
