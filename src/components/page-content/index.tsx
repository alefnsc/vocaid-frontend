/**
 * PageContent Component
 * 
 * Simple content wrapper for pages inside LoggedLayout.
 * Provides consistent styling without layout duplication.
 * 
 * Use this instead of DefaultLayout for pages that are
 * rendered inside the LoggedLayout route.
 * 
 * @module components/page-content
 */

'use client';

import React, { ReactNode } from 'react';
import { cn } from 'lib/utils';

interface PageContentProps {
  children: ReactNode;
  /** Additional className for the content wrapper */
  className?: string;
  /** Background color variant */
  background?: 'white' | 'zinc-50' | 'transparent';
  /** Whether to use full-width (no max-width constraint) */
  fullWidth?: boolean;
}

/**
 * Simple content wrapper for logged-area pages.
 * Use this for pages that are children of LoggedLayout.
 */
export function PageContent({
  children,
  className,
  background = 'transparent',
  fullWidth = false,
}: PageContentProps) {
  const bgClasses = {
    'white': 'bg-white',
    'zinc-50': 'bg-zinc-50',
    'transparent': '',
  };

  return (
    <div
      className={cn(
        'min-h-[calc(100vh-180px)]', // Account for topbar + footer
        bgClasses[background],
        !fullWidth && 'max-w-7xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
}

export default PageContent;
