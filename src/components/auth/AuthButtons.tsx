/**
 * OAuth Buttons Component
 * 
 * Google and Apple OAuth trigger buttons following Vocaid design.
 * Clean typography with black text on white backgrounds.
 * Dark purple border on hover.
 * 
 * @module components/auth/AuthButtons
 */

import React from 'react';
import { useSignUp, useSignIn } from '@clerk/clerk-react';
import { cn } from 'lib/utils';

interface AuthButtonsProps {
  mode: 'signUp' | 'signIn';
  className?: string;
  onError?: (error: string) => void;
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({
  mode,
  className,
  onError,
}) => {
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();

  const handleOAuthClick = async (strategy: 'oauth_google' | 'oauth_apple') => {
    try {
      const auth = mode === 'signUp' ? signUp : signIn;
      if (!auth) return;

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
    }
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Google Button */}
      <button
        type="button"
        onClick={() => handleOAuthClick('oauth_google')}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-3',
          'bg-white border border-zinc-200 rounded-lg',
          'text-sm font-semibold text-black',
          'transition-all duration-200',
          'hover:border-purple-600 hover:shadow-sm',
          'focus:outline-none focus:border-purple-600'
        )}
      >
        Continue with Google
      </button>

      {/* Apple Button */}
      <button
        type="button"
        onClick={() => handleOAuthClick('oauth_apple')}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-3',
          'bg-white border border-zinc-200 rounded-lg',
          'text-sm font-semibold text-black',
          'transition-all duration-200',
          'hover:border-purple-600 hover:shadow-sm',
          'focus:outline-none focus:border-purple-600'
        )}
      >
        Continue with Apple
      </button>
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
