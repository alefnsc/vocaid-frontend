/**
 * Feature Flags Configuration
 * 
 * Single source of truth for feature toggles.
 * Used to enable/disable features across the application.
 * 
 * B2B features are disabled until next release.
 */

export const FEATURES = {
  // ============================================
  // B2C: Interview Practice (ACTIVE)
  // ============================================
  B2C_INTERVIEW_PRACTICE_ENABLED: true,
  
  // ============================================
  // B2B: Recruiter Interview Platform (DISABLED)
  // ============================================
  B2B_RECRUITER_PLATFORM_ENABLED: false,
  
  // ============================================
  // HR: Employee Service Hub (DISABLED)
  // ============================================
  B2B_EMPLOYEE_HUB_ENABLED: false,
  
  // ============================================
  // Payment Providers
  // ============================================
  MERCADO_PAGO_ENABLED: true,
  STRIPE_ENABLED: false,
  
  // ============================================
  // Misc Features
  // ============================================
  RESUME_SCORING_ENABLED: true,
  ANALYTICS_FILTERS_ENABLED: true,
  DEVELOPER_PORTAL_ENABLED: false,
} as const;

/**
 * Copy for disabled features
 */
export const FEATURE_COPY = {
  UNDER_CONSTRUCTION_TITLE: 'Under Construction',
  UNDER_CONSTRUCTION_MESSAGE: 'This feature is coming in the next release. Stay tuned!',
  COMING_SOON_BADGE: 'Coming Soon',
  NEXT_RELEASE_LABEL: 'Next Release',
  JOIN_WAITLIST_CTA: 'Join Waitlist',
  NOTIFY_ME_CTA: 'Notify Me',
} as const;

/**
 * Check if a B2B feature is enabled
 */
export function isB2BFeatureEnabled(feature: 'recruiter' | 'hr'): boolean {
  if (feature === 'recruiter') {
    return FEATURES.B2B_RECRUITER_PLATFORM_ENABLED;
  }
  if (feature === 'hr') {
    return FEATURES.B2B_EMPLOYEE_HUB_ENABLED;
  }
  return false;
}

/**
 * Check if any B2B feature is enabled
 */
export function isAnyB2BEnabled(): boolean {
  return FEATURES.B2B_RECRUITER_PLATFORM_ENABLED || FEATURES.B2B_EMPLOYEE_HUB_ENABLED;
}

export type FeatureKey = keyof typeof FEATURES;
