/**
 * BetaFeedbackFab
 * 
 * Floating Action Button for beta feedback.
 * Shows a prominent bug icon button that opens the feedback modal.
 * 
 * Only visible when REACT_APP_CLOSED_BETA_FEEDBACK=true
 * Hidden during active interviews to avoid blocking audio UI.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bug } from 'lucide-react';
import { cn } from 'lib/utils';
import { isClosedBetaFeedbackEnabled } from 'config/featureFlags';
import BetaFeedbackChatModal from './BetaFeedbackChatModal';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Pages where the FAB should be hidden (e.g., during active interview)
const HIDDEN_PATHS = [
  '/interview',      // Active interview (would block audio UI)
  '/sign-in',
  '/sign-up',
  '/sso-callback',
];

// ============================================================================
// COMPONENT
// ============================================================================

const BetaFeedbackFab: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if FAB should be visible
  const shouldHide = 
    !isClosedBetaFeedbackEnabled() ||
    HIDDEN_PATHS.some(path => 
      location.pathname === path || 
      location.pathname.startsWith(path + '/')
    );

  // Open modal handler
  const handleOpen = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  // Close modal handler
  const handleClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  if (shouldHide) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <div
        className="fixed bottom-4 right-4 z-[9990] flex flex-col items-end gap-2
          sm:bottom-6 sm:right-6"
      >
        {/* Main FAB Button */}
        <button
          onClick={handleOpen}
          className={cn(
            'flex items-center gap-3',
            'px-5 py-3.5',
            'bg-purple-600 hover:bg-purple-700',
            'text-white text-sm font-semibold',
            'rounded-full',
            'shadow-lg hover:shadow-xl',
            'transition-all duration-200',
            'transform hover:scale-105 active:scale-95',
            'focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2',
            // Pulse animation to draw attention
            'animate-pulse-subtle'
          )}
          aria-label={t('betaFeedback.fabLabel', 'Send Feedback')}
          aria-haspopup="dialog"
        >
          <Bug className="w-5 h-5" />
          <span className="hidden sm:inline">
            {t('betaFeedback.fabText', 'Feedback')}
          </span>
        </button>
      </div>

      {/* Feedback Modal */}
      <BetaFeedbackChatModal
        isOpen={isModalOpen}
        onClose={handleClose}
      />

      {/* Custom animation styles */}
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% {
            box-shadow: 0 10px 15px -3px rgba(147, 51, 234, 0.3),
                        0 4px 6px -4px rgba(147, 51, 234, 0.3);
          }
          50% {
            box-shadow: 0 10px 25px -3px rgba(147, 51, 234, 0.5),
                        0 4px 10px -4px rgba(147, 51, 234, 0.5);
          }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default BetaFeedbackFab;
