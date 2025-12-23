/**
 * Auth Select Component
 * 
 * Custom select dropdown following Vocaid design language.
 * White background, 1px zinc-200 border, purple-600 focus state.
 * 
 * @module components/auth/AuthSelect
 */

import React from 'react';
import { cn } from 'lib/utils';

interface SelectOption {
  value: string;
  label: string;
  flag?: string;
}

interface AuthSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
  className?: string;
}

export const AuthSelect: React.FC<AuthSelectProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  placeholder = 'Select an option',
  className,
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full px-4 py-3 bg-white border rounded-lg text-sm appearance-none cursor-pointer',
            'transition-all duration-200 outline-none',
            !value && 'text-zinc-400',
            value && 'text-zinc-900',
            error 
              ? 'border-zinc-200 border-b-2 border-b-black' 
              : 'border-zinc-200 focus:border-purple-600',
            className
          )}
        >
          <option value="" disabled className="text-zinc-400">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-zinc-900">
              {option.flag ? `${option.flag} ${option.label}` : option.label}
            </option>
          ))}
        </select>
        
        {/* Custom chevron icon */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg 
            className="w-4 h-4 text-zinc-400"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-zinc-500">{error}</p>
      )}
    </div>
  );
};

export default AuthSelect;
