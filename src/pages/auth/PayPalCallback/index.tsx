/**
 * PayPal OAuth Callback Page
 * 
 * Handles the OAuth callback from PayPal after user authorization.
 * This is separate from Clerk SSO since PayPal uses custom OAuth.
 * 
 * @module pages/auth/PayPalCallback
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { config } from 'lib/config';

type CallbackStatus = 'processing' | 'success' | 'error';

const PayPalCallback: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoaded } = useUser();
  
  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get OAuth code from URL params
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Handle PayPal error response
        if (error) {
          console.error('PayPal OAuth error:', error, errorDescription);
          setStatus('error');
          setErrorMessage(errorDescription || 'PayPal authorization was denied.');
          return;
        }

        if (!code) {
          setStatus('error');
          setErrorMessage('No authorization code received from PayPal.');
          return;
        }

        // Wait for Clerk user to be loaded
        if (!isLoaded) return;

        // Exchange code for tokens via backend
        const response = await fetch(`${config.backendUrl}/api/auth/paypal/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id || '',
          },
          body: JSON.stringify({
            code,
            state,
            clerkUserId: user?.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to complete PayPal authentication');
        }

        const data = await response.json();
        
        if (data.status === 'success') {
          setStatus('success');
          
          // Redirect to dashboard or account page after short delay
          setTimeout(() => {
            navigate('/account?paypal=connected');
          }, 1500);
        } else {
          throw new Error(data.message || 'PayPal connection failed');
        }
      } catch (err: any) {
        console.error('PayPal callback error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'An unexpected error occurred.');
      }
    };

    if (isLoaded) {
      handleCallback();
    }
  }, [searchParams, isLoaded, user, navigate]);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="bg-white border border-zinc-200 rounded-xl p-8 max-w-md w-full mx-4 text-center">
        {status === 'processing' && (
          <>
            <div className="w-8 h-8 mx-auto mb-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">
              Connecting PayPal
            </h2>
            <p className="text-sm text-zinc-500">
              {t('auth.paypal.processing', 'Please wait while we complete your PayPal connection...')}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">
              PayPal Connected
            </h2>
            <p className="text-sm text-zinc-500">
              {t('auth.paypal.success', 'Your PayPal account has been connected successfully.')}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">
              Connection Failed
            </h2>
            <p className="text-sm text-zinc-500 mb-4">
              {errorMessage || t('auth.paypal.error', 'Failed to connect your PayPal account.')}
            </p>
            <button
              onClick={() => navigate('/account')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
            >
              Back to Account
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PayPalCallback;
