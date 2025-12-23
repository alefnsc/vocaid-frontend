/**
 * PageLayout Component
 * 
 * Master layout wrapper for all pages with consistent navigation,
 * borders, and white content area following Vocaid design system.
 * 
 * @module components/page-layout
 */

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import TopBar from '../top-bar';

// ========================================
// ANIMATION VARIANTS
// ========================================

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// ========================================
// TYPES
// ========================================

interface PageLayoutProps {
  children: ReactNode;
  /** Page title for accessibility */
  title?: string;
  /** Show navigation bar */
  showNav?: boolean;
  /** Use full-width content (no max-width constraint) */
  fullWidth?: boolean;
  /** Background color variant */
  background?: 'white' | 'gray' | 'transparent';
  /** Padding variant */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
  /** Disable page transition animations */
  disableAnimation?: boolean;
}

// ========================================
// COMPONENT
// ========================================

export function PageLayout({
  children,
  title,
  showNav = true,
  fullWidth = false,
  background = 'white',
  padding = 'md',
  className = '',
  disableAnimation = false,
}: PageLayoutProps) {
  const location = useLocation();

  // Background classes
  const bgClasses = {
    white: 'bg-white',
    gray: 'bg-zinc-50',
    transparent: 'bg-transparent',
  };

  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'px-4 py-4 sm:px-6 sm:py-6',
    md: 'px-4 py-6 sm:px-6 sm:py-8 lg:px-8',
    lg: 'px-6 py-8 sm:px-8 sm:py-10 lg:px-12',
  };

  // Container width
  const widthClasses = fullWidth 
    ? 'w-full' 
    : 'w-full max-w-7xl mx-auto';

  const content = (
    <div className={`min-h-screen flex flex-col ${bgClasses[background]}`}>
      {/* Navigation */}
      {showNav && <TopBar />}

      {/* Main Content Area */}
      <main 
        className={`
          flex-1 
          ${paddingClasses[padding]}
          ${className}
        `}
        role="main"
        aria-label={title || 'Page content'}
      >
        <div className={widthClasses}>
          {children}
        </div>
      </main>
    </div>
  );

  // Return with or without animation
  if (disableAnimation) {
    return content;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}

// ========================================
// SUBCOMPONENTS
// ========================================

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 ${className}`}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-zinc-600">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}

interface PageSectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function PageSection({ children, title, subtitle, className = '' }: PageSectionProps) {
  return (
    <section className={`mb-8 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const baseClasses = 'bg-white border border-zinc-200 rounded-xl';
  const hoverClasses = hover 
    ? 'transition-all duration-200 hover:border-zinc-300 hover:shadow-md cursor-pointer' 
    : '';

  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export default PageLayout;
