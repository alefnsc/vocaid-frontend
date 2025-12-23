/**
 * Registration Metadata Hook
 * 
 * Captures and syncs user registration metadata to Clerk publicMetadata.
 * This includes geolocation data, preferred language, and onboarding status.
 * 
 * @module hooks/use-registration-metadata
 */

import { useCallback, useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { detectGeolocation, GeoLocation } from '../../lib/geolocation';
import { getCurrentLanguage, SupportedLanguageCode } from '../../lib/i18n';

// ========================================
// TYPES
// ========================================

export interface RegistrationMetadata {
  // Onboarding
  onboarding_complete: boolean;
  
  // Language & Localization
  preferred_language: SupportedLanguageCode;
  languageSetByUser: boolean;
  
  // Registration Geolocation
  registration_region?: string;
  registration_country?: string;
  initial_ip?: string;
  
  // Timestamps
  registered_at?: string;
  metadata_updated_at?: string;
}

interface UseRegistrationMetadataReturn {
  // State
  metadata: RegistrationMetadata | null;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  
  // Actions
  captureRegistrationData: () => Promise<RegistrationMetadata | null>;
  updateMetadata: (updates: Partial<RegistrationMetadata>) => Promise<boolean>;
  markOnboardingComplete: () => Promise<boolean>;
  updatePreferredLanguage: (language: SupportedLanguageCode, setByUser?: boolean) => Promise<boolean>;
  
  // Status checks
  isNewUser: boolean;
  needsOnboarding: boolean;
}

// ========================================
// HOOK
// ========================================

export function useRegistrationMetadata(): UseRegistrationMetadataReturn {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { isSignedIn } = useAuth();
  
  const [metadata, setMetadata] = useState<RegistrationMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Derived state
  const isNewUser = !!(user && !user.publicMetadata?.registered_at);
  const needsOnboarding = !!(user && user.publicMetadata?.onboarding_complete !== true);
  
  /**
   * Get current metadata from Clerk (checks both unsafeMetadata and publicMetadata)
   */
  const getCurrentMetadata = useCallback((): RegistrationMetadata | null => {
    if (!user) return null;
    
    // Use unsafeMetadata as primary source (can be set from client)
    // Fall back to publicMetadata (set from backend/webhook)
    const um = user.unsafeMetadata || {};
    const pm = user.publicMetadata || {};
    
    return {
      onboarding_complete: (um.onboarding_complete ?? pm.onboarding_complete) as boolean ?? false,
      preferred_language: (um.preferred_language ?? pm.preferred_language) as SupportedLanguageCode ?? 'en-US',
      languageSetByUser: (um.languageSetByUser ?? pm.languageSetByUser) as boolean ?? false,
      registration_region: (um.registration_region ?? pm.registration_region) as string,
      registration_country: (um.registration_country ?? pm.registration_country) as string,
      initial_ip: (um.initial_ip ?? pm.initial_ip) as string,
      registered_at: (um.registered_at ?? pm.registered_at) as string,
      metadata_updated_at: (um.metadata_updated_at ?? pm.metadata_updated_at) as string,
    };
  }, [user]);
  
  /**
   * Capture registration data for new users
   * Called once on first sign-up to capture initial geolocation
   */
  const captureRegistrationData = useCallback(async (): Promise<RegistrationMetadata | null> => {
    if (!user) {
      console.warn('Cannot capture registration data: No user');
      return null;
    }
    
    // Don't re-capture if already registered
    if (user.publicMetadata?.registered_at) {
      console.log('User already has registration data');
      return getCurrentMetadata();
    }
    
    setIsSyncing(true);
    setError(null);
    
    try {
      // Detect geolocation
      const geo: GeoLocation | null = await detectGeolocation();
      
      // Build registration metadata
      const registrationData: RegistrationMetadata = {
        onboarding_complete: false,
        preferred_language: geo?.inferredLanguage as SupportedLanguageCode ?? getCurrentLanguage(),
        languageSetByUser: false,
        registration_region: geo?.region,
        registration_country: geo?.country,
        initial_ip: geo?.ip,
        registered_at: new Date().toISOString(),
        metadata_updated_at: new Date().toISOString(),
      };
      
      // Sync to Clerk using unsafeMetadata (publicMetadata can only be set from backend)
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          ...registrationData,
        },
      });
      
      setMetadata(registrationData);
      console.log('Registration data captured:', registrationData);
      
      return registrationData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to capture registration data';
      console.error('Failed to capture registration data:', err);
      setError(message);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [user, getCurrentMetadata]);
  
  /**
   * Update specific metadata fields
   */
  const updateMetadata = useCallback(async (updates: Partial<RegistrationMetadata>): Promise<boolean> => {
    if (!user) {
      console.warn('Cannot update metadata: No user');
      return false;
    }
    
    setIsSyncing(true);
    setError(null);
    
    try {
      const updatedData = {
        ...updates,
        metadata_updated_at: new Date().toISOString(),
      };
      
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          ...updatedData,
        },
      });
      
      setMetadata(prev => prev ? { ...prev, ...updatedData } : null);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update metadata';
      console.error('Failed to update metadata:', err);
      setError(message);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user]);
  
  /**
   * Mark onboarding as complete
   */
  const markOnboardingComplete = useCallback(async (): Promise<boolean> => {
    return updateMetadata({ onboarding_complete: true });
  }, [updateMetadata]);
  
  /**
   * Update preferred language
   */
  const updatePreferredLanguage = useCallback(async (
    language: SupportedLanguageCode, 
    setByUser: boolean = true
  ): Promise<boolean> => {
    return updateMetadata({ 
      preferred_language: language, 
      languageSetByUser: setByUser 
    });
  }, [updateMetadata]);
  
  // Load metadata when user is available
  useEffect(() => {
    if (!isUserLoaded) return;
    
    if (!isSignedIn || !user) {
      setMetadata(null);
      setIsLoading(false);
      return;
    }
    
    // Get existing metadata
    const existing = getCurrentMetadata();
    setMetadata(existing);
    setIsLoading(false);
    
    // If new user, capture registration data
    if (!existing?.registered_at) {
      captureRegistrationData();
    }
  }, [isUserLoaded, isSignedIn, user, getCurrentMetadata, captureRegistrationData]);
  
  return {
    metadata,
    isLoading,
    isSyncing,
    error,
    captureRegistrationData,
    updateMetadata,
    markOnboardingComplete,
    updatePreferredLanguage,
    isNewUser,
    needsOnboarding,
  };
}

export default useRegistrationMetadata;
