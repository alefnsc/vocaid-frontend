/**
 * ComparativeBenchmark Component ("The Ranker")
 * Compares user's score against global average for their role
 * 
 * Design: Vocaid system (grayscale + purple-600, typography-driven, no icons)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type TFunction = ReturnType<typeof useTranslation>['t'];

// ========================================
// TYPES
// ========================================

export interface BenchmarkData {
  userScore: number;
  globalAverage: number;
  percentile: number; // 0-100, percentage of candidates scored below
  roleTitle: string;
  totalCandidates: number;
  breakdown?: {
    communication: { user: number; average: number };
    problemSolving: { user: number; average: number };
    technicalDepth: { user: number; average: number };
    leadership: { user: number; average: number };
    adaptability: { user: number; average: number };
  };
}

interface ComparativeBenchmarkProps {
  data: BenchmarkData | null;
  isLoading?: boolean;
}

// ========================================
// PERCENTILE BAR COMPONENT
// ========================================

const PercentileBar: React.FC<{ percentile: number; roleTitle: string; t: TFunction }> = ({ 
  percentile, 
  roleTitle,
  t 
}) => {
  // Determine performance tier
  const getTier = (p: number) => {
    if (p >= 90) return { label: t('analytics.benchmark.tiers.topPerformer'), color: 'text-purple-600' };
    if (p >= 75) return { label: t('analytics.benchmark.tiers.aboveAverage'), color: 'text-zinc-700' };
    if (p >= 50) return { label: t('analytics.benchmark.tiers.average'), color: 'text-zinc-600' };
    if (p >= 25) return { label: t('analytics.benchmark.tiers.belowAverage'), color: 'text-zinc-500' };
    return { label: t('analytics.benchmark.tiers.needsWork'), color: 'text-zinc-400' };
  };
  
  const tier = getTier(percentile);

  return (
    <div className="space-y-4">
      {/* Main statement */}
      <div className="text-center">
        <p className="text-lg text-zinc-700">
          {t('analytics.benchmark.scoredHigherThan')} <span className="text-3xl font-bold text-purple-600">{Math.round(percentile)}%</span>
        </p>
        <p className="text-sm text-zinc-500 mt-1">
          {t('analytics.benchmark.ofCandidatesFor')} <span className="font-medium text-zinc-700">{roleTitle}</span>
        </p>
      </div>
      
      {/* Horizontal percentile bar */}
      <div className="relative h-8 bg-zinc-200 rounded-full overflow-hidden">
        {/* Gradient background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(90deg, #f4f4f5 0%, #e4e4e7 25%, #d4d4d8 50%, #a1a1aa 75%, #9333ea 100%)'
          }}
        />
        
        {/* Percentile markers */}
        {[25, 50, 75].map(mark => (
          <div 
            key={mark}
            className="absolute top-0 bottom-0 w-px bg-zinc-300"
            style={{ left: `${mark}%` }}
          />
        ))}
        
        {/* User position indicator */}
        <motion.div
          className="absolute top-0 bottom-0 flex items-center"
          style={{ left: `${percentile}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="relative">
            <div className="w-4 h-4 bg-purple-600 rounded-full shadow-lg transform -translate-x-1/2" />
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs font-bold text-purple-600">{tier.label}</span>
            </div>
          </div>
        </motion.div>
        
        {/* Filled progress */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-purple-600/30"
          initial={{ width: 0 }}
          animate={{ width: `${percentile}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      
      {/* Scale labels */}
      <div className="flex justify-between text-xs text-zinc-400 px-1">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

// ========================================
// SCORE COMPARISON COMPONENT
// ========================================

const ScoreComparison: React.FC<{ 
  label: string; 
  userScore: number; 
  averageScore: number;
  t: TFunction 
}> = ({ label, userScore, averageScore, t }) => {
  const diff = userScore - averageScore;
  const isAbove = diff > 0;
  
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
      <span className="text-sm text-zinc-600">{label}</span>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className="text-sm font-bold text-zinc-900">{userScore}</span>
          <span className="text-xs text-zinc-400 ml-1">{t('analytics.benchmark.you')}</span>
        </div>
        <div className="w-px h-4 bg-zinc-200" />
        <div className="text-right">
          <span className="text-sm text-zinc-500">{averageScore}</span>
          <span className="text-xs text-zinc-400 ml-1">{t('analytics.benchmark.avg')}</span>
        </div>
        <span className={`text-xs font-mono ${isAbove ? 'text-purple-600' : 'text-zinc-400'}`}>
          {isAbove ? '+' : ''}{diff.toFixed(0)}
        </span>
      </div>
    </div>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================

const ComparativeBenchmark: React.FC<ComparativeBenchmarkProps> = ({ 
  data, 
  isLoading = false 
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-xl">
        <h3 className="text-lg font-bold text-zinc-900 mb-4">{t('analytics.benchmark.title')}</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 rounded-full" />
          <div className="h-4 bg-zinc-200 rounded w-3/4 mx-auto" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-xl">
        <h3 className="text-lg font-bold text-zinc-900 mb-4">{t('analytics.benchmark.title')}</h3>
        <div className="text-center py-8">
          <p className="text-zinc-500 font-medium">{t('analytics.benchmark.noData')}</p>
          <p className="text-sm text-zinc-400 mt-1">{t('analytics.benchmark.noDataHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="p-6 bg-zinc-50 border border-zinc-200 rounded-xl"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-zinc-900">{t('analytics.benchmark.title')}</h3>
        <p className="text-sm text-zinc-500 mt-1">
          {t('analytics.benchmark.basedOn', { count: data.totalCandidates.toLocaleString() } as Record<string, string>)}
        </p>
      </div>
      
      {/* Main Percentile Bar */}
      <PercentileBar percentile={data.percentile} roleTitle={data.roleTitle} t={t} />
      
      {/* Score summary */}
      <div className="mt-8 pt-6 border-t border-zinc-200">
        <div className="grid grid-cols-2 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-purple-600">{data.userScore}</p>
            <p className="text-sm text-zinc-500 mt-1">{t('analytics.benchmark.yourScore')}</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-zinc-400">{data.globalAverage}</p>
            <p className="text-sm text-zinc-500 mt-1">{t('analytics.benchmark.globalAverage')}</p>
          </div>
        </div>
      </div>
      
      {/* Detailed breakdown (if available) */}
      {data.breakdown && (
        <div className="mt-6 pt-6 border-t border-zinc-200">
          <h4 className="text-sm font-bold text-zinc-700 mb-3 uppercase tracking-wider">
            {t('analytics.benchmark.scoreBreakdown')}
          </h4>
          <div className="space-y-1">
            <ScoreComparison 
              label={t('analytics.softSkills.skills.communication')} 
              userScore={data.breakdown.communication.user}
              averageScore={data.breakdown.communication.average}
              t={t}
            />
            <ScoreComparison 
              label={t('analytics.softSkills.skills.problemSolving')} 
              userScore={data.breakdown.problemSolving.user}
              averageScore={data.breakdown.problemSolving.average}
              t={t}
            />
            <ScoreComparison 
              label={t('analytics.softSkills.skills.technicalDepth')} 
              userScore={data.breakdown.technicalDepth.user}
              averageScore={data.breakdown.technicalDepth.average}
              t={t}
            />
            <ScoreComparison 
              label={t('analytics.softSkills.skills.leadership')} 
              userScore={data.breakdown.leadership.user}
              averageScore={data.breakdown.leadership.average}
              t={t}
            />
            <ScoreComparison 
              label={t('analytics.softSkills.skills.adaptability')} 
              userScore={data.breakdown.adaptability.user}
              averageScore={data.breakdown.adaptability.average}
              t={t}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ComparativeBenchmark;
