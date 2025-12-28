/**
 * Auth Validation Schemas
 * 
 * Zod schemas for authentication form validation.
 * Follows Vocaid design language for error messaging.
 * 
 * @module components/auth/validation
 */

import { z } from 'zod';

// User roles for the application - expanded generic options
export const USER_ROLES = [
  'Candidate',
  'Student',
  'Junior Developer',
  'Mid-level Developer',
  'Senior Developer',
  'Tech Lead',
  'Engineering Manager',
  'Product Manager',
  'Data Analyst',
  'Data Engineer',
  'Recruiter',
  'HR / People Ops',
  'Other'
] as const;

export type UserRole = typeof USER_ROLES[number];

// Seniority levels for interview targeting
export const SENIORITY_LEVELS = [
  'Intern',
  'Junior',
  'Mid',
  'Senior',
  'Staff',
  'Principal',
  'Manager'
] as const;

export type SeniorityLevel = typeof SENIORITY_LEVELS[number];

// Supported countries for B2C (all enabled)
// ID verification is only available for Brazil users
export const SUPPORTED_COUNTRIES = [
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', enabled: true, idVerificationAvailable: true },
  { code: 'US', name: 'United States', flag: '🇺🇸', enabled: true, idVerificationAvailable: false },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', enabled: true, idVerificationAvailable: false },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', enabled: true, idVerificationAvailable: false },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', enabled: true, idVerificationAvailable: false },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', enabled: true, idVerificationAvailable: false },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', enabled: true, idVerificationAvailable: false },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', enabled: true, idVerificationAvailable: false },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', enabled: true, idVerificationAvailable: false },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', enabled: true, idVerificationAvailable: false },
] as const;

// Helper to check if ID verification is available for a country
export function isIdVerificationAvailable(countryCode: string): boolean {
  const country = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);
  return country?.idVerificationAvailable ?? false;
}

export type CountryCode = typeof SUPPORTED_COUNTRIES[number]['code'];

// Sign-up form validation schema
export const signUpSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: 'Please select a role' }),
  }),
  
  preferredLanguage: z.string().min(1, 'Please select a language'),
  
  countryCode: z.string().length(2, 'Please select a country').default('BR'),
});

// Sign-in form validation schema
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  password: z
    .string()
    .min(1, 'Password is required'),
});

// Verification code schema
export const verificationSchema = z.object({
  code: z
    .string()
    .min(6, 'Verification code must be 6 digits')
    .max(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  
  role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: 'Please select a role' }),
  }),
});

// Type exports for form data
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type VerificationFormData = z.infer<typeof verificationSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
