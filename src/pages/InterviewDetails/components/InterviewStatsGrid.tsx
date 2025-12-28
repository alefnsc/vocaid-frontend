/**
 * Interview Stats Grid Component
 * 
 * Displays key interview metadata in a responsive grid.
 * 
 * @module pages/InterviewDetails/components/InterviewStatsGrid
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, Building2, Calendar, Clock, Award } from 'lucide-react';
import StatsCard from 'components/ui/stats-card';

// ========================================
// TYPES
// ========================================

interface InterviewStatsGridProps {
  position: string;
  company: string;
  date: string;
  duration: string;
  score: number | string | null;
}

// ========================================
// COMPONENT
// ========================================

export const InterviewStatsGrid: React.FC<InterviewStatsGridProps> = ({
  position,
  company,
  date,
  duration,
  score,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
      <StatsCard
        title={t('interviewDetails.stats.position', 'Position')}
        value={position}
        icon={<Briefcase />}
        size="small"
      />
      <StatsCard
        title={t('interviewDetails.stats.company', 'Company')}
        value={company}
        icon={<Building2 />}
        size="small"
      />
      <StatsCard
        title={t('interviewDetails.stats.date', 'Date')}
        value={date}
        icon={<Calendar />}
        size="small"
      />
      <StatsCard
        title={t('interviewDetails.stats.duration', 'Duration')}
        value={duration}
        icon={<Clock />}
      />
      <StatsCard
        title={t('interviewDetails.stats.score', 'Score')}
        value={score !== null ? score : 'N/A'}
        icon={<Award />}
      />
    </div>
  );
};

export default InterviewStatsGrid;
