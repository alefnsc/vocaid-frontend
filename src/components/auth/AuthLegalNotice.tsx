/**
 * Auth Legal Notice Component
 * 
 * Terms of Use and Privacy Policy links for auth forms.
 * Opens legal content in a modal instead of navigating away.
 * 
 * @module components/auth/AuthLegalNotice
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from 'lib/utils';
import { LegalModal, LegalDocType } from './LegalModal';

interface AuthLegalNoticeProps {
  /** Optional class name */
  className?: string;
  /** Show consent checkboxes (for sign-up) */
  showCheckboxes?: boolean;
  /** Terms acceptance state */
  termsAccepted?: boolean;
  /** Terms change handler */
  onTermsChange?: (accepted: boolean) => void;
  /** Marketing opt-in state */
  marketingOptIn?: boolean;
  /** Marketing opt-in change handler */
  onMarketingChange?: (accepted: boolean) => void;
}

export const AuthLegalNotice: React.FC<AuthLegalNoticeProps> = ({
  className,
  showCheckboxes = false,
  termsAccepted = false,
  onTermsChange,
  marketingOptIn = false,
  onMarketingChange,
}) => {
  const { t } = useTranslation();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<LegalDocType>('privacy');

  // Open modal with specific document
  const openModal = (doc: LegalDocType, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDoc(doc);
    setModalOpen(true);
  };

  // Link styling - now as button-style links
  const linkClass = 'text-purple-600 hover:underline focus:outline-none focus:underline cursor-pointer';

  if (showCheckboxes) {
    return (
      <>
        <div className={cn('space-y-3', className)}>
          {/* Divider */}
          <div className="border-t border-zinc-200 my-4" />
          
          {/* Terms acceptance checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => onTermsChange?.(e.target.checked)}
              className={cn(
                'mt-0.5 h-4 w-4 rounded border-zinc-300',
                'text-purple-600 focus:ring-purple-600 focus:ring-offset-2',
                'cursor-pointer'
              )}
            />
            <span className="text-xs text-zinc-600 leading-relaxed">
              {t('auth.legal.agreeToTerms', 'I agree to the')}{' '}
              <button 
                type="button"
                onClick={(e) => openModal('terms', e)}
                className={linkClass}
              >
                {t('auth.legal.termsOfUse', 'Terms of Use')}
              </button>
              {' '}{t('auth.legal.and', 'and')}{' '}
              <button 
                type="button"
                onClick={(e) => openModal('privacy', e)}
                className={linkClass}
              >
                {t('auth.legal.privacyPolicy', 'Privacy Policy')}
              </button>
            </span>
          </label>
          
          {/* Marketing opt-in checkbox (optional) */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => onMarketingChange?.(e.target.checked)}
              className={cn(
                'mt-0.5 h-4 w-4 rounded border-zinc-300',
                'text-purple-600 focus:ring-purple-600 focus:ring-offset-2',
                'cursor-pointer'
              )}
            />
            <span className="text-xs text-zinc-500 leading-relaxed">
              {t('auth.legal.marketingOptIn', 'Send me tips and updates about improving my interview skills')}
            </span>
          </label>
        </div>

        {/* Legal Modal */}
        <LegalModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          activeDoc={activeDoc}
          onDocChange={setActiveDoc}
        />
      </>
    );
  }

  // Simple text-only legal notice (for sign-in)
  return (
    <>
      <div className={cn('text-center', className)}>
        <p className="text-xs text-zinc-500 leading-relaxed">
          {t('auth.legal.byContinuing', 'By continuing, you agree to the')}{' '}
          <button 
            type="button"
            onClick={(e) => openModal('terms', e)}
            className={linkClass}
          >
            {t('auth.legal.termsOfUse', 'Terms of Use')}
          </button>
          {' '}{t('auth.legal.and', 'and')}{' '}
          <button 
            type="button"
            onClick={(e) => openModal('privacy', e)}
            className={linkClass}
          >
            {t('auth.legal.privacyPolicy', 'Privacy Policy')}
          </button>
        </p>
      </div>

      {/* Legal Modal */}
      <LegalModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        activeDoc={activeDoc}
        onDocChange={setActiveDoc}
      />
    </>
  );
};

export default AuthLegalNotice;
