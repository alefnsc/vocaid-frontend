/**
 * Interview No Feedback State Component
 * 
 * Displays a message when feedback is not available.
 * 
 * @module pages/InterviewDetails/components/InterviewNoFeedback
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, FileText } from 'lucide-react';

// ========================================
// TYPES
// ========================================

interface InterviewNoFeedbackProps {
  /** Current interview status */
  status: string;
}

// ========================================
// COMPONENT
// ========================================

export const InterviewNoFeedback: React.FC<InterviewNoFeedbackProps> = ({ status }) => {
  const { t } = useTranslation();

  const isInProgress = status === 'IN_PROGRESS';

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <BarChart3 className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg sm:text-xl font-semibold text-zinc-900">
          {t('interviewDetails.performanceFeedback', 'Performance Feedback')}
        </h2>
      </div>
      <div className="p-6 bg-white border border-zinc-200 rounded-xl text-center py-12">
        <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
        <p className="text-zinc-600 mb-2">
          {isInProgress
            ? t('interviewDetails.feedbackPending', 'Feedback is being generated...')
            : t('interviewDetails.noFeedback', 'No feedback available for this interview')}
        </p>
        <p className="text-sm text-zinc-400">
          {isInProgress
            ? t('interviewDetails.completeToProceed', 'Complete the interview to receive feedback')
            : t('interviewDetails.interviewIssue', 'There may have been an issue with this interview')}
        </p>
      </div>
    </div>
  );
};

export default InterviewNoFeedback;
