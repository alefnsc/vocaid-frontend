/**
 * Interview Analytics Section Component
 * 
 * Displays advanced analytics: soft skills, transcript, benchmark, learning path.
 * 
 * @module pages/InterviewDetails/components/InterviewAnalyticsSection
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AnalysisDashboard,
  TranscriptViewer,
  ComparativeBenchmark,
  LearningPath,
  type TimelineDataPoint,
  type SoftSkillsData,
  type TranscriptSegment,
  type BenchmarkData,
  type LearningPathData,
} from 'components/analytics';

// ========================================
// TYPES
// ========================================

interface InterviewAnalyticsSectionProps {
  /** Timeline data for analysis dashboard */
  timelineData: TimelineDataPoint[];
  /** Soft skills radar data */
  softSkills: SoftSkillsData | null;
  /** Total call duration in seconds */
  callDuration: number;
  /** Transcript segments */
  transcript: TranscriptSegment[];
  /** Benchmark comparison data */
  benchmark: BenchmarkData | null;
  /** Learning path recommendations */
  learningPathData: LearningPathData | null;
  /** Current playback time for transcript sync */
  currentTime: number;
  /** Handler for seeking to transcript segment */
  onSeek: (timestamp: number) => void;
  /** Whether analytics data is still loading */
  isLoading?: boolean;
}

// ========================================
// COMPONENT
// ========================================

export const InterviewAnalyticsSection: React.FC<InterviewAnalyticsSectionProps> = ({
  timelineData,
  softSkills,
  callDuration,
  transcript,
  benchmark,
  learningPathData,
  currentTime,
  onSeek,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  // Don't render if no analytics data available
  const hasAnalytics = softSkills || transcript.length > 0 || benchmark || learningPathData;
  
  if (!hasAnalytics && !isLoading) {
    return null;
  }

  return (
    <div className="mt-8 pt-8 border-t border-zinc-200">
      <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-6">
        {t('interviewDetails.analytics.title', 'Advanced')}{' '}
        <span className="text-purple-600">{t('interviewDetails.analytics.highlight', 'Analytics')}</span>
      </h2>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-zinc-500">
              {t('interviewDetails.loadingAnalytics', 'Loading advanced analytics...')}
            </p>
          </div>
        </div>
      )}

      {/* Analytics Content */}
      {!isLoading && hasAnalytics && (
        <>
          {/* Analysis Dashboard - Radar + Timeline */}
          {softSkills && (
            <div className="mb-6 sm:mb-8">
              <AnalysisDashboard 
                timelineData={timelineData}
                softSkills={softSkills}
                callDuration={callDuration}
              />
            </div>
          )}

          {/* Two Column Layout for Transcript and Benchmark */}
          {(transcript.length > 0 || benchmark) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
              {/* Transcript Viewer */}
              {transcript.length > 0 && (
                <TranscriptViewer
                  segments={transcript}
                  currentTime={currentTime}
                  onSeek={onSeek}
                />
              )}

              {/* Comparative Benchmark */}
              {benchmark && (
                <ComparativeBenchmark data={benchmark} />
              )}
            </div>
          )}

          {/* Learning Path - Full Width */}
          {learningPathData && (
            <div className="mb-6 sm:mb-8">
              <LearningPath data={learningPathData} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InterviewAnalyticsSection;
