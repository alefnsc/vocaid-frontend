/**
 * SSO Callback Page
 * 
 * Handles OAuth redirects from Google/Apple/Microsoft authentication.
 * Uses Clerk's AuthenticateWithRedirectCallback.
 * 
 * @module pages/SSOCallback
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

const SSOCallback: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-500">{t('auth.sso.completing', 'Completing sign in...')}</p>
      </div>
      <AuthenticateWithRedirectCallback 
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        signInForceRedirectUrl="/app/b2c/dashboard"
        signUpForceRedirectUrl="/app/b2c/dashboard"
      />
    </div>
  );
};

export default SSOCallback;
