/**
 * Auth Input Component
 * 
 * Custom input field following Vocaid design language.
 * White background, 1px zinc-200 border, purple-600 focus state.
 * Error states use black border-b-2 with gray caption.
 * 
 * @module components/auth/AuthInput
 */

import React from 'react';
import { cn } from 'lib/utils';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          {label}
        </label>
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-white border rounded-lg text-sm text-zinc-900',
            'transition-all duration-200 outline-none',
            'placeholder:text-zinc-400',
            error 
              ? 'border-zinc-200 border-b-2 border-b-black' 
              : 'border-zinc-200 focus:border-purple-600',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-zinc-500">{error}</p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';

export default AuthInput;
