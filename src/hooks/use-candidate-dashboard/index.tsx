/**
 * useCandidateDashboard Hook
 * 
 * Unified hook for B2C candidate dashboard with filtering support.
 * Uses the new unified dashboard endpoint that returns all data in one request.
 * 
 * Features:
 * - Filter by date range, role, seniority, resume
 * - Caching with manual refresh
 * - Filter state management with URL sync
 * 
 * @module hooks/use-candidate-dashboard
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useUserContext } from '../../contexts/UserContext';
import apiService, {
  CandidateDashboardFilters,
  CandidateDashboardResponse,
  DashboardKPIs,
  ScoreEvolutionPoint,
  RecentInterview,
  ResumeUtilization,
  DashboardFilterOptions,
} from '../../services/APIService';

// ==========================================
// TYPES
// ==========================================

export interface DateRangePreset {
  key: 'last7days' | 'last30days' | 'last90days' | 'ytd' | 'custom' | 'all';
  label: string;
  getRange: () => { startDate?: string; endDate?: string };
}

export interface UseCandidateDashboardState {
  isLoading: boolean;
  error: string | null;
  kpis: DashboardKPIs | null;
  scoreEvolution: ScoreEvolutionPoint[];
  recentInterviews: RecentInterview[];
  resumes: ResumeUtilization[];
  filterOptions: DashboardFilterOptions | null;
  activeFilters: CandidateDashboardFilters;
}

export interface UseCandidateDashboardActions {
  refresh: (forceRefresh?: boolean) => Promise<void>;
  setDateRange: (preset: DateRangePreset['key'] | { startDate: string; endDate: string }) => void;
  setRoleFilter: (role: string | null) => void;
  setSeniorityFilter: (seniority: string | null) => void;
  setResumeFilter: (resumeId: string | null) => void;
  clearFilters: () => void;
  downloadResume: (resumeId: string) => Promise<void>;
}

export interface UseCandidateDashboardReturn extends UseCandidateDashboardState, UseCandidateDashboardActions {}

// ==========================================
// CONSTANTS
// ==========================================

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  {
    key: 'last7days',
    label: 'Last 7 Days',
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    },
  },
  {
    key: 'last30days',
    label: 'Last 30 Days',
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    },
  },
  {
    key: 'last90days',
    label: 'Last 90 Days',
    getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 90);
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    },
  },
  {
    key: 'ytd',
    label: 'Year to Date',
    getRange: () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), 0, 1);
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    },
  },
  {
    key: 'all',
    label: 'All Time',
    getRange: () => ({}),
  },
];

// ==========================================
// HOOK
// ==========================================

export function useCandidateDashboard(
  initialLimit = 10,
  syncToUrl = true
): UseCandidateDashboardReturn {
  const { user, isLoaded, isSignedIn } = useUser();
  const { isSynced } = useUserContext(); // Wait for user validation to complete
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<CandidateDashboardResponse | null>(null);

  // Parse initial filters from URL
  const initialFilters = useMemo<CandidateDashboardFilters>(() => {
    if (!syncToUrl) return { limit: initialLimit };
    
    return {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      roleTitle: searchParams.get('role') || undefined,
      seniority: searchParams.get('seniority') || undefined,
      resumeId: searchParams.get('resume') || undefined,
      limit: initialLimit,
    };
  }, [searchParams, initialLimit, syncToUrl]);

  const [activeFilters, setActiveFilters] = useState<CandidateDashboardFilters>(initialFilters);

  // Sync filters to URL
  const updateUrlParams = useCallback(
    (filters: CandidateDashboardFilters) => {
      if (!syncToUrl) return;

      const params = new URLSearchParams();
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      if (filters.roleTitle) params.set('role', filters.roleTitle);
      if (filters.seniority) params.set('seniority', filters.seniority);
      if (filters.resumeId) params.set('resume', filters.resumeId);

      setSearchParams(params, { replace: true });
    },
    [syncToUrl, setSearchParams]
  );

  // Fetch dashboard data
  const fetchDashboard = useCallback(
    async (forceRefresh = false) => {
      // Wait for both Clerk auth AND user validation/sync to complete
      if (!user?.id || !isSignedIn || !isSynced) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await apiService.getCandidateDashboard(user.id, activeFilters, forceRefresh);
        setDashboardData(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard';
        setError(message);
        console.error('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id, isSignedIn, isSynced, activeFilters]
  );

  // Initial fetch - only when user is synced with backend
  useEffect(() => {
    if (isLoaded && isSignedIn && isSynced) {
      fetchDashboard();
    }
  }, [isLoaded, isSignedIn, isSynced, fetchDashboard]);

  // Actions
  const refresh = useCallback(
    async (forceRefresh = true) => {
      await fetchDashboard(forceRefresh);
    },
    [fetchDashboard]
  );

  const setDateRange = useCallback(
    (preset: DateRangePreset['key'] | { startDate: string; endDate: string }) => {
      let newFilters: CandidateDashboardFilters;

      if (typeof preset === 'string') {
        const presetConfig = DATE_RANGE_PRESETS.find((p) => p.key === preset);
        if (!presetConfig) return;

        const range = presetConfig.getRange();
        newFilters = {
          ...activeFilters,
          startDate: range.startDate,
          endDate: range.endDate,
        };
      } else {
        newFilters = {
          ...activeFilters,
          startDate: preset.startDate,
          endDate: preset.endDate,
        };
      }

      setActiveFilters(newFilters);
      updateUrlParams(newFilters);
    },
    [activeFilters, updateUrlParams]
  );

  const setRoleFilter = useCallback(
    (role: string | null) => {
      const newFilters = {
        ...activeFilters,
        roleTitle: role || undefined,
      };
      setActiveFilters(newFilters);
      updateUrlParams(newFilters);
    },
    [activeFilters, updateUrlParams]
  );

  const setSeniorityFilter = useCallback(
    (seniority: string | null) => {
      const newFilters = {
        ...activeFilters,
        seniority: seniority || undefined,
      };
      setActiveFilters(newFilters);
      updateUrlParams(newFilters);
    },
    [activeFilters, updateUrlParams]
  );

  const setResumeFilter = useCallback(
    (resumeId: string | null) => {
      const newFilters = {
        ...activeFilters,
        resumeId: resumeId || undefined,
      };
      setActiveFilters(newFilters);
      updateUrlParams(newFilters);
    },
    [activeFilters, updateUrlParams]
  );

  const clearFilters = useCallback(() => {
    const newFilters: CandidateDashboardFilters = { limit: initialLimit };
    setActiveFilters(newFilters);
    updateUrlParams(newFilters);
  }, [initialLimit, updateUrlParams]);

  const downloadResume = useCallback(
    async (resumeId: string) => {
      if (!user?.id) return;

      try {
        const { fileName, mimeType, base64 } = await apiService.downloadResume(user.id, resumeId);

        // Convert base64 to blob and trigger download
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Resume download error:', err);
        throw err;
      }
    },
    [user?.id]
  );

  // Return memoized values
  return useMemo(
    () => ({
      isLoading,
      error,
      kpis: dashboardData?.kpis || null,
      scoreEvolution: dashboardData?.scoreEvolution || [],
      recentInterviews: dashboardData?.recentInterviews || [],
      resumes: dashboardData?.resumes || [],
      filterOptions: dashboardData?.filterOptions || null,
      activeFilters,
      refresh,
      setDateRange,
      setRoleFilter,
      setSeniorityFilter,
      setResumeFilter,
      clearFilters,
      downloadResume,
    }),
    [
      isLoading,
      error,
      dashboardData,
      activeFilters,
      refresh,
      setDateRange,
      setRoleFilter,
      setSeniorityFilter,
      setResumeFilter,
      clearFilters,
      downloadResume,
    ]
  );
}

export default useCandidateDashboard;
