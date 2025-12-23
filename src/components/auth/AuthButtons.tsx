/**
 * OAuth Buttons Component
 * 
 * OAuth trigger buttons following Vocaid design.
 * Supports: Google, Apple, Microsoft, LinkedIn
 * Clean typography with black text on white backgrounds.
 * Dark purple border on hover. No icons per design standards.
 * 
 * @module components/auth/AuthButtons
 */

import React, { useState } from 'react';
import { useSignUp, useSignIn } from '@clerk/clerk-react';
import { cn } from 'lib/utils';
import { config } from 'lib/config';

// Clerk OAuth strategy types
type ClerkOAuthStrategy = 
  | 'oauth_google' 
  | 'oauth_apple' 
  | 'oauth_microsoft'
  | 'oauth_linkedin_oidc';

// PayPal uses custom OAuth, not Clerk
type CustomOAuthProvider = 'paypal';

interface AuthButtonsProps {
  mode: 'signUp' | 'signIn';
  className?: string;
  onError?: (error: string) => void;
  showPayPal?: boolean; // Optional PayPal button for payment linking
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({
  mode,
  className,
  onError,
  showPayPal = false,
}) => {
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  // Handle Clerk OAuth (Google, Apple, Microsoft, LinkedIn)
  const handleClerkOAuth = async (strategy: ClerkOAuthStrategy) => {
    try {
      setLoadingProvider(strategy);
      const auth = mode === 'signUp' ? signUp : signIn;
      if (!auth) {
        onError?.('Authentication service not ready. Please try again.');
        return;
      }

      // Use the current window origin for redirect URLs
      const baseUrl = window.location.origin;
      
      await auth.authenticateWithRedirect({
        strategy,
        redirectUrl: `${baseUrl}/sso-callback`,
        redirectUrlComplete: `${baseUrl}/dashboard`,
      });
    } catch (error: any) {
      console.error('OAuth error:', error);
      onError?.(error.errors?.[0]?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  };

  // Handle PayPal custom OAuth (not through Clerk)
  const handlePayPalOAuth = async () => {
    try {
      setLoadingProvider('paypal');
      
      // PayPal OAuth is handled by our backend, not Clerk
      const baseUrl = window.location.origin;
      const backendUrl = config.backendUrl;
      
      // Start PayPal OAuth flow via backend
      const response = await fetch(`${backendUrl}/api/auth/paypal/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redirectUrl: `${baseUrl}/auth/paypal/callback`,
          mode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start PayPal authentication');
      }

      const data = await response.json();
      
      if (data.authUrl) {
        // Redirect to PayPal
        window.location.href = data.authUrl;
      } else {
        throw new Error('No PayPal auth URL received');
      }
    } catch (error: any) {
      console.error('PayPal OAuth error:', error);
      onError?.(error.message || 'PayPal authentication failed. Please try again.');
    } finally {
      setLoadingProvider(null);
    }
  };

  // Button style based on loading state
  const getButtonClass = (provider: string) => cn(
    'w-full flex items-center justify-center gap-2 px-4 py-3',
    'bg-white border border-zinc-200 rounded-lg',
    'text-sm font-semibold text-black',
    'transition-all duration-200',
    'hover:border-purple-600 hover:shadow-sm',
    'focus:outline-none focus:border-purple-600',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    loadingProvider === provider && 'opacity-70 cursor-wait'
  );

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Google Button */}
      <button
        type="button"
        onClick={() => handleClerkOAuth('oauth_google')}
        disabled={loadingProvider !== null}
        className={getButtonClass('oauth_google')}
      >
        {loadingProvider === 'oauth_google' ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
            Connecting...
          </span>
        ) : (
          'Continue with Google'
        )}
      </button>

      {/* Apple Button */}
      <button
        type="button"
        onClick={() => handleClerkOAuth('oauth_apple')}
        disabled={loadingProvider !== null}
        className={getButtonClass('oauth_apple')}
      >
        {loadingProvider === 'oauth_apple' ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
            Connecting...
          </span>
        ) : (
          'Continue with Apple'
        )}
      </button>

      {/* Microsoft Button */}
      <button
        type="button"
        onClick={() => handleClerkOAuth('oauth_microsoft')}
        disabled={loadingProvider !== null}
        className={getButtonClass('oauth_microsoft')}
      >
        {loadingProvider === 'oauth_microsoft' ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
            Connecting...
          </span>
        ) : (
          'Continue with Microsoft'
        )}
      </button>

      {/* LinkedIn Button */}
      <button
        type="button"
        onClick={() => handleClerkOAuth('oauth_linkedin_oidc')}
        disabled={loadingProvider !== null}
        className={getButtonClass('oauth_linkedin_oidc')}
      >
        {loadingProvider === 'oauth_linkedin_oidc' ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
            Connecting...
          </span>
        ) : (
          'Continue with LinkedIn'
        )}
      </button>

      {/* PayPal Button (optional, for payment linking) */}
      {showPayPal && (
        <button
          type="button"
          onClick={handlePayPalOAuth}
          disabled={loadingProvider !== null}
          className={getButtonClass('paypal')}
        >
          {loadingProvider === 'paypal' ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              Connecting...
            </span>
          ) : (
            'Continue with PayPal'
          )}
        </button>
      )}
    </div>
  );
};

// Divider component for separating OAuth from email form
export const AuthDivider: React.FC<{ text?: string }> = ({ text = 'or' }) => {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-zinc-200" />
      <span className="text-sm font-medium text-zinc-400 uppercase tracking-wide">{text}</span>
      <div className="flex-1 h-px bg-zinc-200" />
    </div>
  );
};

export default AuthButtons;
