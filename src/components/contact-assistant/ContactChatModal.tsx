/**
 * Contact Chat Modal
 * Modal container for the Contact Assistant
 * 
 * Vocaid Design System:
 * - White background, zinc border, soft shadow
 * - No icons
 * - Mobile-first (bottom sheet on mobile)
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import ContactAssistant from './ContactAssistant';

interface ContactChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ContactChatModal: React.FC<ContactChatModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[9998] transition-opacity duration-200"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed z-[9999] transition-all duration-300 ease-out
          /* Mobile: bottom sheet style */
          bottom-0 left-0 right-0 h-[85vh] rounded-t-2xl
          /* Desktop: floating window */
          sm:bottom-4 sm:right-4 sm:left-auto sm:top-auto
          sm:w-[420px] sm:h-[600px] sm:rounded-2xl
          /* Styling */
          bg-white border border-zinc-200 shadow-2xl
          flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        <ContactAssistant onClose={onClose} onSubmitSuccess={onSuccess} />
      </div>
    </>
  );
};

export default ContactChatModal;
