/**
 * FeatureGate Component
 * 
 * Wraps features that may be disabled.
 * Shows "Under Construction" modal when disabled feature is clicked.
 * 
 * Usage:
 * <FeatureGate enabled={FEATURES.B2B_RECRUITER_PLATFORM_ENABLED}>
 *   <Button>Go to Recruiter Dashboard</Button>
 * </FeatureGate>
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

interface FeatureGateProps {
  /** Whether the feature is enabled */
  enabled: boolean;
  /** Children to render (will be disabled if feature is off) */
  children: React.ReactNode;
  /** Custom title for the modal */
  title?: string;
  /** Custom message for the modal */
  message?: string;
  /** Whether to show a "Coming Soon" badge on the element */
  showBadge?: boolean;
  /** Badge text override */
  badgeText?: string;
  /** Mode: 'disable' wraps children, 'replace' replaces with disabled version */
  mode?: 'disable' | 'replace';
  /** Additional class name for the wrapper */
  className?: string;
  /** Callback when disabled feature is clicked */
  onDisabledClick?: () => void;
}

export function FeatureGate({
  enabled,
  children,
  title,
  message,
  showBadge = false,
  badgeText,
  mode = 'disable',
  className = '',
  onDisabledClick,
}: FeatureGateProps) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = React.useState(false);

  // Use translations as defaults
  const displayTitle = title ?? t('features.underConstruction.title');
  const displayMessage = message ?? t('features.underConstruction.message');
  const displayBadgeText = badgeText ?? t('features.comingSoon');

  // If enabled, render children normally
  if (enabled) {
    return <>{children}</>;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModalOpen(true);
    onDisabledClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setModalOpen(true);
      onDisabledClick?.();
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-disabled="true"
        className={`relative cursor-pointer ${className}`}
      >
        {/* Disabled overlay wrapper */}
        <div className="opacity-60 pointer-events-none select-none">
          {children}
        </div>
        
        {/* Coming Soon Badge */}
        {showBadge && (
          <span className="absolute -top-2 -right-2 text-[10px] font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full whitespace-nowrap">
            {displayBadgeText}
          </span>
        )}
      </div>

      {/* Under Construction Modal */}
      <UnderConstructionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={displayTitle}
        message={displayMessage}
      />
    </>
  );
}

/**
 * UnderConstructionModal
 * 
 * Modal shown when a disabled feature is clicked.
 * Typography-first design, no icons.
 */
interface UnderConstructionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
  showWaitlist?: boolean;
  onJoinWaitlist?: () => void;
}

export function UnderConstructionModal({
  open,
  onOpenChange,
  title,
  message,
  showWaitlist = false,
  onJoinWaitlist,
}: UnderConstructionModalProps) {
  const { t } = useTranslation();
  
  const displayTitle = title ?? t('features.underConstruction.title');
  const displayMessage = message ?? t('features.underConstruction.message');
  
  const handleJoinWaitlist = () => {
    onJoinWaitlist?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-zinc-900">
            {displayTitle}
          </DialogTitle>
          <DialogDescription className="text-zinc-600 mt-2">
            {displayMessage}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-3">
          {showWaitlist && (
            <button
              onClick={handleJoinWaitlist}
              className="w-full px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              {t('features.joinWaitlist')}
            </button>
          )}
          <button
            onClick={() => onOpenChange(false)}
            className="w-full px-4 py-3 bg-zinc-100 text-zinc-900 font-medium rounded-lg hover:bg-zinc-200 transition-colors"
          >
            {t('common.gotIt')}
          </button>
        </div>

        <p className="text-xs text-zinc-500 text-center mt-4">
          {t('features.underConstruction.patience')}
        </p>
      </DialogContent>
    </Dialog>
  );
}

/**
 * DisabledNavItem
 * 
 * A navigation item that shows as disabled with a "Coming Soon" tag.
 * Used in sidebars and menus for B2B features.
 */
interface DisabledNavItemProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

export function DisabledNavItem({ label, onClick, className = '' }: DisabledNavItemProps) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = React.useState(false);

  const handleClick = () => {
    setModalOpen(true);
    onClick?.();
  };

  return (
    <>
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
        aria-disabled="true"
        className={`flex items-center justify-between px-3 py-2 text-zinc-400 cursor-pointer hover:bg-zinc-50 rounded-lg transition-colors ${className}`}
      >
        <span>{label}</span>
        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-zinc-100 text-zinc-500 rounded">
          {t('common.soon')}
        </span>
      </div>

      <UnderConstructionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}

export default FeatureGate;
