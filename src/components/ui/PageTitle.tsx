/**
 * PageTitle Component
 * 
 * Standardized page header with two-word title pattern:
 * - First word: black (text-zinc-900)
 * - Second word: purple (text-purple-600)
 * 
 * Supports:
 * - Automatic splitting by first space (for languages with spaces)
 * - Manual primary/accent props (for CJK languages or custom control)
 * - Optional subtitle
 * - Responsive sizing
 * 
 * @module components/ui/PageTitle
 * 
 * @example
 * // Auto-split mode (for English, Spanish, etc.)
 * <PageTitle title="Account Settings" subtitle="Manage your profile" />
 * 
 * // Manual mode (for CJK or custom emphasis)
 * <PageTitle primary="アカウント" accent="設定" subtitle="プロフィールを管理" />
 */

'use client';

import React from 'react';
import { cn } from 'lib/utils';

export interface PageTitleProps {
  /** 
   * Full title to auto-split. First word will be black, second word purple.
   * If title has only one word, it will be all purple.
   */
  title?: string;
  
  /** 
   * Manual primary (black) text. Takes precedence over auto-split.
   */
  primary?: string;
  
  /** 
   * Manual accent (purple) text. Takes precedence over auto-split.
   */
  accent?: string;
  
  /** Optional subtitle below the title */
  subtitle?: string;
  
  /** Use h1 (default) or h2 tag */
  as?: 'h1' | 'h2';
  
  /** Additional className for the title */
  className?: string;
  
  /** Additional className for the subtitle */
  subtitleClassName?: string;
  
  /** Additional className for the container */
  containerClassName?: string;
}

/**
 * Split title into primary and accent parts
 * For CJK languages (no spaces), treat as single accent word
 */
function splitTitle(title: string): { primary: string; accent: string } {
  // Check if title contains spaces
  const spaceIndex = title.indexOf(' ');
  
  if (spaceIndex === -1) {
    // No space: entire title is accent (purple)
    // This handles single-word titles and CJK languages
    return { primary: '', accent: title };
  }
  
  // Split at first space
  const primary = title.substring(0, spaceIndex);
  const accent = title.substring(spaceIndex + 1);
  
  return { primary, accent };
}

export const PageTitle: React.FC<PageTitleProps> = ({
  title,
  primary: manualPrimary,
  accent: manualAccent,
  subtitle,
  as: Tag = 'h1',
  className,
  subtitleClassName,
  containerClassName,
}) => {
  // Determine primary and accent text
  let primary: string;
  let accent: string;
  
  if (manualPrimary !== undefined || manualAccent !== undefined) {
    // Manual mode: use provided values
    primary = manualPrimary || '';
    accent = manualAccent || '';
  } else if (title) {
    // Auto-split mode
    const split = splitTitle(title);
    primary = split.primary;
    accent = split.accent;
  } else {
    // No title provided
    primary = '';
    accent = '';
  }
  
  return (
    <div className={cn('mb-2', containerClassName)}>
      <Tag className={cn(
        'text-2xl sm:text-3xl font-bold',
        className
      )}>
        {primary && (
          <span className="text-zinc-900">{primary}</span>
        )}
        {primary && accent && ' '}
        {accent && (
          <span className="text-purple-600">{accent}</span>
        )}
      </Tag>
      
      {subtitle && (
        <p className={cn(
          'text-zinc-600 mt-1',
          subtitleClassName
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PageTitle;
