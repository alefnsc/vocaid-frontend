/**
 * Dashboard Query Hooks
 * 
 * React Query hooks for dashboard data fetching with:
 * - Automatic caching and deduplication
 * - Background refetching
 * - Optimistic updates
 * - Error handling
 * - Mock data fallback for development
 * 
 * These hooks wrap the existing APIService methods with React Query.
 * 
 * @module hooks/queries/useDashboardQueries
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';
import { useUserContext } from '../../contexts/UserContext';
import { queryKeys } from '../../lib/queryClient';
import apiService, {
  CandidateDashboardFilters,
  CandidateDashboardResponse,
} from '../../services/APIService';
import { isMockDataEnabled, getMockDashboardData } from '../../config/mockData';

// ============================================
// MOCK DATA TRANSFORMER
// ============================================

/**
 * Transform mock data to match the CandidateDashboardResponse type
 */
function transformMockToDashboardResponse(): CandidateDashboardResponse {
  const mockData = getMockDashboardData();
  
  return {
    recentInterviews: mockData.recentInterviews.map(i => ({
      id: i.id,
      date: i.date,
      roleTitle: i.roleTitle,
      companyName: i.companyName,
      seniority: i.seniority,
      resumeTitle: null,
      resumeId: null,
      durationMinutes: i.duration,
      score: i.score,
      status: 'COMPLETED',
    })),
    kpis: {
      totalInterviews: mockData.kpis.totalInterviews,
      completedInterviews: mockData.kpis.totalInterviews,
      averageScore: mockData.kpis.averageScore,
      scoreChange: mockData.kpis.scoreChange,
      averageDurationMinutes: Math.round(mockData.kpis.totalDuration / mockData.kpis.totalInterviews),
      totalSpent: mockData.kpis.totalInterviews * 2, // 2 credits per interview
      creditsRemaining: 10,
      interviewsThisMonth: mockData.kpis.totalInterviews,
      passRate: 0.8,
    },
    scoreEvolution: mockData.scoreEvolution.map(p => ({
      date: p.date,
      score: p.score,
      roleTitle: 'Practice Interview',
      seniority: null,
    })),
    resumes: [],
    filterOptions: {
      roleTitles: ['Frontend Developer', 'Backend Developer', 'Full Stack Engineer'],
      seniorities: ['junior', 'mid', 'senior'],
      resumes: [],
    },
    filters: {
      startDate: null,
      endDate: null,
      roleTitle: null,
      seniority: null,
      resumeId: null,
    },
  };
}

// ============================================
// DASHBOARD QUERY
// ============================================

interface UseDashboardQueryOptions {
  filters?: CandidateDashboardFilters;
  enabled?: boolean;
}

/**
 * Query hook for fetching candidate dashboard data
 * 
 * Supports mock data fallback when REACT_APP_USE_MOCK_DATA=true
 * 
 * @example
 * const { data, isLoading, error, refetch } = useDashboardQuery({
 *   filters: { roleTitle: 'Software Engineer', limit: 10 }
 * });
 */
export function useDashboardQuery(options: UseDashboardQueryOptions = {}) {
  const { user, isSignedIn, isLoaded } = useUser();
  const { isSynced } = useUserContext();
  const { filters = {}, enabled = true } = options;

  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 useDashboardQuery state:', {
      userId: user?.id?.slice(0, 15),
      isSignedIn,
      isLoaded,
      isSynced,
      mockDataEnabled: isMockDataEnabled(),
      queryEnabled: enabled && isLoaded && isSignedIn && (isMockDataEnabled() || (isSynced && !!user?.id)),
    });
  }

  return useQuery({
    queryKey: queryKeys.dashboard.stats(user?.id || '', filters),
    queryFn: async (): Promise<CandidateDashboardResponse> => {
      // Use mock data in development when enabled
      if (isMockDataEnabled()) {
        console.log('🧪 Using mock dashboard data');
        return transformMockToDashboardResponse();
      }
      
      if (!user?.id) throw new Error('User not authenticated');
      
      console.log('📡 Fetching dashboard data for user:', user.id.slice(0, 15));
      
      const result = await apiService.getCandidateDashboard(user.id, filters, false);
      
      console.log('📊 Dashboard data received:', {
        interviewCount: result.recentInterviews?.length ?? 0,
        scoreEvolutionPoints: result.scoreEvolution?.length ?? 0,
        avgScore: result.kpis?.averageScore,
      });
      
      return result;
    },
    enabled: enabled && isLoaded && isSignedIn && (isMockDataEnabled() || (isSynced && !!user?.id)),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Prefetch dashboard data (useful for route transitions)
 */
export function usePrefetchDashboard() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return async (filters?: CandidateDashboardFilters) => {
    if (!user?.id) return;
    
    await queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.stats(user.id, filters),
      queryFn: () => apiService.getCandidateDashboard(user.id, filters, false),
      staleTime: 60 * 1000,
    });
  };
}

// ============================================
// DASHBOARD MUTATIONS
// ============================================

/**
 * Mutation hook for manually refreshing dashboard data
 */
export function useRefreshDashboard() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (filters?: CandidateDashboardFilters) => {
      if (!user?.id) throw new Error('User not authenticated');
      return apiService.getCandidateDashboard(user.id, filters, true);
    },
    onSuccess: (data, filters) => {
      // Update the cache with fresh data
      queryClient.setQueryData(
        queryKeys.dashboard.stats(user?.id || '', filters),
        data
      );
    },
  });
}

export default useDashboardQuery;
