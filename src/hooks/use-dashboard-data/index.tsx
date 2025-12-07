import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import apiService, {
  DashboardStats,
  InterviewSummary,
  ScoreDataPoint,
  SpendingDataPoint
} from '../../services/APIService';

export interface DashboardData {
  stats: DashboardStats | null;
  interviews: InterviewSummary[];
  scoreData: ScoreDataPoint[];
  spendingData: SpendingDataPoint[];
}

export interface UseDashboardDataReturn {
  data: DashboardData;
  isLoading: boolean;
  error: string | null;
  refresh: (forceRefresh?: boolean) => Promise<void>;
}

/**
 * Shared hook for fetching dashboard data
 * Used by both Home and Dashboard pages to avoid duplicate logic
 * Leverages APIService caching to prevent redundant backend requests
 */
export function useDashboardData(interviewLimit = 5): UseDashboardDataReturn {
  const { user, isLoaded, isSignedIn } = useUser();
  
  const [data, setData] = useState<DashboardData>({
    stats: null,
    interviews: [],
    scoreData: [],
    spendingData: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all dashboard data in parallel
      // The APIService handles caching internally
      const [statsResult, interviewsResult, scoreResult, spendingResult] = await Promise.allSettled([
        apiService.getDashboardStats(user.id, forceRefresh),
        apiService.getUserInterviews(user.id, 1, interviewLimit, forceRefresh),
        apiService.getScoreEvolution(user.id, 6, forceRefresh),
        apiService.getSpendingHistory(user.id, 6, forceRefresh)
      ]);

      setData({
        stats: statsResult.status === 'fulfilled' ? statsResult.value : null,
        interviews: interviewsResult.status === 'fulfilled' ? interviewsResult.value.interviews : [],
        scoreData: scoreResult.status === 'fulfilled' ? scoreResult.value : [],
        spendingData: spendingResult.status === 'fulfilled' ? spendingResult.value : []
      });

      // Check if any requests failed
      const failures = [statsResult, interviewsResult, scoreResult, spendingResult]
        .filter(r => r.status === 'rejected');
      
      if (failures.length > 0) {
        console.warn('Some dashboard requests failed:', failures);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, interviewLimit]);

  // Fetch data when user is authenticated
  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      fetchData();
    } else if (isLoaded && !isSignedIn) {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, user?.id, fetchData]);

  // Refresh function for manual refresh with force option
  const refresh = useCallback(async (forceRefresh = true) => {
    await fetchData(forceRefresh);
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh
  };
}

export default useDashboardData;
