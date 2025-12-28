/**
 * Interview Feedback Sections Component
 * 
 * Displays strengths, improvements, and recommendations in a grid.
 * 
 * @module pages/InterviewDetails/components/InterviewFeedbackSections
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, AlertTriangle, Lightbulb, Mic, FileText } from 'lucide-react';

// ========================================
// TYPES
// ========================================

interface InterviewFeedbackSectionsProps {
  summary?: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

// ========================================
// HELPER COMPONENTS
// ========================================

const FeedbackItem: React.FC<{ text: string }> = ({ text }) => (
  <li className="flex items-start gap-3 py-2 first:pt-0 last:pb-0">
    <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 bg-purple-600" />
    <span className="text-zinc-700 text-sm sm:text-base">{text}</span>
  </li>
);

const EmptyState: React.FC<{ icon: React.ReactNode; message: string }> = ({ icon, message }) => (
  <div className="text-center py-6">
    <div className="text-zinc-300 mx-auto mb-2">{icon}</div>
    <p className="text-zinc-500 text-sm">{message}</p>
  </div>
);

// ========================================
// COMPONENT
// ========================================

export const InterviewFeedbackSections: React.FC<InterviewFeedbackSectionsProps> = ({
  summary,
  strengths,
  improvements,
  recommendations,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Summary Section */}
      {summary && (
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Mic className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900">
              {t('interviewDetails.summary', 'Summary')}
            </h2>
          </div>
          <div className="p-6 bg-white border border-zinc-200 rounded-xl">
            <p className="text-zinc-700 leading-relaxed">{summary}</p>
          </div>
        </div>
      )}

      {/* Feedback Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Strengths */}
        <div>
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900">
              {t('interviewDetails.sections.strengths', 'Strengths')}
            </h2>
          </div>
          <div className="p-6 bg-white border border-zinc-200 rounded-xl h-full">
            {strengths.length === 0 ? (
              <EmptyState 
                icon={<CheckCircle className="w-10 h-10" />}
                message={t('interviewDetails.noStrengths', 'No strengths identified yet')}
              />
            ) : (
              <ul className="divide-y divide-zinc-100">
                {strengths.map((item, index) => (
                  <FeedbackItem key={index} text={item} />
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div>
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <AlertTriangle className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900">
              {t('interviewDetails.sections.improvements', 'Areas to Improve')}
            </h2>
          </div>
          <div className="p-6 bg-white border border-zinc-200 rounded-xl h-full">
            {improvements.length === 0 ? (
              <EmptyState 
                icon={<AlertTriangle className="w-10 h-10" />}
                message={t('interviewDetails.noImprovements', 'No improvements needed')}
              />
            ) : (
              <ul className="divide-y divide-zinc-100">
                {improvements.map((item, index) => (
                  <FeedbackItem key={index} text={item} />
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900">
              {t('interviewDetails.sections.recommendations', 'Recommendations')}
            </h2>
          </div>
          <div className="p-6 bg-white border border-zinc-200 rounded-xl h-full">
            {recommendations.length === 0 ? (
              <EmptyState 
                icon={<Lightbulb className="w-10 h-10" />}
                message={t('interviewDetails.noRecommendations', 'No recommendations yet')}
              />
            ) : (
              <ul className="divide-y divide-zinc-100">
                {recommendations.map((item, index) => (
                  <FeedbackItem key={index} text={item} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InterviewFeedbackSections;
