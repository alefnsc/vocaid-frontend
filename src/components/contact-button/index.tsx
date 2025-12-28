/**
 * Contact Button
 * 
 * Fixed floating button that opens the Contact Assistant modal
 * 
 * Vocaid Design System:
 * - Purple-600 background
 * - No icons
 * - Mobile responsive
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ContactChatModal from '../contact-assistant/ContactChatModal';

// Pages where the contact button should be hidden
const HIDDEN_PATHS = [
  '/interview-setup',
  '/interview',
  '/feedback',
  '/sign-in',
  '/sign-up',
  '/sso-callback',
];

const ContactButton: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if button should be hidden
  const shouldHide = HIDDEN_PATHS.some(path => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  );

  // Open modal handler
  const handleOpen = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  // Close modal handler
  const handleClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Success handler (optional: close modal after delay)
  const handleSuccess = useCallback(() => {
    // Keep modal open to show success message
    // User can close manually
  }, []);

  if (shouldHide) {
    return null;
  }

  return (
    <>
      {/* Floating Contact Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-4 right-4 z-[9990] 
          px-4 py-3 
          bg-purple-600 hover:bg-purple-700 
          text-white text-sm font-medium 
          rounded-full 
          shadow-lg hover:shadow-xl 
          transition-all duration-200 
          transform hover:scale-105 active:scale-95
          /* Mobile adjustments */
          sm:bottom-6 sm:right-6 sm:px-5 sm:py-3"
        aria-label={t('contactAssistant.button', 'Contact Us')}
      >
        {t('contactAssistant.button', 'Contact Us')}
      </button>

      {/* Contact Modal */}
      <ContactChatModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default ContactButton;
