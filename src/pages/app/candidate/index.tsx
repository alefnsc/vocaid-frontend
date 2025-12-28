/**
 * Candidate Portal (B2B)
 * 
 * Placeholder page for B2B Candidate users.
 * This portal will be used by candidates invited by recruiters.
 * 
 * Coming soon - restricted to CANDIDATE role only.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Clock, ArrowRight } from 'lucide-react';

const CandidatePortal: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-8">
          <Users className="w-10 h-10 text-blue-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('candidatePortal.title', 'Candidate Portal')}
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-8">
          {t('candidatePortal.description', 'This portal is exclusively for candidates invited by recruiters. Complete structured interviews and receive feedback from hiring teams.')}
        </p>

        {/* Coming Soon Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
          <Clock className="w-4 h-4" />
          {t('common.comingSoon', 'Coming Soon')}
        </div>

        {/* Features Preview */}
        <div className="mt-12 grid gap-4 text-left">
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200">
            <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900">{t('candidatePortal.feature1Title', 'Structured Interviews')}</h3>
              <p className="text-sm text-gray-600">{t('candidatePortal.feature1Desc', 'Complete AI-powered interviews tailored to the role')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200">
            <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900">{t('candidatePortal.feature2Title', 'Recruiter Feedback')}</h3>
              <p className="text-sm text-gray-600">{t('candidatePortal.feature2Desc', 'Receive detailed feedback from hiring teams')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200">
            <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900">{t('candidatePortal.feature3Title', 'Progress Tracking')}</h3>
              <p className="text-sm text-gray-600">{t('candidatePortal.feature3Desc', 'Track your application status in real-time')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidatePortal;
