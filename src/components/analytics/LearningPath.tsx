/**
 * LearningPath Component
 * AI-generated study recommendations based on interview performance
 * 
 * Design: Vocaid system (grayscale + purple-600, typography-driven, no icons)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type TFunction = ReturnType<typeof useTranslation>['t'];

// ========================================
// TYPES
// ========================================

export interface StudyTopic {
  id: string;
  topic: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  resources?: string[];
  estimatedTime?: string; // e.g., "2-3 hours"
}

export interface WeakArea {
  area: string;
  score: number;
  suggestion: string;
}

export interface LearningPathData {
  topics: StudyTopic[];
  weakAreas: WeakArea[];
  generatedAt?: string;
}

interface LearningPathProps {
  data: LearningPathData | null;
  isLoading?: boolean;
}

// ========================================
// PRIORITY BADGE COMPONENT
// ========================================

const PriorityBadge: React.FC<{ priority: StudyTopic['priority']; t: TFunction }> = ({ priority, t }) => {
  const styles = {
    high: 'bg-purple-100 text-purple-700 border-purple-200',
    medium: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    low: 'bg-zinc-50 text-zinc-500 border-zinc-100'
  };
  
  const labels = {
    high: t('analytics.learningPath.priority.high'),
    medium: t('analytics.learningPath.priority.medium'),
    low: t('analytics.learningPath.priority.low')
  };
  
  return (
    <span className={`
      inline-block px-2 py-0.5 text-xs font-medium rounded border
      ${styles[priority]}
    `}>
      {labels[priority]}
    </span>
  );
};

// ========================================
// STUDY TOPIC CARD COMPONENT
// ========================================

const StudyTopicCard: React.FC<{ 
  topic: StudyTopic; 
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  t: TFunction;
}> = ({ topic, index, isExpanded, onToggle, t }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`
        border rounded-lg transition-all duration-200
        ${topic.priority === 'high' 
          ? 'border-purple-200 bg-white' 
          : 'border-zinc-200 bg-white'
        }
      `}
    >
      <button
        onClick={onToggle}
        className="w-full text-left p-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-mono text-zinc-400">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h4 className="text-base font-bold text-zinc-900">{topic.topic}</h4>
            </div>
            <PriorityBadge priority={topic.priority} t={t} />
          </div>
          <span className={`
            text-sm font-medium transition-transform duration-200
            ${isExpanded ? 'rotate-180' : ''}
          `}>
            ▼
          </span>
        </div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-zinc-100">
              {/* Reason */}
              <div className="mb-4">
                <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  {t('analytics.learningPath.whyThisMatters')}
                </h5>
                <p className="text-sm text-zinc-700 leading-relaxed">{topic.reason}</p>
              </div>
              
              {/* Estimated Time */}
              {topic.estimatedTime && (
                <div className="mb-4">
                  <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    {t('analytics.learningPath.estimatedStudyTime')}
                  </h5>
                  <p className="text-sm text-zinc-700">{topic.estimatedTime}</p>
                </div>
              )}
              
              {/* Resources */}
              {topic.resources && topic.resources.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    {t('analytics.learningPath.suggestedResources')}
                  </h5>
                  <ul className="space-y-1">
                    {topic.resources.map((resource, i) => (
                      <li key={i} className="text-sm text-zinc-600 flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        {resource}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ========================================
// WEAK AREA INDICATOR COMPONENT
// ========================================

const WeakAreaIndicator: React.FC<{ area: WeakArea }> = ({ area }) => {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-zinc-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-zinc-900">{area.area}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{area.suggestion}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-zinc-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-600 rounded-full"
            style={{ width: `${area.score}%` }}
          />
        </div>
        <span className="text-sm font-mono text-zinc-600 w-8">{area.score}</span>
      </div>
    </div>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================

const LearningPath: React.FC<LearningPathProps> = ({ data, isLoading = false }) => {
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const { t } = useTranslation();
  
  const handleToggle = (topicId: string) => {
    setExpandedTopicId(prev => prev === topicId ? null : topicId);
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
        <div className="border-t-4 border-purple-600" />
        <div className="p-6">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">{t('analytics.learningPath.title')}</h3>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-zinc-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || (data.topics.length === 0 && data.weakAreas.length === 0)) {
    return (
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
        <div className="border-t-4 border-purple-600" />
        <div className="p-6">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">{t('analytics.learningPath.title')}</h3>
          <div className="text-center py-8">
            <p className="text-zinc-500 font-medium">{t('analytics.learningPath.noData')}</p>
            <p className="text-sm text-zinc-400 mt-1">
              {t('analytics.learningPath.noDataHint')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Sort topics by priority
  const sortedTopics = [...data.topics].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden"
    >
      {/* Purple top accent */}
      <div className="h-1 bg-purple-600" />
      
      {/* Header */}
      <div className="p-6 border-b border-zinc-200">
        <h3 className="text-lg font-bold text-zinc-900">{t('analytics.learningPath.title')}</h3>
        <p className="text-sm text-zinc-500 mt-1">
          {t('analytics.learningPath.subtitle')}
        </p>
        {data.generatedAt && (
          <p className="text-xs text-zinc-400 mt-2 font-mono">
            {t('analytics.learningPath.generated')}: {new Date(data.generatedAt).toLocaleDateString()}
          </p>
        )}
      </div>
      
      {/* Weak Areas Summary */}
      {data.weakAreas.length > 0 && (
        <div className="p-6 border-b border-zinc-200 bg-white">
          <h4 className="text-sm font-bold text-zinc-700 uppercase tracking-wider mb-3">
            {t('analytics.learningPath.areasForImprovement')}
          </h4>
          <div className="space-y-1">
            {data.weakAreas.map((area, index) => (
              <WeakAreaIndicator key={index} area={area} />
            ))}
          </div>
        </div>
      )}
      
      {/* Study Topics */}
      <div className="p-6">
        <h4 className="text-sm font-bold text-zinc-700 uppercase tracking-wider mb-4">
          {t('analytics.learningPath.recommendedTopics')} ({sortedTopics.length})
        </h4>
        <div className="space-y-3">
          {sortedTopics.map((topic, index) => (
            <StudyTopicCard
              key={topic.id}
              topic={topic}
              index={index}
              isExpanded={expandedTopicId === topic.id}
              onToggle={() => handleToggle(topic.id)}
              t={t}
            />
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-6 py-4 bg-white border-t border-zinc-200">
        <p className="text-xs text-zinc-500 leading-relaxed">
          <span className="font-medium">{t('analytics.learningPath.howItWorks')}</span> {t('analytics.learningPath.howItWorksDesc')}
        </p>
      </div>
    </motion.div>
  );
};

export default LearningPath;
